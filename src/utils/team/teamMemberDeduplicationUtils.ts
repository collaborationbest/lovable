import { TeamMember } from "@/types/TeamMember";
import { ACCOUNT_OWNER_EMAIL } from "@/hooks/useAccessControl";

// Function to remove duplicate team members
export const removeDuplicateTeamMembers = (members: TeamMember[]): TeamMember[] => {
  console.log("Removing duplicates from team members, initial count:", members.length);
  
  // Use a Map to track unique members by email (case-insensitive)
  const uniqueByEmail = new Map<string, TeamMember>();
  
  // First pass: prioritize database members (with real IDs)
  members.forEach(member => {
    if (member.contact) {
      const email = member.contact.toLowerCase();
      
      // If we don't have this email yet, or current one has a less valid ID, add it
      if (!uniqueByEmail.has(email) || 
          uniqueByEmail.get(email)?.id === "owner" || 
          (member.id !== "owner" && !uniqueByEmail.get(email)?.id)) {
        uniqueByEmail.set(email, member);
      } else if (member.id !== "owner" && uniqueByEmail.get(email)?.id !== "owner") {
        // If both have valid IDs, keep the newer one (assuming higher ID is newer)
        const existingId = uniqueByEmail.get(email)?.id || "0";
        const currentId = member.id || "0";
        
        if (currentId > existingId) {
          uniqueByEmail.set(email, member);
        }
      }
    } else if (member.id && !member.contact) {
      // Handle members without email but with ID (edge case)
      uniqueByEmail.set(`id_${member.id}`, member);
    }
  });
  
  // Second pass: ensure we have the account owner
  const ownerEmail = ACCOUNT_OWNER_EMAIL.toLowerCase();
  const ownerExists = Array.from(uniqueByEmail.values()).some(
    member => member.contact?.toLowerCase() === ownerEmail
  );
  
  if (!ownerExists) {
    const owner = members.find(member => 
      member.contact?.toLowerCase() === ownerEmail
    );
    if (owner) {
      uniqueByEmail.set(ownerEmail, owner);
    }
  }
  
  const result = Array.from(uniqueByEmail.values());
  console.log("After email-based deduplication:", result.length);
  return result;
};
