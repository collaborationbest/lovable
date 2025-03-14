
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";
import LoginForm from "@/components/auth/LoginForm"; // Keep as fallback
import CustomLoginForm from "@/components/auth/CustomLoginForm";
import CustomSignupForm from "@/components/auth/CustomSignupForm";
import PasswordChangeForm from "@/components/auth/PasswordChangeForm";
import { useAuthState } from "@/hooks/useAuthState";
import { Toaster } from "@/components/ui/toaster";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [authError, setAuthError] = useState<string | null>(null);
  const [confirmationSuccess, setConfirmationSuccess] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [showSignup, setShowSignup] = useState<boolean>(false);
  const redirectAttempted = useRef(false);
  
  // Use the custom hook for authentication state
  const { isLoading, isAuthenticated, forcePasswordChange } = useAuthState();

  // Check for signup parameter in URL
  useEffect(() => {
    const signupParam = searchParams.get('signup');
    setShowSignup(signupParam === 'true');
  }, [searchParams]);

  useEffect(() => {
    // Avoid double checks and redirections
    if (redirectAttempted.current) {
      return;
    }
    
    if (isAuthenticated && !forcePasswordChange && !redirectAttempted.current) {
      redirectAttempted.current = true;
      setIsRedirecting(true);
      
      // Clear any existing doctor data in localStorage to prevent conflicts
      // This ensures we start fresh when redirecting to dashboard
      const origin = location.state?.from?.pathname || "/";
      
      console.log("Authentication successful, redirecting to:", origin);
      
      // Immediate redirection
      navigate(origin, { replace: true });
      
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur DentalPilote !",
      });
    }
  }, [isAuthenticated, forcePasswordChange, navigate, location]);

  useEffect(() => {
    // Check URL parameters for confirmation token and errors
    const urlParams = new URLSearchParams(window.location.search);
    const confirmationToken = urlParams.get('confirmation_token');
    const errorParam = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    if (confirmationToken) {
      setConfirmationSuccess(true);
      toast({
        title: "Email confirmé",
        description: "Votre compte a été validé avec succès. Vous pouvez maintenant vous connecter.",
      });
    } else if (errorParam && errorDescription) {
      if (errorDescription.includes("user not found")) {
        setAuthError("Compte introuvable. Il est possible que ce compte ait été supprimé.");
      } else {
        setAuthError(errorDescription);
      }
    }
  }, []);

  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f2ee] to-white flex items-center justify-center p-4">
        <Spinner className="h-10 w-10 text-[#B88E23]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f2ee] to-white flex items-center justify-center p-4">
      {forcePasswordChange ? (
        <PasswordChangeForm />
      ) : showSignup ? (
        <CustomSignupForm />
      ) : (
        <CustomLoginForm
          confirmationSuccess={confirmationSuccess}
          authError={authError}
        />
      )}
      <Toaster />
    </div>
  );
};

export default AuthPage;
