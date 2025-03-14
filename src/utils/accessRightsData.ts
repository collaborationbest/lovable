
import { MemberRole } from "@/types/TeamMember";

export const pages = [
  { id: "dashboard", name: "Tableau de bord" },
  { id: "operations", name: "Opérations" },
  { id: "planning", name: "Planning" },
  { id: "equipe", name: "Équipe" },
  { id: "patients", name: "Patients" },
  { id: "documents", name: "Documents" },
  { id: "parametres", name: "Paramètres" },
  { id: "outils-ia", name: "Outils IA" }
];

export const roles: MemberRole[] = ["dentiste", "assistante", "secrétaire"];

export const roleLabels: Record<MemberRole, string> = {
  "dentiste": "Dentiste",
  "assistante": "Assistante",
  "secrétaire": "Secrétaire"
};
