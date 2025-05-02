
import { Button } from "@/components/ui/button";
import { Building, Download, LayoutDashboard } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useState, useEffect } from "react";

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
  const isMobile = useIsMobile();
  const {
    profile,
    loading: profileLoading
  } = useUserProfile();
  const [displayName, setDisplayName] = useState("");

  // Set display name from profile
  useEffect(() => {
    if (profileLoading) return;
    if (profile) {
      const firstName = profile.first_name || "";
      const lastName = profile.last_name || "";
      if (firstName || lastName) {
        setDisplayName(`${firstName} ${lastName}`.trim());
        return;
      }
      if (profile.email) {
        const emailName = profile.email.split('@')[0] || "";
        setDisplayName(emailName);
        return;
      }
    }
    setDisplayName("Bienvenue");
  }, [profile, profileLoading]);

  return (
    <div className="mb-6 relative">
      {/* Export buttons positioned in top right absolutely */}
      <div className="absolute top-0 right-0 space-x-2 flex">
        {onExportJSON && (
          <Button 
            variant="outline" 
            onClick={onExportJSON} 
            className="text-[#5C4E3D] border-[#B88E23]/20 hover:bg-[#B88E23]/10 hover:text-[#B88E23]" 
            size="sm"
          >
            <Download className="mr-2 h-4 w-4" />
            JSON
          </Button>
        )}
        
        {onExportPDF && (
          <Button 
            variant="outline" 
            onClick={onExportPDF} 
            className="text-[#5C4E3D] border-[#B88E23]/20 hover:bg-[#B88E23]/10 hover:text-[#B88E23]" 
            size="sm"
          >
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
        )}
        
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
      
      <div className="flex items-center gap-4 mb-4">
        <div className="h-10 w-10 rounded-full bg-[#f5f2ee] flex items-center justify-center text-[#B88E23]">
          <LayoutDashboard size={20} />
        </div>
        <div className={`${isMobile ? 'pt-10' : 'pr-36'}`}>
          <h1 className="text-2xl font-semibold text-[#5C4E3D]">
            {title || "Bienvenue dans Open Ordo"}
          </h1>
          
          {/* Cabinet information */}
          {city && (
            <div className="text-sm text-[#454240]">
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
    </div>
  );
};

export default DashboardHeader;
