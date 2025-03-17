// Add missing function to ensure an account owner exists
import { supabase } from "@/integrations/supabase/client";

// Add missing function to ensure an account owner exists
export const ensureAccountOwnerExists = async (
  cabinetId: string,
  ownerData: {
    firstName: string;
    lastName: string;
    email: string;
    userId?: string;
  }
): Promise<boolean> => {
  try {
    // Check if owner already exists for this cabinet
    const { data: existingOwners } = await supabase
      .from('team_members')
      .select('*')
      .eq('cabinet_id', cabinetId)
      .eq('is_owner', true);

    if (existingOwners && existingOwners.length > 0) {
      console.log("Cabinet already has an owner");
      return true;
    }

    // Create new owner
    const insertData = {
      first_name: ownerData.firstName, // required field
      last_name: ownerData.lastName,   // required field
      role: "dentiste" as const,       // required field with specific type
      is_admin: true,
      is_owner: true,
      cabinet_id: cabinetId,
      contact: ownerData.email,
      user_id: ownerData.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('team_members')
      .insert(insertData);

    if (error) {
      console.error("Error ensuring account owner exists:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception in ensureAccountOwnerExists:", error);
    return false;
  }
};
