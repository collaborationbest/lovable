
import { useState } from "react";
import { TeamMember } from "@/types/TeamMember";
import { useAccessControl } from "@/hooks/useAccessControl";
import { useTeamMembers } from "@/hooks/team/useTeamMembers";
import { removeDuplicateTeamMembers } from "@/utils/team/teamMemberDeduplicationUtils";

export const useTeamManager = () => {
  const { isAdmin, userEmail, isAccountOwner } = useAccessControl();
  const teamMembersHook = useTeamMembers([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Use the utility function instead of local deduplication
  const filteredMembers = removeDuplicateTeamMembers(teamMembersHook.teamMembers).filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const email = member.contact?.toLowerCase() || "";
    const role = member.role.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || email.includes(query) || role.includes(query);
  });

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map(member => member.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectMember = (id: string) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter(memberId => memberId !== id));
      setSelectAll(false);
    } else {
      setSelectedMembers([...selectedMembers, id]);
      if (selectedMembers.length + 1 === filteredMembers.length) {
        setSelectAll(true);
      }
    }
  };

  return {
    ...teamMembersHook,
    isAdmin,
    userEmail,
    isAccountOwner,
    searchQuery,
    setSearchQuery,
    selectedMembers,
    setSelectedMembers,
    selectAll,
    setSelectAll,
    filteredMembers,
    handleSelectAll,
    handleSelectMember
  };
};

