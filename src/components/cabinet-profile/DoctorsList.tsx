
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Doctor } from "@/types/Doctor";
import DoctorCard from "./DoctorCard";

interface DoctorsListProps {
  doctors: Doctor[];
  onAddDoctorClick: () => void;
  onUpdateDoctor: (id: string, field: keyof Doctor, value: string) => void;
  onRemoveDoctor: (id: string) => void;
}

/**
 * Composant pour gérer la liste des praticiens
 */
const DoctorsList: React.FC<DoctorsListProps> = ({ 
  doctors, 
  onAddDoctorClick, 
  onUpdateDoctor, 
  onRemoveDoctor 
}) => {
  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-[#454240]">
          Praticiens
        </label>
        <Button 
          onClick={onAddDoctorClick} 
          variant="outline"
          className="border-[#B88E23]/20 text-[#B88E23] hover:bg-[#B88E23]/10"
        >
          <PlusCircle className="w-4 h-4 mr-1" />
          Ajouter
        </Button>
      </div>

      {/* Liste des praticiens */}
      {doctors.map((doctor, index) => (
        <DoctorCard
          key={doctor.id}
          doctor={doctor}
          index={index}
          onUpdate={onUpdateDoctor}
          onRemove={onRemoveDoctor}
          showRemoveButton={doctors.length > 1}
        />
      ))}
    </div>
  );
};

export default DoctorsList;
