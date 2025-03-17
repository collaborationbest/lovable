
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from './config.ts'

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

// For backward compatibility
export const generatePassword = generateTemporaryPassword;

// Creates a user directly through Supabase Auth
export async function createUserDirectly(
  supabaseClient: ReturnType<typeof createClient>,
  email: string,
  firstName: string | null = null,
  lastName: string | null = null
) {
  console.log(`Attempting to create user with email: ${email}`);
  const temporaryPassword = generateTemporaryPassword();
  
  try {
    // Try admin API first
    const { data: userData, error: adminError } = await supabaseClient.auth.admin.createUser({
      email: email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: { 
        first_name: firstName || email.split('@')[0],
        last_name: lastName || '',
        full_name: `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0]
      }
    });
    
    if (adminError) {
      console.error("Error creating user with admin API:", adminError);
      
      // Fall back to standard signup method
      console.log("Falling back to standard signup method");
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase URL or anon key for fallback signup");
      }
      
      // Create a fresh client with anon key
      const anonClient = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data: signupData, error: signupError } = await anonClient.auth.signUp({
        email: email,
        password: temporaryPassword,
        options: {
          data: {
            first_name: firstName || email.split('@')[0],
            last_name: lastName || '',
            full_name: `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0]
          }
        }
      });
      
      if (signupError) {
        throw signupError;
      }
      
      console.log(`Successfully created user with fallback method: ${signupData.user?.id}`);
      
      return {
        user: signupData.user,
        temporaryPassword
      };
    }
    
    console.log(`Successfully created user: ${userData.user.id}`);
    
    return {
      user: userData.user,
      temporaryPassword
    };
  } catch (error) {
    console.error("Error creating user directly:", error);
    throw error;
  }
}

// Get user's cabinet ID
export async function getUserCabinetId(supabaseClient: ReturnType<typeof createClient>, userId: string | undefined): Promise<string | null> {
  if (!userId) {
    console.log("No userId provided to getUserCabinetId");
    return null;
  }
  
  try {
    console.log(`Getting cabinet ID for user: ${userId}`);
    
    // First try to get cabinet based on ownership
    const { data: cabinetData, error: cabinetError } = await supabaseClient
      .from('cabinets')
      .select('id')
      .eq('owner_id', userId)
      .maybeSingle();
    
    if (cabinetError) {
      console.error("Error fetching cabinet by owner_id:", cabinetError);
    } else if (cabinetData && cabinetData.id) {
      console.log(`Found cabinet by ownership: ${cabinetData.id}`);
      return cabinetData.id;
    }
    
    // If not found by ownership, check team membership
    const { data: teamMemberData, error: teamMemberError } = await supabaseClient
      .from('team_members')
      .select('cabinet_id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (teamMemberError) {
      console.error("Error fetching cabinet by team membership:", teamMemberError);
    } else if (teamMemberData && teamMemberData.cabinet_id) {
      console.log(`Found cabinet by team membership: ${teamMemberData.cabinet_id}`);
      return teamMemberData.cabinet_id;
    }
    
    console.log("No cabinet found for user");
    return null;
  } catch (error) {
    console.error("Exception in getUserCabinetId:", error);
    return null;
  }
}

// Check if user is cabinet owner
export async function isCabinetOwner(
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  cabinetId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabaseClient
      .from('cabinets')
      .select('id')
      .eq('id', cabinetId)
      .eq('owner_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error(`Error checking if user ${userId} is owner of cabinet ${cabinetId}:`, error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error(`Exception checking if user ${userId} is owner of cabinet ${cabinetId}:`, error);
    return false;
  }
}

