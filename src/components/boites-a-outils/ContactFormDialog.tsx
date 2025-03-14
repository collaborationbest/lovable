
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Contact, ContactFormData } from "./types";

interface ContactFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingContact: Contact | null;
  newContact: ContactFormData;
  onNewContactChange: (contact: ContactFormData) => void;
  onEditingContactChange: (contact: Contact) => void;
  onSave: () => void;
  onCancel: () => void;
}

const ContactFormDialog = ({
  isOpen,
  onOpenChange,
  editingContact,
  newContact,
  onNewContactChange,
  onEditingContactChange,
  onSave,
  onCancel
}: ContactFormDialogProps) => {
  
  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    if (editingContact) {
      onEditingContactChange({
        ...editingContact,
        [field]: value
      });
    } else {
      onNewContactChange({
        ...newContact,
        [field]: value
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingContact ? "Modifier un contact" : "Ajouter un contact"}</DialogTitle>
          <DialogDescription>
            {editingContact 
              ? "Modifiez les informations du contact ci-dessous." 
              : "Remplissez les informations du nouveau contact ci-dessous."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="company">Société</Label>
              <Input
                id="company"
                value={editingContact ? editingContact.company : newContact.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={editingContact ? editingContact.firstName : newContact.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={editingContact ? editingContact.lastName : newContact.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={editingContact ? editingContact.phone : newContact.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editingContact ? editingContact.email : newContact.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="type" className="mb-2 block">Type de contact</Label>
              <Select
                value={editingContact ? editingContact.type : newContact.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comptable">Comptable</SelectItem>
                  <SelectItem value="assureur">Assureur</SelectItem>
                  <SelectItem value="banquier">Banquier</SelectItem>
                  <SelectItem value="technicien">Technicien</SelectItem>
                  <SelectItem value="fournisseur">Fournisseur</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button 
            onClick={onSave}
            className="bg-[#B88E23] hover:bg-[#8A6A1B] text-white"
          >
            {editingContact ? "Enregistrer" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactFormDialog;
