
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamMember, MemberRole, ContractType, DentalSpecialty, WeekDay } from "@/types/TeamMember";
import { Switch } from "@/components/ui/switch";
import { useAccessControl } from "@/hooks/useAccessControl";
import WorkingDaysSelector from "./MemberDetailsDialog/WorkingDaysSelector";
import ColorSelector from "./MemberDetailsDialog/ColorSelector";
import { Loader2 } from "lucide-react";

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newMember: Omit<TeamMember, "id">;
  setNewMember: React.Dispatch<React.SetStateAction<Omit<TeamMember, "id">>>;
  onAddMember: () => void;
  isSubmitting?: boolean;
}

const AddMemberDialog: React.FC<AddMemberDialogProps> = ({
  open,
  onOpenChange,
  newMember,
  setNewMember,
  onAddMember,
  isSubmitting = false
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
  
  const handleColorChange = (colorId: string) => {
    setNewMember({ ...newMember, colorId });
  };
  
  const handleWorkingDaysChange = (workingDays: WeekDay[]) => {
    setNewMember({ ...newMember, workingDays });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 mt-16 sm:mt-0">
        <DialogHeader className="pb-2">
          <DialogTitle>Ajouter un membre à l'équipe</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-3 sm:gap-4">
            <Label htmlFor="firstName" className="sm:text-right sm:col-span-1">
              Prénom*
            </Label>
            <Input
              id="firstName"
              name="firstName"
              value={newMember.firstName}
              onChange={handleInputChange}
              className="sm:col-span-4"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-3 sm:gap-4">
            <Label htmlFor="lastName" className="sm:text-right sm:col-span-1">
              Nom*
            </Label>
            <Input
              id="lastName"
              name="lastName"
              value={newMember.lastName}
              onChange={handleInputChange}
              className="sm:col-span-4"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-3 sm:gap-4">
            <Label htmlFor="contact" className="sm:text-right sm:col-span-1">
              Email*
            </Label>
            <Input
              id="contact"
              name="contact"
              type="email"
              value={newMember.contact || ""}
              onChange={handleInputChange}
              className="sm:col-span-4"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-3 sm:gap-4">
            <Label htmlFor="role" className="sm:text-right sm:col-span-1">
              Rôle
            </Label>
            <Select 
              value={newMember.role} 
              onValueChange={handleRoleChange}
            >
              <SelectTrigger className="sm:col-span-4">
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dentiste">Dentiste</SelectItem>
                <SelectItem value="assistante">Assistante</SelectItem>
                <SelectItem value="secrétaire">Secrétaire</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Color selector */}
          <div className="grid grid-cols-1 sm:grid-cols-5 items-start gap-3 sm:gap-4">
            <Label className="sm:text-right sm:col-span-1">
              Couleur
            </Label>
            <div className="sm:col-span-4">
              <ColorSelector 
                selectedColor={newMember.colorId || ""} 
                onChange={handleColorChange} 
              />
            </div>
          </div>
          
          {/* Working days selector */}
          <div className="grid grid-cols-1 sm:grid-cols-5 items-start gap-3 sm:gap-4">
            <Label className="sm:text-right sm:col-span-1">
              Jours travaillés
            </Label>
            <div className="sm:col-span-4">
              <WorkingDaysSelector 
                selectedDays={newMember.workingDays || []} 
                onChange={handleWorkingDaysChange} 
              />
            </div>
          </div>
          
          {/* Only show specialty selection for dentists */}
          {newMember.role === "dentiste" && (
            <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-3 sm:gap-4">
              <Label htmlFor="specialty" className="sm:text-right sm:col-span-1">
                Spécialité
              </Label>
              <Select 
                value={newMember.specialty || ""} 
                onValueChange={handleSpecialtyChange}
              >
                <SelectTrigger className="sm:col-span-4">
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
          
          <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-3 sm:gap-4">
            <Label htmlFor="contractType" className="sm:text-right sm:col-span-1">
              Type de contrat
            </Label>
            <Select 
              value={newMember.contractType} 
              onValueChange={handleContractTypeChange}
            >
              <SelectTrigger className="sm:col-span-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-3 sm:gap-4">
            <Label htmlFor="hireDate" className="sm:text-right sm:col-span-1">
              Date d'embauche
            </Label>
            <Input
              id="hireDate"
              name="hireDate"
              type="date"
              value={newMember.hireDate || ""}
              onChange={handleInputChange}
              className="sm:col-span-4"
            />
          </div>
          
          {/* Admin toggle - only visible to account owners */}
          {isAccountOwner && (
            <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-3 sm:gap-4">
              <Label htmlFor="isAdmin" className="sm:text-right sm:col-span-1">
                Administrateur
              </Label>
              <div className="sm:col-span-4 flex items-center gap-2">
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

          {/* Birth date field */}
          <div className="grid grid-cols-1 sm:grid-cols-5 items-center gap-3 sm:gap-4">
            <Label htmlFor="birthDate" className="sm:text-right sm:col-span-1">
              Date de naissance
            </Label>
            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              value={newMember.birthDate || ""}
              onChange={handleInputChange}
              className="sm:col-span-4"
            />
          </div>
        </div>
        <DialogFooter className="mt-4 sm:mt-6 flex justify-end">
          <Button 
            type="submit" 
            onClick={onAddMember} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ajout en cours...
              </>
            ) : (
              "Ajouter"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberDialog;
