
import { supabase, ensureUserCabinetAssociation } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Helper function to check if a user is an admin
export const checkAndFixAdminStatus = async (setCheckingAdmin: (checking: boolean) => void): Promise<void> => {
  // Prevent concurrent checks
  setCheckingAdmin(true);
  
  try {
    console.log("Checking and fixing admin status...");
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log("No session found, skipping admin check");
      setCheckingAdmin(false);
      return;
    }
    
    const userId = session.user.id;
    const userEmail = session.user.email;
    
    if (!userEmail) {
      console.log("No user email found, skipping admin check");
      setCheckingAdmin(false);
      return;
    }
    
    console.log(`Checking admin status for user ${userEmail}`);
    
    // Special case for specific email addresses that should always be admin
    const isSpecialAdmin = userEmail === 'r.haddadpro@gmail.com' || userEmail === 'cabinet@docteurhaddad.fr';
    
    try {
      // Check if the user has a team_member entry with admin privileges
      const { data: teamMember, error: teamMemberError } = await supabase
        .from('team_members')
        .select('*')
        .eq('contact', userEmail)
        .maybeSingle();
      
      if (teamMemberError) {
        console.error("Error checking team member status:", teamMemberError);
        
        // If we got a recursion error, we need to try a different approach
        if (teamMemberError.message?.includes('infinite recursion') || teamMemberError.code === '42P17') {
          await handleRecursionError(userId, userEmail, isSpecialAdmin);
        }
        
        setCheckingAdmin(false);
        return;
      }
      
      // Find cabinets owned by this user
      const { data: cabinets, error: cabinetsError } = await supabase
        .from('cabinets')
        .select('id')
        .eq('owner_id', userId);
      
      if (cabinetsError) {
        console.error("Error checking owned cabinets:", cabinetsError);
        setCheckingAdmin(false);
        return;
      }
      
      console.log(`User owns ${cabinets?.length || 0} cabinets`);
      
      // Check if user owns cabinets but isn't an admin
      if ((cabinets && cabinets.length > 0) || isSpecialAdmin) {
        const cabinetId = cabinets && cabinets.length > 0 ? cabinets[0].id : "126"; // Default to cabinet 126 for special admins
        
        if (!teamMember) {
          console.log("User owns cabinets but has no team member entry. Creating one...");
          await createTeamMemberForOwner(userId, userEmail, cabinetId);
        } else if (!teamMember.is_admin || (cabinetId && teamMember.cabinet_id !== cabinetId)) {
          console.log("User owns cabinets but isn't an admin or has wrong cabinet. Updating role...");
          await updateTeamMemberAdminStatus(teamMember.id, cabinetId);
        } else {
          console.log("User already has admin privileges for their cabinet");
        }
      } else {
        console.log("User doesn't own any cabinets");
      }
    } catch (error) {
      console.error("Error in team member check:", error);
      // Try the fallback method if regular methods fail
      await handleRecursionError(userId, userEmail, isSpecialAdmin);
    }
  } catch (error) {
    console.error("Error in checkAndFixAdminStatus:", error);
  } finally {
    setCheckingAdmin(false);
  }
};

// Handle recursion errors with our direct database approach
export const handleRecursionError = async (userId: string, userEmail: string, isSpecialAdmin: boolean): Promise<void> => {
  try {
    console.log("Using direct database approach to fix admin status due to recursion error");
    
    // Find cabinets owned by this user
    const { data: cabinets } = await supabase
      .from('cabinets')
      .select('id')
      .eq('owner_id', userId);
    
    const ownerOfCabinets = cabinets && cabinets.length > 0;
    const cabinetId = ownerOfCabinets ? cabinets[0].id : "126"; // Default to cabinet 126 for special admins
    
    if (ownerOfCabinets || isSpecialAdmin) {
      // Extract first and last name from email
      let firstName = userEmail.split('@')[0];
      let lastName = "";
      
      // Try to extract a proper name if possible
      const nameParts = firstName.split(/[._-]/);
      if (nameParts.length > 1) {
        firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
        lastName = nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1);
      } else {
        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
      }
      
      // Create association with the cabinet
      const success = await ensureUserCabinetAssociation(cabinetId, {
        firstName,
        lastName,
        email: userEmail,
        isAdmin: true,
        isOwner: ownerOfCabinets || isSpecialAdmin,
        role: "dentiste"
      });
      
      if (success) {
        console.log("Successfully updated cabinet association and admin status");
        
        toast.success("Vos droits d'administrateur ont été restaurés. Veuillez rafraîchir la page.", {
          duration: 6000,
          action: {
            label: "Rafraîchir",
            onClick: () => window.location.reload()
          }
        });
      }
    }
  } catch (directError) {
    console.error("Error in handleRecursionError:", directError);
  }
};

