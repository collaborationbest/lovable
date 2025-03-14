
export type Folder = {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
};

export type Document = {
  id: string;
  name: string;
  file_type: string;
  size: number;
  url: string;
  folder_id: string | null;
  created_at: string;
  document_type?: string;
};

export type RequiredDocument = {
  id: string;
  name: string;
  description: string;
  category: string;
  isRequired: boolean;
};

export type BreadcrumbItem = {
  id: string | null;
  name: string;
};

export type ViewMode = "grid" | "list";
