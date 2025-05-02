
import { TeamMemberData, TeamMemberResponse } from './types.ts';
import { generateTemporaryPassword, sendWelcomeEmail } from './helpers.ts';

// Update an existing team member
export async function updateExistingMember(
  supabaseClient: any, 
  existingMember: any, 
  memberData: TeamMemberData, 
  userId: string | undefined
): Promise<TeamMemberResponse> {
  console.log("Team member with this email already exists:", existingMember);
  
  // If the member exists but in a different cabinet, we should not update
  if (memberData.cabinet_id && existingMember.cabinet_id && 
      memberData.cabinet_id !== existingMember.cabinet_id) {
    console.log("Cannot update team member in different cabinet");
    throw new Error("Ce membre appartient à un autre cabinet. Impossible de le modifier.");
  }
  
  // Update existing team member instead of inserting
  const { data: updatedMember, error: updateError } = await supabaseClient
    .from('team_members')
    .update({
      ...memberData,
      updated_at: new Date().toISOString()
    })
    .eq('id', existingMember.id)
    .select()
    .single();
    
  if (updateError) {
    console.error("Error updating team member:", updateError);
    throw updateError;
  }
  
  console.log("Successfully updated team member:", updatedMember);
  
  return { 
    success: true, 
    data: updatedMember,
    emailSent: false,
    userId: userId || null,
    updated: true
  };
}

// Create a new team member
export async function createNewTeamMember(
  supabaseClient: any, 
  memberData: TeamMemberData, 
  email: string | undefined, 
  firstName: string | undefined, 
  lastName: string | undefined, 
  userId: string | undefined,
  origin: string | null
): Promise<TeamMemberResponse> {
  console.log("Creating new team member with data:", {
    memberData,
    email,
    firstName,
    lastName,
    origin
  });
  
  // Insert the team member into the team_members table
  const { data: teamMemberRecord, error: insertError } = await supabaseClient
    .from('team_members')
    .insert({
      ...memberData,
      user_id: memberData.user_id || null, // Don't set user_id to current user
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (insertError) {
    console.error("Error inserting team member:", insertError);
    // If this is a uniqueness violation, make the error more user-friendly
    if (insertError.code === '23505') {
      throw new Error("Un membre avec cet email existe déjà dans cette équipe");
    }
    throw insertError;
  }
  
  console.log("Successfully created team member:", teamMemberRecord);
  
  return await sendInvitationEmail(supabaseClient, teamMemberRecord, email, firstName, lastName, userId, origin);
}

// Send invitation email and handle user creation
export async function sendInvitationEmail(
  supabaseClient: any,
  teamMemberRecord: any,
  email: string | undefined,
  firstName: string | undefined,
  lastName: string | undefined,
  userId: string | undefined,
  origin: string | null
): Promise<TeamMemberResponse> {
  // Generate temporary password if email is provided
  let temporaryPassword = null;
  let emailSent = false;
  let newUserId = null;
  
  if (email) {
    temporaryPassword = generateTemporaryPassword();
    console.log("Generated temporary password for email invitation:", { email, temporaryPassword: "***REDACTED***" });
    
    // Make sure we have a valid loginUrl
    const loginUrl = origin ? `${origin}/auth` : 'https://dentalpilote.com/auth';
    console.log("Using login URL for invitation:", loginUrl);
    
    // Send welcome email with login instructions via edge function
    const emailResult = await sendWelcomeEmail(
      supabaseClient, 
      email, 
      firstName || '', 
      lastName || '', 
      temporaryPassword, 
      loginUrl
    );
    
    console.log("Email sending result:", emailResult);
    emailSent = emailResult.success;
    
    if (emailResult.success && emailResult.userId) {
      newUserId = emailResult.userId;
      
      // Update team_member record with auth user_id if available
      if (newUserId) {
        const { error: updateError } = await supabaseClient
          .from('team_members')
          .update({ user_id: newUserId })
          .eq('id', teamMemberRecord.id);
          
        if (updateError) {
          console.error("Error updating team member with user_id:", updateError);
          // Continue even if update fails
        } else {
          console.log(`Updated team member ${teamMemberRecord.id} with user_id: ${newUserId}`);
        }
      }
    } else if (!emailResult.success) {
      console.error("Failed to send invitation email:", emailResult.error);
    }
  } else {
    console.log("No email provided, skipping invitation");
  }
  
  return { 
    success: true, 
    data: teamMemberRecord,
    emailSent: emailSent,
    userId: newUserId,
    temporaryPassword: temporaryPassword // Include the password in response for debugging
  };
}
