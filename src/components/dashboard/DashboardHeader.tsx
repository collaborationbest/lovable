
/**
 * DashboardHeader - Affiche l'en-tête du tableau de bord avec les informations du cabinet
 * et un bouton permettant d'accéder au profil du cabinet.
 */
import { Button } from "@/components/ui/button";
import { Building, Download } from "lucide-react";

interface TimeLeft {
  days: number;
  months: number;
}

interface DashboardHeaderProps {
  title: string;
  city: string;
  openingDate: string;
  timeLeft: TimeLeft | null;
  showProfileButton: boolean;
  onProfileClick: () => void;
  onExportJSON?: () => void;
  onExportPDF?: () => void;
}

const DashboardHeader = ({
  title,
  city,
  openingDate,
  timeLeft,
  showProfileButton,
  onProfileClick,
  onExportJSON,
  onExportPDF
}: DashboardHeaderProps) => {
  return (
    <div className="mb-6 relative">
      {/* Bouton d'accès au profil positionné en haut à droite de façon absolue */}
      <div className="absolute top-0 right-0">
        {showProfileButton && (
          <Button
            variant="outline"
            onClick={onProfileClick}
            className="text-[#5C4E3D] border-[#B88E23]/20 hover:bg-[#B88E23]/10 hover:text-[#B88E23]"
            size="sm"
          >
            <Building className="mr-2 h-4 w-4" />
            Profil du Cabinet
          </Button>
        )}
      </div>
      
      <div className="flex flex-col mb-4 pr-36">
        {/* Titre du cabinet aligné à gauche avec taille réduite pour éviter les retours à la ligne */}
        <h1 className="text-2xl md:text-3xl font-bold text-[#5C4E3D] text-left truncate">
          {title || "Bienvenue dans Open Ordo"}
        </h1>
        
        {/* Informations du cabinet alignées à gauche */}
        {city && (
          <div className="text-sm text-[#454240] mt-2 text-left">
            <span>{city}</span>
            {openingDate && timeLeft && (
              <span className="ml-2">
                • Ouverture prévue dans {timeLeft.months} mois et {timeLeft.days} jours
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
