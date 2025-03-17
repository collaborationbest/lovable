
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { invalidateAuthCache } from "@/components/auth/ProtectedRoute";

/**
 * Component that listens for auth changes and shows toast notifications
 * It doesn't render anything visible
 */
const AuthStatusObserver = () => {
  // Keep track of notification status to avoid duplicates
  const logoutNotificationShown = useRef(false);
  const loginNotificationShown = useRef(false);
  
  // Track the current auth session to prevent duplicate notifications
  const sessionRef = useRef<string | null>(null);
  const lastEventRef = useRef<string | null>(null);
  const cleanupInProgress = useRef(false);
  const isUnmounting = useRef(false);
  const activeTimeouts = useRef<number[]>([]);

  // Clear all timeouts to prevent memory leaks and DOM manipulation after unmount
  const clearAllTimeouts = () => {
    activeTimeouts.current.forEach(timeoutId => {
      window.clearTimeout(timeoutId);
    });
    activeTimeouts.current = [];
  };

  useEffect(() => {
    // Reset notification status when component mounts
    logoutNotificationShown.current = false;
    loginNotificationShown.current = false;
    sessionRef.current = null;
    lastEventRef.current = null;
    cleanupInProgress.current = false;
    isUnmounting.current = false;
    activeTimeouts.current = [];
    
    console.log("AuthStatusObserver mounted, ready to listen for auth changes");
    
    // Check current session first, but don't show notification for initial session
    const checkCurrentSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          sessionRef.current = data.session.user.id;
          console.log("Current session detected for user:", data.session.user.email);
        }
      } catch (e) {
        console.error("Error checking current session:", e);
      }
    };
    
    checkCurrentSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // Skip all processing if component is unmounting
      if (isUnmounting.current) {
        console.log("Component unmounting, skipping auth state change handling");
        return;
      }
      
      console.info("Auth state change detected:", event, "Session:", session ? "exists" : "null");
      
      // Avoid processing the same event multiple times
      if (event === lastEventRef.current && event !== 'SIGNED_IN') {
        console.log("Duplicate event ignored:", event);
        return;
      }
      
      lastEventRef.current = event;
      
      // Store the session ID to track changes and prevent duplicate notifications
      const sessionId = session?.user?.id || null;
      
      if (event === 'SIGNED_OUT') {
        try {
          invalidateAuthCache();
        } catch (e) {
          console.error("Error invalidating auth cache:", e);
        }
        
        // Prevent showing logout notification if we're cleaning up during logout
        if (cleanupInProgress.current) {
          console.log("Cleanup in progress, skipping logout notification");
          return;
        }
        
        cleanupInProgress.current = true;
        
        // Only show logout notification once 
        if (!logoutNotificationShown.current) {
          logoutNotificationShown.current = true;
          loginNotificationShown.current = false; // Reset login notification flag
          
          // Mark cleanup as complete after a delay to prevent DOM manipulation errors
          const timeoutId = window.setTimeout(() => {
            cleanupInProgress.current = false;
          }, 1000);
          activeTimeouts.current.push(timeoutId);
          
          // We don't show toast here since it's shown in useLogout
        }
        
        // Clear session reference
        sessionRef.current = null;
      } 
      else if (event === 'SIGNED_IN') {
        try {
          invalidateAuthCache();
        } catch (e) {
          console.error("Error invalidating auth cache:", e);
        }
        
        // Only show login notification once and only if the session ID is different
        if (!loginNotificationShown.current && sessionId !== sessionRef.current) {
          loginNotificationShown.current = true;
          logoutNotificationShown.current = false; // Reset logout notification flag
          sessionRef.current = sessionId;
          
          // Add delay to ensure toast appears after any redirects and page stabilizes
          const timeoutId = window.setTimeout(() => {
            if (!isUnmounting.current) {
              try {
                toast.success("Connexion réussie", {
                  id: "auth-signin-toast", // Use ID to prevent duplicates
                  duration: 3000,
                });
                
                console.log("Login notification shown for session:", sessionId);
              } catch (e) {
                console.error("Error showing login toast:", e);
              }
            }
          }, 500);
          activeTimeouts.current.push(timeoutId);
        }
      } 
      else if (event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        // Just invalidate the cache, no notification needed
        try {
          invalidateAuthCache();
        } catch (e) {
          console.error("Error invalidating auth cache:", e);
        }
      }
    });

    return () => {
      // Mark component as unmounting to prevent any further state updates
      isUnmounting.current = true;
      
      // Clear all timeouts to prevent memory leaks
      clearAllTimeouts();
      
      // Ensure we stop listening to auth events
      try {
        authListener.subscription.unsubscribe();
      } catch (e) {
        console.error("Error unsubscribing from auth listener:", e);
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default AuthStatusObserver;
