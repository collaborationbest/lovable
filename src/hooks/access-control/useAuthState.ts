
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { MemberRole } from "@/types/TeamMember";
import { AccessControlState } from "@/types/AccessControl";
import { ACCOUNT_OWNER_EMAIL, CABINET_EMAIL } from "@/constants/accessControl";
import { checkCabinetOwnership } from "@/utils/cabinetOwnershipUtils";

export function useAuthState() {
  const [state, setState] = useState<AccessControlState>({
    userRole: null,
    isAdmin: false,
    isAccountOwner: false,
    loading: true,
    userEmail: null,
    error: null
  });

  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error fetching session:", error);
          setState(prev => ({ ...prev, loading: false, error: error as Error }));
          return;
        }

        const session = sessionData?.session;
        const email = session?.user?.email || null;
        
        if (!email || !session) {
          setState({
            userEmail: null,
            isAccountOwner: false,
            isAdmin: false,
            userRole: null,
            loading: false,
            error: null
          });
          return;
        }
        
        // Check if this is the account owner email or cabinet email (case-insensitive)
        const isAccountOwner = email.toLowerCase() === ACCOUNT_OWNER_EMAIL.toLowerCase() || 
                               email.toLowerCase() === CABINET_EMAIL.toLowerCase();
        
        console.log(`Checking access for user: ${email}, isAccountOwner: ${isAccountOwner}`);
        
        // Try to get the user's role from team_members
        let userRole: MemberRole = "dentiste"; // Default role
        let isAdmin = isAccountOwner; // Account owner is always admin
        
        try {
          // Check if user is a cabinet owner - this should make them admin
          const isCabinetOwner = await checkCabinetOwnership(session.user.id, email);
          if (isCabinetOwner) {
            isAdmin = true;
          }
          
          // Check team member status and role
          const { data: teamMemberData, error: teamMemberError } = await supabase
            .from('team_members')
            .select('role, is_admin, is_owner, cabinet_id')
            .eq('contact', email)
            .maybeSingle();
          
          if (!teamMemberError && teamMemberData) {
            userRole = teamMemberData.role as MemberRole;
            isAdmin = teamMemberData.is_admin || isAdmin;
            console.log("Team member data:", teamMemberData);
          } else if (teamMemberError) {
            console.error("Error fetching team member data:", teamMemberError);
          }
        } catch (e) {
          console.error("Error fetching user role data:", e);
          // Fall back to default values if there's an error
          // Don't block access completely for the account owner
          if (isAccountOwner) {
            isAdmin = true;
          }
        }
        
        setState({
          userEmail: email,
          isAccountOwner,
          isAdmin,
          userRole,
          loading: false,
          error: null
        });
        
        console.log("Auth status:", { 
          isAuthenticated: !!session, 
          email, 
          isAdmin, 
          isAccountOwner,
          userRole
        });
        
      } catch (error) {
        console.error("Error in auth check:", error);
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error as Error,
          // For the account owner, always provide access even if there's an error
          isAccountOwner: state.userEmail?.toLowerCase() === ACCOUNT_OWNER_EMAIL.toLowerCase() || 
                          state.userEmail?.toLowerCase() === CABINET_EMAIL.toLowerCase(),
          isAdmin: (state.userEmail?.toLowerCase() === ACCOUNT_OWNER_EMAIL.toLowerCase() || 
                    state.userEmail?.toLowerCase() === CABINET_EMAIL.toLowerCase()) || 
                   state.isAdmin
        }));
      }
    };

    checkUserAuth();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state changed: ${event}`);
        
        const email = session?.user?.email || null;
        const isAccountOwner = email?.toLowerCase() === ACCOUNT_OWNER_EMAIL.toLowerCase() || 
                               email?.toLowerCase() === CABINET_EMAIL.toLowerCase();
        let userRole: MemberRole = "dentiste"; // Default role
        let isAdmin = isAccountOwner; // Account owner is always admin
        
        if (email && session) {
          try {
            // Check if user is a cabinet owner - this should make them admin
            const isCabinetOwner = await checkCabinetOwnership(session.user.id, email);
            if (isCabinetOwner) {
              isAdmin = true;
            }
            
            // Get user's role from team_members
            const { data: teamMemberData, error: teamMemberError } = await supabase
              .from('team_members')
              .select('role, is_admin, is_owner, cabinet_id')
              .eq('contact', email)
              .maybeSingle();
            
            if (!teamMemberError && teamMemberData) {
              userRole = teamMemberData.role as MemberRole;
              isAdmin = teamMemberData.is_admin || isAdmin;
              console.log("Team member data from auth change:", teamMemberData);
            } else if (teamMemberError) {
              console.error("Error fetching team member data:", teamMemberError);
            }
          } catch (e) {
            console.error("Error fetching team member data:", e);
            // Don't block access completely for the account owner if there's an error
            if (isAccountOwner) {
              isAdmin = true;
            }
          }
        }
        
        setState({
          userEmail: email,
          isAccountOwner,
          isAdmin,
          userRole,
          loading: false,
          error: null
        });
        
        console.log("Auth state changed:", { 
          event, 
          email, 
          isAdmin, 
          isAccountOwner,
          userRole
        });
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return { state };
}
