import { useState } from "react";
import { Doctor } from "@/types/Doctor";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCabinetProfile = (
  initialDoctors: Doctor[],
  initialCity: string,
  initialOpeningDate?: string,
  onSave?: (doctors: Doctor[]) => void,
  onCityChange?: (city: string) => void,
  onOpeningDateChange?: (date: string) => void,
  onClose?: () => void,
  initialCabinetName?: string,
  onCabinetNameChange?: (name: string) => void,
  initialCabinetStatus?: string,
  onCabinetStatusChange?: (status: string) => void
) => {
  // État local du dialogue
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [city, setCity] = useState(initialCity);
  const [cabinetName, setCabinetName] = useState(initialCabinetName || "");
  const [openingDate, setOpeningDate] = useState<Date | undefined>(
    initialOpeningDate ? new Date(initialOpeningDate) : undefined
  );
  const [cabinetStatus, setCabinetStatus] = useState(initialCabinetStatus || "en activité");
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast: uiToast } = useToast();

  /**
   * Ouvre le dialogue d'ajout de praticien
   */
  const handleAddDoctorClick = () => {
    setIsAddDoctorOpen(true);
  };

  /**
   * Ajoute un nouveau praticien à la liste avec les informations complètes
   */
  const handleAddDoctor = (newDoctorData: Omit<Doctor, "id">) => {
    const newDoctor: Doctor = {
      id: Date.now().toString(),
      ...newDoctorData
    };
    setDoctors([...doctors, newDoctor]);
    uiToast({
      title: "Praticien ajouté",
      description: `${newDoctor.title === 'dr' ? 'Dr' : 'Pr'} ${newDoctor.lastName} ${newDoctor.firstName} a été ajouté à la liste.`,
    });
  };

  /**
   * Supprime un praticien de la liste
   */
  const handleRemoveDoctor = (id: string) => {
    setDoctors(doctors.filter(doc => doc.id !== id));
  };

  /**
   * Met à jour un champ spécifique d'un praticien
   */
  const updateDoctor = (id: string, field: keyof Doctor, value: string) => {
    setDoctors(doctors.map(doc => 
      doc.id === id ? { ...doc, [field]: value } : doc
    ));
  };

  /**
   * Crée ou met à jour un membre d'équipe comme admin pour l'utilisateur actuel
   */
  const ensureAdminTeamMember = async (userId: string, userEmail: string, cabinetId: string) => {
    console.log(`Ensuring admin privileges for user ${userEmail} in cabinet ${cabinetId}`);
    
    try {
      // Extraire prénom et nom à partir de l'email ou utiliser des valeurs par défaut
      let firstName = userEmail.split('@')[0];
      let lastName = "";

      // Essayer d'extraire un nom propre si possible
      const nameParts = firstName.split(/[._-]/);
      if (nameParts.length > 1) {
        firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
        lastName = nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1);
      } else {
        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
      }

      // D'abord vérifier si l'utilisateur a déjà une entrée team_member
      const { data: existingTeamMember, error: checkError } = await supabase
        .from('team_members')
        .select('id, is_admin, is_owner, cabinet_id')
        .eq('contact', userEmail)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking existing team member:", checkError);
        // Continuer avec la création - on ne veut pas bloquer complètement le processus
      }
      
      if (existingTeamMember) {
        console.log("Existing team member found:", existingTeamMember);
        
        // Si l'entrée existe mais n'est pas admin ou a un cabinet_id différent
        if (!existingTeamMember.is_admin || existingTeamMember.cabinet_id !== cabinetId) {
          console.log("Updating team member with admin privileges");
          
          const { error: updateError } = await supabase
            .from('team_members')
            .update({
              is_admin: true,
              is_owner: true,
              cabinet_id: cabinetId
            })
            .eq('id', existingTeamMember.id);
            
          if (updateError) {
            console.error("Failed to update team member with admin privileges:", updateError);
            throw updateError;
          }
          
          console.log("Team member updated with admin privileges");
        } else {
          console.log("User already has admin privileges for this cabinet");
        }
      } else {
        console.log("No existing team member found, creating new one");
        
        // Tenter d'abord une insertion directe
        const { data: directInsert, error: directInsertError } = await supabase
          .from('team_members')
          .insert({
            first_name: firstName,
            last_name: lastName,
            role: "dentiste",
            contact: userEmail,
            is_admin: true,
            is_owner: true,
            cabinet_id: cabinetId,
            user_id: userId
          })
          .select()
          .single();
        
        if (directInsertError) {
          console.error("Direct team member insertion failed:", directInsertError);
          console.log("Falling back to edge function for team member creation");
          
          // Fallback à la fonction edge pour contourner les problèmes de RLS
          try {
            const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('create-team-member', {
              body: {
                memberData: {
                  first_name: firstName,
                  last_name: lastName,
                  role: "dentiste",
                  contact: userEmail,
                  is_admin: true,
                  is_owner: true,
                  cabinet_id: cabinetId,
                  user_id: userId
                },
                email: userEmail,
                firstName,
                lastName
              }
            });
            
            if (edgeFunctionError) {
              console.error("Edge function error:", edgeFunctionError);
              throw edgeFunctionError;
            }
            
            console.log("Team member created via edge function:", edgeFunctionData);
          } catch (edgeFunctionException) {
            console.error("Exception calling edge function:", edgeFunctionException);
            throw edgeFunctionException;
          }
        } else {
          console.log("Team member created directly:", directInsert);
        }
      }
      
      // Envoi d'une notification à l'utilisateur
      toast.success("Droits d'administrateur attribués avec succès", {
        duration: 4000
      });
      
      return true;
    } catch (error) {
      console.error("Error ensuring admin team member:", error);
      return false;
    }
  };

  /**
   * Sauvegarde les modifications et ferme le dialogue
   */
  const handleSave = async () => {
    if (!cabinetName.trim()) {
      uiToast({
        title: "Information incomplète",
        description: "Veuillez saisir le nom du cabinet",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);

      if (onSave) onSave(doctors);
      if (onCityChange) onCityChange(city);
      if (onCabinetNameChange) onCabinetNameChange(cabinetName);
      if (openingDate && onOpeningDateChange) {
        onOpeningDateChange(openingDate.toISOString());
      }
      if (onCabinetStatusChange) {
        onCabinetStatusChange(cabinetStatus);
      }
      
      // Marquer le profil comme configuré
      localStorage.setItem('profileConfigured', 'true');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const userId = session.user.id;
        const userEmail = session.user.email;
        
        if (!userEmail) {
          throw new Error("User email not available");
        }
        
        // Vérifier si un cabinet existe déjà
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
          // Mettre à jour le cabinet existant
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
          // Créer un nouveau cabinet
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
        
        // S'assurer que l'utilisateur a les droits d'admin pour ce cabinet
        const adminCreated = await ensureAdminTeamMember(userId, userEmail, cabinetId);
        
        if (!adminCreated) {
          console.warn("Failed to ensure admin privileges - user may not have full access");
        }
      }
      
      uiToast({
        title: "Profil mis à jour",
        description: "Les informations du cabinet ont été enregistrées",
      });

      // Fermer la popup immédiatement après la sauvegarde
      if (onClose) {
        onClose();
      }
      
      // Forcer un rafraîchissement de la page pour mettre à jour les droits d'accès
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du profil:", error);
      uiToast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde du profil",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  /**
   * Gère la sélection d'une date
   */
  const handleDateSelect = (date: Date | undefined) => {
    setOpeningDate(date);
  };

  return {
    doctors,
    city,
    cabinetName,
    openingDate,
    cabinetStatus,
    isAddDoctorOpen,
    isSaving,
    setIsAddDoctorOpen,
    handleAddDoctorClick,
    handleAddDoctor,
    handleRemoveDoctor,
    updateDoctor,
    handleSave,
    handleDateSelect,
    setCity,
    setCabinetName,
    setCabinetStatus,
  };
};
