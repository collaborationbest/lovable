
import { supabase } from "@/integrations/supabase/client";
import { TeamMember } from "@/types/TeamMember";
import { fetchTeamMembers } from "@/utils/team/teamMemberCrud";
import { removeDuplicateTeamMembers } from "./teamMemberDeduplicationUtils";

// Function to get the cabinet ID based on the account owner's email
export const getCabinetId = async (accountOwnerEmail: string): Promise<string | null> => {
  try {
    // Fetch team members to find the account owner
    const { data: teamMembers, error: fetchError } = await fetchTeamMembers();
    
    if (fetchError) {
      console.error("Error fetching team members:", fetchError);
      return null;
    }
    
    // Deduplicate team members to ensure we only have one instance of each member
    const dedupedTeamMembers = removeDuplicateTeamMembers(teamMembers);
    
    // Find the account owner in the team members list
    const accountOwner = dedupedTeamMembers.find(member => member.contact === accountOwnerEmail);
    
    if (!accountOwner) {
      console.warn("Account owner not found in team members list");
      return null;
    }
    
    // Return the cabinet ID of the account owner
    return accountOwner.cabinet_id || null;
  } catch (error) {
    console.error("Error getting cabinet ID:", error);
    return null;
  }
};

// Add the missing export for ensureCabinetOwnerHasAdminRights
export const ensureCabinetOwnerHasAdminRights = async (teamMember: TeamMember): Promise<boolean> => {
  try {
    if (!teamMember.contact) {
      console.warn("Team member has no contact information");
      return false;
    }

    const cabinetId = await getCabinetId(teamMember.contact);
    if (!cabinetId) {
      console.warn("Could not determine cabinet ID for owner");
      return false;
    }

    // Update team member with admin rights
    const { error } = await supabase
      .from('team_members')
      .update({ 
        is_admin: true,
        cabinet_id: cabinetId
      })
      .eq('id', teamMember.id);

    if (error) {
      console.error("Error ensuring admin rights:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in ensureCabinetOwnerHasAdminRights:", error);
    return false;
  }
};
