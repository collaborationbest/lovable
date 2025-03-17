
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
      toast.default({
        title: "Confirmation invalide",
        description: "Veuillez saisir 'SUPPRIMER' pour confirmer.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDeleting(true);
      
      // Get current user
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      
      if (!userId) {
        throw new Error("Utilisateur non connecté");
      }
      
      // Perform the delete operation
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) {
        throw error;
      }

      toast.default({
        title: "Compte supprimé",
        description: "Votre compte a été supprimé avec succès.",
      });

      // Sign out the user
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.default({
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
