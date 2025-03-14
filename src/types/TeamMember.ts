
export type MemberRole = "dentiste" | "assistante" | "secrétaire";
export type ContractType = "CDI" | "CDD" | "Contrat Pro" | "Stage" | "Indépendant";
export type DentalSpecialty = "omnipratique" | "orthodontie" | "parodontie" | "esthétique" | "chirurgie orale" | "médecine bucco dentaire" | "pédodontie";

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  role: MemberRole;
  contractType?: ContractType;
  contractFile?: string;
  hireDate?: string;
  contact?: string;
  location?: string;
  currentProjects?: string[];
  isAdmin?: boolean;
  cabinet_id?: string; // Added this field
  specialty?: DentalSpecialty;
}

export interface PageAccessRights {
  pageId: string;
  pageName: string;
  roles: MemberRole[];
}
