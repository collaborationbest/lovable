
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamMember, MemberRole, ContractType, DentalSpecialty } from "@/types/TeamMember";
import { Switch } from "@/components/ui/switch";
import { useAccessControl } from "@/hooks/useAccessControl";

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newMember: Omit<TeamMember, "id">;
  setNewMember: React.Dispatch<React.SetStateAction<Omit<TeamMember, "id">>>;
  onAddMember: () => void;
}

const AddMemberDialog: React.FC<AddMemberDialogProps> = ({
  open,
  onOpenChange,
  newMember,
  setNewMember,
  onAddMember
}) => {
  const { isAccountOwner } = useAccessControl();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMember({ ...newMember, [name]: value });
  };

  const handleRoleChange = (value: string) => {
    setNewMember({ ...newMember, role: value as MemberRole });
  };

  const handleContractTypeChange = (value: string) => {
    setNewMember({ ...newMember, contractType: value as ContractType });
  };

  const handleSpecialtyChange = (value: string) => {
    setNewMember({ ...newMember, specialty: value as DentalSpecialty });
  };
  
  const handleAdminToggle = (checked: boolean) => {
    setNewMember({ ...newMember, isAdmin: checked });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un membre à l'équipe</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firstName" className="text-right">
              Prénom*
            </Label>
            <Input
              id="firstName"
              name="firstName"
              value={newMember.firstName}
              onChange={handleInputChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastName" className="text-right">
              Nom*
            </Label>
            <Input
              id="lastName"
              name="lastName"
              value={newMember.lastName}
              onChange={handleInputChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contact" className="text-right">
              Email*
            </Label>
            <Input
              id="contact"
              name="contact"
              type="email"
              value={newMember.contact || ""}
              onChange={handleInputChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Rôle
            </Label>
            <Select 
              value={newMember.role} 
              onValueChange={handleRoleChange}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dentiste">Dentiste</SelectItem>
                <SelectItem value="assistante">Assistante</SelectItem>
                <SelectItem value="secrétaire">Secrétaire</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Only show specialty selection for dentists */}
          {newMember.role === "dentiste" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="specialty" className="text-right">
                Spécialité
              </Label>
              <Select 
                value={newMember.specialty || ""} 
                onValueChange={handleSpecialtyChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionnez une spécialité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="omnipratique">Omnipratique</SelectItem>
                  <SelectItem value="orthodontie">Orthodontie</SelectItem>
                  <SelectItem value="parodontie">Parodontie</SelectItem>
                  <SelectItem value="esthétique">Esthétique</SelectItem>
                  <SelectItem value="chirurgie orale">Chirurgie orale</SelectItem>
                  <SelectItem value="médecine bucco dentaire">Médecine bucco-dentaire</SelectItem>
                  <SelectItem value="pédodontie">Pédodontie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contractType" className="text-right">
              Type de contrat
            </Label>
            <Select 
              value={newMember.contractType} 
              onValueChange={handleContractTypeChange}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionnez un type de contrat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CDI">CDI</SelectItem>
                <SelectItem value="CDD">CDD</SelectItem>
                <SelectItem value="Contrat Pro">Contrat Pro</SelectItem>
                <SelectItem value="Stage">Stage</SelectItem>
                <SelectItem value="Indépendant">Indépendant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="hireDate" className="text-right">
              Date d'embauche
            </Label>
            <Input
              id="hireDate"
              name="hireDate"
              type="date"
              value={newMember.hireDate || ""}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          
          {/* Admin toggle - only visible to account owners */}
          {isAccountOwner && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isAdmin" className="text-right">
                Administrateur
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Switch 
                  id="isAdmin" 
                  checked={newMember.isAdmin || false}
                  onCheckedChange={handleAdminToggle}
                />
                <Label htmlFor="isAdmin" className="cursor-pointer">
                  Droits administrateur
                </Label>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onAddMember}>Ajouter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberDialog;
