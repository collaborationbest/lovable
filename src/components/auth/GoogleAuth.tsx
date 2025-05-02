
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GoogleAuthProps {
  redirectTo?: string;
  mode?: 'signin' | 'signup';
}

export const GoogleAuth: React.FC<GoogleAuthProps> = ({ 
  redirectTo = `${window.location.origin}/auth`, 
  mode = 'signin'
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      if (error) {
        console.error("Google auth error:", error);
        toast.error("Une erreur est survenue lors de la connexion avec Google", {
          description: error.message
        });
      }
    } catch (err) {
      console.error("Unexpected error during Google auth:", err);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <img 
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
          alt="Google logo" 
          className="h-4 w-4" 
        />
      )}
      {mode === 'signin' 
        ? "Se connecter avec Google" 
        : "S'inscrire avec Google"
      }
    </Button>
  );
};
