import { TeamMember } from "@/types/TeamMember";
import { ACCOUNT_OWNER_EMAIL } from "@/hooks/useAccessControl";

/**
 * Utility functions for team members
 */
export function useTeamMembersUtils() {
  // Helper function to deduplicate team members by email
  const removeDuplicateMembers = (members: TeamMember[]): TeamMember[] => {
    console.log("Removing duplicates from members list:", members.length);
    const uniqueMembers = new Map<string, TeamMember>();
    
    // First pass: keep database members by ID
    members.forEach(member => {
      if (member.id && member.id !== "owner") {
        uniqueMembers.set(member.id, member);
        
        // If this is the account owner, mark that we have it
        if (member.contact?.toLowerCase() === ACCOUNT_OWNER_EMAIL.toLowerCase()) {
          console.log("Found account owner in database members with ID:", member.id);
        }
      }
    });
    
    // Second pass: ensure we have the account owner (by email)
    const ownerEmail = ACCOUNT_OWNER_EMAIL.toLowerCase();
    const ownerExists = Array.from(uniqueMembers.values()).some(
      member => member.contact?.toLowerCase() === ownerEmail
    );
    
    if (!ownerExists) {
      console.log("Account owner not found in unique members, searching in all members");
      const owner = members.find(member => 
        member.contact?.toLowerCase() === ownerEmail
      );
      if (owner) {
        console.log("Adding account owner to unique members with ID:", owner.id);
        uniqueMembers.set(owner.id, owner);
      } else {
        console.log("Account owner not found in any members!");
      }
    } else {
      console.log("Account owner already exists in unique members");
    }
    
    const result = Array.from(uniqueMembers.values());
    console.log("After deduplication:", result.length);
    return result;
  };
  
  // Find the owner in a members array
  const findOwnerInMembers = (members: TeamMember[]) => {
    const owner = members.find(member => 
      member.contact?.toLowerCase() === ACCOUNT_OWNER_EMAIL.toLowerCase()
    );
    console.log("Owner search result:", owner);
    return owner;
  };

  return {
    removeDuplicateMembers,
    findOwnerInMembers
  };
}
