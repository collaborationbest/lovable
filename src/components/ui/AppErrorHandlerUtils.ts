
import { supabase } from '@/integrations/supabase/client';
import { ensureUserCabinetAssociation } from '@/integrations/supabase/cabinetUtils';

// Add the missing checkAndFixAdminStatus function
export const checkAndFixAdminStatus = async (setCheckingAdmin: (checking: boolean) => void): Promise<boolean> => {
  try {
    setCheckingAdmin(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log("No session found, skipping admin check");
      return false;
    }
    
    // Check if user is already an admin
    const { data, error } = await supabase
      .from('team_members')
      .select('id, is_admin')
      .eq('contact', user.email)
      .eq('is_admin', true)
      .maybeSingle();

    if (error) {
      console.error("Error checking admin status:", error);
      return false;
    }

    if (data) {
      console.log("User is already an admin, no fix needed");
      return true;
    }

    // Only try to fix if the user email matches our known account owner email
    if (user.email === 'r.haddadpro@gmail.com' || user.email === 'cabinet@docteurhaddad.fr') {
      console.log("Account owner detected, will fix admin status");
      
      // Get the user's cabinet ID
      const cabinetId = await ensureUserCabinetAssociation(user.id);
      
      if (!cabinetId) {
        console.error("Could not determine cabinet ID for user");
        return false;
      }
      
      // Update the user's team_member entry to make them an admin
      const { error: updateError } = await supabase
        .from('team_members')
        .update({ is_admin: true })
        .eq('contact', user.email)
        .eq('cabinet_id', cabinetId);
      
      if (updateError) {
        console.error("Error updating admin status:", updateError);
        return false;
      }
      
      console.log("Successfully fixed admin status for account owner");
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error in checkAndFixAdminStatus:", error);
    return false;
  } finally {
    setCheckingAdmin(false);
  }
};

// Type definitions for error handling
type ErrorType = 'auth' | 'database' | 'network' | 'storage' | 'unknown';

interface ErrorInfo {
  type: ErrorType;
  message: string;
  details?: string;
  suggestionForUser?: string;
}

/**
 * Processes and classifies different types of errors
 */
export const processError = (error: any): ErrorInfo => {
  // Default error info
  const defaultError: ErrorInfo = {
    type: 'unknown',
    message: 'Une erreur inconnue est survenue',
    suggestionForUser: 'Veuillez réessayer ou contacter le support'
  };

  if (!error) return defaultError;

  // Convert error to string if it's not already
  const errorString = typeof error === 'string' ? error : error.message || JSON.stringify(error);

  // Authentication errors
  if (errorString.includes('auth') || errorString.includes('JWT') || errorString.includes('token')) {
    return {
      type: 'auth',
      message: 'Erreur d\'authentification',
      details: errorString,
      suggestionForUser: 'Veuillez vous reconnecter ou vérifier vos identifiants'
    };
  }

  // Database errors
  if (errorString.includes('database') || errorString.includes('DB') || errorString.includes('SQL')) {
    return {
      type: 'database',
      message: 'Erreur de base de données',
      details: errorString,
      suggestionForUser: 'Une erreur est survenue lors de l\'accès aux données'
    };
  }

  // Network errors
  if (errorString.includes('network') || errorString.includes('connexion') || errorString.includes('timeout')) {
    return {
      type: 'network',
      message: 'Erreur de connexion',
      details: errorString,
      suggestionForUser: 'Veuillez vérifier votre connexion internet'
    };
  }

  // Storage errors
  if (errorString.includes('storage') || errorString.includes('upload') || errorString.includes('file')) {
    return {
      type: 'storage',
      message: 'Erreur de stockage',
      details: errorString,
      suggestionForUser: 'Une erreur est survenue lors du traitement du fichier'
    };
  }

  // Default case
  return {
    type: 'unknown',
    message: 'Erreur',
    details: errorString,
    suggestionForUser: 'Veuillez réessayer ou contacter le support'
  };
};

/**
 * Recovers from errors by attempting some recovery strategies
 */
export const recoverFromError = async (error: ErrorInfo): Promise<boolean> => {
  try {
    switch (error.type) {
      case 'auth':
        // Try to refresh the token
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error("Failed to refresh auth session:", refreshError);
          return false;
        }
        return true;

      case 'database':
        // For database errors, could retry the transaction (not implemented here)
        return false;

      case 'network':
        // For network errors, we could retry the request after a delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        return true;

      case 'storage':
        // Storage errors often require user intervention
        return false;

      default:
        return false;
    }
  } catch (recoveryError) {
    console.error("Error during recovery attempt:", recoveryError);
    return false;
  }
};

/**
 * Create or associate user with cabinet - string parameter version
 */
export const createOrAssociateUserWithCabinet = async (cabinetId: string): Promise<boolean> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Ensure the user is associated with the cabinet
    const result = await ensureUserCabinetAssociation(user.id);
    return !!result;
  } catch (error) {
    console.error("Error in createOrAssociateUserWithCabinet:", error);
    return false;
  }
};

/**
 * This function is used to create a new team member
 */
export const createTeamMember = async (cabinetId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { error } = await supabase.from('team_members').insert({
      first_name: "Nouveau",
      last_name: "Membre",
      role: "dentiste",
      cabinet_id: cabinetId,
      contact: user.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    if (error) {
      console.error("Error creating team member:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in createTeamMember:", error);
    return false;
  }
};

/**
 * Handle errors related to document uploads
 */
export const handleDocumentUploadError = async (error: any): Promise<string> => {
  const errorInfo = processError(error);
  
  // Log the error for debugging
  console.error("Document upload error:", errorInfo);
  
  // Return a user-friendly message
  switch (errorInfo.type) {
    case 'storage':
      return "Erreur lors du téléchargement du document. Veuillez vérifier la taille et le format du fichier.";
    case 'auth':
      return "Vous devez être connecté pour télécharger des documents.";
    case 'network':
      return "Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer.";
    default:
      return "Une erreur est survenue lors du téléchargement. Veuillez réessayer.";
  }
};

/**
 * Check document storage quotas and limits
 */
export const checkDocumentStorageLimits = async (fileSize: number, cabinetId: string): Promise<{ allowed: boolean; message: string }> => {
  try {
    // Get total storage used
    const { data, error } = await supabase
      .from('documents')
      .select('size')
      .eq('cabinet_id', cabinetId);
    
    if (error) {
      console.error("Error checking storage limits:", error);
      return { allowed: true, message: "" }; // Allow upload on error to avoid blocking user
    }
    
    // Calculate total size in bytes
    const totalSizeBytes = data.reduce((sum, doc) => sum + (doc.size || 0), 0);
    
    // Check against limit (e.g., 1GB = 1,073,741,824 bytes)
    const storageLimitBytes = 1073741824;
    
    if (totalSizeBytes + fileSize > storageLimitBytes) {
      return {
        allowed: false,
        message: "Vous avez atteint votre limite de stockage. Veuillez supprimer d'anciens documents."
      };
    }
    
    return { allowed: true, message: "" };
  } catch (error) {
    console.error("Error in checkDocumentStorageLimits:", error);
    return { allowed: true, message: "" }; // Allow upload on error
  }
};
