
import { TeamMember } from "@/types/TeamMember";
import { supabase } from "@/integrations/supabase/client";
import { ACCOUNT_OWNER_EMAIL } from "@/hooks/useAccessControl";
import { transformTeamMemberToDatabase } from "./teamMemberTransformUtils";

// Check if account owner exists in team members
export const checkAccountOwnerExists = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('contact')
      .ilike('contact', ACCOUNT_OWNER_EMAIL) // Case-insensitive comparison
      .single();

    if (error) {
      console.error("Error checking for account owner:", error);
      return false;
    }

    console.log("Account owner check result:", data);
    return !!data;
  } catch (error) {
    console.error("Error in checkAccountOwnerExists:", error);
    return false;
  }
};

// Add account owner to database if not exists
export const ensureAccountOwnerInDatabase = async (ownerData: Omit<TeamMember, "id"> & { cabinet_id?: string, isOwner?: boolean }): Promise<void> => {
  try {
    console.log("Checking if account owner exists in database...");
    const ownerExists = await checkAccountOwnerExists();

    if (!ownerExists) {
      console.log("Account owner not found in database, adding with data:", ownerData);
      const memberData = transformTeamMemberToDatabase(ownerData);

      // Add cabinet_id and is_owner to the database data
      if (ownerData.cabinet_id) {
        memberData.cabinet_id = ownerData.cabinet_id;
      }

      if (ownerData.isOwner !== undefined) {
        memberData.is_owner = ownerData.isOwner;
      }

      console.log("Transformed owner data for database:", memberData);

      // Try to use the edge function for permission issues
      try {
        // First get the current user's auth ID
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        const response = await supabase.functions.invoke('create-team-member', {
          body: {
            memberData: {
              ...memberData,
              is_admin: true,
              is_owner: true,
              // Ensure first_name is included since it's required
              first_name: ownerData.firstName || 'Account'
            },
            email: ACCOUNT_OWNER_EMAIL,
            firstName: ownerData.firstName || 'Account',
            lastName: ownerData.lastName || 'Owner',
            userId: userId
          }
        });

        if (response.error) {
          throw new Error(`Edge function error: ${response.error.message}`);
        }

        console.log("Account owner added via edge function:", response.data);
      } catch (edgeFunctionError) {
        console.error("Edge function failed, trying direct insert:", edgeFunctionError);

        // Fall back to direct insert in case edge function fails
        // Ensure first_name is included when inserting directly
        const { data, error } = await supabase
          .from('team_members')
          .insert({
            ...memberData,
            first_name: ownerData.firstName || 'Account', // Required field
            last_name: ownerData.lastName || 'Owner', // Make sure this is set too
            is_admin: true,
            is_owner: true
          })
          .select()
          .single();

        if (error) {
          console.error("Error adding account owner to database:", error);
          throw error;
        }

        console.log("Account owner added to database successfully:", data);
      }
    } else {
      console.log("Account owner already exists in database");

      // Update the cabinet_id and is_owner status if the account owner exists
      if (ownerData.cabinet_id || ownerData.isOwner !== undefined) {
        const updateData: any = {
          is_admin: true
        };

        if (ownerData.cabinet_id) {
          updateData.cabinet_id = ownerData.cabinet_id;
        }

        if (ownerData.isOwner !== undefined) {
          updateData.is_owner = ownerData.isOwner;
        }

        // Only update if we have data to update
        if (Object.keys(updateData).length > 0) {
          console.log("Updating existing account owner with:", updateData);

          const { data, error } = await supabase
            .from('team_members')
            .update(updateData)
            .eq('contact', ACCOUNT_OWNER_EMAIL)
            .select();

          if (error) {
            console.error("Error updating account owner in database:", error);
          } else {
            console.log("Account owner updated successfully:", data);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in ensureAccountOwnerInDatabase:", error);
  }
};
