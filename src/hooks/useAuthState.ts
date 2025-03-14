
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
        // Récupérer la session actuelle
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Aucune session trouvée
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
