
/**
 * DashboardContent - Composant principal du tableau de bord
 * Affiche l'en-tête, la barre de progression et la checklist
 */
import ProgressBar from "@/components/dashboard/ProgressBar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ChecklistContainer from "@/components/checklist/ChecklistContainer";
import { Doctor } from "@/types/Doctor";
import { ChecklistItem } from "@/types/ChecklistItem";

interface TimeLeft {
  days: number;
  months: number;
}

interface DashboardContentProps {
  doctors: Doctor[];
  city: string;
  cabinetName: string;
  openingDate: string;
  timeLeft: TimeLeft | null;
  progressPercentage: number;
  checklist: ChecklistItem[];
  showProfileButton: boolean;
  onProfileClick: () => void;
  onChecklistItemClick: (id: string) => void;
  onAddChecklistItem: (newItem: ChecklistItem) => void;
  onExportJSON?: () => void;
  onExportPDF?: () => void;
  cabinetStatus?: string;
}

const DashboardContent = ({
  doctors,
  city,
  cabinetName,
  openingDate,
  timeLeft,
  progressPercentage,
  checklist,
  showProfileButton,
  onProfileClick,
  onChecklistItemClick,
  onAddChecklistItem,
  cabinetStatus = "en activité"
}: DashboardContentProps) => {
  /**
   * Génère le titre du cabinet à partir des noms des praticiens
   * Format: "Cabinet du Dr NOM Prénom" ou "Cabinet des Drs NOM1 Prénom1 et NOM2 Prénom2"
   */
  const getFullNames = () => {
    // Si le nom du cabinet est défini, l'utiliser comme titre
    if (cabinetName) return cabinetName;
    
    // Sinon, générer un titre à partir des médecins
    if (doctors.length === 0) return "Bienvenue Dr.,";
    
    if (doctors.length === 1) {
      return `Cabinet du ${doctors[0].title.toUpperCase()} ${doctors[0].lastName} ${doctors[0].firstName}`;
    }
    
    const doctorsNames = doctors.map(doc => 
      `${doc.lastName} ${doc.firstName}`
    ).join(" et ");
    
    return `Cabinet des Drs ${doctorsNames}`;
  };

  // Déterminer si le cabinet est en cours de création
  const isCreationInProgress = cabinetStatus === "en création";

  return (
    <div className="pt-4 px-6 max-w-4xl mx-auto animate-slideIn">
      {/* En-tête avec informations du cabinet */}
      <DashboardHeader 
        title={getFullNames()}
        city={city}
        openingDate={isCreationInProgress ? openingDate : ""}
        timeLeft={isCreationInProgress ? timeLeft : null}
        showProfileButton={showProfileButton}
        onProfileClick={onProfileClick}
      />

      {/* Barre de progression globale - uniquement si le cabinet est en création */}
      {isCreationInProgress && (
        <div className="my-6">
          <ProgressBar percentage={progressPercentage} />
        </div>
      )}

      {/* Conteneur de la checklist - uniquement si le cabinet est en création */}
      {isCreationInProgress && (
        <div className="mt-6">
          <ChecklistContainer 
            checklist={checklist}
            onChecklistItemClick={onChecklistItemClick}
            onAddChecklistItem={onAddChecklistItem}
          />
        </div>
      )}

      {/* Message spécifique pour les cabinets en activité */}
      {!isCreationInProgress && (
        <div className="mt-6 p-6 bg-white rounded-lg shadow-sm border border-[#B88E23]/10">
          <p className="text-center text-[#5C4E3D]">
            Bienvenue à votre tableau de bord de cabinet en activité.
          </p>
        </div>
      )}
    </div>
  );
};

export default DashboardContent;
