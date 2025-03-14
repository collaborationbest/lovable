
import React, { useState } from "react";
import { TeamMember, DentalSpecialty } from "@/types/TeamMember";
import { Button } from "@/components/ui/button";
import { Activity, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MemberProfileProps {
  member: TeamMember;
  isViewingOwner: boolean;
  canModifyAdminRights: boolean;
  onToggleAdmin?: (id: string, isAdmin: boolean) => void;
  onUpdateSpecialty?: (id: string, specialty: DentalSpecialty) => void;
}

const MemberProfile: React.FC<MemberProfileProps> = ({
  member,
  isViewingOwner,
  canModifyAdminRights,
  onToggleAdmin,
  onUpdateSpecialty
}) => {
  const [editingSpecialty, setEditingSpecialty] = useState(false);
  
  const handleSpecialtyChange = (value: string) => {
    if (onUpdateSpecialty && member) {
      onUpdateSpecialty(member.id, value as DentalSpecialty);
      setEditingSpecialty(false);
    }
  };

  return (
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 text-lg font-medium">
            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
          </div>
          <div>
            <h3 className="font-medium text-lg">
              {member.role === "dentiste" ? "Dr. " : ""}{member.firstName} {member.lastName}
            </h3>
            <p className="text-gray-500 text-sm">{member.contact}</p>
            {isViewingOwner && (
              <Badge className="mt-1 bg-[#B88E23]">Propriétaire du compte</Badge>
            )}
          </div>
        </div>
        
        <p><span className="font-medium">Rôle:</span> {member.role.charAt(0).toUpperCase() + member.role.slice(1)}</p>
        
        {member.role === "dentiste" && (
          editingSpecialty ? (
            <div className="flex items-center gap-2 my-2">
              <span className="font-medium">Spécialité:</span>
              <Select 
                defaultValue={member.specialty || ""}
                onValueChange={handleSpecialtyChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sélectionner une spécialité" />
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
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setEditingSpecialty(false)}
                className="h-8 px-2"
              >
                Annuler
              </Button>
            </div>
          ) : (
            <p className="flex items-center gap-1">
              <span className="font-medium">Spécialité:</span> 
              <span className="flex items-center gap-1">
                <Activity className="h-4 w-4 text-blue-700" />
                {member.specialty ? member.specialty.charAt(0).toUpperCase() + member.specialty.slice(1) : "Non spécifiée"}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setEditingSpecialty(true)}
                  className="h-6 w-6 p-0 ml-1"
                >
                  <Pencil className="h-3.5 w-3.5 text-gray-500" />
                </Button>
              </span>
            </p>
          )
        )}
        
        {member.hireDate && <p><span className="font-medium">Date d'embauche:</span> {member.hireDate}</p>}
        
        {/* Admin toggle switch (only visible to admins) */}
        {canModifyAdminRights && (
          <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200">
            <Switch 
              id="admin-mode" 
              checked={member.isAdmin || false}
              onCheckedChange={(checked) => {
                if (onToggleAdmin) {
                  onToggleAdmin(member.id, checked);
                }
              }}
            />
            <Label htmlFor="admin-mode">Droits administrateur</Label>
          </div>
        )}
        
        {/* Always show admin badge for account owners */}
        {isViewingOwner && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-600 italic">
              Les propriétaires du compte ont automatiquement des droits d'administrateur.
            </p>
          </div>
        )}
      </div>
      
      <div>
        {member.contractFile ? (
          <div className="bg-green-50 text-green-700 px-3 py-2 rounded-md border border-green-100 flex items-center">
            <span className="font-medium">Contrat signé ✓</span>
          </div>
        ) : (
          <div className="bg-amber-50 text-amber-700 px-3 py-2 rounded-md border border-amber-100">
            <span className="font-medium">Sans contrat</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberProfile;
