
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import useLocalStorage from "@/hooks/useLocalStorage";
import { MemberRole, PageAccessRights } from "@/types/TeamMember";
import { AccessControlState, AccessControlHook } from "@/types/AccessControl";
import { ACCOUNT_OWNER_EMAIL, CABINET_EMAIL } from "@/constants/accessControl";
import { checkCabinetOwnership } from "@/utils/cabinetOwnershipUtils";
import { fetchAccessRights, checkPageAccess } from "@/utils/accessRightsUtils";
import { useAuthState } from './useAuthState';
import { usePageAccess } from './usePageAccess';

export function useAccessControl(): AccessControlHook {
  const [accessRights, setAccessRights] = useLocalStorage<PageAccessRights[]>("page-access-rights", []);
  const { state } = useAuthState();
  const { hasAccess: checkAccess } = usePageAccess(
    state.userEmail,
    state.isAdmin,
    state.isAccountOwner,
    state.userRole,
    accessRights
  );

  // Fetch access rights from database
  useEffect(() => {
    const loadAccessRights = async () => {
      try {
        const rights = await fetchAccessRights();
        if (rights.length > 0) {
          setAccessRights(rights);
        }
      } catch (error) {
        console.error("Error in loadAccessRights:", error);
        // Continue with empty access rights, don't block the app
      }
    };

    loadAccessRights();
  }, []);

  const hasAccess = (pageId: string): boolean => {
    return checkAccess(pageId);
  };

  return {
    ...state,
    hasAccess
  };
}
