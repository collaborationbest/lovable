
export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  custom?: boolean;
  steps: string[];
}
