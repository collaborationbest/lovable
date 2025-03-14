
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building } from "lucide-react";
import { useCabinetProfile } from "./useCabinetProfile";
import { UserProfileDialogProps } from "./types";
import CabinetMetadataForm from "./CabinetMetadataForm";
import DialogActions from "./DialogActions";
import { Spinner } from "@/components/ui/spinner";

const UserProfileDialog: React.FC<UserProfileDialogProps> = ({ 
  open, 
  onClose, 
  initialDoctors, 
  onSave, 
  currentCity, 
  onCityChange,
  currentOpeningDate = "",
  onOpeningDateChange = () => {},
  hideCloseButton = false,
  currentCabinetName = "",
  onCabinetNameChange = () => {},
  currentCabinetStatus = "en activité",
  onCabinetStatusChange = () => {}
}) => {
  const {
    doctors,
    city,
    cabinetName,
    openingDate,
    cabinetStatus,
    handleSave,
    handleDateSelect,
    setCity,
    setCabinetName,
    setCabinetStatus,
    isSaving
  } = useCabinetProfile(
    initialDoctors,
    currentCity,
    currentOpeningDate,
    onSave,
    onCityChange,
    onOpeningDateChange,
    onClose,
    currentCabinetName,
    onCabinetNameChange,
    currentCabinetStatus,
    onCabinetStatusChange
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && !isSaving) {
        onClose();
      }
    }} modal>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar" hideCloseButton={hideCloseButton}>
        <DialogHeader>
          <DialogTitle className="text-[#5C4E3D] flex items-center gap-2">
            <Building className="h-5 w-5" />
            Profil du Cabinet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isSaving ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Spinner className="h-8 w-8 text-[#B88E23] mb-4" />
              <p className="text-center text-[#5C4E3D]">Enregistrement en cours...</p>
            </div>
          ) : (
            <>
              <CabinetMetadataForm
                cabinetName={cabinetName}
                onCabinetNameChange={setCabinetName}
                city={city}
                onCityChange={setCity}
                openingDate={openingDate}
                onDateSelect={handleDateSelect}
                cabinetStatus={cabinetStatus}
                onCabinetStatusChange={setCabinetStatus}
              />

              <DialogActions onSave={handleSave} onClose={onClose} />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;
