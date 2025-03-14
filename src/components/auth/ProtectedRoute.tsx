
import { ReactNode, useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const authCheckComplete = useRef(false);
  const location = useLocation();
  const authCheckAttempts = useRef(0);
  const maxAuthCheckAttempts = 3;

  useEffect(() => {
    let isMounted = true;
    
    // Avoid multiple checks
    if (authCheckComplete.current) {
      return;
    }
    
    const checkAuth = async () => {
      try {
        console.info("ProtectedRoute: Checking authentication");
        authCheckAttempts.current += 1;
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // No session found
          console.info("ProtectedRoute: No session found");
          if (isMounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
            authCheckComplete.current = true;
          }
          return;
        }
        
        // Verify session is still valid
        const { data: user, error } = await supabase.auth.getUser();
        
        if (error || !user.user) {
          console.info("ProtectedRoute: Session invalid or error", error);
          if (isMounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
            authCheckComplete.current = true;
          }
        } else {
          console.info("ProtectedRoute: User authenticated", user.user.email);
          if (isMounted) {
            setIsAuthenticated(true);
            setIsLoading(false);
            authCheckComplete.current = true;
          }
        }
      } catch (error) {
        console.error("ProtectedRoute: Auth check error", error);
        
        // Attempt retry if under max attempts
        if (authCheckAttempts.current < maxAuthCheckAttempts) {
          console.info(`ProtectedRoute: Retrying auth check (${authCheckAttempts.current}/${maxAuthCheckAttempts})`);
          setTimeout(checkAuth, 500);
          return;
        }
        
        if (isMounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
          authCheckComplete.current = true;
          
          toast.error("Erreur de connexion. Veuillez vous reconnecter.", {
            id: "auth-error"
          });
        }
      }
    };

    // Execute check with minimal delay
    const timer = setTimeout(checkAuth, 50);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.info("ProtectedRoute: Auth state change", event);
        if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (isMounted) {
            setIsAuthenticated(!!session);
            setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f5f2ee]">
        <Spinner className="h-10 w-10 text-[#B88E23]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirection vers la page d'authentification en conservant l'URL initiale
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
