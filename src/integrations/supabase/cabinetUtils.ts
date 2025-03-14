
import { supabase } from './client';

/**
 * Gets the cabinet ID associated with the current authenticated user
 */
export const getUserCabinetId = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // Try to find associated cabinet via team_members table
    const { data: teamMemberData } = await supabase
      .from('team_members')
      .select('cabinet_id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (teamMemberData?.cabinet_id) {
      return teamMemberData.cabinet_id;
    }
    
    // If no team member entry, check if user is a cabinet owner
    const { data: cabinetData } = await supabase
      .from('cabinets')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle();
    
    if (cabinetData?.id) {
      return cabinetData.id;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user cabinet ID:", error);
    return null;
  }
};

/**
 * Ensures that a user is associated with a cabinet
 * This helps with data access permissions
 */
export const ensureUserCabinetAssociation = async (userId: string, cabinetId: string): Promise<boolean> => {
  try {
    // Check if association already exists
    const { data: existingAssociation } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', userId)
      .eq('cabinet_id', cabinetId)
      .maybeSingle();
    
    if (existingAssociation) {
      // Association already exists
      return true;
    }
    
    // Check if user exists in profiles
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .maybeSingle();
    
    if (!userProfile) {
      console.error("User profile not found when ensuring cabinet association");
      return false;
    }
    
    // Create association as a team member
    const { error } = await supabase
      .from('team_members')
      .insert({
        user_id: userId,
        cabinet_id: cabinetId,
        first_name: userProfile.first_name || 'User',
        last_name: userProfile.last_name || userId.substring(0, 6),
        role: 'dentiste',
        is_admin: true,
        contact: userProfile.email
      });
    
    if (error) {
      console.error("Error creating user-cabinet association:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception in ensureUserCabinetAssociation:", error);
    return false;
  }
};
