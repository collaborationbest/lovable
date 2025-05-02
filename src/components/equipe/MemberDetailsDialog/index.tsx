
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Upload, Pencil, Save } from "lucide-react";
import { TeamMember, DentalSpecialty } from "@/types/TeamMember";
import { useAccessControl } from "@/hooks/useAccessControl";
import MemberProfile from "./MemberProfile";
import MemberEditForm from "./MemberEditForm";

interface MemberDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  onDelete: (id: string) => void;
  onUploadContract: (filePath: string, fileName: string) => void;
  onOpenUploadDialog: () => void;
  onToggleAdmin?: (id: string, isAdmin: boolean) => void;
  onUpdateSpecialty?: (id: string, specialty: DentalSpecialty) => void;
  onUpdateMember?: (id: string, updatedMember: Partial<TeamMember>) => void;
}

const MemberDetailsDialog: React.FC<MemberDetailsDialogProps> = ({
  open,
  onOpenChange,
  member,
  onDelete,
  onOpenUploadDialog,
  onToggleAdmin,
  onUpdateSpecialty,
  onUpdateMember
}) => {
  const { isAdmin, isAccountOwner, userEmail } = useAccessControl();
  const [isEditing, setIsEditing] = useState(false);
  const [editedMember, setEditedMember] = useState<Partial<TeamMember>>({});
  
  if (!member) return null;
  
  // Check if the currently viewed member is the account owner
  const isViewingOwner = member.contact === userEmail && isAccountOwner;
  
  // Determine if we can modify admin rights
  // Account owners can't have their admin rights revoked
  const canModifyAdminRights = (isAdmin || isAccountOwner) && !isViewingOwner;

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      if (onUpdateMember && member && Object.keys(editedMember).length > 0) {
        onUpdateMember(member.id, editedMember);
      }
    } else {
      // Start editing - initialize the editedMember with current values
      setEditedMember({
        firstName: member.firstName,
        lastName: member.lastName,
        contact: member.contact,
        role: member.role,
        contractType: member.contractType,
        hireDate: member.hireDate,
        location: member.location
      });
    }
    setIsEditing(!isEditing);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedMember({ ...editedMember, [name]: value });
  };

  const handleRoleChange = (value: string) => {
    setEditedMember({ ...editedMember, role: value as TeamMember["role"] });
  };

  const handleContractTypeChange = (value: string) => {
    setEditedMember({ ...editedMember, contractType: value as TeamMember["contractType"] });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {!isEditing && (
              <>
                {member.role === "dentiste" ? "Dr. " : ""}{member.firstName} {member.lastName}
              </>
            )}
            {isEditing && (
              <>Modifier le profil</>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {!isEditing ? (
            // View mode
            <MemberProfile 
              member={member}
              isViewingOwner={isViewingOwner}
              canModifyAdminRights={canModifyAdminRights}
              onToggleAdmin={onToggleAdmin}
              onUpdateSpecialty={onUpdateSpecialty}
            />
          ) : (
            // Edit mode
            <MemberEditForm 
              editedMember={editedMember}
              handleInputChange={handleInputChange}
              handleRoleChange={handleRoleChange}
              handleContractTypeChange={handleContractTypeChange}
            />
          )}
        </div>

        <DialogFooter className="flex justify-between items-center sm:justify-between">
          {/* Edit button - always visible */}
          <Button 
            variant="outline" 
            onClick={handleEditToggle}
            className="flex items-center gap-2"
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4" />
                Enregistrer
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                Éditer
              </>
            )}
          </Button>
          
          <div className="flex gap-2">
            {/* Don't allow account owners to delete themselves */}
            {(!isViewingOwner && !isEditing) && (
              <Button variant="destructive" onClick={() => onDelete(member.id)} className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            )}
            
            {!member.contractFile && !isEditing && (
              <Button className="flex items-center gap-2" onClick={onOpenUploadDialog}>
                <Upload className="h-4 w-4" />
                Importer contrat
              </Button>
            )}
            
            {isEditing && (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2"
              >
                Annuler
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MemberDetailsDialog;
