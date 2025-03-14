import { TeamMember } from "@/types/TeamMember";
import { supabase } from "@/integrations/supabase/client";
import { removeDuplicateTeamMembers } from "./teamMemberDeduplicationUtils";
import { transformDatabaseRecordsToTeamMembers } from "./teamMemberTransformUtils";
import { getUserCabinetId } from "@/integrations/supabase/cabinetUtils";
import { TeamMemberSchema } from "@/types/TeamMemberSchema";

// Function to fetch team members from database
export const fetchTeamMembers = async (): Promise<{ data: TeamMember[], error: any }> => {
  try {
    // Get the current user's cabinet ID
    const cabinetId = await getUserCabinetId();
    
    if (!cabinetId) {
      console.error("No cabinet ID found for current user");
      return { data: [], error: new Error("No cabinet ID found") };
    }
    
    console.log(`Fetching team members for cabinet: ${cabinetId}`);
    
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('cabinet_id', cabinetId);
    
    if (error) {
      throw error;
    }
    
    // Cast the roles to the correct type before passing to transform function
    const typedData = data.map(item => ({
      ...item,
      role: item.role as "dentiste" | "assistante" | "secrétaire"
    })) as TeamMemberSchema[];
    
    const transformedData = transformDatabaseRecordsToTeamMembers(typedData);
    console.log(`Fetched ${transformedData.length} team members from database for cabinet ${cabinetId}`);
    
    // Check for and log any potential duplicates by email
    const emailCounts = new Map<string, number>();
    transformedData.forEach(member => {
      if (member.contact) {
        const email = member.contact.toLowerCase();
        emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
      }
    });
    
    let hasDuplicates = false;
    emailCounts.forEach((count, email) => {
      if (count > 1) {
        console.warn(`Duplicate team member found: ${email} appears ${count} times`);
        hasDuplicates = true;
      }
    });
    
    if (!hasDuplicates) {
      console.log("No duplicate team members detected by email");
    }
    
    // Use the deduplication function to ensure unique emails
    const dedupedData = removeDuplicateTeamMembers(transformedData);
    
    return { data: dedupedData, error: null };
  } catch (error) {
    console.error("Error fetching team members:", error);
    return { data: [], error };
  }
};
