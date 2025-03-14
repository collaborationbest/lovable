
import { TeamMember } from "@/types/TeamMember";
import { useTeamMembersState } from "./useTeamMembersState";
import { useTeamMembersFetch } from "./useTeamMembersFetch";
import { useTeamMembersActions } from "./useTeamMembersActions";
import { useTeamMemberUpdates } from "./useTeamMemberUpdates";

/**
 * Main hook for managing team members
 * Aggregates all functionality from smaller hooks
 */
export function useTeamMembers(initialMembers: TeamMember[] = []) {
  // Initialize all state
  const stateHook = useTeamMembersState(initialMembers);
  
  // Fetch team members
  useTeamMembersFetch(initialMembers, {
    teamMembers: stateHook.teamMembers,
    setTeamMembers: stateHook.setTeamMembers,
    isLoading: stateHook.isLoading,
    setIsLoading: stateHook.setIsLoading
  });
  
  // Initialize CRUD actions
  const actionsHook = useTeamMembersActions({
    teamMembers: stateHook.teamMembers,
    setTeamMembers: stateHook.setTeamMembers,
    setIsAddMemberOpen: stateHook.setIsAddMemberOpen,
    setIsViewMemberOpen: stateHook.setIsViewMemberOpen,
    setIsUploadContractOpen: stateHook.setIsUploadContractOpen,
    selectedMember: stateHook.selectedMember,
    setSelectedMember: stateHook.setSelectedMember,
    newMember: stateHook.newMember,
    setNewMember: stateHook.setNewMember
  });
  
  // Initialize update functions
  const updatesHook = useTeamMemberUpdates({
    teamMembers: stateHook.teamMembers,
    setTeamMembers: stateHook.setTeamMembers,
    selectedMember: stateHook.selectedMember,
    setSelectedMember: stateHook.setSelectedMember
  });

  // Return all hooks combined
  return {
    ...stateHook,
    ...actionsHook,
    ...updatesHook
  };
}
