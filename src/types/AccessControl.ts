
import { MemberRole } from "./TeamMember";

export interface AccessControlState {
  isAdmin: boolean;
  isAccountOwner: boolean;
  userRole: MemberRole | null;
  userEmail: string | null;
  loading: boolean;
  error: Error | null;
}

export interface AccessControlHook extends AccessControlState {
  hasAccess: (pageId: string) => boolean;
}
