
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { directDatabaseQuery } from "@/integrations/supabase/utils/queryUtils";

interface UseProfileManagementProps {
  userId: string | undefined;
  setLoading: (value: boolean) => void;
  onProfileUpdated?: (firstName: string, lastName: string) => void;
}

export const useProfileManagement = ({ 
  userId, 
  setLoading, 
  onProfileUpdated 
}: UseProfileManagementProps) => {
  const handleUpdateProfile = async (firstName: string, lastName: string) => {
    if (!userId) {
      toast({
        title: "Erreur",
        description: "ID utilisateur manquant. Veuillez vous reconnecter.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      console.log("Starting profile update process...");
      
      // First get the user's email
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user?.email) {
        console.error("Failed to get user information:", userError);
        throw new Error("Impossible de récupérer les informations utilisateur");
      }

      console.log("Current user data:", user);

      // Try with direct database query first
      const profileData = {
        id: userId,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date().toISOString()
      };

      console.log("Attempting direct profile update with data:", profileData);

      try {
        // First attempt: try direct database query to bypass RLS
        const { data: directUpdateData, error: directUpdateError } = await directDatabaseQuery('profiles', 'update', {
          data: profileData,
          filters: { id: userId },
          returning: true
        });

        if (directUpdateError) {
          console.log("Direct update failed, falling back to standard upsert:", directUpdateError);
          
          // Second attempt: standard upsert
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert(profileData);
          
          if (upsertError) {
            console.error("Profile upsert error:", upsertError);
            throw new Error(`Échec de la mise à jour du profil: ${upsertError.message}`);
          }
        } else {
          console.log("Direct profile update successful:", directUpdateData);
        }

        // Call the callback to update the UI
        if (onProfileUpdated) {
          onProfileUpdated(firstName, lastName);
        }

        toast({
          title: "Profil mis à jour",
          description: "Vos informations de profil ont été mises à jour avec succès.",
        });
      } catch (innerError: any) {
        console.error("Error during profile update:", innerError);
        throw innerError;
      }
    } catch (error: any) {
      console.error("Profile update failed:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour du profil.",
        variant: "destructive",
      });
    } finally {
      console.log("Update process complete, resetting loading state");
      setLoading(false);
    }
  };

  return { handleUpdateProfile };
};
