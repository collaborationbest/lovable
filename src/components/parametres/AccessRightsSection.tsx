
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAccessControl } from "@/hooks/useAccessControl";
import { useAccessRights } from "@/hooks/parametres/useAccessRights";
import RoleSelector from "./access-rights/RoleSelector";
import AccessRightsTable from "./access-rights/AccessRightsTable";

const AccessRightsSection = () => {
  const { isAdmin } = useAccessControl();
  const {
    accessRights,
    selectedRole,
    isSaving,
    isLoading,
    setSelectedRole,
    handlePageToggle,
    handleSaveChanges
  } = useAccessRights();

  // If not admin, don't render the component
  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestion des droits d'accès</CardTitle>
          <CardDescription>
            Vous n'avez pas les permissions nécessaires pour accéder à cette fonctionnalité.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestion des droits d'accès</CardTitle>
          <CardDescription>
            Chargement des droits d'accès...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des droits d'accès</CardTitle>
        <CardDescription>
          Définissez quels rôles peuvent accéder à chaque section de la plateforme.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <RoleSelector 
            selectedRole={selectedRole} 
            onRoleChange={setSelectedRole} 
          />
          
          <AccessRightsTable 
            accessRights={accessRights} 
            selectedRole={selectedRole} 
            onPageToggle={handlePageToggle} 
          />
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessRightsSection;
