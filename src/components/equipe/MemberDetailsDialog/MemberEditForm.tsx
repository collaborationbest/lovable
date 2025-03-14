
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MemberRole, ContractType } from "@/types/TeamMember";

interface MemberEditFormProps {
  editedMember: Partial<{
    firstName: string;
    lastName: string;
    contact: string;
    role: MemberRole;
    contractType: ContractType;
    hireDate: string;
  }>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRoleChange: (value: string) => void;
  handleContractTypeChange: (value: string) => void;
}

const MemberEditForm: React.FC<MemberEditFormProps> = ({
  editedMember,
  handleInputChange,
  handleRoleChange,
  handleContractTypeChange
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="firstName" className="text-right">
          Prénom*
        </Label>
        <Input
          id="firstName"
          name="firstName"
          value={editedMember.firstName || ""}
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
          value={editedMember.lastName || ""}
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
          value={editedMember.contact || ""}
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
          value={editedMember.role} 
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
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="contractType" className="text-right">
          Type de contrat
        </Label>
        <Select 
          value={editedMember.contractType} 
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
          value={editedMember.hireDate || ""}
          onChange={handleInputChange}
          className="col-span-3"
        />
      </div>
    </div>
  );
};

export default MemberEditForm;
