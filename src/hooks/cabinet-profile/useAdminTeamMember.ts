
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook for managing admin team member operations
 */
export const useAdminTeamMember = () => {
  /**
   * Creates or updates a team member as admin for the current user
   */
  const ensureAdminTeamMember = async (userId: string, userEmail: string, cabinetId: string) => {
    console.log(`Ensuring admin privileges for user ${userEmail} in cabinet ${cabinetId}`);
    
    try {
      // Extract first name and last name from email or use default values
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

      // First check if the user already has a team_member entry
      const { data: existingTeamMember, error: checkError } = await supabase
        .from('team_members')
        .select('id, is_admin, is_owner, cabinet_id')
        .eq('contact', userEmail)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking existing team member:", checkError);
        // Continue with creation - we don't want to completely block the process
      }
      
      if (existingTeamMember) {
        console.log("Existing team member found:", existingTeamMember);
        
        // If the entry exists but is not admin or has a different cabinet_id
        if (!existingTeamMember.is_admin || existingTeamMember.cabinet_id !== cabinetId) {
          console.log("Updating team member with admin privileges");
          
          const { error: updateError } = await supabase
            .from('team_members')
            .update({
              is_admin: true,
              is_owner: true,
              cabinet_id: cabinetId
            })
            .eq('id', existingTeamMember.id);
            
          if (updateError) {
            console.error("Failed to update team member with admin privileges:", updateError);
            throw updateError;
          }
          
          console.log("Team member updated with admin privileges");
        } else {
          console.log("User already has admin privileges for this cabinet");
        }
      } else {
        console.log("No existing team member found, creating new one");
        
        // Try direct insertion first
        const { data: directInsert, error: directInsertError } = await supabase
          .from('team_members')
          .insert({
            first_name: firstName,
            last_name: lastName,
            role: "dentiste",
            contact: userEmail,
            is_admin: true,
            is_owner: true,
            cabinet_id: cabinetId,
            user_id: userId
          })
          .select()
          .single();
        
        if (directInsertError) {
          console.error("Direct team member insertion failed:", directInsertError);
          console.log("Falling back to edge function for team member creation");
          
          // Fallback to the edge function to bypass RLS issues
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
                firstName,
                lastName
              }
            });
            
            if (edgeFunctionError) {
              console.error("Edge function error:", edgeFunctionError);
              throw edgeFunctionError;
            }
            
            console.log("Team member created via edge function:", edgeFunctionData);
          } catch (edgeFunctionException) {
            console.error("Exception calling edge function:", edgeFunctionException);
            throw edgeFunctionException;
          }
        } else {
          console.log("Team member created directly:", directInsert);
        }
      }
      
      // Send notification to the user
      toast.success("Droits d'administrateur attribués avec succès", {
        duration: 4000
      });
      
      return true;
    } catch (error) {
      console.error("Error ensuring admin team member:", error);
      return false;
    }
  };

  return { ensureAdminTeamMember };
};
