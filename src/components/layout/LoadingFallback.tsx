
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

// Enhanced loading component with animation, delayed display and navigation awareness
const LoadingFallback = () => {
  const [show, setShow] = useState(false);
  const [timeout, setTimeout] = useState(false);
  const [moduleError, setModuleError] = useState<string | null>(null);
  const location = useLocation();
  
  // Only show loading during initial page loads, not during navigation
  useEffect(() => {
    // Set a maximum timeout to prevent infinite loading
    const maxTimeoutTimer = window.setTimeout(() => {
      setTimeout(true);
      // Force app to continue even if loading hasn't completed
      sessionStorage.setItem('appLoaded', 'true');
      // Log the error for debugging purposes
      console.error("Loading timeout triggered after 8 seconds");
    }, 8000); // 8 seconds maximum loading time
    
    // Check for module loading errors
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('dynamically imported module') || 
          event.error?.message?.includes('Failed to fetch')) {
        console.error("Module loading error detected:", event.error);
        setModuleError(event.error?.message || "Failed to load module");
      }
    };
    
    window.addEventListener('error', handleError);
    
    // Skip showing the loader if this is an internal navigation
    if (sessionStorage.getItem('appLoaded')) {
      return () => {
        clearTimeout(maxTimeoutTimer);
        window.removeEventListener('error', handleError);
      };
    }
    
    // Only show the loader after a small delay to prevent flashing
    const timer = window.setTimeout(() => setShow(true), 500);
    
    // Mark that the app has been loaded once
    sessionStorage.setItem('appLoaded', 'true');
    sessionStorage.setItem('lastNavigationTime', Date.now().toString());
    
    return () => {
      clearTimeout(timer);
      clearTimeout(maxTimeoutTimer);
      window.removeEventListener('error', handleError);
    };
  }, [location.pathname]);
  
  // Handle the redirect to auth page properly
  const handleRedirectToAuth = () => {
    // Clear cache and reload for a fresh start
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
        // Also clear session and local storage
        sessionStorage.clear();
        localStorage.removeItem('appLoaded');
        localStorage.removeItem('moduleCache');
      });
    } else {
      // Fallback for browsers without cache API
      sessionStorage.clear();
      localStorage.removeItem('appLoaded');
      localStorage.removeItem('moduleCache');
    }
    window.location.href = '/auth';
  };
  
  // If loading takes too long or there's a module error, show recovery options
  if (timeout || moduleError) {
    // Show a toast with the error message for better user awareness
    if (moduleError && !timeout) {
      toast.error("Erreur de chargement", {
        description: "Un module n'a pas pu être chargé correctement",
        duration: 5000,
      });
    }
    
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#f5f2ee] fixed inset-0 z-50">
        <div className="text-center p-4 max-w-md">
          <h2 className="text-xl font-semibold text-[#5C4E3D] mb-3">
            {moduleError ? "Erreur de chargement" : "Chargement trop long"}
          </h2>
          <p className="mb-4 text-[#5C4E3D]/70">
            {moduleError 
              ? "Une erreur s'est produite lors du chargement de l'application. Cela peut être dû à une connexion internet instable."
              : "Le chargement prend plus de temps que prévu."}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#B88E23] text-white rounded-md hover:bg-[#8A6A1B] transition-colors w-full"
            >
              Recharger la page
            </button>
            
            {moduleError && (
              <button
                onClick={handleRedirectToAuth}
                className="px-4 py-2 border border-[#B88E23] text-[#B88E23] rounded-md hover:bg-[#B88E23]/10 transition-colors w-full"
              >
                Vider le cache et se reconnecter
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  if (!show) return null;
  
  return (
    <div className="flex items-center justify-center h-screen bg-[#f5f2ee] animate-fade-in fixed inset-0 z-50 opacity-0 animate-[fadeIn_400ms_ease-in-out_forwards]">
      <div className="transform opacity-0 animate-[scaleIn_300ms_ease-out_100ms_forwards]">
        <Spinner className="h-10 w-10 text-[#B88E23]" />
      </div>
    </div>
  );
};

export default LoadingFallback;
