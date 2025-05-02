
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Credential, CredentialFormData } from "./types";

interface CredentialFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingCredential: Credential | null;
  newCredential: Partial<CredentialFormData>;
  onNewCredentialChange: (credential: Partial<CredentialFormData>) => void;
  onEditingCredentialChange: (credential: Credential | null) => void;
  onSave: () => void;
  onCancel: () => void;
}

const CredentialFormDialog: React.FC<CredentialFormDialogProps> = ({
  isOpen,
  onOpenChange,
  editingCredential,
  newCredential,
  onNewCredentialChange,
  onEditingCredentialChange,
  onSave,
  onCancel
}) => {
  const credential = editingCredential || newCredential;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (editingCredential) {
      onEditingCredentialChange({
        ...editingCredential,
        [name]: value
      });
    } else {
      onNewCredentialChange({
        ...newCredential,
        [name]: value
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingCredential ? "Modifier un accès" : "Ajouter un nouvel accès"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="company">Nom de la société</Label>
            <Input
              id="company"
              name="company"
              value={credential.company || ""}
              onChange={handleChange}
              placeholder="Nom de la société"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="website">Site internet</Label>
            <Input
              id="website"
              name="website"
              value={credential.website || ""}
              onChange={handleChange}
              placeholder="exemple.com"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">Email / Identifiant</Label>
            <Input
              id="email"
              name="email"
              value={credential.email || ""}
              onChange={handleChange}
              placeholder="identifiant@exemple.com"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={credential.password || ""}
              onChange={handleChange}
              placeholder="Mot de passe"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              name="notes"
              value={credential.notes || ""}
              onChange={handleChange}
              placeholder="Informations complémentaires..."
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Annuler</Button>
          <Button onClick={onSave} className="bg-[#B88E23] hover:bg-[#8A6A1B] text-white">
            {editingCredential ? "Mettre à jour" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CredentialFormDialog;
