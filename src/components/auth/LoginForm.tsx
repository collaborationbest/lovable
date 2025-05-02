
import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { handleSignupError } from "@/integrations/supabase/profileUtils";
import { Toaster } from "@/components/ui/toaster";

interface LoginFormProps {
  confirmationSuccess: boolean;
  authError: string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({ confirmationSuccess, authError }) => {
  useEffect(() => {
    // Listen for auth events to handle custom error messages
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && !session) {
        // This indicates a potential auth error
        console.log("Auth event detected without session, may indicate an error");
      }
    });

    // Add a separate listener for auth API errors during signup
    const handleAuthError = (e: any) => {
      if (e && e.error && (e.error.message?.includes('email') || e.error.message?.includes('Email'))) {
        handleSignupError({ message: "Email already exists in the database" });
      }
    };

    // Add event listener for form submission
    document.addEventListener('supabase.auth.error', handleAuthError);

    return () => {
      authListener?.subscription.unsubscribe();
      document.removeEventListener('supabase.auth.error', handleAuthError);
    };
  }, []);

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-center mb-4">
        <img 
          src="/lovable-uploads/1cc80bed-52e4-4216-903b-1a8170e9886a.png" 
          alt="DentalPilote Logo" 
          className="h-16 w-auto"
        />
      </div>
      
      <h1 className="text-2xl font-semibold text-[#5C4E3D] mb-2 text-center">
        Cabinet Connect
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Connectez-vous à votre compte pour accéder à votre tableau de bord
      </p>
      
      {confirmationSuccess && (
        <Alert className="mb-4 bg-green-50 border-green-500">
          <AlertDescription className="text-green-700">
            Votre compte a été validé avec succès. Vous pouvez maintenant vous connecter.
          </AlertDescription>
        </Alert>
      )}
      
      {authError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}
      
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#B88E23',
                brandAccent: '#927219',
              }
            }
          },
          extend: true
        }}
        view="sign_in"
        providers={[]} 
        redirectTo={window.location.origin}
        localization={{
          variables: {
            sign_in: {
              email_label: 'Email',
              password_label: 'Mot de passe',
              button_label: 'Se connecter',
              loading_button_label: 'Connexion en cours...',
              link_text: 'Vous avez déjà un compte ? Connectez-vous',
              social_provider_text: 'Continuer avec {{provider}}',
            },
            sign_up: {
              email_label: 'Email',
              password_label: 'Mot de passe',
              button_label: "S'inscrire",
              loading_button_label: 'Inscription en cours...',
              link_text: "Vous n'avez pas de compte ? Inscrivez-vous",
              social_provider_text: 'Continuer avec {{provider}}',
            },
            forgotten_password: {
              email_label: 'Email',
              button_label: 'Envoyer les instructions',
              loading_button_label: 'Envoi en cours...',
              link_text: 'Mot de passe oublié ?',
              confirmation_text: 'Vérifiez vos emails pour réinitialiser votre mot de passe',
            },
          }
        }}
      />
      <div className="mt-4 text-center">
        <Link to="/reset-password">
          <Button variant="link" className="text-[#B88E23]">
            Mot de passe oublié ?
          </Button>
        </Link>
      </div>
      
      {/* Add Toaster component to handle toast notifications */}
      <Toaster />
    </div>
  );
};

export default LoginForm;
