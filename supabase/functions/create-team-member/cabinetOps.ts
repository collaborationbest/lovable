
import { TeamMemberData } from './types.ts';
import { 
  isCabinetOwner, 
  getUserCabinetId 
} from './helpers.ts';

// Process the cabinet_id for the team member
export async function processCabinetId(
  supabaseClient: any, 
  memberData: TeamMemberData, 
  userId: string | undefined
): Promise<void> {
  let cabinetId = memberData.cabinet_id;
  
  // If no cabinet_id provided in memberData, try to get it from the current user
  if (!cabinetId) {
    cabinetId = await getUserCabinetId(supabaseClient, userId);
    if (!cabinetId) {
      console.error("No cabinet_id found for user:", userId);
      throw new Error("User not associated with any cabinet");
    }
    
    // Set the cabinet_id in memberData
    memberData.cabinet_id = cabinetId;
    console.log("Set cabinet_id in memberData:", cabinetId);
  }
}

// Process admin and owner status
export async function processAdminStatus(
  supabaseClient: any, 
  memberData: TeamMemberData, 
  userId: string | undefined,
  email: string | undefined
): Promise<void> {
  // Auto-set is_admin and is_owner if this user is the cabinet owner
  if (userId && memberData.cabinet_id) {
    const isOwner = await isCabinetOwner(supabaseClient, userId, memberData.cabinet_id);
    if (isOwner) {
      console.log(`User ${userId} is the owner of cabinet ${memberData.cabinet_id}, setting admin privileges`);
      memberData.is_admin = true;
      memberData.is_owner = true;
      
      // If creating a team member for the cabinet owner, link user_id
      if (memberData.contact && memberData.contact === email) {
        memberData.user_id = userId;
      }
    }
  }
}
