export interface Contact {
  id: string;
  company: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  type: string;
  cabinet_id: string;
}

export type ContactFormData = Omit<Contact, "id" | "cabinet_id">;

export type ContactType = "comptable" | "assureur" | "banquier" | "technicien" | "fournisseur" | "commercial" | "autre";

export interface Credential {
  id: string;
  company: string;
  website?: string;
  email?: string;
  password: string;
  notes?: string;
  cabinet_id?: string;
  created_at: string;
  updated_at: string;
}

export type CredentialFormData = Omit<Credential, "id" | "cabinet_id" | "created_at" | "updated_at">;

export interface QuestionnairePatientData {
  firstName: string;
  lastName: string;
  address: string;
  postalCode: string;
  city: string;
  birthDate: string;
  gender: string;
  profession?: string;
  phone: string;
  visitReason?: string[];
  visitReasonOther?: string;
  lastExamDate?: string;
  goodHealth?: boolean;
  healthIssues?: string[];
  healthIssuesOther?: string;
  onMedicalTreatment?: boolean;
  medicalTreatmentReason?: string;
  takingMedications?: boolean;
  medications?: string;
  isSmoker?: boolean;
  cigarettesPerDay?: string;
  smokingYears?: string;
  hasRadiotherapy?: boolean;
  radiotherapyDetails?: string;
  hasProlongedBleeding?: boolean;
  onBiphosphonates?: boolean;
  doctorInfo?: string;
  formDate?: string;
  signature?: string;
  remarks?: string;
}

export interface ImplantTraceData {
  manufacturer: string;
  reference: string;
  lotNumber: string;
  position: string;
  fileData?: string;
  fileType?: string;
  fileUrl?: string;
}

export interface BoneGraftTraceData {
  type: string;
  manufacturer: string;
  lotNumber: string;
  membraneOptions: string[];
  fileData?: string;
  fileType?: string;
  fileUrl?: string;
}
