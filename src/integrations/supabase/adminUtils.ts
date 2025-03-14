
import { supabase } from './client';
import { directDatabaseQuery, TeamMember } from './dbUtils';

// Utilitaire pour vérifier si un utilisateur est admin - uses the new security definer function
export const isUserAdmin = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_user_is_admin');
    
    if (error) {
      // If we get the infinite recursion error, try a fallback approach
      if (error.message?.includes('infinite recursion') || error.code === '42P17') {
        console.log("Using fallback method to check admin status due to recursion error");
        
        // Fallback: Get the current user data and check their admin status directly
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return false;
        
        const userId = session.user.id;
        const email = session.user.email;
        
        // Special case for known admin emails
        if (email === 'r.haddadpro@gmail.com' || email === 'cabinet@docteurhaddad.fr') {
          return true;
        }
        
        // Check if user is a cabinet owner
        const { data: cabinets } = await supabase.from('cabinets').select('id').eq('owner_id', userId);
        if (cabinets && cabinets.length > 0) {
          return true;
        }
        
        // Check team member table
        const { data: teamMember } = await directDatabaseQuery<TeamMember>('team_members', 'select', {
          select: 'is_admin',
          filters: {
            user_id: userId
          },
          single: true
        });
        
        return teamMember && teamMember.is_admin ? true : false;
      }
      
      console.error("Erreur lors de la vérification du statut admin:", error);
      return false;
    }
    
    return !!data;
  } catch (e) {
    console.error("Exception lors de la vérification du statut admin:", e);
    return false;
  }
};
