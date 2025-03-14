
// Define interfaces for database query responses
export interface TeamMember {
  id: string;
  is_admin?: boolean;
  cabinet_id?: string;
  [key: string]: any;
}

export interface QueryResult<T> {
  data: T | null;
  error: any;
}

export type DatabaseOperation = 'select' | 'insert' | 'update' | 'delete';
