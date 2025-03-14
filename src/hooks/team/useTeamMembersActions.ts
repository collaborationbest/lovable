import { TeamMember, DentalSpecialty } from "@/types/TeamMember";
import { useToast } from "@/hooks/use-toast";
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
  const handleAddMember = async () => {
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
  };
  
  // Function to open member details
  const handleViewMember = (member: TeamMember) => {
    setSelectedMember(member);
    setIsViewMemberOpen(true);
  };
  
  // Function to delete a team member
  const handleDeleteMember = async (id: string) => {
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
  };
  
  // Function to upload a contract
  const handleUploadContract = async () => {
    if (!selectedMember) return;
    
    try {
      // In a real implementation, upload to Supabase Storage
      // For now, simulate contract upload
      const { error } = await uploadContract(selectedMember.id, 'contrat_embauche.pdf');
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedMembers = teamMembers.map(member => 
        member.id === selectedMember.id 
          ? { ...member, contractFile: "contrat_embauche.pdf" } 
          : member
      );
      
      setTeamMembers(updatedMembers);
      setSelectedMember({ ...selectedMember, contractFile: "contrat_embauche.pdf" });
      setIsUploadContractOpen(false);
      
      toast({
        title: "Contrat téléchargé",
        description: "Le contrat a été téléchargé avec succès."
      });
    } catch (error: any) {
      console.error("Error uploading contract:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du téléchargement du contrat.",
        variant: "destructive"
      });
    }
  };

  return {
    handleAddMember,
    handleViewMember,
    handleDeleteMember,
    handleUploadContract
  };
}
