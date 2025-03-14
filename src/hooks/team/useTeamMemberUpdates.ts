import { TeamMember, DentalSpecialty } from "@/types/TeamMember";
import { useToast } from "@/hooks/use-toast";
import { updateTeamMember } from "@/utils/team/teamMemberCrud";

type TeamMembersStateProps = {
  teamMembers: TeamMember[];
  setTeamMembers: (members: TeamMember[]) => void;
  selectedMember: TeamMember | null;
  setSelectedMember: (member: TeamMember | null) => void;
};

/**
 * Hook for managing team member updates
 */
export function useTeamMemberUpdates({
  teamMembers,
  setTeamMembers,
  selectedMember,
  setSelectedMember
}: TeamMembersStateProps) {
  const { toast } = useToast();

  // Function to toggle admin rights
  const handleToggleAdmin = async (id: string, isAdmin: boolean) => {
    try {
      const { error } = await updateTeamMember(id, { isAdmin });
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedMembers = teamMembers.map(member => 
        member.id === id 
          ? { ...member, isAdmin } 
          : member
      );
      
      setTeamMembers(updatedMembers);
      
      // Update selected member if it's the one being edited
      if (selectedMember?.id === id) {
        setSelectedMember({ ...selectedMember, isAdmin });
      }
      
      toast({
        title: isAdmin ? "Droits d'admin accordés" : "Droits d'admin révoqués",
        description: `Les droits d'administrateur ont été ${isAdmin ? 'accordés' : 'révoqués'} avec succès.`
      });
    } catch (error: any) {
      console.error("Error updating admin rights:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la modification des droits d'administrateur.",
        variant: "destructive"
      });
    }
  };

  // Function to update member specialty
  const handleUpdateSpecialty = async (id: string, specialty: DentalSpecialty) => {
    try {
      const { error } = await updateTeamMember(id, { specialty });
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedMembers = teamMembers.map(member => 
        member.id === id 
          ? { ...member, specialty } 
          : member
      );
      
      setTeamMembers(updatedMembers);
      
      // Update selected member if it's the one being edited
      if (selectedMember?.id === id) {
        setSelectedMember({ ...selectedMember, specialty });
      }
      
      toast({
        title: "Spécialité mise à jour",
        description: `La spécialité a été mise à jour avec succès.`
      });
    } catch (error: any) {
      console.error("Error updating specialty:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la modification de la spécialité.",
        variant: "destructive"
      });
    }
  };

  // Function to update member information
  const handleUpdateMember = async (id: string, updatedMember: Partial<TeamMember>) => {
    try {
      const { error } = await updateTeamMember(id, updatedMember);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedMembers = teamMembers.map(member => 
        member.id === id 
          ? { ...member, ...updatedMember } 
          : member
      );
      
      setTeamMembers(updatedMembers);
      
      // Update selected member if it's the one being edited
      if (selectedMember?.id === id) {
        setSelectedMember({ ...selectedMember, ...updatedMember });
      }
      
      toast({
        title: "Profil mis à jour",
        description: "Les informations du membre ont été mises à jour avec succès."
      });
    } catch (error: any) {
      console.error("Error updating member:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la modification du profil.",
        variant: "destructive"
      });
    }
  };

  return {
    handleToggleAdmin,
    handleUpdateSpecialty,
    handleUpdateMember
  };
}
