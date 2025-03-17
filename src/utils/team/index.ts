import { supabase } from "@/integrations/supabase/client";
import { TeamMember } from "@/types/TeamMember";
import { createClient } from "@supabase/supabase-js";
import { getCabinetId } from "./cabinetOwnerUtils";
import { fetchTeamMembers } from "./teamMemberCrud";
import { ensureAccountOwnerExists } from "./accountOwnerUtils";

export const getOrCreateCabinet = async (cabinetName: string, ownerEmail: string): Promise<{ id: string; } | null> => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase URL or Key missing from environment variables.");
      return null;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let { data: cabinets, error: cabinetError } = await supabase
      .from('cabinets')
      .select('id')
      .eq('name', cabinetName);

    if (cabinetError) {
      console.error("Error fetching cabinets:", cabinetError);
      return null;
    }

    if (cabinets && cabinets.length > 0) {
      console.log(`Cabinet "${cabinetName}" already exists with ID: ${cabinets[0].id}`);
      return { id: cabinets[0].id };
    }

    const { data, error } = await supabase
      .from('cabinets')
      .insert([{ name: cabinetName, owner_email: ownerEmail }])
      .select('id');

    if (error) {
      console.error("Error creating cabinet:", error);
      return null;
    }

    if (data && data.length > 0) {
      console.log(`Cabinet "${cabinetName}" created with ID: ${data[0].id}`);
      return { id: data[0].id };
    } else {
      console.warn("No cabinet ID returned after creation.");
      return null;
    }
  } catch (error) {
    console.error("Error in getOrCreateCabinet:", error);
    return null;
  }
};

export const ensureCabinetAndAccountOwner = async (cabinetName: string, ownerData: Omit<TeamMember, "id">) => {
  try {
    const cabinetResult = await getOrCreateCabinet(cabinetName, ownerData.contact as string);
    if (!cabinetResult) {
      console.error("Failed to get or create cabinet.");
      return;
    }

    const accountOwnerData = {
      firstName: ownerData.firstName,
      lastName: ownerData.lastName,
      email: ownerData.contact as string
    };
    await ensureAccountOwnerExists(cabinetResult.id, accountOwnerData);

    console.log("Cabinet and account owner ensured successfully.");
  } catch (error) {
    console.error("Error in ensureCabinetAndAccountOwner:", error);
  }
};
