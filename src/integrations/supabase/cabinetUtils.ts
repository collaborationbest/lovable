
import { supabase } from './client';

/**
 * Ensures that a user is associated with a cabinet
 * @param userId The ID of the user
 * @returns The cabinet ID if successful, null otherwise
 */
export const ensureUserCabinetAssociation = async (userId: string): Promise<string | null> => {
  try {
    // First, get the user's email
    const { data: userData, error: userError } = await supabase.auth.getUser(userId);
    
    if (userError || !userData.user) {
      console.error("Error fetching user data:", userError);
      return null;
    }
    
    const userEmail = userData.user.email;
    
    if (!userEmail) {
      console.error("User has no email address");
      return null;
    }
    
    // Check if the user is already a cabinet owner
    const { data: cabinetData, error: cabinetError } = await supabase
      .from('cabinets')
      .select('id')
      .eq('owner_id', userId)
      .maybeSingle();
      
    if (cabinetError) {
      console.error("Error checking cabinet ownership:", cabinetError);
    } else if (cabinetData?.id) {
      console.log(`User is already a cabinet owner with ID: ${cabinetData.id}`);
      
      // Ensure they have a team_member entry for this cabinet
      const { data: teamMemberCheck, error: teamCheckError } = await supabase
        .from('team_members')
        .select('id')
        .eq('cabinet_id', cabinetData.id)
        .eq('user_id', userId)
        .maybeSingle();
        
      if (teamCheckError) {
        console.error("Error checking team membership for cabinet owner:", teamCheckError);
      }
      
      if (!teamMemberCheck) {
        // Create team_member entry for cabinet owner
        console.log("Creating team_member entry for cabinet owner");
        
        const { error: createMemberError } = await supabase
          .from('team_members')
          .insert({
            contact: userEmail,
            first_name: userData.user.user_metadata?.first_name || userEmail.split('@')[0],
            last_name: userData.user.user_metadata?.last_name || "",
            role: "dentiste",
            cabinet_id: cabinetData.id,
            user_id: userId,
            is_admin: true,
            is_owner: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (createMemberError) {
          console.error("Error creating team member for cabinet owner:", createMemberError);
        }
      }
      
      return cabinetData.id;
    }
    
    // Find a team member entry with this email
    const { data: teamMemberData, error: teamMemberError } = await supabase
      .from('team_members')
      .select('cabinet_id')
      .eq('contact', userEmail)
      .maybeSingle();
    
    if (teamMemberError) {
      console.error("Error fetching team member data:", teamMemberError);
    }
    
    if (teamMemberData && teamMemberData.cabinet_id) {
      console.log(`Found cabinet association through team membership: ${teamMemberData.cabinet_id}`);
      
      // Update the team_member with the user_id if it's not set
      const { error: updateError } = await supabase
        .from('team_members')
        .update({ user_id: userId })
        .eq('contact', userEmail)
        .is('user_id', null);
        
      if (updateError) {
        console.error("Error updating team member with user_id:", updateError);
      }
      
      return teamMemberData.cabinet_id;
    }
    
    console.log("No cabinet association found, attempting to create one");
    
    // Create a new cabinet for the user
    const newCabinetId = `cab_${Date.now().toString(36)}`;
    
    // Try to create cabinet
    const { error: createCabinetError } = await supabase
      .from('cabinets')
      .insert({
        id: newCabinetId,
        name: `Cabinet de ${userData.user.user_metadata?.first_name || userEmail.split('@')[0]}`,
        owner_id: userId,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
    if (createCabinetError) {
      console.error("Error creating cabinet:", createCabinetError);
      
      // Try via edge function if direct insertion fails
      const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('create-team-member', {
        body: {
          action: 'create_cabinet',
          cabinetName: `Cabinet de ${userData.user.user_metadata?.first_name || userEmail.split('@')[0]}`,
          ownerId: userId
        }
      });
      
      if (edgeFunctionError) {
        console.error("Error creating cabinet via edge function:", edgeFunctionError);
        return null;
      }
      
      console.log("Cabinet created via edge function:", edgeFunctionData);
    } else {
      console.log(`Created new cabinet with ID: ${newCabinetId}`);
    }
    
    // Create team member entry
    const { error: createTeamError } = await supabase
      .from('team_members')
      .insert({
        contact: userEmail,
        first_name: userData.user.user_metadata?.first_name || userEmail.split('@')[0],
        last_name: userData.user.user_metadata?.last_name || "",
        role: "dentiste",
        cabinet_id: newCabinetId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_admin: true,
        is_owner: true,
        user_id: userId
      });
    
    if (createTeamError) {
      console.error("Error creating team member association:", createTeamError);
      
      // Try via edge function
      const { error: edgeFunctionError } = await supabase.functions.invoke('create-team-member', {
        body: {
          memberData: {
            contact: userEmail,
            first_name: userData.user.user_metadata?.first_name || userEmail.split('@')[0],
            last_name: userData.user.user_metadata?.last_name || "",
            role: "dentiste",
            cabinet_id: newCabinetId,
            is_admin: true,
            is_owner: true,
            user_id: userId
          }
        }
      });
      
      if (edgeFunctionError) {
        console.error("Error creating team member via edge function:", edgeFunctionError);
      }
    }
    
    return newCabinetId;
  } catch (error) {
    console.error("Exception in ensureUserCabinetAssociation:", error);
    return null;
  }
};

/**
 * Get the cabinet ID for the current user
 * @returns The cabinet ID if successful, null otherwise
 */
export const getUserCabinetId = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // First try to get cabinet where user is owner
    const { data: cabinetData, error: cabinetError } = await supabase
      .from('cabinets')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle();
      
    if (cabinetError) {
      console.error("Error checking cabinet ownership:", cabinetError);
    } else if (cabinetData?.id) {
      return cabinetData.id;
    }
    
    // If not an owner, try team membership
    const { data, error } = await supabase
      .from('team_members')
      .select('cabinet_id')
      .eq('contact', user.email)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching user cabinet:", error);
      
      // Try by user_id as fallback
      const { data: userData, error: userError } = await supabase
        .from('team_members')
        .select('cabinet_id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (userError) {
        console.error("Error fetching user cabinet by user_id:", userError);
        return null;
      }
      
      return userData?.cabinet_id || null;
    }
    
    if (!data?.cabinet_id) {
      // No cabinet found, attempt to ensure cabinet association
      return await ensureUserCabinetAssociation(user.id);
    }
    
    return data.cabinet_id;
  } catch (error) {
    console.error("Exception in getUserCabinetId:", error);
    return null;
  }
};
