
import { ReactNode, useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

// Simple auth state cache for ProtectedRoute
const authCache = {
  isAuthenticated: null as boolean | null,
  timestamp: 0,
  // Cache expiration in milliseconds (5 minutes)
  expirationTime: 5 * 60 * 1000
};

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
    // Initialize from cache if available and not expired
    () => {
      const now = Date.now();
      if (authCache.isAuthenticated !== null && now - authCache.timestamp < authCache.expirationTime) {
        console.info("ProtectedRoute: Using cached auth state", authCache.isAuthenticated);
        return authCache.isAuthenticated;
      }
      return null;
    }
  );
  
  const authCheckComplete = useRef(false);
  const location = useLocation();
  const authCheckAttempts = useRef(0);
  const maxAuthCheckAttempts = 3;
  const checkInProgress = useRef(false);
  const isComponentMounted = useRef(true);

  useEffect(() => {
    isComponentMounted.current = true;
    
    // Avoid redundant checks
    if (authCheckComplete.current || checkInProgress.current) {
      return;
    }
    
    // If we have a cached value, use it
    const now = Date.now();
    if (authCache.isAuthenticated !== null && now - authCache.timestamp < authCache.expirationTime) {
      if (isComponentMounted.current) {
        setIsAuthenticated(authCache.isAuthenticated);
        setIsLoading(false);
        authCheckComplete.current = true;
      }
      return;
    }
    
    const checkAuth = async () => {
      try {
        console.info("ProtectedRoute: Checking authentication");
        checkInProgress.current = true;
        authCheckAttempts.current += 1;
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // No session found
          console.info("ProtectedRoute: No session found");
          if (isComponentMounted.current) {
            setIsAuthenticated(false);
            setIsLoading(false);
            authCheckComplete.current = true;
            
            // Update cache
            authCache.isAuthenticated = false;
            authCache.timestamp = Date.now();
          }
          checkInProgress.current = false;
          return;
        }
        
        // Session found, mark as authenticated immediately
        if (isComponentMounted.current) {
          setIsAuthenticated(true);
          setIsLoading(false);
          authCheckComplete.current = true;
          
          // Update cache
          authCache.isAuthenticated = true;
          authCache.timestamp = Date.now();
        }
        
        checkInProgress.current = false;
      } catch (error) {
        console.error("ProtectedRoute: Auth check error", error);
        checkInProgress.current = false;
        
        // Attempt retry if under max attempts
        if (authCheckAttempts.current < maxAuthCheckAttempts && isComponentMounted.current) {
          console.info(`ProtectedRoute: Retrying auth check (${authCheckAttempts.current}/${maxAuthCheckAttempts})`);
          setTimeout(checkAuth, 500);
          return;
        }
        
        if (isComponentMounted.current) {
          setIsAuthenticated(false);
          setIsLoading(false);
          authCheckComplete.current = true;
          
          // Update cache
          authCache.isAuthenticated = false;
          authCache.timestamp = Date.now();
          
          toast.error("Erreur de connexion. Veuillez vous reconnecter.", {
            id: "auth-error"
          });
        }
      }
    };

    // Execute check with no delay
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.info("ProtectedRoute: Auth state change", event);
        if (event === 'SIGNED_OUT') {
          if (isComponentMounted.current) {
            setIsAuthenticated(false);
            setIsLoading(false);
            
            // Update cache
            authCache.isAuthenticated = false;
            authCache.timestamp = Date.now();
          }
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (isComponentMounted.current) {
            const isValid = !!session;
            setIsAuthenticated(isValid);
            setIsLoading(false);
            
            // Update cache with longer expiration for performance
            authCache.isAuthenticated = isValid;
            authCache.timestamp = Date.now();
          }
        }
      }
    );

    return () => {
      isComponentMounted.current = false;
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
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
    // Use a more direct approach for redirection to prevent React Router issues
    if (window.location.pathname !== "/auth") {
      window.location.href = "/auth";
      return null;
    }
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Function to invalidate the auth cache
export const invalidateAuthCache = () => {
  authCache.isAuthenticated = null;
  authCache.timestamp = 0;
  console.info("ProtectedRoute: Auth cache invalidated");
};

export default ProtectedRoute;
