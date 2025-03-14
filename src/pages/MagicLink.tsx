
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const MagicLink = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingLink, setIsProcessingLink] = useState(true);
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Vérifier si la page est chargée via un magic link ou un reset password
    const checkSession = async () => {
      try {
        // Check for 'type' parameter in URL to determine if this is a password reset
        const params = new URLSearchParams(window.location.search);
        const hash = window.location.hash;
        const type = params.get('type');
        const isPasswordReset = type === 'recovery' || hash.includes('type=recovery');

        // First, attempt to get the current session
        const { data, error } = await supabase.auth.getSession();
        console.log("isPasswordReset", isPasswordReset);
        if (error) {
          throw error;
        }

        // If there's no active session or we have a password reset hash/query
        if (!data.session || isPasswordReset) {
          // Process the URL hash/query for auth purposes
          const query = window.location.search;

          if (!hash && !query) {
            // No auth parameters found
            setIsProcessingLink(false);
            setHasError(true);
            toast({
              title: "Erreur",
              description: "Lien invalide ou expiré. Veuillez demander un nouveau lien.",
              variant: "destructive",
            });
            return;
          }

          // Exchange token in URL for session
          try {
            const { data: authData, error: authError } = await supabase.auth.getSession();

            if (authError) {
              throw authError;
            }

            // Now we have processed the auth parameters
            setIsProcessingLink(false);

            // If this was a password reset, don't redirect even if we have a session
            if (isPasswordReset) {
              console.log("Password reset mode activated");
            } else if (authData.session) {
              // For magic links, auto-redirect to dashboard
              navigate("/");
            }
          } catch (signInError) {
            console.error("Erreur lors de la récupération de session:", signInError);
            setIsProcessingLink(false);
            setHasError(true);
            toast({
              title: "Erreur",
              description: "Lien invalide ou expiré. Veuillez demander un nouveau lien.",
              variant: "destructive",
            });
          }
        } else {
          // User already had a valid session

          // Check if this is a password reset - if so, stay on page to allow password change
          if (isPasswordReset) {
            setIsProcessingLink(false);
            console.log("Password reset mode activated with existing session");
          } else {
            // Normal login flow - redirect to dashboard as user is already logged in
            navigate("/");
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de session:", error);
        setIsProcessingLink(false);
        setHasError(true);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    };

    checkSession();
  }, [navigate, toast]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès.",
      });

      // Rediriger vers la page d'accueil après 2 secondes
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour du mot de passe.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isProcessingLink) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f2ee] to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-semibold text-[#5C4E3D] mb-6">
            Traitement en cours...
          </h1>
          <p className="text-muted-foreground">
            Veuillez patienter pendant que nous vérifions votre lien.
          </p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f2ee] to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-semibold text-[#5C4E3D] mb-6">
            Lien invalide ou expiré
          </h1>
          <p className="text-muted-foreground mb-6">
            Le lien que vous avez utilisé est invalide ou a expiré.
          </p>
          <Button
            onClick={() => navigate("/reset-password")}
            className="bg-[#B88E23] hover:bg-[#927219]"
          >
            Demander un nouveau lien
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f2ee] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold text-[#5C4E3D] mb-6 text-center">
          Définir un nouveau mot de passe
        </h1>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nouveau mot de passe</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Entrez votre nouveau mot de passe"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmez votre nouveau mot de passe"
              disabled={isLoading}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#B88E23] hover:bg-[#927219]"
            disabled={isLoading}
          >
            {isLoading ? "Mise à jour en cours..." : "Mettre à jour le mot de passe"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MagicLink;
