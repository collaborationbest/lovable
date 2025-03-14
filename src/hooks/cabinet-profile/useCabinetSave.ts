
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminTeamMember } from "./useAdminTeamMember";
import { Doctor } from "@/types/Doctor";

interface UseCabinetSaveProps {
  doctors: Doctor[];
  city: string;
  cabinetName: string;
  openingDate?: Date;
  onSave?: (doctors: Doctor[]) => void;
  onCityChange?: (city: string) => void;
  onOpeningDateChange?: (date: string) => void;
  onCabinetNameChange?: (name: string) => void;
  onClose?: () => void;
}

/**
 * Hook for saving cabinet profile data
 */
export const useCabinetSave = ({
  doctors,
  city,
  cabinetName,
  openingDate,
  onSave,
  onCityChange,
  onOpeningDateChange,
  onCabinetNameChange,
  onClose
}: UseCabinetSaveProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { ensureAdminTeamMember } = useAdminTeamMember();

  /**
   * Saves changes and closes the dialog
   */
  const handleSave = async () => {
    if (!cabinetName.trim()) {
      toast({
        title: "Information incomplète",
        description: "Veuillez saisir le nom du cabinet",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);

      // Save data
      if (onSave) onSave(doctors);
      if (onCityChange) onCityChange(city);
      if (onCabinetNameChange) onCabinetNameChange(cabinetName);
      if (openingDate && onOpeningDateChange) {
        onOpeningDateChange(openingDate.toISOString());
      }
      
      // Mark profile as configured
      localStorage.setItem('profileConfigured', 'true');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const userId = session.user.id;
        const userEmail = session.user.email;
        
        if (!userEmail) {
          throw new Error("User email not available");
        }
        
        // Check if a cabinet already exists
        const { data: existingCabinet, error: cabinetError } = await supabase
          .from('cabinets')
          .select('id')
          .eq('owner_id', userId)
          .maybeSingle();
        
        if (cabinetError) {
          console.error("Error checking cabinet:", cabinetError);
        }
        
        let cabinetId;
        
        if (existingCabinet) {
          // Update existing cabinet
          const { error: updateError } = await supabase
            .from('cabinets')
            .update({
              name: cabinetName,
              city: city,
              opening_date: openingDate ? openingDate.toISOString().split('T')[0] : null,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingCabinet.id);
            
          if (updateError) {
            console.error("Error updating cabinet:", updateError);
            throw updateError;
          }
            
          cabinetId = existingCabinet.id;
          console.log(`Cabinet updated with ID: ${cabinetId}`);
        } else {
          // Create a new cabinet
          const newCabinetId = `cab_${Date.now().toString(36)}`;
          
          const { error: insertError } = await supabase
            .from('cabinets')
            .insert({
              id: newCabinetId,
              name: cabinetName,
              city: city,
              opening_date: openingDate ? openingDate.toISOString().split('T')[0] : null,
              owner_id: userId
            });
            
          if (insertError) {
            console.error("Error creating cabinet:", insertError);
            throw insertError;
          }
          
          cabinetId = newCabinetId;
          console.log(`New cabinet created with ID: ${cabinetId}`);
        }
        
        // Ensure the user has admin rights for this cabinet
        const adminCreated = await ensureAdminTeamMember(userId, userEmail, cabinetId);
        
        if (!adminCreated) {
          console.warn("Failed to ensure admin privileges - user may not have full access");
        }
      }
      
      toast({
        title: "Profil mis à jour",
        description: "Les informations du cabinet ont été enregistrées",
      });

      // Close the popup immediately after saving
      if (onClose) {
        onClose();
      }
      
      // Force a page refresh to update access rights
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du profil:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde du profil",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    setIsSaving,
    handleSave
  };
};
