
import { TeamMember } from "@/types/TeamMember";
import { supabase } from "@/integrations/supabase/client";
import { transformTeamMemberToDatabase } from "./teamMemberTransformUtils";
import { invalidateTeamMembersCache } from "./teamMemberFetchUtils";

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
    
    // Invalidate cache after successful delete
    invalidateTeamMembersCache();
    
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
    
    // Invalidate cache after successful update
    invalidateTeamMembersCache();
    
    return { error: null };
  } catch (error) {
    console.error("Error updating team member:", error);
    return { error };
  }
};

// Function to upload a contract for a team member
export const uploadContract = async (id: string, filePath: string, fileName: string): Promise<{ error: any }> => {
  try {
    // Update the team member with the contract information
    const { error } = await supabase
      .from('team_members')
      .update({ 
        contract_file: filePath,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    // Invalidate cache after successful contract upload
    invalidateTeamMembersCache();
    
    return { error: null };
  } catch (error) {
    console.error("Error uploading contract:", error);
    return { error };
  }
};
