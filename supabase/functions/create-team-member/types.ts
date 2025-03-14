
// Type definitions for team member creation

export interface TeamMemberData {
  first_name?: string;
  last_name?: string;
  role?: string;
  contract_type?: string;
  contract_file?: string;
  hire_date?: string;
  contact?: string;
  location?: string;
  current_projects?: string[];
  is_admin?: boolean;
  is_owner?: boolean;
  specialty?: string;
  cabinet_id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TeamMemberCreationRequest {
  memberData: TeamMemberData;
  email?: string;
  firstName?: string;
  lastName?: string;
  userId?: string;
  authUserId?: string;  // Legacy support
  origin?: string;      // Added to support explicit origin URL for email links
}

export interface TeamMemberResponse {
  success: boolean;
  data?: any;
  emailSent?: boolean;
  userId?: string | null;
  updated?: boolean;
  error?: string;
  temporaryPassword?: string;  // For debugging
}
