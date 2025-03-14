
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleSignupError, createUserProfile, createUserCabinet } from "@/integrations/supabase/profileUtils";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const CustomSignupForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Helper function to check for duplicate email
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      // Check profiles table first
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email')
        .ilike('email', email)
        .maybeSingle();
      
      if (existingProfile) return true;
      
      // Also check team_members table
      const { data: existingTeamMember } = await supabase
        .from('team_members')
        .select('contact')
        .ilike('contact', email)
        .maybeSingle();
        
      return !!existingTeamMember;
    } catch (error) {
      console.error("Error checking email existence:", error);
      return false; // Default to false on error
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setSignupError("Veuillez renseigner l'email et le mot de passe");
      return;
    }
    
    try {
      setIsLoading(true);
      setSignupError(null);
      
      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase();
      
      // First check if a user with this email already exists
      const emailExists = await checkEmailExists(normalizedEmail);
      
      if (emailExists) {
        setSignupError("Cette adresse email est déjà utilisée");
        setIsLoading(false);
        return;
      }
      
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      
      if (error) {
        console.error("Signup error:", error);
        handleSignupError(error);
        setSignupError(error.message || "Une erreur est survenue lors de l'inscription");
        return;
      }
      
      if (data?.user) {
        const userId = data.user.id;
        
        // Create user profile in the profiles table
        const profileData = await createUserProfile(userId, normalizedEmail, firstName, lastName);
        
        if (!profileData) {
          console.error("Failed to create user profile");
          setSignupError("Échec de la création du profil utilisateur");
          return;
        }
        
        console.log("User profile created successfully:", profileData);
        
        // Create a cabinet for the user
        const cabinetData = await createUserCabinet(userId, firstName, lastName);
        
        if (!cabinetData) {
          console.warn("Failed to create cabinet for user");
          // We still continue as this is not critical for signup
        } else {
          console.log("Cabinet created successfully:", cabinetData);
        }
        
        setSignupSuccess(true);
        toast({
          title: "Inscription réussie",
          description: "Veuillez confirmer votre email pour activer votre compte.",
        });
      }
    } catch (error: any) {
      console.error("Exception during signup:", error);
      handleSignupError(error);
      setSignupError(error.message || "Une erreur inattendue est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-semibold text-[#5C4E3D] mb-6 text-center">
        Créer un compte DentalPilote
      </h1>
      
      {signupSuccess && (
        <Alert className="mb-4 bg-green-50 border-green-500">
          <AlertDescription className="text-green-700">
            Votre compte a été créé avec succès. Veuillez vérifier votre email pour confirmer votre compte.
          </AlertDescription>
        </Alert>
      )}
      
      {signupError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{signupError}</AlertDescription>
        </Alert>
      )}
      
      {!signupSuccess && (
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input 
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Prénom"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input 
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Nom"
              />
            </div>
          </div>
          
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
            <p className="text-xs text-gray-500">Le mot de passe doit contenir au moins 6 caractères</p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#B88E23] hover:bg-[#927219]"
            disabled={isLoading}
          >
            {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
          </Button>
        </form>
      )}
      
      <div className="mt-4 text-center">
        <Link to="/auth">
          <Button variant="link" className="text-[#B88E23]">
            Vous avez déjà un compte ? Connectez-vous
          </Button>
        </Link>
      </div>
      
      <Toaster />
    </div>
  );
};

export default CustomSignupForm;
