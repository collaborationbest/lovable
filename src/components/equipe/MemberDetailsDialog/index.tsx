import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2, Upload, Pencil, Save, Loader2 } from "lucide-react";
import { TeamMember, DentalSpecialty, WeekDay } from "@/types/TeamMember";
import { useAccessControl } from "@/hooks/useAccessControl";
import MemberProfile from "./MemberProfile";
import MemberEditForm from "./MemberEditForm";
import MemberScheduleDialog from "../MemberScheduleDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { LoadingButton } from "@/components/ui/loading-button";
import { Spinner } from "@/components/ui/spinner";
import { useCabinet } from "@/hooks/useCabinet";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const { cabinetId } = useCabinet();
  
  useEffect(() => {
    if (member) {
      setEditedMember({
        firstName: member.firstName,
        lastName: member.lastName,
        contact: member.contact,
        role: member.role,
        contractType: member.contractType,
        hireDate: member.hireDate,
        location: member.location,
        colorId: member.colorId || '',
        workingDays: member.workingDays || []
      });
    }
  }, [member]);
  
  if (!member) return null;
  
  const isViewingOwner = member.contact === userEmail && isAccountOwner;
  
  const canModifyAdminRights = (isAdmin || isAccountOwner) && !isViewingOwner;

  const handleEditToggle = async () => {
    if (isEditing) {
      if (onUpdateMember && member && Object.keys(editedMember).length > 0) {
        try {
          setIsLoading(true);
          await onUpdateMember(member.id, editedMember);
        } finally {
          setIsLoading(false);
          setIsEditing(false);
        }
      } else {
        setIsEditing(false);
      }
    } else {
      setEditedMember({
        firstName: member.firstName,
        lastName: member.lastName,
        contact: member.contact,
        role: member.role,
        contractType: member.contractType,
        hireDate: member.hireDate,
        location: member.location,
        colorId: member.colorId || '',
        workingDays: member.workingDays || []
      });
      setIsEditing(true);
    }
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
  
  const handleColorChange = (colorId: string) => {
    setEditedMember({ ...editedMember, colorId });
  };
  
  const handleWorkingDaysChange = (workingDays: WeekDay[]) => {
    setEditedMember({ ...editedMember, workingDays });
  };

  const handleDeleteMember = async () => {
    try {
      setIsDeleting(true);
      await onDelete(member.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderContent = () => (
    <>
      <div className="grid gap-4 py-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-6">
            <Spinner size="lg" className="border-[#B88E23]" />
            <p className="text-sm text-muted-foreground mt-2">
              {isEditing ? "Enregistrement en cours..." : "Chargement des données..."}
            </p>
          </div>
        ) : !isEditing ? (
          <MemberProfile 
            member={member}
            isViewingOwner={isViewingOwner}
            canModifyAdminRights={canModifyAdminRights}
            onToggleAdmin={onToggleAdmin}
            onUpdateSpecialty={onUpdateSpecialty}
            onOpenScheduleDialog={() => setIsScheduleDialogOpen(true)}
          />
        ) : (
          <MemberEditForm 
            editedMember={editedMember}
            handleInputChange={handleInputChange}
            handleRoleChange={handleRoleChange}
            handleContractTypeChange={handleContractTypeChange}
            handleColorChange={handleColorChange}
            handleWorkingDaysChange={handleWorkingDaysChange}
          />
        )}
      </div>

      <div className="flex justify-between items-center sm:justify-between mt-4">
        <LoadingButton 
          variant="outline" 
          onClick={handleEditToggle}
          className="flex items-center gap-2"
          isLoading={isLoading}
          loadingText={isEditing ? "Enregistrement..." : "Chargement..."}
          disabled={isDeleting}
          icon={isEditing ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
        >
          {isEditing ? "Enregistrer" : "Éditer"}
        </LoadingButton>
        
        <div className="flex gap-2">
          {(!isViewingOwner && !isEditing) && (
            <LoadingButton 
              variant="destructive" 
              onClick={handleDeleteMember} 
              className="flex items-center gap-2"
              isLoading={isDeleting}
              loadingText="Suppression..."
              disabled={isLoading}
              icon={<Trash2 className="h-4 w-4" />}
            >
              Supprimer
            </LoadingButton>
          )}
          
          {!member.contractFile && !isEditing && (
            <Button 
              className="flex items-center gap-2" 
              onClick={onOpenUploadDialog}
              disabled={isLoading || isDeleting}
            >
              <Upload className="h-4 w-4" />
              Importer contrat
            </Button>
          )}
          
          {isEditing && (
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              Annuler
            </Button>
          )}
        </div>
      </div>
    </>
  );

  return isMobile ? (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto py-6 px-6 h-[100dvh]">
        <SheetHeader className="text-left mb-4">
          <SheetTitle className="text-xl">
            {!isEditing ? (
              <>{member.role === "dentiste" ? "Dr. " : ""}{member.firstName} {member.lastName}</>
            ) : (
              <>Modifier le profil</>
            )}
          </SheetTitle>
        </SheetHeader>
        
        {renderContent()}
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog open={open} onOpenChange={isLoading || isDeleting ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {!isEditing ? (
              <>{member.role === "dentiste" ? "Dr. " : ""}{member.firstName} {member.lastName}</>
            ) : (
              <>Modifier le profil</>
            )}
          </DialogTitle>
        </DialogHeader>
        
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default MemberDetailsDialog;
