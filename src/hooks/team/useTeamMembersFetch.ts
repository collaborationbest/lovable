import { useEffect } from "react";
import { TeamMember } from "@/types/TeamMember";
import { useToast } from "@/hooks/use-toast";
import { ACCOUNT_OWNER_EMAIL } from "@/hooks/useAccessControl";
import { fetchTeamMembers } from "@/utils/team/teamMemberCrud";
import { ensureAccountOwnerExists } from "@/utils/team/accountOwnerUtils";
import { useTeamMembersUtils } from "./useTeamMembersUtils";

type TeamMembersStateProps = {
  teamMembers: TeamMember[];
  setTeamMembers: (members: TeamMember[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

/**
 * Hook for fetching team members data
 */
export function useTeamMembersFetch(
  initialMembers: TeamMember[],
  { teamMembers, setTeamMembers, isLoading, setIsLoading }: TeamMembersStateProps
) {
  const { toast } = useToast();
  const { removeDuplicateMembers, findOwnerInMembers } = useTeamMembersUtils();
  
  // Fetch team members from Supabase
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        setIsLoading(true);
        
        // Ensure account owner is in the database
        const owner = findOwnerInMembers(initialMembers);
        console.log("Found owner in initial members:", owner);
        
        if (owner) {
          console.log("Attempting to ensure owner is in database:", owner);
          const ownerData = {
            firstName: owner.firstName,
            lastName: owner.lastName,
            email: owner.contact,
            userId: owner.id
          };
          await ensureAccountOwnerExists("126", ownerData);
          console.log("Owner database operation complete");
        } else {
          console.log("No owner found in initial members");
        }
        
        // Fetch all team members
        const { data, error } = await fetchTeamMembers();
        
        if (error) {
          console.error("Error fetching team members:", error);
          throw error;
        }
        
        console.log("Fetched team members:", data);
        
        // Ensure account owner is in the list - using case-insensitive comparison
        const ownerExists = data.some(member => 
          member.contact?.toLowerCase() === ACCOUNT_OWNER_EMAIL.toLowerCase()
        );
        console.log("Owner exists in fetched data:", ownerExists);
        
        let finalMembersList = [...data];
        
        if (!ownerExists && initialMembers.length > 0) {
          const owner = initialMembers.find(member => 
            member.contact?.toLowerCase() === ACCOUNT_OWNER_EMAIL.toLowerCase()
          );
          if (owner) {
            console.log("Adding account owner to team members list:", owner);
            finalMembersList.push(owner);
          }
        }
        
        // Remove duplicates before setting state
        finalMembersList = removeDuplicateMembers(finalMembersList);
        console.log("Final members list after filtering:", finalMembersList);
        
        setTeamMembers(finalMembersList);
      } catch (error: any) {
        console.error("Error fetching team members:", error);
        toast({
          title: "Erreur",
          description: error.message || "Une erreur est survenue lors du chargement de l'équipe.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTeamMembers();
  }, []);

  return { teamMembers };
}
