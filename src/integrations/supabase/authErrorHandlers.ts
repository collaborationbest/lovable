
import { toast } from "@/components/ui/use-toast";

/**
 * Handles signup errors, showing appropriate toast messages
 * @param error The error object from Supabase
 */
export const handleSignupError = (error: any) => {
  if (!error) return;
  
  console.error("Signup error:", error);
  
  // Check for email already exists error
  if (
    error.message?.includes("Email already exists") || 
    error.message?.includes("unique violation") ||
    error.message?.includes("duplicate key value") ||
    error.message?.includes("already existed") ||
    error.message?.includes("already registered") ||
    error.message?.includes("Database error saving new user")
  ) {
    toast({
      variant: "destructive",
      title: "Erreur d'inscription",
      description: "Cette adresse email est déjà utilisée pour un compte existant.",
    });
  } else {
    // General error handling
    toast({
      variant: "destructive",
      title: "Erreur d'inscription",
      description: error.message || "Une erreur est survenue lors de l'inscription",
    });
  }
};
