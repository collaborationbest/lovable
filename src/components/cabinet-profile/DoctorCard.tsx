
import React from "react";
import { Doctor } from "@/types/Doctor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface DoctorCardProps {
  /** Données du praticien */
  doctor: Doctor;
  /** Index du praticien dans la liste */
  index: number;
  /** Fonction de mise à jour d'un champ du praticien */
  onUpdate: (id: string, field: keyof Doctor, value: string) => void;
  /** Fonction de suppression du praticien */
  onRemove: (id: string) => void;
  /** Indique si le bouton de suppression doit être affiché */
  showRemoveButton: boolean;
}

/**
 * Composant pour afficher et modifier un praticien
 */
const DoctorCard: React.FC<DoctorCardProps> = ({ 
  doctor, 
  index, 
  onUpdate, 
  onRemove,
  showRemoveButton 
}) => {
  // Format the doctor's title properly
  const formattedTitle = doctor.title === "dr" ? "Dr" : "Pr";
  
  // Version en mode édition avec champs séparés pour titre, nom et prénom
  const renderEditMode = () => (
    <div className="space-y-3 p-4 border rounded-lg border-[#B88E23]/20 bg-[#F1F0FB]/50 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center border-b border-[#B88E23]/10 pb-2">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-[#D6BCFA] rounded-full flex items-center justify-center text-[#5C4E3D] font-medium mr-2">
            {doctor.firstName.charAt(0) || "D"}{doctor.lastName.charAt(0) || "D"}
          </div>
          <span className="text-sm font-medium text-[#5C4E3D]">
            {formattedTitle} {doctor.firstName} {doctor.lastName}
          </span>
        </div>
        {showRemoveButton && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onRemove(doctor.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Formulaire avec champs séparés */}
      <div className="grid gap-3">
        <div>
          <Label className="block text-sm text-[#454240] mb-1">
            Titre
          </Label>
          <Select
            value={doctor.title}
            onValueChange={(value) => onUpdate(doctor.id, "title", value)}
          >
            <SelectTrigger className="border-[#B88E23]/20 bg-white">
              <SelectValue placeholder="Sélectionnez" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dr">Dr</SelectItem>
              <SelectItem value="pr">Pr</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="block text-sm text-[#454240] mb-1">
            Nom
          </Label>
          <Input
            value={doctor.lastName}
            onChange={(e) => onUpdate(doctor.id, "lastName", e.target.value)}
            className="border-[#B88E23]/20 bg-white"
            placeholder="Nom"
          />
        </div>

        <div>
          <Label className="block text-sm text-[#454240] mb-1">
            Prénom
          </Label>
          <Input
            value={doctor.firstName}
            onChange={(e) => onUpdate(doctor.id, "firstName", e.target.value)}
            className="border-[#B88E23]/20 bg-white"
            placeholder="Prénom"
          />
        </div>
      </div>
    </div>
  );

  // Affichage en mode carte avec tout sur une seule ligne
  const renderCardView = () => (
    <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-md border border-gray-100">
      <CardContent className="p-4 flex items-center">
        {/* Avatar avec initiales */}
        <div className="h-16 w-16 bg-[#E7EFFF] rounded-full flex items-center justify-center text-[#4169E1] font-bold text-xl mr-4">
          {doctor.firstName.charAt(0) || ""}{doctor.lastName.charAt(0) || ""}
        </div>
        
        {/* Informations du docteur - format plus lisible */}
        <div className="flex-1">
          <div className="text-base font-medium text-black">
            {formattedTitle} {doctor.firstName} {doctor.lastName}
          </div>
        </div>
        
        {/* Delete button if needed */}
        {showRemoveButton && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onRemove(doctor.id)}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );

  // Pour UserProfileDialog, on continue d'utiliser le mode édition
  // Pour l'affichage normal, on utilise le nouveau format
  return window.location.pathname.includes('parametres') ? renderEditMode() : renderCardView();
};

export default DoctorCard;
