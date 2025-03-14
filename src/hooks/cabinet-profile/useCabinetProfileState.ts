
import { useState } from "react";
import { Doctor } from "@/types/Doctor";

/**
 * Hook for managing cabinet profile state
 */
export const useCabinetProfileState = (
  initialDoctors: Doctor[],
  initialCity: string,
  initialOpeningDate?: string,
  initialCabinetName?: string
) => {
  // Local dialog state
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [city, setCity] = useState(initialCity);
  const [cabinetName, setCabinetName] = useState(initialCabinetName || "");
  const [openingDate, setOpeningDate] = useState<Date | undefined>(
    initialOpeningDate ? new Date(initialOpeningDate) : undefined
  );
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  return {
    // State
    doctors,
    setDoctors,
    city,
    setCity,
    cabinetName,
    setCabinetName,
    openingDate,
    setOpeningDate,
    isAddDoctorOpen,
    setIsAddDoctorOpen,
    isSaving,
    setIsSaving,
    // Helper functions
    handleDateSelect: (date: Date | undefined) => {
      setOpeningDate(date);
    }
  };
};
