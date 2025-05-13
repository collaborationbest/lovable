
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Laboratory, Prosthetic } from "@/types/Prosthetic";
import { TeamMember } from "@/types/TeamMember";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";

interface ProstheticBoxProps {
  prosthetic: Prosthetic;
  laboratories: Laboratory[];
  dentists: TeamMember[];
  onUpdateStatus: (id: string, status: "pending" | "arrived" | "ready-to-ship") => void;
  onDeleteProsthetic: (id: string) => void;
  onEditProsthetic: (prosthetic: Prosthetic) => void;
  statusLabels: Record<string, string>;
  statusColors: Record<string, string>;
}

const ProstheticBox: React.FC<ProstheticBoxProps> = ({
  prosthetic,
  laboratories,
  dentists,
  onUpdateStatus,
  onDeleteProsthetic,
  onEditProsthetic,
  statusLabels,
  statusColors
}) => {
  const getLaboratoryName = (labId: string) => {
    const laboratory = laboratories.find(lab => lab.id === labId);
    return laboratory ? laboratory.name : labId;
  };

  const getDentistName = (dentistId: string | undefined) => {
    if (!dentistId) return "";
    const dentist = dentists.find(d => d.id === dentistId);
    return dentist ? `${dentist.firstName} ${dentist.lastName}` : "";
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">
              {prosthetic.patientfirstname} {prosthetic.patientlastname}
            </h3>
            <p className="text-sm text-muted-foreground">
              {prosthetic.prosthetictype}
            </p>
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${statusColors[prosthetic.status]}`}>
            {statusLabels[prosthetic.status]}
          </span>
        </div>

        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Laboratoire:</span>
            <span>{getLaboratoryName(prosthetic.laboratory)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dentiste:</span>
            <span>{getDentistName(prosthetic.dentistid)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date d'arrivée:</span>
            <span>{new Date(prosthetic.arrivaldate).toLocaleDateString()}</span>
          </div>
          {prosthetic.departuredate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date de départ:</span>
              <span>{new Date(prosthetic.departuredate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 gap-2">
          <Select
            value={prosthetic.status}
            onValueChange={(value: "pending" | "arrived" | "ready-to-ship") => {
              onUpdateStatus(prosthetic.id, value);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Changer le statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="arrived">Arrivée</SelectItem>
              <SelectItem value="ready-to-ship">Prête à l'envoi</SelectItem>
            </SelectContent>
          </Select>
          
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-40">
              <ContextMenuItem onClick={() => onEditProsthetic(prosthetic)}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onDeleteProsthetic(prosthetic.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProstheticBox;
