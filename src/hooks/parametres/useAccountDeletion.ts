
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const useAccountDeletion = () => {
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const isDeleteButtonDisabled = deleteConfirmation !== "SUPPRIMER";

  const handleDeleteConfirmationChange = (value: string) => {
    setDeleteConfirmation(value);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "SUPPRIMER") {
      toast({
        title: "Confirmation invalide",
        description: "Veuillez saisir 'SUPPRIMER' pour confirmer.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDeleting(true);
      
      // Explicitly type this to avoid deep instantiation
      const { error } = await supabase.auth.admin.deleteUser(
        (await supabase.auth.getUser()).data.user?.id || ''
      );

      if (error) {
        throw error;
      }

      toast({
        title: "Compte supprimé",
        description: "Votre compte a été supprimé avec succès.",
      });

      // Sign out the user
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression du compte.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmation("");
    }
  };

  return {
    deleteConfirmation,
    isDeleteButtonDisabled,
    isDeleting,
    handleDeleteConfirmationChange,
    handleDeleteAccount,
  };
};
