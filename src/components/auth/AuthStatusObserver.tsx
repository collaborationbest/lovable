
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AuthStatusObserver = () => {
  useEffect(() => {
    // Observer pattern pour suivre les changements d'état d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change detected:", event);
      }
    );

    // Check for database connection issues
    supabase
      .from('access_rights')
      .select('count(*)', { count: 'exact' })
      .then(({ error }) => {
        if (error && error.message.includes('infinite recursion')) {
          toast.error(
            "Erreur de base de données détectée. Certaines fonctionnalités peuvent être limitées.",
            { 
              duration: 10000,
              id: "db-error"
            }
          );
        }
      });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
  
  return null;
};

export default AuthStatusObserver;
