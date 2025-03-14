
import { TeamMember } from "@/types/TeamMember";
import { TeamMemberSchema, CreateTeamMemberData } from "@/types/TeamMemberSchema";

// Function to transform database records to TeamMember objects
export const transformDatabaseRecordsToTeamMembers = (data: TeamMemberSchema[]): TeamMember[] => {
  console.log("Raw data from DB:", data);
  return data.map(member => ({
    id: member.id,
    firstName: member.first_name,
    lastName: member.last_name,
    role: member.role,
    contractType: member.contract_type,
    contractFile: member.contract_file,
    hireDate: member.hire_date,
    contact: member.contact,
    location: member.location,
    currentProjects: member.current_projects,
    isAdmin: member.is_admin,
    specialty: member.specialty
  }));
};

// Function to transform TeamMember object to database format
export const transformTeamMemberToDatabase = (member: Partial<TeamMember>): Partial<CreateTeamMemberData> => {
  const memberData: Partial<CreateTeamMemberData> = {};
  
  if (member.firstName !== undefined) memberData.first_name = member.firstName;
  if (member.lastName !== undefined) memberData.last_name = member.lastName;
  if (member.role !== undefined) memberData.role = member.role;
  if (member.contractType !== undefined) memberData.contract_type = member.contractType;
  if (member.hireDate !== undefined) memberData.hire_date = member.hireDate;
  if (member.contact !== undefined) memberData.contact = member.contact;
  if (member.location !== undefined) memberData.location = member.location;
  if (member.specialty !== undefined) memberData.specialty = member.specialty;
  if (member.isAdmin !== undefined) memberData.is_admin = member.isAdmin;
  if (member.currentProjects !== undefined) memberData.current_projects = member.currentProjects;
  
  return memberData;
};

