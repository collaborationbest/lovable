
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUp, Upload } from "lucide-react";

interface UploadContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadContract: () => void;
}

const UploadContractDialog: React.FC<UploadContractDialogProps> = ({ 
  open,
  onOpenChange,
  onUploadContract
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importer un contrat</DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <FileUp className="h-10 w-10 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-2">
              Cliquez pour sélectionner un fichier ou glissez-déposez
            </p>
            <p className="text-xs text-gray-400">
              Formats supportés: PDF, DOC, DOCX (max 5MB)
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={onUploadContract}
            >
              <Upload className="h-4 w-4 mr-2" />
              Sélectionner un fichier
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadContractDialog;
