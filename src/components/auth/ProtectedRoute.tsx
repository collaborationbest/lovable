
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAccessControl } from "@/hooks/access-control";
import { usePageAccess } from "@/hooks/access-control/usePageAccess";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
  pageId?: string;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

const ProtectedRoute = ({
  children,
  pageId = "dashboard", // Default page ID
  requiresAuth = true,
  requiresAdmin = false
}: ProtectedRouteProps) => {
  const location = useLocation();
  const {
    isLoading,
    isAuthenticated,
    isAdmin,
    isAccountOwner,
    userEmail,
    userRole
  } = useAccessControl();
  
  const { hasAccess, isLoading: accessRightsLoading } = usePageAccess(
    userEmail,
    isAdmin,
    isAccountOwner,
    userRole
  );

  // Add a timeout to prevent infinite loading
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  useEffect(() => {
    if (isLoading) {
      // Set a timeout to force progress after 5 seconds
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
        console.log("Loading timeout triggered in ProtectedRoute - forcing navigation");
        // Also log any cached auth data to help with debugging
        if (sessionStorage.getItem('authState')) {
          console.log("Found cached auth state:", sessionStorage.getItem('authState'));
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Handle loading state with timeout recovery
  if (isLoading && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f2ee] to-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center">
          <img 
            src="/lovable-uploads/1cc80bed-52e4-4216-903b-1a8170e9886a.png" 
            alt="DentalPilote Logo" 
            className="h-24 w-auto mb-4"
          />
          <div className="h-10 w-10 border-4 border-[#B88E23] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // If loading takes too long, redirect to auth page with an explanation
  if (loadingTimeout) {
    console.log("Redirecting due to loading timeout");
    // Attempt to use any cached authentication data before giving up
    const cachedAuth = sessionStorage.getItem('cachedAuthState');
    if (cachedAuth) {
      try {
        const parsedAuth = JSON.parse(cachedAuth);
        if (parsedAuth.isAuthenticated) {
          console.log("Using cached authentication data to proceed");
          // Continue with the cached data
          return <>{children}</>;
        }
      } catch (e) {
        console.error("Error parsing cached auth data:", e);
      }
    }
    
    toast.error("Session de connexion expirée", {
      description: "Veuillez vous connecter à nouveau",
      duration: 5000,
    });
    
    return <Navigate to="/auth" state={{ from: location, timeout: true }} replace />;
  }

  // Handle authentication check
  if (requiresAuth && !isAuthenticated) {
    console.log("User not authenticated, redirecting to auth page");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Handle admin check - except for the settings page which should be accessible to all users
  if (requiresAdmin && !isAdmin && !isAccountOwner && location.pathname !== "/parametres") {
    console.log(`Admin-only page access denied for user ${userEmail} with role ${userRole}`);
    toast.error("Accès réservé aux administrateurs", {
      id: "admin-only",
    });
    return <Navigate to="/" replace />;
  }

  // Redirect to the correct page based on user role
  // Only apply this logic when accessing the root path "/"
  if (isAuthenticated && location.pathname === "/") {
    console.log(`Checking role-based redirect for user with role: ${userRole}, isAdmin: ${isAdmin}`);
    
    // Non-admin users (assistants and secretaries) are redirected to operations
    if (!isAdmin && !isAccountOwner && (userRole === 'assistante' || userRole === 'secrétaire')) {
      console.log(`Redirecting ${userRole} to operations page`);
      return <Navigate to="/operations" replace />;
    }
    
    // Admin users and dentists stay on the dashboard (default behavior)
    console.log("User can access dashboard, no redirect needed");
  }

  // Check page-specific access rights - settings page is always accessible to authenticated users
  if (pageId && location.pathname !== "/parametres") {
    console.log(`Checking access for page ${pageId} for user ${userEmail} with role ${userRole}`);
    
    if (!hasAccess(pageId)) {
      console.log(`Access denied for page ${pageId} for user ${userEmail} with role ${userRole}`);
      toast.error("Vous n'avez pas accès à cette page", {
        id: "no-access",
      });
      
      // Redirect to appropriate page based on role
      if (!isAdmin && !isAccountOwner && (userRole === 'assistante' || userRole === 'secrétaire')) {
        return <Navigate to="/operations" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
  }

  // Cache successful authentication state for backup
  if (isAuthenticated) {
    try {
      const cacheData = {
        isAuthenticated,
        isAdmin,
        isAccountOwner,
        userEmail,
        userRole,
        timestamp: Date.now()
      };
      sessionStorage.setItem('cachedAuthState', JSON.stringify(cacheData));
    } catch (e) {
      console.error("Error caching auth state:", e);
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
