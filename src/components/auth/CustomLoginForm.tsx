
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { GoogleAuth } from './GoogleAuth';

interface LoginFormProps {
  confirmationSuccess: boolean;
  authError: string | null;
}

const CustomLoginForm: React.FC<LoginFormProps> = ({ confirmationSuccess, authError }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!email || !password) {
      setFormError("Veuillez remplir tous les champs");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error);
        if (error.message.includes("Invalid login")) {
          setFormError("Email ou mot de passe incorrect");
        } else {
          setFormError(error.message);
        }
      } else if (data.user) {
        toast({
          title: "Connexion réussie",
          description: "Vous allez être redirigé...",
          duration: 3000,
        });
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      setFormError("Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-md">
      <CardHeader className="space-y-1 flex flex-col items-center pb-4">
        <div className="mb-2">
          <img 
            src="/lovable-uploads/1cc80bed-52e4-4216-903b-1a8170e9886a.png" 
            alt="DentalPilote Logo" 
            className="h-16 w-auto"
          />
        </div>
        <CardTitle className="text-2xl font-semibold text-[#5C4E3D] text-center">
          Cabinet Connect
        </CardTitle>
        <p className="text-center text-gray-600">
          Connectez-vous à votre compte pour accéder à votre tableau de bord
        </p>
      </CardHeader>
      
      <CardContent>
        {confirmationSuccess && (
          <Alert className="mb-4 bg-green-50 border-green-500">
            <AlertDescription className="text-green-700">
              Votre compte a été validé avec succès. Vous pouvez maintenant vous connecter.
            </AlertDescription>
          </Alert>
        )}
        
        {(authError || formError) && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError || formError}</AlertDescription>
          </Alert>
        )}

        <div className="mb-4">
          <GoogleAuth redirectTo={`${window.location.origin}/auth`} mode="signin" />
        </div>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-xs text-gray-500">OU</span>
          </div>
        </div>
        
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email" 
              placeholder="Votre adresse email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <Link to="/reset-password" className="text-xs text-[#B88E23] hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
            <Input 
              id="password"
              type="password" 
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#B88E23] hover:bg-[#8A6A1A]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion...
              </>
            ) : "Se connecter"}
          </Button>
          
          <div className="mt-4 text-center text-sm">
            Vous n'avez pas de compte ?{" "}
            <Link to="/auth?signup=true" className="text-[#B88E23] hover:underline">
              Inscrivez-vous
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomLoginForm;
