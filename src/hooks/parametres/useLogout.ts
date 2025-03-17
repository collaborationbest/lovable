
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const isLoggingOut = useRef(false);

  const handleLogout = async () => {
    // Prevent multiple logout attempts
    if (isLoggingOut.current || loading) return;
    isLoggingOut.current = true;
    setLoading(true);

    try {
      // First show toast notification using sonner (more reliable during unmounting)
      toast.success("Déconnexion réussie", {
        id: "logout-success-toast",
        duration: 3000
      });
      
      // Important delay to allow the toast to be displayed before auth changes
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Sign out from Supabase in a way that won't trigger DOM errors
      try {
        const { error } = await supabase.auth.signOut();
        if (error) console.error("Logout error:", error);
      } catch (err) {
        console.error("Error during signOut:", err);
      }
      
      // Safe cleanup with longer timeouts
      setTimeout(() => {
        // Safely clear storage, ignoring errors
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          console.error("Failed to clear storage:", e);
        }
        
        // Final step: completely reload the page instead of using React Router
        // This avoids any React tree reconciliation errors and double navigation
        setTimeout(() => {
          try {
            // IMPORTANT: Only use direct location change, not React Router
            window.location.href = "/auth";
          } catch (e) {
            console.error("Failed to navigate:", e);
          }
        }, 300);
      }, 300);
    } catch (error: any) {
      toast.error("Erreur de déconnexion", {
        description: error.message || "Une erreur est survenue lors de la déconnexion."
      });
      setLoading(false);
      isLoggingOut.current = false;
    }
  };

  return { handleLogout, loading };
};
