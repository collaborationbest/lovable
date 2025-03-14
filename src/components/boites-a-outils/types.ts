
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
