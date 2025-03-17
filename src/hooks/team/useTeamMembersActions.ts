
import { TeamMember, DentalSpecialty } from "@/types/TeamMember";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";
import { 
  addTeamMember, 
  deleteTeamMember, 
  updateTeamMember, 
  uploadContract 
} from "@/utils/team/teamMemberCrud";

type TeamMembersStateProps = {
  teamMembers: TeamMember[];
  setTeamMembers: (members: TeamMember[]) => void;
  setIsAddMemberOpen: (open: boolean) => void;
  setIsViewMemberOpen: (open: boolean) => void;
  setIsUploadContractOpen: (open: boolean) => void;
  selectedMember: TeamMember | null;
  setSelectedMember: (member: TeamMember | null) => void;
  newMember: Omit<TeamMember, "id">;
  setNewMember: (member: Omit<TeamMember, "id">) => void;
};

/**
 * Hook for team members CRUD operations
 */
export function useTeamMembersActions({
  teamMembers,
  setTeamMembers,
  setIsAddMemberOpen,
  setIsViewMemberOpen,
  setIsUploadContractOpen,
  selectedMember,
  setSelectedMember,
  newMember,
  setNewMember
}: TeamMembersStateProps) {
  const { toast } = useToast();
  
  // Function to add a new team member
  const handleAddMember = useCallback(async () => {
    if (!newMember.firstName || !newMember.lastName || !newMember.contact) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires (prénom, nom et email).",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data: member, error } = await addTeamMember(newMember);
      
      if (error) {
        throw error;
      }
      
      if (member) {
        setTeamMembers([...teamMembers, member]);
        
        // Reset new member form
        setNewMember({
          firstName: "",
          lastName: "",
          role: "dentiste",
          contractType: undefined,
          currentProjects: [],
          location: ""
        });
        
        setIsAddMemberOpen(false);
        
        toast({
          title: "Membre ajouté",
          description: `${member.firstName} ${member.lastName} a été ajouté(e) à l'équipe.`
        });
      }
    } catch (error: any) {
      console.error("Error creating team member:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'ajout du membre.",
        variant: "destructive"
      });
    }
  }, [newMember, teamMembers, setTeamMembers, setNewMember, setIsAddMemberOpen, toast]);
  
  // Function to open member details
  const handleViewMember = useCallback((member: TeamMember) => {
    setSelectedMember(member);
    setIsViewMemberOpen(true);
  }, [setSelectedMember, setIsViewMemberOpen]);
  
  // Function to delete a team member
  const handleDeleteMember = useCallback(async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce membre de l'équipe ?")) {
      try {
        const { error } = await deleteTeamMember(id);
        
        if (error) {
          throw error;
        }
        
        setTeamMembers(teamMembers.filter(member => member.id !== id));
        
        toast({
          title: "Membre supprimé",
          description: "Le membre a été supprimé de l'équipe."
        });
        
        // Close details dialog if it was open
        if (selectedMember?.id === id) {
          setIsViewMemberOpen(false);
        }
      } catch (error: any) {
        console.error("Error deleting team member:", error);
        toast({
          title: "Erreur",
          description: error.message || "Une erreur est survenue lors de la suppression du membre.",
          variant: "destructive"
        });
      }
    }
  }, [teamMembers, selectedMember, setTeamMembers, setIsViewMemberOpen, toast]);
  
  // Function to upload a contract
  const handleUploadContract = useCallback(async (filePath: string, fileName: string) => {
    if (!selectedMember) return;
    
    try {
      const { error } = await uploadContract(selectedMember.id, filePath, fileName);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedMembers = teamMembers.map(member => 
        member.id === selectedMember.id 
          ? { ...member, contractFile: fileName } 
          : member
      );
      
      setTeamMembers(updatedMembers);
      setSelectedMember({ ...selectedMember, contractFile: fileName });
      
      toast({
        title: "Contrat téléchargé",
        description: "Le contrat a été téléchargé avec succès."
      });
    } catch (error: any) {
      console.error("Error saving contract reference:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'enregistrement de la référence du contrat.",
        variant: "destructive"
      });
    }
  }, [selectedMember, teamMembers, setTeamMembers, setSelectedMember, toast]);

  return {
    handleAddMember,
    handleViewMember,
    handleDeleteMember,
    handleUploadContract
  };
}
