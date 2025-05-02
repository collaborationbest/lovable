
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
import { invalidateAuthCache } from '@/hooks/access-control/useAuthState';
import { useAccessControl } from '@/hooks/access-control';
import { ensureUserProfile } from '@/integrations/supabase/userProfileOperations';
import { getUserCabinetId, ensureUserCabinetAssociation } from '@/integrations/supabase/cabinetUtils';
import { ensureUserCabinetAssociation as ensureTeamMembership } from '@/integrations/supabase/teamMemberUtils';

/**
 * Component that observes authentication status changes
 * and handles automatic redirects based on user role
 */
const AuthStatusObserver = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, isAdmin, isAccountOwner } = useAccessControl();
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event);
      
      if (event === 'SIGNED_IN') {
        // Cache invalidation to ensure fresh auth state
        invalidateAuthCache();
        
        // Handle Google sign-in specifically
        if (session?.user && session.user.app_metadata.provider === 'google') {
          try {
            console.log("Google sign-in detected in AuthStatusObserver");
            const userId = session.user.id;
            const email = session.user.email || '';
            
            // Extract name from user metadata
            const firstName = session.user.user_metadata.name?.split(' ')[0] || '';
            const lastName = session.user.user_metadata.name?.split(' ').slice(1).join(' ') || '';
            
            // Ensure user profile exists
            await ensureUserProfile(userId, {
              first_name: firstName,
              last_name: lastName,
              email: email,
              is_admin: false
            });
            
            // Ensure user has a cabinet and is associated with it
            const cabinetId = await ensureUserCabinetAssociation(userId);
            
            if (cabinetId) {
              console.log(`User associated with cabinet ${cabinetId}`);
              
              // Ensure the user is a team member in their cabinet
              const teamMemberData = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                isAdmin: true, // Cabinet owners should be admins
                isOwner: true,
                role: 'dentiste'
              };
              
              await ensureTeamMembership(cabinetId, teamMemberData);
            } else {
              console.error("Failed to ensure cabinet association");
              
              toast.error("Impossible de créer un cabinet pour votre compte", {
                description: "Veuillez réessayer ou contacter le support",
                duration: 5000
              });
            }
          } catch (error) {
            console.error("Error handling Google sign-in:", error);
            
            toast.error("Une erreur est survenue lors de la configuration de votre compte", {
              description: "Veuillez réessayer ou contacter le support",
              duration: 5000
            });
          }
        }
        
        // Determine where to redirect based on role
        if (location.pathname === '/auth') {
          // Get role from session metadata if possible
          let role = session?.user?.user_metadata?.role as string | undefined;
          
          // Use the role from our access control hook if available
          if (!role && userRole) {
            role = userRole;
          }
          
          // Default redirect path
          let redirectPath = '/';
          
          // Redirect assistants and secretaries to operations, others to dashboard
          if (role === 'assistante' || role === 'secrétaire') {
            if (!isAdmin && !isAccountOwner) {
              redirectPath = '/operations';
              console.log(`User with role ${role} redirected to Operations`);
            }
          }
          
          navigate(redirectPath, { replace: true });
        }
      } else if (event === 'SIGNED_OUT') {
        // Invalidate cache on sign out
        invalidateAuthCache();
        
        // Clear any persisted form data
        localStorage.removeItem('formData');
        
        toast.info('You have been signed out', {
          id: 'signed-out',
        });
        
        // Redirect to auth page
        navigate('/auth', { replace: true });
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [location, navigate, userRole, isAdmin, isAccountOwner]);
  
  return null;
};

export default AuthStatusObserver;
