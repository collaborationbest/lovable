
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleSignupError } from "@/integrations/supabase/authErrorHandlers";
import { createUserProfile } from "@/integrations/supabase/userProfileOperations";
import { toast } from "sonner";
import { Separator } from '@/components/ui/separator';
import { v4 as uuidv4 } from 'uuid';
import { GoogleAuth } from './GoogleAuth';

const CustomSignupForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const navigate = useNavigate();

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email')
        .ilike('email', email)
        .maybeSingle();
      
      if (existingProfile) return true;
      
      const { data: existingTeamMember } = await supabase
        .from('team_members')
        .select('contact')
        .ilike('contact', email)
        .maybeSingle();
        
      return !!existingTeamMember;
    } catch (error) {
      console.error("Error checking email existence:", error);
      return false;
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
      
      const normalizedEmail = email.toLowerCase();
      
      const emailExists = await checkEmailExists(normalizedEmail);
      
      if (emailExists) {
        setSignupError("Cette adresse email est déjà utilisée");
        setIsLoading(false);
        return;
      }
      
      console.log("Attempting signup with email:", normalizedEmail);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          },
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });
      
      if (error) {
        console.error("Signup error:", error);
        const errorMessage = handleSignupError(error);
        setSignupError(errorMessage || "Une erreur est survenue lors de l'inscription");
        return;
      }
      
      if (data?.user) {
        const userId = data.user.id;
        console.log("User signed up successfully with ID:", userId);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { data: sessionData } = await supabase.auth.getSession();
        
        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
            
          if (existingProfile) {
            console.log("Profile already exists, skipping creation");
          } else {
            let profileData = null;
            let attempts = 0;
            const maxAttempts = 3;
            
            while (!profileData && attempts < maxAttempts) {
              attempts++;
              console.log(`Attempt ${attempts} to create profile for user ${userId}`);
              
              profileData = await createUserProfile(userId, normalizedEmail, firstName, lastName);
              
              if (!profileData && attempts < maxAttempts) {
                console.log(`Profile creation attempt ${attempts} failed, retrying...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
              }
            }
            
            if (!profileData) {
              console.error("Failed to create user profile after multiple attempts");
              console.log("Proceeding with cabinet creation despite profile creation failure");
            }
          }
        } catch (profileError) {
          console.error("Error during profile creation:", profileError);
        }
        
        try {
          const cabinetUuid = uuidv4();
          
          const { data: cabinetData, error: cabinetError } = await supabase
            .from('cabinets')
            .insert({
              id: cabinetUuid,
              name: firstName ? `Cabinet de ${firstName}` : 'Mon Cabinet Dentaire',
              owner_id: userId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              status: 'active'
            })
            .select();
            
          if (cabinetError) {
            console.error("Error creating cabinet:", cabinetError);
          } else {
            console.log("Cabinet created successfully:", cabinetData);
            
            try {
              const teamMemberId = uuidv4();
              
              const { error: teamMemberError } = await supabase
                .from('team_members')
                .insert({
                  id: teamMemberId,
                  first_name: firstName || normalizedEmail.split('@')[0],
                  last_name: lastName || '',
                  role: "dentiste",
                  contact: normalizedEmail,
                  is_admin: true,
                  is_owner: true,
                  cabinet_id: cabinetUuid,
                  user_id: userId,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
                
              if (teamMemberError) {
                console.error("Error creating team member:", teamMemberError);
              } else {
                console.log("Team member created successfully");
              }
            } catch (teamMemberException) {
              console.error("Exception when creating team member:", teamMemberException);
            }
          }
        } catch (cabinetException) {
          console.error("Exception when creating cabinet:", cabinetException);
        }
        
        setSignupSuccess(true);
        toast.success("Inscription réussie", {
          description: "Votre compte a été créé avec succès. Veuillez vérifier votre email pour confirmer votre compte."
        });
        
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
      }
    } catch (error: any) {
      console.error("Exception during signup:", error);
      const errorMessage = handleSignupError(error);
      setSignupError(errorMessage || "Une erreur inattendue est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/");
      }
    };
    
    checkSession();
  }, [navigate]);

  // Add effect to handle authentication change events
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user && session.user.app_metadata.provider === 'google') {
          try {
            console.log("Google sign-in detected, preparing user profile...");
            const userId = session.user.id;
            const email = session.user.email || '';
            
            // Extract name from user metadata
            const firstName = session.user.user_metadata.name?.split(' ')[0] || '';
            const lastName = session.user.user_metadata.name?.split(' ').slice(1).join(' ') || '';
            
            // Check if profile already exists
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .maybeSingle();
              
            if (!existingProfile) {
              console.log("Creating profile for Google user:", userId);
              await createUserProfile(userId, email, firstName, lastName);
              
              // Create cabinet for the new user
              const cabinetUuid = uuidv4();
              
              await supabase
                .from('cabinets')
                .insert({
                  id: cabinetUuid,
                  name: firstName ? `Cabinet de ${firstName}` : 'Mon Cabinet Dentaire',
                  owner_id: userId,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  status: 'active'
                });
              
              // Create team member entry
              await supabase
                .from('team_members')
                .insert({
                  id: uuidv4(),
                  first_name: firstName || email.split('@')[0],
                  last_name: lastName || '',
                  role: "dentiste",
                  contact: email,
                  is_admin: true,
                  is_owner: true,
                  cabinet_id: cabinetUuid,
                  user_id: userId,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
                
              toast.success("Inscription avec Google réussie", {
                description: "Votre compte a été créé avec succès."
              });
            }
          } catch (error) {
            console.error("Error setting up Google user:", error);
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
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
        <>
          <div className="mb-4">
            <GoogleAuth 
              redirectTo={`${window.location.origin}/auth?signup=true`}
              mode="signup" 
            />
          </div>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-xs text-gray-500">OU</span>
            </div>
          </div>
          
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
        </>
      )}
      
      {signupSuccess && (
        <Button 
          onClick={() => setSignupSuccess(false)} 
          className="w-full mt-4 bg-[#B88E23] hover:bg-[#927219]"
        >
          Créer un autre compte
        </Button>
      )}
      
      <div className="mt-4 text-center">
        <Link to="/auth">
          <Button variant="link" className="text-[#B88E23]">
            Vous avez déjà un compte ? Connectez-vous
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CustomSignupForm;
