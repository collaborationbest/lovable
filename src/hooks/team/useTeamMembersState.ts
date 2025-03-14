
import { useState } from "react";
import { TeamMember } from "@/types/TeamMember";

/**
 * Hook for managing team members state
 */
export function useTeamMembersState(initialMembers: TeamMember[] = []) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialMembers);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isViewMemberOpen, setIsViewMemberOpen] = useState(false);
  const [isUploadContractOpen, setIsUploadContractOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [newMember, setNewMember] = useState<Omit<TeamMember, "id">>({
    firstName: "",
    lastName: "",
    role: "dentiste",
    contractType: undefined,
    currentProjects: [],
    location: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  
  return {
    // State
    teamMembers,
    setTeamMembers,
    isAddMemberOpen,
    setIsAddMemberOpen,
    isViewMemberOpen,
    setIsViewMemberOpen,
    isUploadContractOpen,
    setIsUploadContractOpen,
    selectedMember,
    setSelectedMember,
    newMember,
    setNewMember,
    isLoading,
    setIsLoading
  };
}
