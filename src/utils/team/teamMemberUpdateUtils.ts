
import { TeamMember } from "@/types/TeamMember";
import { supabase } from "@/integrations/supabase/client";
import { transformTeamMemberToDatabase } from "./teamMemberTransformUtils";

// Function to delete a team member from database
export const deleteTeamMember = async (id: string): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return { error: null };
  } catch (error) {
    console.error("Error deleting team member:", error);
    return { error };
  }
};

// Function to update a team member in database
export const updateTeamMember = async (id: string, updatedMember: Partial<TeamMember>): Promise<{ error: any }> => {
  try {
    const memberData = transformTeamMemberToDatabase(updatedMember);
    
    const { error } = await supabase
      .from('team_members')
      .update(memberData)
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return { error: null };
  } catch (error) {
    console.error("Error updating team member:", error);
    return { error };
  }
};

// Function to upload a contract for a team member
export const uploadContract = async (id: string, contractFile: string): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('team_members')
      .update({ contract_file: contractFile })
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return { error: null };
  } catch (error) {
    console.error("Error uploading contract:", error);
    return { error };
  }
};
