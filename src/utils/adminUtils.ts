
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Utilitaire pour supprimer tous les utilisateurs et réinitialiser l'application
 * ATTENTION: Cette fonction est destructive et supprimera toutes les données utilisateurs
 */
export const deleteAllUsers = async (): Promise<boolean> => {
  try {
    // Vérifier si l'utilisateur est bien connecté et est propriétaire du compte
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Vous devez être connecté pour effectuer cette opération");
      return false;
    }
    
    if (user.email !== 'r.haddadpro@gmail.com') {
      toast.error("Seul le propriétaire du compte peut effectuer cette opération");
      return false;
    }
    
    // Confirmation de l'utilisateur
    if (!window.confirm("ATTENTION: Cette action va supprimer TOUS les utilisateurs et leurs données associées. Cette action est irréversible. Êtes-vous vraiment sûr de vouloir continuer?")) {
      return false;
    }
    
    // Second niveau de confirmation
    const confirmText = prompt("Pour confirmer, veuillez saisir 'SUPPRIMER TOUS LES UTILISATEURS'");
    if (confirmText !== 'SUPPRIMER TOUS LES UTILISATEURS') {
      toast.error("Opération annulée: le texte de confirmation n'est pas correct");
      return false;
    }
    
    // Utiliser la fonction admin pour supprimer tous les utilisateurs sauf le propriétaire
    const { data, error } = await supabase.functions.invoke('delete-all-users', {
      body: { 
        adminEmail: 'r.haddadpro@gmail.com'
      }
    });
    
    if (error) {
      console.error("Erreur lors de la suppression des utilisateurs:", error);
      toast.error(`Erreur: ${error.message || "Une erreur est survenue"}`);
      return false;
    }
    
    console.log("Résultat de la suppression:", data);
    
    if (data.success) {
      toast.success(`${data.deletedCount || 0} utilisateurs ont été supprimés avec succès`);
      
      // Après suppression, déconnecter l'utilisateur et recharger la page
      setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.href = '/auth';
      }, 2000);
      
      return true;
    } else {
      toast.error(data.message || "Échec de l'opération");
      return false;
    }
  } catch (error: any) {
    console.error("Erreur critique:", error);
    toast.error(`Erreur critique: ${error.message || "Une erreur inconnue est survenue"}`);
    return false;
  }
};
