
import { useState, useEffect } from "react";
import { PageAccessRights, MemberRole } from "@/types/TeamMember";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import useLocalStorage from "@/hooks/useLocalStorage";
import { pages } from "@/utils/accessRightsData";

export const useAccessRights = () => {
  const defaultAccessRights: PageAccessRights[] = pages.map(page => ({
    pageId: page.id,
    pageName: page.name,
    roles: ["dentiste", "assistante", "secrétaire"] as MemberRole[]
  }));

  const [localAccessRights, setLocalAccessRights] = useLocalStorage<PageAccessRights[]>(
    "page-access-rights",
    defaultAccessRights
  );

  const [accessRights, setAccessRights] = useState<PageAccessRights[]>(defaultAccessRights);
  const [selectedRole, setSelectedRole] = useState<MemberRole>("dentiste");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch access rights from Supabase on component mount
  useEffect(() => {
    const fetchAccessRights = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('access_rights')
          .select('*');

        if (error) {
          console.error("Error fetching access rights:", error);
          // If there's an error fetching from database, use local storage as fallback
        } else if (data && data.length > 0) {
          // If we have data from the database, use it
          const formattedRights: PageAccessRights[] = data.map(item => ({
            pageId: item.page_id,
            pageName: pages.find(p => p.id === item.page_id)?.name || item.page_id,
            roles: item.roles as MemberRole[]
          }));

          setAccessRights(formattedRights);
          // Also update localStorage for offline usage
          setLocalAccessRights(formattedRights);
          console.log("Access rights loaded from database:", formattedRights);
        } else {
          // No data in the database yet, initialize with local storage values
          console.log("No access rights found in database, using defaults");
        }
      } catch (error) {
        console.error("Error in fetchAccessRights:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccessRights();
  }, []);

  const handlePageToggle = (pageId: string) => {
    setAccessRights(prev =>
      prev.map(page => {
        if (page.pageId === pageId) {
          if (page.roles.includes(selectedRole)) {
            // Don't allow removing all roles from a page
            const otherRolesExist = page.roles.filter(r => r !== selectedRole).length > 0;
            if (otherRolesExist) {
              return { ...page, roles: page.roles.filter(r => r !== selectedRole) };
            } else {
              // Show toast if this is the last role with access
              toast.default({
                title: "Action non autorisée",
                description: "Au moins un rôle doit avoir accès à cette page.",
                variant: "destructive"
              });
              return page;
            }
          } else {
            return { ...page, roles: [...page.roles, selectedRole] };
          }
        }
        return page;
      })
    );
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);

      // Save to Supabase
      // First, delete existing records
      await supabase
        .from('access_rights')
        .delete()
        .gt('id', 0);

      // Then insert all the updated access rights
      const accessRightsToInsert = accessRights.map(right => ({
        page_id: right.pageId,
        roles: right.roles
      }));

      const { error } = await supabase
        .from('access_rights')
        .insert(accessRightsToInsert);

      if (error) {
        throw error;
      }

      // Also update local storage
      setLocalAccessRights(accessRights);

      toast.default({
        title: "Droits d'accès mis à jour",
        description: "Les modifications ont été enregistrées avec succès."
      });
    } catch (error) {
      console.error("Error saving access rights:", error);
      toast.default({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde des droits d'accès.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    accessRights,
    selectedRole,
    isSaving,
    isLoading,
    setSelectedRole,
    handlePageToggle,
    handleSaveChanges
  };
};
