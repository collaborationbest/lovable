
import { TeamMemberData } from './types.ts';

// Validate required fields for team member creation
export function validateTeamMemberData(memberData: TeamMemberData): void {
  if (!memberData) {
    throw new Error("Missing required field: memberData");
  }
  
  if (!memberData.cabinet_id) {
    throw new Error("cabinet_id is required for creating a team member");
  }
}

// Check for duplicate emails in team_members table
export async function checkEmailUniqueness(
  supabaseClient: any,
  memberData: TeamMemberData
): Promise<void> {
  if (!memberData.contact) return;
  
  const { data: existingMembers, error: emailCheckError } = await supabaseClient
    .from('team_members')
    .select('id, contact, cabinet_id')
    .ilike('contact', memberData.contact);
    
  if (emailCheckError) {
    console.error("Error checking email uniqueness:", emailCheckError);
  } else if (existingMembers && existingMembers.length > 0) {
    // If member exists but in a different cabinet, we might want to allow it
    // But if in same cabinet, reject it as duplicate
    if (memberData.cabinet_id) {
      const sameTeamDuplicate = existingMembers.some(
        member => member.cabinet_id === memberData.cabinet_id
      );
      
      if (sameTeamDuplicate) {
        throw new Error(`Un membre avec l'email ${memberData.contact} existe déjà dans cette équipe`);
      }
    } else {
      throw new Error(`Un membre avec l'email ${memberData.contact} existe déjà`);
    }
  }
}
