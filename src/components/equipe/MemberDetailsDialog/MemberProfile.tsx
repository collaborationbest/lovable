import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar, Mail, Phone, MapPin, FileText, Clock, Building, Star } from "lucide-react";
import { TeamMember, DentalSpecialty } from "@/types/TeamMember";
import { calculateTimeWithCompany } from "@/utils/dateUtils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MemberProfileProps {
  member: TeamMember;
  isViewingOwner: boolean;
  canModifyAdminRights: boolean;
  onToggleAdmin?: (id: string, isAdmin: boolean) => void;
  onUpdateSpecialty?: (id: string, specialty: DentalSpecialty) => void;
  onOpenScheduleDialog?: () => void;
}

const MemberProfile: React.FC<MemberProfileProps> = ({
  member,
  isViewingOwner,
  canModifyAdminRights,
  onToggleAdmin,
  onUpdateSpecialty,
  onOpenScheduleDialog
}) => {

  const renderAdminControls = () => {
    if (!canModifyAdminRights || !onToggleAdmin) return null;

    return (
      <div className="admin-controls space-y-2">
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Droits administrateur</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleAdmin(member.id, !member.isAdmin)}
          >
            {member.isAdmin ? "Révoquer" : "Accorder"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="basic-info space-y-4">
        <div className="flex items-center gap-4 justify-between">
          <Badge className={`${member.role === 'dentiste' ? 'bg-blue-100 text-blue-800' : member.role === 'assistante' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
            {member.role === 'dentiste' ? 'Dentiste' : member.role === 'assistante' ? 'Assistante' : 'Secrétaire'}
          </Badge>
          
          {member.isAdmin && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
              Administrateur
            </Badge>
          )}
        </div>
        
        {member.contact && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{member.contact}</span>
          </div>
        )}
        
        {member.hireDate && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm">
              {calculateTimeWithCompany(member.hireDate)} - Depuis le {format(new Date(member.hireDate), 'PPP', { locale: fr })}
            </span>
          </div>
        )}
        
        {member.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{member.location}</span>
          </div>
        )}
        
        {member.contractType && (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{member.contractType}</span>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 flex-wrap">
        {member.workingDays && member.workingDays.length > 0 && (
          <Card className="w-full">
            <CardHeader className="py-2 px-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Jours travaillés
                </span>
                
                {onOpenScheduleDialog && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onOpenScheduleDialog}
                    className="h-7 px-2 text-xs"
                  >
                    Gérer planning
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <div className="flex flex-wrap gap-1">
                {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
                  const isWorking = member.workingDays?.includes(day as any);
                  const dayTranslations: Record<string, string> = {
                    monday: "Lun",
                    tuesday: "Mar",
                    wednesday: "Mer",
                    thursday: "Jeu",
                    friday: "Ven",
                    saturday: "Sam",
                    sunday: "Dim"
                  };
                  
                  return (
                    <Badge
                      key={day}
                      variant="outline"
                      className={`${isWorking ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                    >
                      {dayTranslations[day]}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="specialty-section space-y-2">
        {member.specialty && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Spécialité</span>
              {onUpdateSpecialty ? (
                <ToggleGroup
                  type="single"
                  defaultValue={member.specialty}
                  onValueChange={(value) => onUpdateSpecialty(member.id, value as DentalSpecialty)}
                >
                  <ToggleGroupItem value="omnipratique" aria-label="Omnipratique">
                    Omnipratique
                  </ToggleGroupItem>
                  <ToggleGroupItem value="orthodontie" aria-label="Orthodontie">
                    Orthodontie
                  </ToggleGroupItem>
                  <ToggleGroupItem value="parodontie" aria-label="Parodontie">
                    Parodontie
                  </ToggleGroupItem>
                </ToggleGroup>
              ) : (
                <span className="text-sm">{member.specialty}</span>
              )}
            </div>
          </>
        )}
      </div>

      {renderAdminControls()}
    </div>
  );
};

export default MemberProfile;
