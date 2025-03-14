
import {
  generateTemporaryPassword,
  isCabinetOwner,
  getUserCabinetId,
  checkExistingTeamMember,
  sendWelcomeEmail
} from './helpers.ts'
import { TeamMemberCreationRequest, TeamMemberResponse, TeamMemberData } from './types.ts'

// Main handler for team member creation
export async function handleTeamMemberCreation(
  supabaseClient: any,
  requestData: TeamMemberCreationRequest,
  headers: Headers
): Promise<TeamMemberResponse> {
  const { memberData, email, firstName, lastName, userId, authUserId } = requestData;

  if (!memberData) {
    throw new Error("Missing required field: memberData");
  }

  console.log("Received data for team member creation:", { memberData, email, firstName, lastName, userId });

  // Extract the auth user ID if provided or from JWT
  let userIdFromRequest = userId || authUserId;

  if (!userIdFromRequest && headers.get('Authorization')) {
    try {
      const { data: userData, error: authError } = await supabaseClient.auth.getUser();
      if (!authError && userData && userData.user) {
        userIdFromRequest = userData.user.id;
        console.log("Extracted userId from JWT:", userIdFromRequest);
      }
    } catch (authError) {
      console.error("Failed to extract userId from JWT:", authError);
    }
  }

  // Check for duplicate emails more thoroughly in team_members table - case insensitive
  if (memberData.contact) {
    const { data: existingMembers, error: emailCheckError } = await supabaseClient
      .from('team_members')
      .select('id, contact, cabinet_id')
      .ilike('contact', memberData.contact);

    if (emailCheckError) {
      console.error("Error checking email uniqueness:", emailCheckError);
    } else if (existingMembers && existingMembers.length > 0) {
      // If member exists but in a different cabinet, we might want to allow it
      // But if in same cabinet, reject it as duplicate
      if (memberData.cabinet_id) {
        const sameTeamDuplicate = existingMembers.some(
          member => member.cabinet_id === memberData.cabinet_id
        );

        if (sameTeamDuplicate) {
          throw new Error(`Un membre avec l'email ${memberData.contact} existe déjà dans cette équipe`);
        }
      } else {
        throw new Error(`Un membre avec l'email ${memberData.contact} existe déjà`);
      }
    }
  }

  // Process cabinet ID
  await processCabinetId(supabaseClient, memberData, userIdFromRequest);

  // Process admin and owner status
  await processAdminStatus(supabaseClient, memberData, userIdFromRequest, email);

  // Check for existing member and update if found
  const existingMember = await checkExistingTeamMember(supabaseClient, memberData.contact);
  if (existingMember) {
    return await updateExistingMember(supabaseClient, existingMember, memberData, userIdFromRequest);
  }

  // Create new team member
  return await createNewTeamMember(
    supabaseClient,
    memberData,
    email,
    firstName,
    lastName,
    userIdFromRequest,
    headers.get('Origin')
  );
}

// Process the cabinet_id for the team member
async function processCabinetId(supabaseClient: any, memberData: TeamMemberData, userId: string | undefined) {
  let cabinetId = memberData.cabinet_id;

  // If no cabinet_id provided in memberData, try to get it from the current user
  if (!cabinetId) {
    cabinetId = await getUserCabinetId(supabaseClient, userId);
    if (!cabinetId) {
      console.error("No cabinet_id found for user:", userId);
      throw new Error("User not associated with any cabinet");
    }

    // Set the cabinet_id in memberData
    memberData.cabinet_id = cabinetId;
    console.log("Set cabinet_id in memberData:", cabinetId);
  }
}

// Process admin and owner status
async function processAdminStatus(
  supabaseClient: any,
  memberData: TeamMemberData,
  userId: string | undefined,
  email: string | undefined
) {
  // Auto-set is_admin and is_owner if this user is the cabinet owner
  if (userId && memberData.cabinet_id) {
    const isOwner = await isCabinetOwner(supabaseClient, userId, memberData.cabinet_id);
    if (isOwner) {
      console.log(`User ${userId} is the owner of cabinet ${memberData.cabinet_id}, setting admin privileges`);
      memberData.is_admin = true;
      memberData.is_owner = true;

      // If creating a team member for the cabinet owner, link user_id
      if (memberData.contact && memberData.contact === email) {
        memberData.user_id = userId;
      }
    }
  }
}

// Update an existing team member
async function updateExistingMember(
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
async function createNewTeamMember(
  supabaseClient: any,
  memberData: TeamMemberData,
  email: string | undefined,
  firstName: string | undefined,
  lastName: string | undefined,
  userId: string | undefined,
  origin: string | null
): Promise<TeamMemberResponse> {
  // Make sure cabinet_id is set before insertion
  if (!memberData.cabinet_id) {
    throw new Error("cabinet_id is required for creating a team member");
  }

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

  // Generate temporary password if email is provided
  let temporaryPassword = null;
  let emailSent = false;
  let newUserId = null;

  if (email) {
    temporaryPassword = generateTemporaryPassword();
    console.log("Generated temporary password for email invitation:", { email, temporaryPassword: "***REDACTED***" });

    // Send welcome email with login instructions via edge function
    const loginUrl = origin ? `${origin}/auth` : 'https://dentalpilote.com/auth';

    const emailResult = await sendWelcomeEmail(
      supabaseClient,
      email,
      firstName || '',
      lastName || '',
      temporaryPassword,
      loginUrl
    );

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
    }
  }

  return {
    success: true,
    data: teamMemberRecord,
    emailSent: emailSent,
    userId: newUserId,
    temporaryPassword: temporaryPassword // Include the password in response for debugging
  };
}
