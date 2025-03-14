
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// Generate a random temporary password
export const generateTemporaryPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  const length = 12; // Use a longer, more secure password
  let password = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    password += chars.charAt(randomValues[i] % chars.length);
  }
  
  return password;
};

// Check if a user is a cabinet owner
export const isCabinetOwner = async (supabaseClient, userId, cabinetId) => {
  if (!userId || !cabinetId) return false;
  
  try {
    const { data, error } = await supabaseClient
      .from('cabinets')
      .select('owner_id')
      .eq('id', cabinetId)
      .single();
      
    if (error) {
      console.error("Error checking cabinet ownership:", error);
      return false;
    }
    
    return data && data.owner_id === userId;
  } catch (e) {
    console.error("Exception in isCabinetOwner:", e);
    return false;
  }
};

// Get user's cabinet_id
export const getUserCabinetId = async (supabaseClient, userId) => {
  if (!userId) return null;
  
  try {
    // First check if user owns any cabinet
    const { data: ownedCabinet, error: ownerError } = await supabaseClient
      .from('cabinets')
      .select('id')
      .eq('owner_id', userId)
      .single();
      
    if (!ownerError && ownedCabinet) {
      return ownedCabinet.id;
    }
    
    // If not an owner, check team_members table
    const { data: teamMember, error: memberError } = await supabaseClient
      .from('team_members')
      .select('cabinet_id')
      .eq('user_id', userId)
      .single();
      
    if (!memberError && teamMember) {
      return teamMember.cabinet_id;
    }
    
    return null;
  } catch (e) {
    console.error("Error in getUserCabinetId:", e);
    return null;
  }
};

// Handle checking if team member already exists
export const checkExistingTeamMember = async (supabaseClient, email) => {
  if (!email) return null;
  
  try {
    const { data: existingMember, error: checkError } = await supabaseClient
      .from('team_members')
      .select('id, cabinet_id')
      .ilike('contact', email)
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking for existing team member:", checkError);
      return null;
    }
    
    return existingMember;
  } catch (e) {
    console.error("Error in checkExistingTeamMember:", e);
    return null;
  }
};

// Create a user directly in auth.users with improved resilience
export const createUserDirectly = async (supabaseClient, email, firstName, lastName, temporaryPassword) => {
  try {
    console.log(`Attempting to create user directly for email: ${email}`);
    
    // Check if user already exists first to avoid duplicate user errors
    const { data: existingUserData, error: existingUserError } = await supabaseClient.auth.admin.listUsers({
      filter: `email.eq.${email}`
    });
    
    if (!existingUserError && existingUserData && existingUserData.users && existingUserData.users.length > 0) {
      console.log(`User with email ${email} already exists, returning existing user ID`);
      return { 
        success: true, 
        userId: existingUserData.users[0].id,
        message: "User already exists"
      };
    }
    
    // Create new user if doesn't exist
    const { data: newUserData, error: createUserError } = await supabaseClient.auth.admin.createUser({
      email: email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: { 
        first_name: firstName || email.split('@')[0],
        last_name: lastName || '',
        full_name: `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0]
      }
    });
    
    if (createUserError) {
      console.error("Error creating user directly:", createUserError);
      return { 
        success: false, 
        userId: null, 
        error: createUserError.message 
      };
    }
    
    console.log(`Successfully created user with ID: ${newUserData.user.id}`);
    return { 
      success: true, 
      userId: newUserData.user.id,
      message: "User created successfully"
    };
  } catch (e) {
    console.error("Exception in createUserDirectly:", e);
    return { 
      success: false, 
      userId: null, 
      error: e.message 
    };
  }
};

// Send welcome email with improved error handling and fallback mechanism
export const sendWelcomeEmail = async (supabaseClient, email, firstName, lastName, temporaryPassword, loginUrl) => {
  try {
    // Add detailed logging to track the email sending process
    console.log("==================== SEND WELCOME EMAIL ====================");
    console.log("Email:", email);
    console.log("Name:", firstName, lastName);
    console.log("Login URL:", loginUrl);
    console.log("Temporary password provided:", !!temporaryPassword);
    
    if (!email || !temporaryPassword || !loginUrl) {
      console.error("Missing required fields for welcome email");
      return { success: false, userId: null, error: "Missing required fields" };
    }
    
    // Ensure we have valid first/last names to avoid issues
    const safeFirstName = firstName || email.split('@')[0];
    const safeLastName = lastName || '';
    
    // First, try to create the user in auth (fallback mechanism)
    // This helps ensure we have a user even if the send-welcome-email function fails
    const directUserResult = await createUserDirectly(
      supabaseClient,
      email,
      safeFirstName,
      safeLastName,
      temporaryPassword
    );
    
    console.log("Direct user creation result:", directUserResult);
    
    // Even if we created the user directly, still try to send the email
    // as it contains important welcome information
    try {
      console.log("Attempting to invoke send-welcome-email function...");
      const { data: emailData, error: emailError } = await supabaseClient.functions.invoke('send-welcome-email', {
        body: {
          email,
          firstName: safeFirstName,
          lastName: safeLastName,
          temporaryPassword,
          loginUrl
        }
      });
      
      if (emailError) {
        console.error("Error invoking send-welcome-email function:", emailError);
        // Don't fail completely if only email sending failed but user was created
        if (directUserResult.success) {
          return { 
            success: true, 
            userId: directUserResult.userId,
            emailSent: false,
            message: `User created but email failed: ${emailError.message}`
          };
        }
        return { success: false, userId: null, error: emailError.message };
      }
      
      console.log("send-welcome-email function response:", emailData);
      
      // If the email function succeeded, use that userId (it should match our directly created one)
      // If not, fall back to the userId from direct creation
      const finalUserId = (emailData?.userId) || directUserResult.userId;
      
      return { 
        success: true, 
        userId: finalUserId,
        emailSent: true,
        message: "User created and welcome email sent"
      };
    } catch (emailExc) {
      console.error("Exception when invoking send-welcome-email function:", emailExc);
      
      // If user was already created directly, consider it a partial success
      if (directUserResult.success) {
        return { 
          success: true, 
          userId: directUserResult.userId,
          emailSent: false,
          message: `User created but email failed: ${emailExc.message}`
        };
      }
      
      return { 
        success: false, 
        userId: null, 
        error: emailExc.message 
      };
    }
  } catch (e) {
    console.error("Exception in sendWelcomeEmail:", e);
    return { success: false, userId: null, error: e.message };
  }
};
