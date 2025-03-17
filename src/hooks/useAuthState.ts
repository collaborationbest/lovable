
import { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any | null;
  forcePasswordChange: boolean;
}

/**
 * Hook personnalisé pour gérer l'état d'authentification
 * Évite les vérifications redondantes et fournit un état cohérent
 */
export const useAuthState = () => {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    forcePasswordChange: false
  });
  
  const authCheckComplete = useRef(false);

  useEffect(() => {
    let isMounted = true;
    
    // Éviter les vérifications multiples
    if (authCheckComplete.current) {
      return;
    }
    
    const checkAuth = async () => {
      try {
        console.log("Checking authentication status...");
        // Récupérer la session actuelle
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Aucune session trouvée
          console.log("No session found");
          if (isMounted) {
            setState({
              isLoading: false,
              isAuthenticated: false,
              user: null,
              forcePasswordChange: false
            });
            authCheckComplete.current = true;
          }
          return;
        }
        
        // Vérifier que la session est toujours valide
        const { data: userData, error } = await supabase.auth.getUser();
        
        if (error || !userData.user) {
          console.log("Error getting user or user not found:", error);
          if (isMounted) {
            setState({
              isLoading: false,
              isAuthenticated: false,
              user: null,
              forcePasswordChange: false
            });
            authCheckComplete.current = true;
          }
        } else {
          const forcePasswordChange = !!userData.user.user_metadata?.forcePasswordChange;
          console.log("User authenticated:", userData.user.email);
          console.log("Force password change:", forcePasswordChange);
          
          if (isMounted) {
            setState({
              isLoading: false,
              isAuthenticated: true,
              user: userData.user,
              forcePasswordChange
            });
            authCheckComplete.current = true;
          }
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
        if (isMounted) {
          setState({
            isLoading: false,
            isAuthenticated: false,
            user: null,
            forcePasswordChange: false
          });
          authCheckComplete.current = true;
        }
      }
    };

    // Exécuter la vérification avec un délai minimal
    const timer = setTimeout(checkAuth, 50);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change:", event);
        if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setState({
              isLoading: false,
              isAuthenticated: false,
              user: null,
              forcePasswordChange: false
            });
          }
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (isMounted && session) {
            const forcePasswordChange = !!session.user.user_metadata?.forcePasswordChange;
            
            setState({
              isLoading: false,
              isAuthenticated: true,
              user: session.user,
              forcePasswordChange
            });
          }
        } else if (event === 'USER_UPDATED') {
          if (isMounted && session) {
            const forcePasswordChange = !!session.user.user_metadata?.forcePasswordChange;
            
            setState({
              isLoading: false,
              isAuthenticated: true,
              user: session.user,
              forcePasswordChange
            });
          }
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(timer);
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return state;
};
