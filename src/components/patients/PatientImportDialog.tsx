
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface PatientImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFile: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => Promise<void>;
  importInProgress: boolean;
}

const PatientImportDialog: React.FC<PatientImportDialogProps> = ({
  open,
  onOpenChange,
  selectedFile,
  onFileChange,
  onUpload,
  importInProgress
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importer des patients</DialogTitle>
          <DialogDescription>
            Importez vos patients à partir d'un fichier CSV ou XLSX.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file-upload" className="text-right">
              Fichier
            </Label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv,.xlsx"
              onChange={onFileChange}
              className="col-span-3"
            />
          </div>
          {selectedFile && (
            <p className="text-sm text-muted-foreground">
              Fichier sélectionné: {selectedFile.name}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            variant="outline"
          >
            Annuler
          </Button>
          <Button 
            type="button" 
            onClick={onUpload}
            disabled={importInProgress || !selectedFile}
          >
            {importInProgress ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Traitement...
              </>
            ) : (
              "Prévisualiser"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PatientImportDialog;
