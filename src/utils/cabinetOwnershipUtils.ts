
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ACCOUNT_OWNER_EMAIL, CABINET_EMAIL } from "@/constants/accessControl";

/**
 * Checks if a user should be an admin based on cabinet ownership
 * @param userId - The user's ID
 * @param email - The user's email
 * @returns Promise<boolean> - Whether the user should be an admin
 */
export const checkCabinetOwnership = async (userId: string, email: string): Promise<boolean> => {
  try {
    console.log(`Checking cabinet ownership for ${email}`);

    // Check if it's one of the special privilege emails
    if (email.toLowerCase() === ACCOUNT_OWNER_EMAIL.toLowerCase() ||
      email.toLowerCase() === CABINET_EMAIL.toLowerCase()) {
      console.log("Email has special privileges");
      return true;
    }

    // Check if user is a cabinet owner
    const { data: cabinetData, error: cabinetError } = await supabase
      .from('cabinets')
      .select('id')
      .eq('owner_id', userId);

    if (cabinetError) {
      console.error("Error checking cabinet ownership:", cabinetError);
      return false;
    }

    if (cabinetData && cabinetData.length > 0) {
      console.log("User is cabinet owner:", email);
      const cabinetId = cabinetData[0].id;

      // Check if user has a team member entry
      const { data: teamMembers, error: teamMemberError } = await supabase
        .from('team_members')
        .select('*')
        .eq('contact', email)

      const teamMember = teamMembers && teamMembers.length > 0 ? teamMembers[0] : null;
      console.log("teamMember", teamMember)

      if (teamMemberError) {
        console.error("Error checking team member for cabinet owner:", teamMemberError);
      }

      // If user owns cabinets but has no team member entry or is not admin
      if (!teamMember || !teamMember.is_admin || teamMember.cabinet_id !== cabinetId) {
        console.log("Cabinet owner missing admin status or has wrong cabinet, attempting to create/update team member...");

        if (!teamMember) {
          // Create team member entry for cabinet owner
          try {
            // Extract first and last name from email
            let firstName = email.split('@')[0];
            let lastName = "";

            // Try to extract a proper name if possible
            const nameParts = firstName.split(/[._-]/);
            if (nameParts.length > 1) {
              firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
              lastName = nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1);
            } else {
              firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
            }

            // Try direct insertion first
            const { error: directError } = await supabase
              .from('team_members')
              .insert({
                first_name: firstName,
                last_name: lastName,
                role: "dentiste",
                contact: email,
                is_admin: true,
                is_owner: true,
                cabinet_id: cabinetId,
                user_id: userId
              });

            if (directError) {
              console.error("Direct team member insertion failed:", directError);
              console.log("Falling back to edge function");

              // Fall back to edge function
              const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('create-team-member', {
                body: {
                  memberData: {
                    first_name: firstName,
                    last_name: lastName,
                    role: "dentiste",
                    contact: email,
                    is_admin: true,
                    is_owner: true,
                    cabinet_id: cabinetId,
                    user_id: userId
                  },
                  email: email,
                  firstName,
                  lastName
                }
              });

              if (edgeFunctionError) {
                console.error("Error from edge function:", edgeFunctionError);
                return false;
              } else {
                console.log("Successfully created team member for cabinet owner:", edgeFunctionData);

                toast.success("Vos droits d'administrateur ont été activés. Veuillez rafraîchir la page.", {
                  duration: 6000,
                  action: {
                    label: "Rafraîchir",
                    onClick: () => window.location.reload()
                  }
                });

                return true;
              }
            } else {
              console.log("Team member created successfully via direct insertion");

              toast.success("Vos droits d'administrateur ont été activés. Veuillez rafraîchir la page.", {
                duration: 6000,
                action: {
                  label: "Rafraîchir",
                  onClick: () => window.location.reload()
                }
              });

              return true;
            }
          } catch (edgeFunctionException) {
            console.error("Exception when calling edge function:", edgeFunctionException);
            return false;
          }
        } else {
          // Update existing team member to be admin
          const { error: updateError } = await supabase
            .from('team_members')
            .update({
              is_admin: true,
              is_owner: true,
              cabinet_id: cabinetId
            })
            .eq('id', teamMember.id);

          if (updateError) {
            console.error("Error updating team member to admin:", updateError);
            return false;
          } else {
            console.log("Updated cabinet owner to admin successfully");

            toast.success("Vos droits d'administrateur ont été activés. Veuillez rafraîchir la page.", {
              duration: 6000,
              action: {
                label: "Rafraîchir",
                onClick: () => window.location.reload()
              }
            });

            return true;
          }
        }
      } else {
        console.log("User already has proper admin privileges");
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Error in checkCabinetOwnership:", error);
    return false;
  }
};
