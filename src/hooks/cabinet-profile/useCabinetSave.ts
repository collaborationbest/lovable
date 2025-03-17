
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminTeamMember } from "./useAdminTeamMember";
import { Doctor } from "@/types/Doctor";
import { invalidateAuthCache } from "@/hooks/access-control/useAuthState";

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
  const [saveAttemptCount, setSaveAttemptCount] = useState(0);
  const [cabinetCreated, setCabinetCreated] = useState(false);

  /**
   * Saves changes and closes the dialog
   */
  const handleSave = useCallback(async () => {
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
      setSaveAttemptCount(prev => prev + 1);

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
        let cabinetCreationSuccess = false;
        
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
          cabinetCreationSuccess = true;
        } else {
          // Try multiple cabinet creation methods until one succeeds
          const methods = [
            // Method 1: Direct insert
            async () => {
              console.log("Attempting cabinet creation method 1: Direct insert");
              const newCabinetId = `cab_${Date.now().toString(36)}`;
              
              const { error: insertError } = await supabase
                .from('cabinets')
                .insert({
                  id: newCabinetId,
                  name: cabinetName,
                  city: city,
                  opening_date: openingDate ? openingDate.toISOString().split('T')[0] : null,
                  owner_id: userId,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  status: 'active'
                });
                
              if (insertError) {
                console.error("Error in method 1:", insertError);
                throw insertError;
              }
              
              return newCabinetId;
            },
            
            // Method 2: Edge Function
            async () => {
              console.log("Attempting cabinet creation method 2: Edge function");
              const { data, error: edgeError } = await supabase.functions.invoke('create-team-member', {
                body: {
                  action: 'create_cabinet',
                  cabinetName: cabinetName,
                  city: city,
                  openingDate: openingDate ? openingDate.toISOString().split('T')[0] : null,
                  ownerId: userId
                }
              });
              
              if (edgeError) {
                console.error("Error in method 2:", edgeError);
                throw edgeError;
              }
              
              const createdCabinetId = data?.data?.[0]?.id || `cab_${Date.now().toString(36)}_edgefn`;
              return createdCabinetId;
            },
            
            // Method 3: RPC Call
            async () => {
              console.log("Attempting cabinet creation method 3: RPC call");
              try {
                await (supabase.rpc as any)('create_cabinet_for_user', {
                  p_cabinet_name: cabinetName,
                  p_city: city,
                  p_opening_date: openingDate ? openingDate.toISOString().split('T')[0] : null
                });
                
                // Try to get the cabinet ID after creation
                const { data: finalCabinet } = await supabase
                  .from('cabinets')
                  .select('id')
                  .eq('owner_id', userId)
                  .maybeSingle();
                  
                if (!finalCabinet) {
                  throw new Error("Cabinet created but ID not retrieved");
                }
                
                return finalCabinet.id;
              } catch (rpcError) {
                console.error("Error in method 3:", rpcError);
                throw rpcError;
              }
            }
          ];
          
          // Try each method in sequence until one succeeds
          for (let i = 0; i < methods.length; i++) {
            try {
              cabinetId = await methods[i]();
              console.log(`Cabinet created successfully with method ${i+1}, ID: ${cabinetId}`);
              cabinetCreationSuccess = true;
              break;
            } catch (methodError) {
              console.error(`Method ${i+1} failed:`, methodError);
              // Continue to next method
            }
          }
          
          // If all methods failed, make one final attempt to check if a cabinet was created anyway
          if (!cabinetCreationSuccess) {
            const { data: checkCabinet } = await supabase
              .from('cabinets')
              .select('id')
              .eq('owner_id', userId)
              .maybeSingle();
              
            if (checkCabinet) {
              cabinetId = checkCabinet.id;
              cabinetCreationSuccess = true;
              console.log("Found existing cabinet despite creation failures:", cabinetId);
            } else {
              throw new Error("All cabinet creation methods failed");
            }
          }
        }
        
        setCabinetCreated(cabinetCreationSuccess);
        
        // Ensure the user has admin rights for this cabinet
        if (cabinetId) {
          try {
            const adminCreated = await ensureAdminTeamMember(userId, userEmail, cabinetId);
            
            if (!adminCreated) {
              console.warn("Failed to ensure admin privileges - user may not have full access");
              
              // Try direct creation as a fallback
              try {
                const { error: directTeamMemberError } = await supabase
                  .from('team_members')
                  .insert({
                    first_name: userEmail.split('@')[0],
                    last_name: '',
                    role: "dentiste",
                    contact: userEmail,
                    is_admin: true,
                    is_owner: true,
                    cabinet_id: cabinetId,
                    user_id: userId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });
                  
                if (directTeamMemberError) {
                  console.error("Error creating team member directly:", directTeamMemberError);
                } else {
                  console.log("Created team member directly as fallback");
                }
              } catch (directError) {
                console.error("Exception in direct team member creation:", directError);
              }
            }
          } catch (teamMemberError) {
            console.error("Error ensuring admin team member:", teamMemberError);
          }
        }
      }
      
      // Invalidate auth cache to refresh permissions
      invalidateAuthCache();
      
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
      
      // If we've tried less than 3 times and haven't created a cabinet yet, try again
      if (saveAttemptCount < 3 && !cabinetCreated) {
        console.log(`Retrying cabinet save (attempt ${saveAttemptCount + 1}/3)...`);
        setTimeout(() => handleSave(), 1000);
        return;
      }
      
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde du profil. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      if (cabinetCreated || saveAttemptCount >= 3) {
        setIsSaving(false);
      }
    }
  }, [
    cabinetName, city, doctors, ensureAdminTeamMember, onCabinetNameChange, 
    onCityChange, onClose, onOpeningDateChange, onSave, openingDate, 
    saveAttemptCount, cabinetCreated, toast
  ]);

  return {
    isSaving,
    setIsSaving,
    handleSave
  };
};
