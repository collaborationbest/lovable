
import { supabase } from './client';
import { directDatabaseQuery } from './dbUtils';
import { ensureCabinetOwnerHasAdminRights } from '@/utils/team/cabinetOwnerUtils';

// Create or update a cabinet/team member association for a user
export const ensureUserCabinetAssociation = async (
  cabinetId: string, 
  userData: { 
    firstName: string; 
    lastName: string; 
    email: string; 
    isAdmin?: boolean;
    isOwner?: boolean;
    role?: string;
  }
): Promise<boolean> => {
  try {
    // Get current user ID
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;
    
    const userId = session.user.id;
    const { firstName, lastName, email, isAdmin = false, isOwner = false, role = 'dentiste' } = userData;
    
    // Check if user already has a team member entry for this cabinet
    const { data: existingMember, error: queryError } = await directDatabaseQuery<{ id: string }>('team_members', 'select', {
      select: 'id',
      filters: {
        user_id: userId,
        cabinet_id: cabinetId
      },
      single: true
    });
    
    if (existingMember && existingMember.id) {
      // Update existing association
      const { error: updateError } = await directDatabaseQuery('team_members', 'update', {
        data: {
          first_name: firstName,
          last_name: lastName,
          contact: email,
          is_admin: isAdmin,
          is_owner: isOwner,
          role: role,
          updated_at: new Date().toISOString()
        },
        filters: {
          id: existingMember.id
        },
        returning: true
      });
      
      if (updateError) {
        console.error("Error updating team member:", updateError);
        return false;
      }
    } else {
      // Create new association
      const { error: insertError } = await directDatabaseQuery('team_members', 'insert', {
        data: {
          first_name: firstName,
          last_name: lastName,
          contact: email,
          user_id: userId,
          cabinet_id: cabinetId,
          is_admin: isAdmin,
          is_owner: isOwner,
          role: role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        returning: true
      });
      
      if (insertError) {
        console.error("Error creating team member:", insertError);
        return false;
      }
    }
    
    return true;
  } catch (e) {
    console.error("Exception in ensureUserCabinetAssociation:", e);
    return false;
  }
};

// Re-export the ensureCabinetOwnerHasAdminRights function for backward compatibility
export { ensureCabinetOwnerHasAdminRights };
