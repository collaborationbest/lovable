
/**
 * Database schema types for team members
 */

// Represents the team_members table schema
export interface TeamMemberSchema {
  id: string;
  first_name: string;
  last_name: string;
  role: "dentiste" | "assistante" | "secrétaire";
  contract_type?: "CDI" | "CDD" | "Contrat Pro" | "Stage" | "Indépendant";
  contract_file?: string;
  hire_date?: string;
  contact?: string;
  location?: string;
  current_projects?: string[];
  is_admin?: boolean;
  is_owner?: boolean;
  specialty?: "omnipratique" | "orthodontie" | "parodontie" | "esthétique" | "chirurgie orale" | "médecine bucco dentaire" | "pédodontie";
  cabinet_id: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Type for creating a new team member
export type CreateTeamMemberData = Omit<TeamMemberSchema, 'id' | 'created_at' | 'updated_at'>;

// Type for updating an existing team member
export type UpdateTeamMemberData = Partial<Omit<TeamMemberSchema, 'id' | 'created_at' | 'updated_at'>>;

// Type for the response from the create-team-member edge function
export interface CreateTeamMemberResponse {
  success: boolean;
  data?: TeamMemberSchema;
  error?: string;
  emailSent?: boolean;
  userId?: string | null;
  updated?: boolean;
}

