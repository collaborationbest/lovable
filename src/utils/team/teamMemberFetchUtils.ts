
import { TeamMember } from "@/types/TeamMember";
import { supabase } from "@/integrations/supabase/client";
import { removeDuplicateTeamMembers } from "./teamMemberDeduplicationUtils";
import { transformDatabaseRecordsToTeamMembers } from "./teamMemberTransformUtils";
import { getUserCabinetId } from "@/integrations/supabase/cabinetUtils";
import { TeamMemberSchema } from "@/types/TeamMemberSchema";

// Cache for team members to avoid redundant fetching
const teamMembersCache = {
  data: null as TeamMember[] | null,
  timestamp: 0,
  cabinetId: null as string | null,
  // Cache expiration in milliseconds (5 minutes)
  expirationTime: 5 * 60 * 1000
};

// Function to fetch team members from database with caching
export const fetchTeamMembers = async (): Promise<{ data: TeamMember[], error: any }> => {
  try {
    // Get the current user's cabinet ID
    const cabinetId = await getUserCabinetId();
    
    if (!cabinetId) {
      console.error("No cabinet ID found for current user");
      return { data: [], error: new Error("No cabinet ID found") };
    }
    
    // Check if we have valid cached data for this cabinet
    const now = Date.now();
    if (
      teamMembersCache.data && 
      teamMembersCache.cabinetId === cabinetId && 
      now - teamMembersCache.timestamp < teamMembersCache.expirationTime
    ) {
      console.log(`Using cached team members data (${teamMembersCache.data.length} members)`);
      return { data: [...teamMembersCache.data], error: null };
    }
    
    console.log(`Fetching team members for cabinet: ${cabinetId}`);
    
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('cabinet_id', cabinetId);
    
    if (error) {
      throw error;
    }
    
    // Cast the data to the correct type with proper role type checking
    const typedData = data.map(item => {
      // Ensure role is one of the allowed values
      const role = ["dentiste", "assistante", "secrétaire"].includes(item.role) 
        ? (item.role as "dentiste" | "assistante" | "secrétaire") 
        : "dentiste"; // Default to dentiste if role is invalid
        
      return {
        ...item,
        role
      };
    }) as TeamMemberSchema[];
    
    const transformedData = transformDatabaseRecordsToTeamMembers(typedData);
    console.log(`Fetched ${transformedData.length} team members from database for cabinet ${cabinetId}`);
    
    // Use the deduplication function to ensure unique emails
    const dedupedData = removeDuplicateTeamMembers(transformedData);
    
    // Update cache
    teamMembersCache.data = dedupedData;
    teamMembersCache.timestamp = now;
    teamMembersCache.cabinetId = cabinetId;
    
    return { data: dedupedData, error: null };
  } catch (error) {
    console.error("Error fetching team members:", error);
    return { data: [], error };
  }
};

// Function to invalidate the cache when data changes
export const invalidateTeamMembersCache = () => {
  teamMembersCache.data = null;
  teamMembersCache.timestamp = 0;
  teamMembersCache.cabinetId = null;
  console.log("Team members cache invalidated");
};