// Check for existing team member
export async function checkExistingTeamMember(
  supabaseClient: ReturnType<typeof createClient>,
  email: string
) {
  if (!email) return null;
  
  try {
    const { data, error } = await supabaseClient
      .from('team_members')
      .select('*')
      .eq('contact', email)
      .maybeSingle();
      
    if (error) {
      console.error("Error checking for existing team member:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Exception in checkExistingTeamMember:", error);
    return null;
  }
}

// Send welcome email
export async function sendWelcomeEmail(
  supabaseClient: ReturnType<typeof createClient>,
  email: string,
  firstName: string | null = null,
  lastName: string | null = null,
  temporaryPassword?: string | null,
  loginUrl?: string | null
) {
  try {
    // Initialize variables for user data
    let userData = null;
    let password = temporaryPassword || generateTemporaryPassword();
    let userId = null;
    
    // Try to check if user already exists, but handle admin API errors gracefully
    try {
      const { data: existingUsers, error: listError } = await supabaseClient.auth.admin.listUsers({
        filter: `email.eq.${email}`
      });
      
      if (!listError && existingUsers && existingUsers.users && existingUsers.users.length > 0) {
        console.log(`User with email ${email} already exists with ID: ${existingUsers.users[0].id}`);
        userData = { user: existingUsers.users[0] };
        userId = existingUsers.users[0].id;
      }
    } catch (adminListError) {
      console.error("Error when using admin.listUsers (continuing with fallback):", adminListError);
      // Continue with creation flow, we'll try to create and handle duplicate errors there
    }
    
    // If user wasn't found using admin API, try to create them
    if (!userData) {
      try {
        // Try to create the user
        const result = await createUserDirectly(supabaseClient, email, firstName, lastName);
        userData = result;
        password = result.temporaryPassword;
        userId = result.user?.id;
      } catch (createError: any) {
        // If error suggests user already exists, try a direct query to find their ID
        if (createError.message?.includes("already") || createError.status === 400) {
          console.log("User may already exist. Trying to find user through team_members table...");
          
          const { data: existingMember } = await supabaseClient
            .from('team_members')
            .select('user_id')
            .eq('contact', email)
            .maybeSingle();
            
          if (existingMember?.user_id) {
            userId = existingMember.user_id;
            console.log(`Found existing user ID through team_members: ${userId}`);
          } else {
            console.log("Could not find user ID through team_members");
          }
        } else {
          throw createError;
        }
      }
    }
    
    // Construct login URL if not provided
    const actualLoginUrl = loginUrl || constructLoginUrl();
    
    // Invoke the send-welcome-email function
    const { data: emailResult, error: emailError } = await supabaseClient.functions.invoke('send-welcome-email', {
      body: {
        email,
        firstName: firstName || email.split('@')[0],
        lastName: lastName || '',
        temporaryPassword: password,
        loginUrl: actualLoginUrl
      }
    });
    
    if (emailError) {
      console.error("Error sending welcome email:", emailError);
      throw emailError;
    }
    
    console.log("Welcome email sent successfully:", emailResult);
    
    return {
      userId: userId,
      success: true,
      emailSent: true,
      temporaryPassword: password
    };
  } catch (error) {
    console.error("Error in sendWelcomeEmail:", error);
    return {
      success: false,
      emailSent: false,
      error: String(error)
    };
  }
}

// Construct login URL
function constructLoginUrl(): string {
  // Get the domain for the login URL, with fallback to current preview URL
  const domain = Deno.env.get('APP_DOMAIN') || 'https://preview-ac299eea--dentalpilote-4b097d7a.lovable.app';
  return `${domain}/auth`;
}

// Create cabinet for user if needed
export async function ensureCabinetExists(
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  cabinetName?: string
): Promise<string | null> {
  try {
    console.log(`Ensuring cabinet exists for user ${userId}`);
    
    // Check if user already has a cabinet
    const { data: existingCabinet, error: cabinetError } = await supabaseClient
      .from('cabinets')
      .select('id')
      .eq('owner_id', userId)
      .maybeSingle();
    
    if (cabinetError) {
      console.error("Error checking for existing cabinet:", cabinetError);
    } else if (existingCabinet && existingCabinet.id) {
      console.log(`User already has cabinet with ID: ${existingCabinet.id}`);
      return existingCabinet.id;
    }
    
    // Create a new cabinet
    const newCabinetId = `cab_${Date.now().toString(36)}`;
    const { error: createError } = await supabaseClient
      .from('cabinets')
      .insert({
        id: newCabinetId,
        name: cabinetName || 'Mon Cabinet Dentaire',
        owner_id: userId,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (createError) {
      console.error("Error creating cabinet:", createError);
      return null;
    }
    
    console.log(`Created new cabinet with ID: ${newCabinetId}`);
    return newCabinetId;
  } catch (error) {
    console.error("Exception in ensureCabinetExists:", error);
    return null;
  }
}
