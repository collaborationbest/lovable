
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProfileManagement } from "@/hooks/parametres/useProfileManagement";
import { useAccountDeletion } from "@/hooks/parametres/useAccountDeletion";
import DeleteAccountDialog from "./DeleteAccountDialog";

interface ProfileSectionProps {
  userId: string | undefined;
  initialFirstName: string;
  initialLastName: string;
  loading: boolean;
  setLoading: (value: boolean) => void;
  onProfileUpdated?: (firstName: string, lastName: string) => void;
}

const ProfileSection = ({ 
  userId, 
  initialFirstName, 
  initialLastName, 
  loading, 
  setLoading,
  onProfileUpdated
}: ProfileSectionProps) => {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  
  const { handleUpdateProfile } = useProfileManagement({ 
    userId, 
    setLoading,
    onProfileUpdated
  });
  
  const { 
    deleteConfirmation, 
    isDeleteButtonDisabled, 
    isDeleting,
    handleDeleteConfirmationChange, 
    handleDeleteAccount 
  } = useAccountDeletion();
  
  useEffect(() => {
    setFirstName(initialFirstName);
    setLastName(initialLastName);
  }, [initialFirstName, initialLastName]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleUpdateProfile(firstName, lastName);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations personnelles</CardTitle>
        <CardDescription>
          Modifiez vos informations personnelles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Votre prénom"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Votre nom"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="mt-4 bg-[#B88E23] hover:bg-[#927219]"
            disabled={loading}
          >
            {loading ? "Mise à jour..." : "Mettre à jour le profil"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <div className="text-sm text-muted-foreground mb-4">
          Ces informations apparaîtront sur vos documents générés.
        </div>
        <DeleteAccountDialog
          deleteConfirmation={deleteConfirmation}
          isDeleteButtonDisabled={isDeleteButtonDisabled}
          onDeleteConfirmationChange={handleDeleteConfirmationChange}
          onDeleteAccount={handleDeleteAccount}
        />
      </CardFooter>
    </Card>
  );
};

export default ProfileSection;
