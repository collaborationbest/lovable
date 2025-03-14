export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      access_rights: {
        Row: {
          id: number
          page_id: string
          roles: string[]
        }
        Insert: {
          id?: number
          page_id: string
          roles?: string[]
        }
        Update: {
          id?: number
          page_id?: string
          roles?: string[]
        }
        Relationships: []
      }
      cabinets: {
        Row: {
          city: string | null
          created_at: string
          id: string
          name: string | null
          opening_date: string | null
          owner_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          id: string
          name?: string | null
          opening_date?: string | null
          owner_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          name?: string | null
          opening_date?: string | null
          owner_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          cabinet_id: string | null
          company: string
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone: string | null
          type: string
          updated_at: string
        }
        Insert: {
          cabinet_id?: string | null
          company: string
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          cabinet_id?: string | null
          company?: string
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      doctolib_config: {
        Row: {
          connected: boolean | null
          email: string | null
          id: number
          last_sync: string | null
        }
        Insert: {
          connected?: boolean | null
          email?: string | null
          id: number
          last_sync?: string | null
        }
        Update: {
          connected?: boolean | null
          email?: string | null
          id?: number
          last_sync?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          cabinet_id: string | null
          created_at: string
          document_type: string | null
          file_type: string
          folder_id: string | null
          id: string
          name: string
          size: number
          updated_at: string
          url: string
        }
        Insert: {
          cabinet_id?: string | null
          created_at?: string
          document_type?: string | null
          file_type: string
          folder_id?: string | null
          id?: string
          name: string
          size: number
          updated_at?: string
          url: string
        }
        Update: {
          cabinet_id?: string | null
          created_at?: string
          document_type?: string | null
          file_type?: string
          folder_id?: string | null
          id?: string
          name?: string
          size?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          cabinet_id: string | null
          completed: boolean | null
          created_at: string
          date: string
          id: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          cabinet_id?: string | null
          completed?: boolean | null
          created_at?: string
          date: string
          id?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          cabinet_id?: string | null
          completed?: boolean | null
          created_at?: string
          date?: string
          id?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      folders: {
        Row: {
          cabinet_id: string | null
          created_at: string
          id: string
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          cabinet_id?: string | null
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          cabinet_id?: string | null
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          adresse: string | null
          cabinet_id: string | null
          codepostal: string | null
          created_at: string | null
          datenaissance: string | null
          email: string | null
          id: string
          lastappointment: string | null
          nextappointment: string | null
          nom: string
          prenom: string
          telephone: string | null
          updated_at: string | null
          ville: string | null
        }
        Insert: {
          adresse?: string | null
          cabinet_id?: string | null
          codepostal?: string | null
          created_at?: string | null
          datenaissance?: string | null
          email?: string | null
          id: string
          lastappointment?: string | null
          nextappointment?: string | null
          nom: string
          prenom: string
          telephone?: string | null
          updated_at?: string | null
          ville?: string | null
        }
        Update: {
          adresse?: string | null
          cabinet_id?: string | null
          codepostal?: string | null
          created_at?: string | null
          datenaissance?: string | null
          email?: string | null
          id?: string
          lastappointment?: string | null
          nextappointment?: string | null
          nom?: string
          prenom?: string
          telephone?: string | null
          updated_at?: string | null
          ville?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee_id: string | null
          cabinet_id: string | null
          category: string
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          cabinet_id?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          cabinet_id?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          cabinet_id: string | null
          contact: string | null
          contract_file: string | null
          contract_type: string | null
          created_at: string
          current_projects: string[] | null
          first_name: string
          hire_date: string | null
          id: string
          is_admin: boolean | null
          is_owner: boolean | null
          last_name: string
          location: string | null
          role: string
          specialty: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cabinet_id?: string | null
          contact?: string | null
          contract_file?: string | null
          contract_type?: string | null
          created_at?: string
          current_projects?: string[] | null
          first_name: string
          hire_date?: string | null
          id?: string
          is_admin?: boolean | null
          is_owner?: boolean | null
          last_name: string
          location?: string | null
          role: string
          specialty?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cabinet_id?: string | null
          contact?: string | null
          contract_file?: string | null
          contract_type?: string | null
          created_at?: string
          current_projects?: string[] | null
          first_name?: string
          hire_date?: string | null
          id?: string
          is_admin?: boolean | null
          is_owner?: boolean | null
          last_name?: string
          location?: string | null
          role?: string
          specialty?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          first_name: string | null
          id: string
          is_admin: boolean | null
          last_name: string | null
          phone_number: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          first_name?: string | null
          id: string
          is_admin?: boolean | null
          last_name?: string | null
          phone_number?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          last_name?: string | null
          phone_number?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_cabinet_access: {
        Args: {
          user_email: string
          cabinet_id_param: string
        }
        Returns: boolean
      }
      check_is_admin_or_owner: {
        Args: {
          user_email: string
        }
        Returns: boolean
      }
      check_user_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_of_cabinet: {
        Args: {
          cabinet_id_param: string
        }
        Returns: boolean
      }
      is_admin_or_owner: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_cabinet_owner: {
        Args: {
          cabinet_id_param: string
        }
        Returns: boolean
      }
      is_current_user_email: {
        Args: {
          email_param: string
        }
        Returns: boolean
      }
      is_team_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      user_has_cabinet_access: {
        Args: {
          cabinet_id_param: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
