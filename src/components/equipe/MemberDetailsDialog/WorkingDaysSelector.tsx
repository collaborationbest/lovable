
import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { WeekDay } from "@/types/TeamMember";

interface WorkingDaysSelectorProps {
  selectedDays: WeekDay[];
  onChange: (days: WeekDay[]) => void;
}

const weekDays: { value: WeekDay; label: string }[] = [
  { value: "monday", label: "Lundi" },
  { value: "tuesday", label: "Mardi" },
  { value: "wednesday", label: "Mercredi" },
  { value: "thursday", label: "Jeudi" },
  { value: "friday", label: "Vendredi" },
  { value: "saturday", label: "Samedi" },
  { value: "sunday", label: "Dimanche" },
];

const WorkingDaysSelector: React.FC<WorkingDaysSelectorProps> = ({ selectedDays, onChange }) => {
  const handleToggleDay = (day: WeekDay) => {
    const isSelected = selectedDays.includes(day);
    let updatedDays: WeekDay[];
    
    if (isSelected) {
      updatedDays = selectedDays.filter(d => d !== day);
    } else {
      updatedDays = [...selectedDays, day];
    }
    
    onChange(updatedDays);
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Jours travaillés</Label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {weekDays.map((day) => (
          <div className="flex items-center space-x-2" key={day.value}>
            <Checkbox 
              id={`day-${day.value}`}
              checked={selectedDays.includes(day.value)}
              onCheckedChange={() => handleToggleDay(day.value)}
            />
            <Label 
              htmlFor={`day-${day.value}`}
              className="cursor-pointer"
            >
              {day.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkingDaysSelector;
