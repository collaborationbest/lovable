
import { Doctor } from "@/types/Doctor";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for managing doctors within the cabinet profile
 */
export const useDoctorManagement = (
  doctors: Doctor[],
  setDoctors: React.Dispatch<React.SetStateAction<Doctor[]>>
) => {
  const { toast } = useToast();

  /**
   * Opens the doctor addition dialog
   */
  const handleAddDoctorClick = () => {
    return true; // This will be used to set isAddDoctorOpen to true
  };

  /**
   * Adds a new doctor to the list with complete information
   */
  const handleAddDoctor = (newDoctorData: Omit<Doctor, "id">) => {
    const newDoctor: Doctor = {
      id: Date.now().toString(),
      ...newDoctorData
    };
    setDoctors([...doctors, newDoctor]);
    toast({
      title: "Praticien ajouté",
      description: `${newDoctorData.title === 'dr' ? 'Dr' : 'Pr'} ${newDoctorData.lastName} ${newDoctorData.firstName} a été ajouté à la liste.`,
    });
  };

  /**
   * Removes a doctor from the list
   */
  const handleRemoveDoctor = (id: string) => {
    setDoctors(doctors.filter(doc => doc.id !== id));
  };

  /**
   * Updates a specific field of a doctor
   */
  const updateDoctor = (id: string, field: keyof Doctor, value: string) => {
    setDoctors(doctors.map(doc => 
      doc.id === id ? { ...doc, [field]: value } : doc
    ));
  };

  return {
    handleAddDoctorClick,
    handleAddDoctor,
    handleRemoveDoctor,
    updateDoctor
  };
};
