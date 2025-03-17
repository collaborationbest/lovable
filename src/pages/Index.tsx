import { useState, useMemo, useEffect } from "react";
import DashboardContent from "@/components/dashboard/DashboardContent";
import UserProfileDialog from "@/components/cabinet-profile/UserProfileDialog";
import useLocalStorage from "@/hooks/useLocalStorage";
import { calculateTimeLeft } from "@/utils/dateUtils";
import { setupItems } from "@/data/checklistData";
import { Doctor } from "@/types/Doctor";
import { ChecklistItem } from "@/types/ChecklistItem";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Sidebar from "@/components/layout/Sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useProfileCheck } from "@/hooks/useProfileCheck";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  // État local et données persistantes
  const [checklist, setChecklist] = useLocalStorage<ChecklistItem[]>('checklist', setupItems);
  const [doctors, setDoctors] = useLocalStorage<Doctor[]>('doctors', []);
  const [city, setCity] = useLocalStorage<string>('city', "");
  const [cabinetName, setCabinetName] = useLocalStorage<string>('cabinetName', "");
  const [openingDate, setOpeningDate] = useLocalStorage<string>('openingDate', "");
  const [cabinetStatus, setCabinetStatus] = useLocalStorage<string>('cabinetStatus', "en activité");
  
  // État des dialogues
  const [showProfile, setShowProfile] = useState(false);
  
  // État de l'interface
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [timeLeft, setTimeLeft] = useState<{days: number, months: number} | null>(null);
  
  // Utilisation du hook pour vérifier le profil
  const { isLoading, showCabinetProfile } = useProfileCheck({ doctors });
  
  // Détecter les changements de taille d'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculer le temps restant avant l'ouverture
  useEffect(() => {
    if (openingDate) {
      const calculateAndSetTimeLeft = () => {
        setTimeLeft(calculateTimeLeft(openingDate));
      };
      
      calculateAndSetTimeLeft();
      
      // Actualiser quotidiennement
      const interval = setInterval(calculateAndSetTimeLeft, 1000 * 60 * 60 * 24);
      return () => clearInterval(interval);
    }
  }, [openingDate]);

  // Calculer le pourcentage de progression de la checklist
  const progressPercentage = useMemo(() => {
    const completedItems = checklist.filter(item => item.completed).length;
    return Math.round((completedItems / checklist.length) * 100);
  }, [checklist]);

  /**
   * Gestion des actions sur la checklist
   */
  const handleChecklistItemClick = (id: string) => {
    setChecklist(items =>
      items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleAddChecklistItem = (newItem: ChecklistItem) => {
    setChecklist(prevItems => [...prevItems, newItem]);
  };

  /**
   * Gestion du profil du cabinet
   */
  const handleSaveCabinetProfile = async (updatedDoctors: Doctor[]) => {
    try {
      // Sauvegarder les données localement
      setDoctors(updatedDoctors);
      
      // Marquer le profil comme configuré
      localStorage.setItem('profileConfigured', 'true');
      
      // Sauvegarder les données sur le serveur (si disponible)
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Implémenter l'appel API pour sauvegarder sur le serveur ici
        console.log("Sauvegarde du profil sur le serveur pour l'utilisateur:", session.user.id);
      }
      
      toast.success("Les informations de votre cabinet ont été enregistrées avec succès.");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du profil:", error);
      toast.error("Une erreur est survenue lors de l'enregistrement du profil.");
    }
  };

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
  };

  const handleCabinetNameChange = (newName: string) => {
    setCabinetName(newName);
  };

  const handleOpeningDateChange = (newDate: string) => {
    setOpeningDate(newDate);
  };

  const handleCabinetStatusChange = (newStatus: string) => {
    setCabinetStatus(newStatus);
  };

  /**
   * Fonction pour réinitialiser l'application
   */
  const handleReset = () => {
    // Vider le localStorage pour supprimer toutes les données
    localStorage.clear();
    
    // Réinitialiser les états
    setDoctors([]);
    setCity("");
    setCabinetName("");
    setOpeningDate("");
    setChecklist(setupItems);
    
    // Afficher à nouveau le dialogue de profil
    setShowProfile(true);
    
    toast.success("Toutes les données ont été effacées. Vous pouvez maintenant recommencer.");
  };

  // Afficher un loader pendant la vérification de l'état
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f2ee] to-white flex items-center justify-center p-4">
        <Spinner className="h-10 w-10 text-[#B88E23]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-b from-[#f5f2ee] to-white">
      {/* Barre latérale de navigation */}
      <Sidebar />
      
      <div className="flex-1 w-full h-screen content-area custom-scrollbar">
        {/* Dialogue de profil utilisateur (initial) */}
        <UserProfileDialog
          open={showCabinetProfile}
          onClose={() => {
            // Marquer le profil comme configuré même si l'utilisateur ferme sans sauvegarder
            localStorage.setItem('profileConfigured', 'true');
          }}
          initialDoctors={doctors}
          onSave={handleSaveCabinetProfile}
          currentCity={city}
          onCityChange={handleCityChange}
          currentOpeningDate={openingDate}
          onOpeningDateChange={handleOpeningDateChange}
          hideCloseButton={true}
          currentCabinetName={cabinetName}
          onCabinetNameChange={handleCabinetNameChange}
          currentCabinetStatus={cabinetStatus}
          onCabinetStatusChange={handleCabinetStatusChange}
        />
        
        {/* Dialogue de profil utilisateur (accessible depuis le bouton) */}
        <UserProfileDialog
          open={showProfile}
          onClose={() => setShowProfile(false)}
          initialDoctors={doctors}
          onSave={setDoctors}
          currentCity={city}
          onCityChange={setCity}
          currentOpeningDate={openingDate}
          onOpeningDateChange={setOpeningDate}
          currentCabinetName={cabinetName}
          onCabinetNameChange={setCabinetName}
          currentCabinetStatus={cabinetStatus}
          onCabinetStatusChange={setCabinetStatus}
        />
        
        {/* Contenu principal du tableau de bord */}
        <DashboardContent
          doctors={doctors}
          city={city}
          cabinetName={cabinetName}
          openingDate={openingDate}
          timeLeft={timeLeft}
          progressPercentage={progressPercentage}
          checklist={checklist}
          showProfileButton={!showCabinetProfile}
          onProfileClick={() => setShowProfile(true)}
          onChecklistItemClick={handleChecklistItemClick}
          onAddChecklistItem={handleAddChecklistItem}
          cabinetStatus={cabinetStatus}
        />
        
        {/* Bouton de réinitialisation */}
        {!showCabinetProfile && (
          <div className="fixed bottom-4 right-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="rounded-full p-3">
                  <RefreshCcw className="h-5 w-5 text-[#B88E23]" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Réinitialiser l'application</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action supprimera toutes vos données et vous ramènera à l'écran d'inscription.
                    Êtes-vous sûr(e) de vouloir continuer ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>Réinitialiser</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
        
        {/* Système de notifications toast */}
        <Toaster />
      </div>
    </div>
  );
};

export default Index;
