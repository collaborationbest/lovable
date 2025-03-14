
import { MemberRole, PageAccessRights } from "@/types/TeamMember";
import { ACCOUNT_OWNER_EMAIL, CABINET_EMAIL } from "@/constants/accessControl";
import { checkPageAccess } from "@/utils/accessRightsUtils";

export function usePageAccess(
  userEmail: string | null,
  isAdmin: boolean,
  isAccountOwner: boolean,
  userRole: MemberRole | null,
  accessRights: PageAccessRights[]
) {
  const hasAccess = (pageId: string): boolean => {
    return checkPageAccess(
      pageId,
      userEmail,
      isAdmin,
      isAccountOwner,
      userRole,
      accessRights,
      ACCOUNT_OWNER_EMAIL,
      CABINET_EMAIL
    );
  };

  return { hasAccess };
}
