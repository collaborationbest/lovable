
import { Doctor } from "@/types/Doctor";
import { useCabinetProfileState } from "./useCabinetProfileState";
import { useDoctorManagement } from "./useDoctorManagement";
import { useCabinetSave } from "./useCabinetSave";

/**
 * Main hook for cabinet profile management
 * Combines smaller, more focused hooks
 */
export const useCabinetProfile = (
  initialDoctors: Doctor[],
  initialCity: string,
  initialOpeningDate?: string,
  onSave?: (doctors: Doctor[]) => void,
  onCityChange?: (city: string) => void,
  onOpeningDateChange?: (date: string) => void,
  onClose?: () => void,
  initialCabinetName?: string,
  onCabinetNameChange?: (name: string) => void
) => {
  // Use the state management hook
  const {
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
    handleDateSelect
  } = useCabinetProfileState(initialDoctors, initialCity, initialOpeningDate, initialCabinetName);

  // Use the doctor management hook
  const {
    handleAddDoctorClick,
    handleAddDoctor,
    handleRemoveDoctor,
    updateDoctor
  } = useDoctorManagement(doctors, setDoctors);

  // Use the cabinet save hook
  const { handleSave } = useCabinetSave({
    doctors,
    city,
    cabinetName,
    openingDate,
    onSave,
    onCityChange,
    onOpeningDateChange,
    onCabinetNameChange,
    onClose
  });

  // Handle add doctor click with state update
  const onAddDoctorClick = () => {
    if (handleAddDoctorClick()) {
      setIsAddDoctorOpen(true);
    }
  };

  return {
    // State
    doctors,
    city,
    cabinetName,
    openingDate,
    isAddDoctorOpen,
    isSaving,
    
    // Setters
    setIsAddDoctorOpen,
    setCity,
    setCabinetName,
    
    // Actions
    handleAddDoctorClick: onAddDoctorClick,
    handleAddDoctor,
    handleRemoveDoctor,
    updateDoctor,
    handleSave,
    handleDateSelect,
  };
};
