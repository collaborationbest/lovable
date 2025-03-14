
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  checkAndFixAdminStatus,
} from './AppErrorHandlerUtils';

/**
 * Global error handler component that shows error toasts and monitors console errors
 */
const AppErrorHandler = () => {
  const location = useLocation();
  const [lastError, setLastError] = useState<string | null>(null);
  const [errorDebounceTime, setErrorDebounceTime] = useState(0);
  const [errorCounter, setErrorCounter] = useState<Record<string, number>>({});
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  useEffect(() => {
    // Clear all toasts when route changes
    return () => {
      toast.dismiss();
    };
  }, [location.pathname]);

  useEffect(() => {
    const originalConsoleError = console.error;
    
    // Override console.error to track database errors
    console.error = (...args) => {
      originalConsoleError(...args);
      
      // Convert all arguments to string for easier parsing
      const errorString = args.map(arg => 
        typeof arg === 'object' && arg !== null 
          ? JSON.stringify(arg) 
          : String(arg)
      ).join(' ');
      
      // Create a hash of the error for tracking
      const errorHash = errorString.substring(0, 100);
      
      // Check for specific database errors
      const isDbError = 
        errorString.includes('infinite recursion') || 
        errorString.includes('policy for relation') ||
        errorString.includes('42P17') ||
        errorString.includes('violates row-level security') ||
        errorString.includes('permission denied') ||
        errorString.includes('Impossible de charger les dossiers') ||
        errorString.includes('Impossible de récupérer la liste des professionnels');
        
      // Check for storage bucket errors
      const isStorageError =
        errorString.includes('storage bucket') ||
        errorString.includes('bucket not found');
      
      // Check for admin permission errors
      const isAdminError = 
        errorString.includes('does not have access') ||
        errorString.includes('user is not an admin') ||
        errorString.includes('permission denied') ||
        (isDbError && errorString.includes('team_members'));
        
      if (isAdminError) {
        // Try to fix admin permissions
        checkAndFixAdminStatus(setCheckingAdmin);
      }
        
      if ((isDbError || isStorageError) && lastError !== errorHash && Date.now() - errorDebounceTime > 5000) {
        // Update error state to prevent duplicate toasts
        setLastError(errorHash);
        setErrorDebounceTime(Date.now());
        
        // Update error count for this specific error
        const newCount = (errorCounter[errorHash] || 0) + 1;
        setErrorCounter({...errorCounter, [errorHash]: newCount});
        
        // Prevent showing too many toasts for the same error
        if (newCount <= 3) {
          let errorMessage = "Une erreur est survenue. Veuillez rafraîchir la page pour résoudre le problème.";
          
          if (errorString.includes('infinite recursion')) {
            errorMessage = "Une erreur de récursion dans la base de données est survenue. Nous avons corrigé le problème, veuillez rafraîchir la page.";
            // Try to auto-fix permissions
            checkAndFixAdminStatus(setCheckingAdmin);
          } else if (errorString.includes('bucket not found')) {
            errorMessage = "Une erreur de stockage est survenue. Les fichiers ne peuvent pas être téléchargés actuellement. Veuillez réessayer plus tard.";
          } else if (errorString.includes('violates row-level security')) {
            errorMessage = "Erreur d'accès à la base de données: vos permissions semblent limitées pour cette opération. Veuillez rafraîchir la page ou vous reconnecter.";
            // Try to auto-fix permissions
            checkAndFixAdminStatus(setCheckingAdmin);
          }
            
          toast.error(errorMessage, {
            id: `db-error-${errorHash}`,
            duration: 8000,
            onDismiss: () => setLastError(null),
            action: {
              label: "Rafraîchir",
              onClick: () => window.location.reload()
            }
          });
        }
      }
    };
    
    // Execute an admin privilege check on initial load
    checkAndFixAdminStatus(setCheckingAdmin);
    
    return () => {
      console.error = originalConsoleError;
    };
  }, [lastError, errorDebounceTime, errorCounter]);
  
  return null;
};

export default AppErrorHandler;
