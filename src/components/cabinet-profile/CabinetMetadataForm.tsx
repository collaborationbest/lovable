
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CabinetMetadataFormProps {
  /** Nom du cabinet */
  cabinetName: string;
  /** Fonction appelée à la modification du nom du cabinet */
  onCabinetNameChange: (name: string) => void;
  /** Ville du cabinet */
  city: string;
  /** Fonction appelée à la modification de la ville */
  onCityChange: (city: string) => void;
  /** Date d'ouverture du cabinet */
  openingDate?: Date;
  /** Fonction appelée à la sélection d'une date */
  onDateSelect: (date: Date | undefined) => void;
  /** Statut du cabinet (en activité ou en création) */
  cabinetStatus?: string;
  /** Fonction appelée à la modification du statut */
  onCabinetStatusChange?: (status: string) => void;
}

/**
 * Composant pour gérer les métadonnées du cabinet (nom, ville, date d'ouverture)
 */
const CabinetMetadataForm: React.FC<CabinetMetadataFormProps> = ({
  cabinetName,
  onCabinetNameChange,
  city,
  onCityChange,
  openingDate,
  onDateSelect,
  cabinetStatus = "en activité",
  onCabinetStatusChange = () => {}
}) => {
  // État local pour stocker la valeur de l'input de date
  const [dateInputValue, setDateInputValue] = useState(formatDateForInput());
  
  // Fonction pour gérer la saisie de la date au format MM/YYYY
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDateInputValue(inputValue);
    
    // Si le champ est vide, on réinitialise la date
    if (!inputValue) {
      onDateSelect(undefined);
      return;
    }
    
    // On vérifie si la valeur saisie correspond au format MM/YYYY
    if (/^\d{2}\/\d{4}$/.test(inputValue)) {
      try {
        // On parse la date au format MM/YYYY
        const [month, year] = inputValue.split('/').map(Number);
        if (month && year && month >= 1 && month <= 12) {
          const date = new Date(year, month - 1, 1);
          onDateSelect(date);
        }
      } catch (error) {
        // En cas d'erreur de format, on ne fait rien
        console.log("Format de date invalide");
      }
    }
  };

  // Mettre à jour la valeur du champ de date quand openingDate change
  useEffect(() => {
    setDateInputValue(formatDateForInput());
  }, [openingDate]);

  // Formater la date au format MM/YYYY pour l'affichage
  function formatDateForInput() {
    if (!openingDate) return "";
    const month = openingDate.getMonth() + 1;
    const year = openingDate.getFullYear();
    return `${month.toString().padStart(2, '0')}/${year}`;
  }

  return (
    <div className="space-y-6">
      {/* Nom du cabinet */}
      <div className="space-y-2">
        <Label htmlFor="cabinetName" className="text-sm font-medium text-[#454240]">
          Nom du Cabinet
        </Label>
        <Input
          id="cabinetName"
          value={cabinetName}
          onChange={(e) => onCabinetNameChange(e.target.value)}
          className="border-[#B88E23]/20 focus:border-[#B88E23] focus-visible:ring-[#B88E23]/30"
          placeholder="Nom du cabinet"
        />
      </div>
      
      {/* Statut du cabinet */}
      <div className="space-y-2">
        <Label htmlFor="cabinetStatus" className="text-sm font-medium text-[#454240]">
          Statut du Cabinet
        </Label>
        <Select 
          value={cabinetStatus} 
          onValueChange={onCabinetStatusChange}
        >
          <SelectTrigger id="cabinetStatus" className="border-[#B88E23]/20 focus:border-[#B88E23] focus-visible:ring-[#B88E23]/30">
            <SelectValue placeholder="Sélectionner un statut" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="en activité">En activité</SelectItem>
            <SelectItem value="en création">En création</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Information sur la ville */}
      <div className="space-y-2">
        <Label htmlFor="city" className="text-sm font-medium text-[#454240]">
          Ville du Cabinet
        </Label>
        <Input
          id="city"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className="border-[#B88E23]/20 focus:border-[#B88E23] focus-visible:ring-[#B88E23]/30"
          placeholder="Ville"
        />
      </div>
      
      {/* Date d'ouverture prévue - seulement visible si le cabinet est en création */}
      {cabinetStatus === "en création" && (
        <div className="space-y-2">
          <Label htmlFor="openingDate" className="text-sm font-medium text-[#454240]">
            Date d'ouverture prévue
          </Label>
          <Input
            id="openingDate"
            value={dateInputValue}
            onChange={handleDateInputChange}
            className="border-[#B88E23]/20 focus:border-[#B88E23] focus-visible:ring-[#B88E23]/30"
            placeholder="MM/AAAA"
            pattern="\d{2}/\d{4}"
            inputMode="numeric"
          />
          <p className="text-xs text-gray-500 mt-1">Format: MM/AAAA (ex: 06/2024)</p>
        </div>
      )}
    </div>
  );
};

export default CabinetMetadataForm;
