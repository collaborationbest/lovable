
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MemberRole } from "@/types/TeamMember";
import { roles, roleLabels } from "@/utils/accessRightsData";

interface RoleSelectorProps {
  selectedRole: MemberRole;
  onRoleChange: (role: MemberRole) => void;
}

const RoleSelector = ({ selectedRole, onRoleChange }: RoleSelectorProps) => {
  return (
    <div className="flex items-center gap-4">
      <label htmlFor="role-select" className="text-sm font-medium">
        Sélectionnez un rôle :
      </label>
      <Select 
        value={selectedRole} 
        onValueChange={(value) => onRoleChange(value as MemberRole)}
      >
        <SelectTrigger className="w-[180px]" id="role-select">
          <SelectValue placeholder="Sélectionner un rôle" />
        </SelectTrigger>
        <SelectContent>
          {roles.map(role => (
            <SelectItem key={role} value={role}>
              {roleLabels[role]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RoleSelector;
