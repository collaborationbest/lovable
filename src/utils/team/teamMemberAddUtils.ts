
import { TeamMember } from "@/types/TeamMember";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { transformTeamMemberToDatabase } from "./teamMemberTransformUtils";
import { CreateTeamMemberData } from "@/types/TeamMemberSchema";

// Function to add a team member to database - uses edge function to avoid permission issues
export const addTeamMember = async (newMember: Omit<TeamMember, "id">): Promise<{ data: TeamMember | null, error: any }> => {
  try {
    console.log("Adding team member with data:", newMember);
    
    // Validate email format
    if (!newMember.contact || !isValidEmail(newMember.contact)) {
      const errorMessage = "Veuillez fournir un email valide.";
      toast.error(errorMessage);
      return { data: null, error: new Error(errorMessage) };
    }
    
    // Check if email already exists in team_members table - case insensitive check
    const { data: existingMembers, error: checkError } = await supabase
      .from('team_members')
      .select('id, contact')
      .ilike('contact', newMember.contact);
    
    if (checkError) {
      console.error("Error checking for existing email:", checkError);
    }
    
    if (existingMembers && existingMembers.length > 0) {
      const errorMessage = "Un membre avec cet email existe déjà. Veuillez utiliser un email unique.";
      toast.error(errorMessage);
      return { data: null, error: new Error(errorMessage) };
    }
    
    // Format data for team_members table
    const teamMemberData = transformTeamMemberToDatabase(newMember) as Partial<CreateTeamMemberData>;
    
    console.log("Transformed data for insert:", teamMemberData);
    
    // Add more defensive checks and better error handling
    if (!teamMemberData || Object.keys(teamMemberData).length === 0) {
      throw new Error("Invalid team member data");
    }

    // Get current user to set userId
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // Also get current user's cabinet_id
    let cabinetId = null;
    if (userId) {
      // First check owned cabinets
      const { data: ownedCabinet } = await supabase
        .from('cabinets')
        .select('id')
        .eq('owner_id', userId)
        .maybeSingle();
      
      if (ownedCabinet) {
        cabinetId = ownedCabinet.id;
      } else {
        // Then check team memberships
        const { data: membership } = await supabase
          .from('team_members')
          .select('cabinet_id')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (membership) {
          cabinetId = membership.cabinet_id;
        }
      }
      
      // Set cabinet_id in the team member data
      if (cabinetId) {
        teamMemberData.cabinet_id = cabinetId;
      }
    }

    // Get the origin URL for the email link - very important for the email to work correctly
    const origin = window.location.origin;
    console.log("Using origin for invitation links:", origin);

    // Use the edge function to insert the team member with service role permissions
    // Make sure to pass the email, firstName, lastName for invitation emails
    const response = await supabase.functions.invoke('create-team-member', {
      body: {
        memberData: teamMemberData,
        email: newMember.contact,
        firstName: newMember.firstName,
        lastName: newMember.lastName,
        userId: null, // Don't pass the current user ID to avoid linking new member to existing user
        origin: origin // Explicitly pass the origin URL for invitation links
      }
    });
    
    // Improved error handling
    if (response.error) {
      console.error("Error from create-team-member function:", response.error);
      toast.error(`Erreur lors de la création: ${response.error.message || "Erreur inconnue"}`);
      throw response.error;
    }
    
    const data = response.data;
    
    if (!data || !data.success) {
      const errorMessage = data?.error || "Échec de la création du membre d'équipe";
      console.error("Function returned error:", errorMessage);
      toast.error(`Erreur: ${errorMessage}`);
      throw new Error(errorMessage);
    }
    
    console.log("Successfully created team member via edge function:", data);
    
    // Extract the team member record from the response
    const teamMemberRecord = data.data;
    
    if (!teamMemberRecord) {
      throw new Error("No team member data returned from the function");
    }
    
    // Create TeamMember object for state
    const member: TeamMember = {
      id: teamMemberRecord.id,
      firstName: teamMemberRecord.first_name,
      lastName: teamMemberRecord.last_name,
      role: teamMemberRecord.role,
      contractType: teamMemberRecord.contract_type,
      contractFile: teamMemberRecord.contract_file,
      hireDate: teamMemberRecord.hire_date,
      contact: teamMemberRecord.contact,
      location: teamMemberRecord.location,
      currentProjects: teamMemberRecord.current_projects,
      isAdmin: teamMemberRecord.is_admin,
      specialty: teamMemberRecord.specialty
    };
    
    if (data.emailSent) {
      toast.success(`${member.firstName} ${member.lastName} a été ajouté et a reçu un email d'invitation.`);
    } else {
      toast.success(`${member.firstName} ${member.lastName} a été ajouté à l'équipe.`);
    }
    
    return { data: member, error: null };
  } catch (error) {
    console.error("Error creating team member:", error);
    return { data: null, error };
  }
};

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
