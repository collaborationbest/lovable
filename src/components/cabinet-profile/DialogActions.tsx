
import React from "react";
import { Button } from "@/components/ui/button";

interface DialogActionsProps {
  onSave: () => void;
  onClose: () => void;
}

/**
 * Composant pour les boutons d'action du dialogue
 */
const DialogActions: React.FC<DialogActionsProps> = ({ onSave, onClose }) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button
        onClick={onClose}
        variant="outline"
        className="border-[#B88E23]/20"
      >
        Annuler
      </Button>
      <Button
        onClick={onSave}
        className="bg-[#B88E23] hover:bg-[#B88E23]/90 text-white"
      >
        Enregistrer
      </Button>
    </div>
  );
};

export default DialogActions;
