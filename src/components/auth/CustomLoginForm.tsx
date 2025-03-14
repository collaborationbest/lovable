
import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface CustomLoginFormProps {
  confirmationSuccess: boolean;
  authError: string | null;
}

const CustomLoginForm: React.FC<CustomLoginFormProps> = ({ confirmationSuccess, authError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setLoginError("Veuillez renseigner l'email et le mot de passe");
      return;
    }
    
    try {
      setIsLoading(true);
      setLoginError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error);
        setLoginError(error.message || "Une erreur est survenue lors de la connexion");
        return;
      }
      
      if (data?.user) {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur DentalPilote !",
        });
        
        // Redirect handled by Auth component via useAuthState hook
      }
    } catch (error: any) {
      console.error("Exception during login:", error);
      setLoginError(error.message || "Une erreur inattendue est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-semibold text-[#5C4E3D] mb-6 text-center">
        Bienvenue sur DentalPilote
      </h1>
      
      {confirmationSuccess && (
        <Alert className="mb-4 bg-green-50 border-green-500">
          <AlertDescription className="text-green-700">
            Votre compte a été validé avec succès. Vous pouvez maintenant vous connecter.
          </AlertDescription>
        </Alert>
      )}
      
      {(authError || loginError) && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{authError || loginError}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email"
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input 
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-[#B88E23] hover:bg-[#927219]"
          disabled={isLoading}
        >
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </Button>
      </form>
      
      <div className="mt-4 text-center">
        <Link to="/reset-password">
          <Button variant="link" className="text-[#B88E23]">
            Mot de passe oublié ?
          </Button>
        </Link>
      </div>
      
      <div className="mt-2 text-center">
        <Link to="/auth?signup=true">
          <Button variant="link" className="text-[#B88E23]">
            Vous n'avez pas de compte ? Inscrivez-vous
          </Button>
        </Link>
      </div>
      
      <Toaster />
    </div>
  );
};

export default CustomLoginForm;
