
import { useEffect, useState, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { MemberRole } from "@/types/TeamMember";
import { AccessControlState } from "@/types/AccessControl";
import { ACCOUNT_OWNER_EMAIL, CABINET_EMAIL } from "@/constants/accessControl";
import { checkCabinetOwnership } from "@/utils/cabinetOwnershipUtils";

// Cache for auth state to prevent flickering between pages
const authStateCache = {
  data: null as AccessControlState | null,
  timestamp: 0,
  // Cache expiration in milliseconds (30 seconds)
  expirationTime: 30 * 1000
};

export function useAuthState() {
  const [state, setState] = useState<AccessControlState>(() => {
    // Use cached state if available and not expired
    const now = Date.now();
    if (authStateCache.data && now - authStateCache.timestamp < authStateCache.expirationTime) {
      console.log("Using cached auth state");
      return authStateCache.data;
    }
    
    // Default state if no cache is available
    return {
      userRole: null,
      isAdmin: false,
      isAccountOwner: false,
      loading: true,
      userEmail: null,
      error: null
    };
  });

  const authCheckRunning = useRef(false);
  const authCheckComplete = useRef(false);

  useEffect(() => {
    let isMounted = true;
    
    // Prevent multiple concurrent auth checks
    if (authCheckRunning.current) {
      return;
    }
    
    // Skip if auth check is already completed
    if (authCheckComplete.current && !state.loading) {
      return;
    }
    
    const checkUserAuth = async () => {
      authCheckRunning.current = true;
      
      try {
        console.log("Running auth check...");
        const { data: sessionData, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error fetching session:", error);
          if (isMounted) {
            const newState = { ...state, loading: false, error: error as Error };
            setState(newState);
            authStateCache.data = newState;
            authStateCache.timestamp = Date.now();
          }
          authCheckRunning.current = false;
          authCheckComplete.current = true;
          return;
        }

        const session = sessionData?.session;
        const email = session?.user?.email || null;
        
        if (!email || !session) {
          const newState = {
            userEmail: null,
            isAccountOwner: false,
            isAdmin: false,
            userRole: null,
            loading: false,
            error: null
          };
          
          if (isMounted) {
            setState(newState);
            authStateCache.data = newState;
            authStateCache.timestamp = Date.now();
          }
          
          authCheckRunning.current = false;
          authCheckComplete.current = true;
          return;
        }
        
        // Check if this is the account owner email or cabinet email (case-insensitive)
        const isAccountOwner = email.toLowerCase() === ACCOUNT_OWNER_EMAIL.toLowerCase() || 
                               email.toLowerCase() === CABINET_EMAIL.toLowerCase();
        
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
        
        const newState = {
          userEmail: email,
          isAccountOwner,
          isAdmin,
          userRole,
          loading: false,
          error: null
        };
        
        if (isMounted) {
          setState(newState);
          // Update cache
          authStateCache.data = newState;
          authStateCache.timestamp = Date.now();
          
          console.log("Auth state updated:", newState);
        }
        
        authCheckRunning.current = false;
        authCheckComplete.current = true;
      } catch (error) {
        console.error("Error in auth check:", error);
        
        if (isMounted) {
          const newState = { 
            ...state, 
            loading: false, 
            error: error as Error,
            // For the account owner, always provide access even if there's an error
            isAccountOwner: state.userEmail?.toLowerCase() === ACCOUNT_OWNER_EMAIL.toLowerCase() || 
                          state.userEmail?.toLowerCase() === CABINET_EMAIL.toLowerCase(),
            isAdmin: (state.userEmail?.toLowerCase() === ACCOUNT_OWNER_EMAIL.toLowerCase() || 
                    state.userEmail?.toLowerCase() === CABINET_EMAIL.toLowerCase()) || 
                   state.isAdmin
          };
          
          setState(newState);
          authStateCache.data = newState;
          authStateCache.timestamp = Date.now();
        }
        
        authCheckRunning.current = false;
        authCheckComplete.current = true;
      }
    };

    // Only run the check if we don't have valid cached data
    const now = Date.now();
    if (!authStateCache.data || now - authStateCache.timestamp >= authStateCache.expirationTime) {
      checkUserAuth();
    } else if (state.loading && authStateCache.data) {
      // If we have cached data but state is still loading, update it
      setState(authStateCache.data);
      authCheckComplete.current = true;
    }

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state changed: ${event}`);
        
        if (event === 'SIGNED_OUT') {
          const newState = {
            userEmail: null,
            isAccountOwner: false,
            isAdmin: false,
            userRole: null,
            loading: false,
            error: null
          };
          
          if (isMounted) {
            setState(newState);
            authStateCache.data = newState;
            authStateCache.timestamp = Date.now();
          }
          
          authCheckComplete.current = true;
          return;
        }
        
        // For other auth events, trigger a full auth check
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          authCheckComplete.current = false;
          checkUserAuth();
        }
      }
    );

    return () => {
      isMounted = false;
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  return { state };
}

// Export a function to invalidate the auth cache when needed (e.g., after profile updates)
export const invalidateAuthCache = () => {
  authStateCache.data = null;
  authStateCache.timestamp = 0;
  console.log("Auth state cache invalidated");
};
