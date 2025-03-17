import React, { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUp, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UploadContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadContract: (filePath: string, fileName: string) => void;
}

const UploadContractDialog: React.FC<UploadContractDialogProps> = ({ 
  open,
  onOpenChange,
  onUploadContract
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoize file change handler
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check file type
      const acceptedTypes = ['.pdf', '.doc', '.docx', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const fileType = file.type;
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!acceptedTypes.includes(fileType) && !acceptedTypes.includes(fileExtension)) {
        toast.error("Veuillez sélectionner un fichier PDF, DOC ou DOCX.");
        return;
      }
      
      // Check file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La taille du fichier ne doit pas dépasser 5MB.");
        return;
      }
      
      setSelectedFile(file);
    }
  }, []);

  const handleSelectFileClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const resetDialog = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Handle dialog close
  const handleDialogChange = useCallback((open: boolean) => {
    if (!open) {
      resetDialog();
    }
    onOpenChange(open);
  }, [onOpenChange, resetDialog]);

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Veuillez sélectionner un fichier à télécharger.");
      return;
    }

    setIsUploading(true);
    
    try {
      // Generate a unique file path
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const filePath = `contracts/${fileName}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('team-contracts')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        throw error;
      }
      
      // Call the onUploadContract function with the file path
      onUploadContract(filePath, selectedFile.name);
      
      toast.success("Le contrat a été téléchargé avec succès.");
      
      // Close the dialog and reset form
      resetDialog();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error uploading contract:", error);
      toast.error(error.message || "Une erreur est survenue lors du téléchargement du contrat.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importer un contrat</DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <FileUp className="h-10 w-10 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-2">
              {selectedFile ? selectedFile.name : "Cliquez pour sélectionner un fichier ou glissez-déposez"}
            </p>
            <p className="text-xs text-gray-400">
              Formats supportés: PDF, DOC, DOCX (max 5MB)
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleSelectFileClick}
            >
              <Upload className="h-4 w-4 mr-2" />
              Sélectionner un fichier
            </Button>
          </div>
        </div>
        <DialogFooter className="flex justify-between space-x-2">
          <Button variant="outline" onClick={() => handleDialogChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? "Téléchargement..." : "Télécharger"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadContractDialog;