// Create a team member entry for a cabinet owner
export const createTeamMemberForOwner = async (userId: string, userEmail: string, cabinetId: string): Promise<void> => {
  try {
    // Extract first and last name from email
    let firstName = userEmail.split('@')[0];
    let lastName = "";
    
    // Try to extract a proper name if possible
    const nameParts = firstName.split(/[._-]/);
    if (nameParts.length > 1) {
      firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
      lastName = nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1);
    } else {
      firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    }
    
    // Try to create team member via edge function
    try {
      const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('create-team-member', {
        body: {
          memberData: {
            first_name: firstName,
            last_name: lastName,
            role: "dentiste",
            contact: userEmail,
            is_admin: true,
            is_owner: true,
            cabinet_id: cabinetId,
            user_id: userId
          },
          email: userEmail,
          firstName: firstName,
          lastName: lastName || "",
          authUserId: userId
        }
      });
      
      if (edgeFunctionError) {
        console.error("Error from edge function:", edgeFunctionError);
        // Fall back to direct DB method
        await ensureUserCabinetAssociation(cabinetId, {
          firstName, 
          lastName: lastName || "", 
          email: userEmail,
          isAdmin: true,
          isOwner: true
        });
      } else {
        console.log("Auto-created team member with admin rights:", edgeFunctionData);
        
        toast.success("Vos droits d'administrateur ont été restaurés. Veuillez rafraîchir la page.", {
          duration: 6000,
          action: {
            label: "Rafraîchir",
            onClick: () => window.location.reload()
          }
        });
      }
    } catch (edgeFunctionException) {
      console.error("Exception when calling edge function:", edgeFunctionException);
      // Fall back to direct DB method
      await ensureUserCabinetAssociation(cabinetId, {
        firstName, 
        lastName: lastName || "", 
        email: userEmail,
        isAdmin: true,
        isOwner: true
      });
    }
  } catch (error) {
    console.error("Error in createTeamMemberForOwner:", error);
  }
};

// Update an existing team member to have admin status
export const updateTeamMemberAdminStatus = async (memberId: string, cabinetId: string): Promise<void> => {
  try {
    // Try to update the existing team member to be an admin
    const { error: updateError } = await supabase
      .from('team_members')
      .update({ 
        is_admin: true, 
        is_owner: true,
        cabinet_id: cabinetId
      })
      .eq('id', memberId);
    
    if (updateError) {
      console.error("Error updating team member to admin:", updateError);
      
      // If we got a recursion error, we need to try a different approach
      if (updateError.message?.includes('infinite recursion') || updateError.code === '42P17') {
        // We'll use our user session data to find the right information
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const userId = session.user.id;
          const userEmail = session.user.email;
          
          if (userEmail) {
            // Extract first and last name from email
            let firstName = userEmail.split('@')[0];
            let lastName = "";
            
            // Try to extract a proper name if possible
            const nameParts = firstName.split(/[._-]/);
            if (nameParts.length > 1) {
              firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
              lastName = nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1);
            } else {
              firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
            }
            
            // Use our direct database method
            await ensureUserCabinetAssociation(cabinetId, {
              firstName, 
              lastName: lastName || "", 
              email: userEmail,
              isAdmin: true,
              isOwner: true
            });
          }
        }
      }
    } else {
      console.log("Updated user to admin successfully");
      
      toast.success("Vos droits d'administrateur ont été restaurés. Veuillez rafraîchir la page.", {
        duration: 6000,
        action: {
          label: "Rafraîchir",
          onClick: () => window.location.reload()
        }
      });
    }
  } catch (error) {
    console.error("Error in updateTeamMemberAdminStatus:", error);
  }
};
