
import { 
  checkExistingTeamMember
} from './helpers.ts';
import { TeamMemberCreationRequest, TeamMemberResponse } from './types.ts';
import { validateTeamMemberData, checkEmailUniqueness } from './validation.ts';
import { processCabinetId, processAdminStatus } from './cabinetOps.ts';
import { updateExistingMember, createNewTeamMember } from './teamMemberOps.ts';

// Main handler for team member creation
export async function handleTeamMemberCreation(
  supabaseClient: any, 
  requestData: TeamMemberCreationRequest,
  headers?: Headers
): Promise<TeamMemberResponse> {
  const { memberData, email, firstName, lastName, userId, authUserId, origin: requestOrigin } = requestData;
  
  // Validate required data
  validateTeamMemberData(memberData);
  
  console.log("Received data for team member creation:", { memberData, email, firstName, lastName, userId, origin: requestOrigin });
  
  // Extract the auth user ID if provided or from JWT
  let userIdFromRequest = userId || authUserId;
  
  if (!userIdFromRequest && headers && headers.get('Authorization')) {
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
  
  // Check for duplicate emails
  await checkEmailUniqueness(supabaseClient, memberData);
  
  // Process cabinet ID
  await processCabinetId(supabaseClient, memberData, userIdFromRequest);
  
  // Process admin and owner status
  await processAdminStatus(supabaseClient, memberData, userIdFromRequest, email);
  
  // Check for existing member with exact match (not case insensitive)
  const existingMember = await checkExistingTeamMember(supabaseClient, memberData.contact);
  
  // Get origin from request or headers
  const origin = requestOrigin || (headers ? headers.get('Origin') : null);
  console.log("Using origin for email links:", origin);
  
  // If member exists with exact email match, update it
  if (existingMember) {
    return await updateExistingMember(supabaseClient, existingMember, memberData, userIdFromRequest);
  }
  
  // If we reach here, we need to create a new team member regardless of invitation status
  return await createNewTeamMember(
    supabaseClient, 
    memberData, 
    email, 
    firstName, 
    lastName, 
    userIdFromRequest, 
    origin
  );
}
