
import { useState } from "react";
import { X, Link } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type Document = {
  id: string;
  name: string;
  file_type: string;
  size: number;
  url: string;
  folder_id: string | null;
  created_at: string;
  document_type?: string;
};

type DocumentDialogsProps = {
  newFolderDialogOpen: boolean;
  setNewFolderDialogOpen: (open: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  handleCreateFolder: () => Promise<void>;
  
  renameDialogOpen: boolean;
  setRenameDialogOpen: (open: boolean) => void;
  itemToRename: {id: string, name: string, type: 'folder' | 'document'} | null;
  newName: string;
  setNewName: (name: string) => void;
  handleRename: () => Promise<void>;
  
  shareDialogOpen: boolean;
  setShareDialogOpen: (open: boolean) => void;
  shareLink: string;
  
  previewDialogOpen: boolean;
  setPreviewDialogOpen: (open: boolean) => void;
  documentToPreview: Document | null;
};

const DocumentDialogs = ({
  newFolderDialogOpen,
  setNewFolderDialogOpen,
  newFolderName,
  setNewFolderName,
  handleCreateFolder,
  
  renameDialogOpen,
  setRenameDialogOpen,
  itemToRename,
  newName,
  setNewName,
  handleRename,
  
  shareDialogOpen,
  setShareDialogOpen,
  shareLink,
  
  previewDialogOpen,
  setPreviewDialogOpen,
  documentToPreview
}: DocumentDialogsProps) => {
  const { toast } = useToast();

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Lien copié",
      description: "Le lien de partage a été copié dans le presse-papiers."
    });
  };

  return (
    <>
      {/* New Folder Dialog */}
      <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau dossier</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Nom du dossier"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="mb-4"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleCreateFolder} 
              className="bg-[#B88E23] hover:bg-[#927219]"
              disabled={!newFolderName.trim()}
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Renommer {itemToRename?.type === 'folder' ? 'le dossier' : 'le document'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Nouveau nom"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mb-4"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleRename} 
              className="bg-[#B88E23] hover:bg-[#927219]"
              disabled={!newName.trim()}
            >
              Renommer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Partager le dossier</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-2">
              Partagez ce lien pour permettre à d'autres personnes de télécharger des fichiers dans ce dossier
            </p>
            <div className="flex">
              <Input
                value={shareLink}
                readOnly
                className="flex-1 pr-10"
              />
              <Button 
                onClick={handleCopyShareLink} 
                className="ml-2"
                variant="outline"
              >
                <Link className="h-4 w-4 mr-2" />
                Copier
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShareDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-lg truncate max-w-[90%]">
              {documentToPreview?.name}
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setPreviewDialogOpen(false)}
              className="absolute right-4 top-4 h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {documentToPreview && (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
                <img 
                  src="/placeholder.svg" 
                  alt={documentToPreview.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentDialogs;
