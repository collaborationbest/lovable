import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { toast, Toaster } from "sonner"; 
import { Spinner } from "@/components/ui/spinner";
import LoginForm from "@/components/auth/LoginForm"; // Keep as fallback
import CustomLoginForm from "@/components/auth/CustomLoginForm";
import CustomSignupForm from "@/components/auth/CustomSignupForm";
import PasswordChangeForm from "@/components/auth/PasswordChangeForm";
import { useAuthState } from "@/hooks/useAuthState";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [authError, setAuthError] = useState<string | null>(null);
  const [confirmationSuccess, setConfirmationSuccess] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [showSignup, setShowSignup] = useState<boolean>(false);
  const redirectCompleted = useRef(false);
  const notificationShown = useRef(false);
  const isMounted = useRef(true);
  const redirectTimeout = useRef<number | null>(null);
  
  // Use the custom hook for authentication state
  const { isLoading, isAuthenticated, forcePasswordChange } = useAuthState();

  // Set isMounted to false when component unmounts and clear any timeouts
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (redirectTimeout.current !== null) {
        clearTimeout(redirectTimeout.current);
        redirectTimeout.current = null;
      }
    };
  }, []);

  // Check for signup parameter in URL
  useEffect(() => {
    if (!isMounted.current) return;
    
    const signupParam = searchParams.get('signup');
    setShowSignup(signupParam === 'true');
  }, [searchParams]);

  // Handle redirects once after authentication
  useEffect(() => {
    // Avoid double checks and redirections
    if (!isMounted.current || redirectCompleted.current || isRedirecting || !isAuthenticated) {
      return;
    }
    
    if (isAuthenticated && !forcePasswordChange) {
      console.log("Auth: Authentication detected, preparing to redirect...");
      redirectCompleted.current = true;
      setIsRedirecting(true);
      
      // Get the origin path or default to "/"
      const origin = location.state?.from?.pathname || "/";
      
      console.log("Auth: Redirecting to:", origin);
      
      // Use a direct window.location approach for better reliability
      // This prevents React Router issues during auth state changes
      window.location.href = origin;
      return;
    }
  }, [isAuthenticated, forcePasswordChange, navigate, location, isRedirecting]);

  useEffect(() => {
    if (!isMounted.current) return;
    
    // Check URL parameters for confirmation token and errors
    const urlParams = new URLSearchParams(window.location.search);
    const confirmationToken = urlParams.get('confirmation_token');
    const errorParam = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    if (confirmationToken) {
      setConfirmationSuccess(true);
      if (!notificationShown.current) {
        notificationShown.current = true;
        toast.success("Email confirmé", {
          description: "Votre compte a été validé avec succès. Vous pouvez maintenant vous connecter."
        });
      }
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
      <Toaster position="top-center" />
    </div>
  );
};

export default AuthPage;
