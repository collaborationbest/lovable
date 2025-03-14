
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Doctor } from "@/types/Doctor";

interface AddDoctorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddDoctor: (doctor: Omit<Doctor, "id">) => void;
}

const AddDoctorDialog: React.FC<AddDoctorDialogProps> = ({
  open,
  onOpenChange,
  onAddDoctor
}) => {
  const [newDoctor, setNewDoctor] = useState<Omit<Doctor, "id">>({
    title: "",
    firstName: "",
    lastName: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctor.title || !newDoctor.firstName || !newDoctor.lastName) {
      return; // Prevent submission if any field is empty
    }
    onAddDoctor(newDoctor);
    setNewDoctor({ title: "", firstName: "", lastName: "" }); // Reset form
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#5C4E3D]">Ajouter un praticien</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[#454240]">Titre</Label>
            <Select
              value={newDoctor.title}
              onValueChange={(value) => setNewDoctor({ ...newDoctor, title: value })}
            >
              <SelectTrigger className="border-[#B88E23]/20 bg-white">
                <SelectValue placeholder="Sélectionnez" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dr">Dr</SelectItem>
                <SelectItem value="pr">Pr</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-[#454240]">Nom</Label>
            <Input
              id="lastName"
              value={newDoctor.lastName}
              onChange={(e) => setNewDoctor({ ...newDoctor, lastName: e.target.value })}
              className="border-[#B88E23]/20 bg-white"
              placeholder="Nom"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-[#454240]">Prénom</Label>
            <Input
              id="firstName"
              value={newDoctor.firstName}
              onChange={(e) => setNewDoctor({ ...newDoctor, firstName: e.target.value })}
              className="border-[#B88E23]/20 bg-white"
              placeholder="Prénom"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={!newDoctor.title || !newDoctor.firstName || !newDoctor.lastName}>
              Ajouter
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDoctorDialog;
