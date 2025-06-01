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
      Case: {
        Row: {
          company_id: number | null
          id: number
          task_settings: Json | null
          title: string | null
        }
        Insert: {
          company_id?: number | null
          id?: number
          task_settings?: Json | null
          title?: string | null
        }
        Update: {
          company_id?: number | null
          id?: number
          task_settings?: Json | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Case_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "Company"
            referencedColumns: ["id"]
          },
        ]
      }
      CaseCustomTask: {
        Row: {
          case_id: number
          id: number
          task_attribute_id: number | null
        }
        Insert: {
          case_id: number
          id?: number
          task_attribute_id?: number | null
        }
        Update: {
          case_id?: number
          id?: number
          task_attribute_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "CaseCustomTask_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "Case"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "CaseCustomTask_task_attribute_id_fkey"
            columns: ["task_attribute_id"]
            isOneToOne: false
            referencedRelation: "TaskAttributeType"
            referencedColumns: ["id"]
          },
        ]
      }
      CaseFiles: {
        Row: {
          case_id: number
          created_at: string
          file_name: string | null
          file_path: string | null
          id: number
        }
        Insert: {
          case_id: number
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          id?: number
        }
        Update: {
          case_id?: number
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "case_files_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "Case"
            referencedColumns: ["id"]
          },
        ]
      }
      Company: {
        Row: {
          company_logo: string | null
          id: number
          titel: string | null
        }
        Insert: {
          company_logo?: string | null
          id?: number
          titel?: string | null
        }
        Update: {
          company_logo?: string | null
          id?: number
          titel?: string | null
        }
        Relationships: []
      }
      PDF: {
        Row: {
          case_id: number | null
          id: number
        }
        Insert: {
          case_id?: number | null
          id?: number
        }
        Update: {
          case_id?: number | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "PDF_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "Case"
            referencedColumns: ["id"]
          },
        ]
      }
      Role: {
        Row: {
          id: number
          type: string
        }
        Insert: {
          id?: number
          type: string
        }
        Update: {
          id?: number
          type?: string
        }
        Relationships: []
      }
      Subscription: {
        Row: {
          id: number
          price: number | null
          type: string | null
        }
        Insert: {
          id?: number
          price?: number | null
          type?: string | null
        }
        Update: {
          id?: number
          price?: number | null
          type?: string | null
        }
        Relationships: []
      }
      "Super-User": {
        Row: {
          email: string | null
          name: string | null
          password: string | null
          username: string
        }
        Insert: {
          email?: string | null
          name?: string | null
          password?: string | null
          username: string
        }
        Update: {
          email?: string | null
          name?: string | null
          password?: string | null
          username?: string
        }
        Relationships: []
      }
      Task: {
        Row: {
          case_id: number | null
          description: string | null
          id: number
          point_on_blueprint: Json | null
          type: Database["public"]["Enums"]["type"] | null
        }
        Insert: {
          case_id?: number | null
          description?: string | null
          id?: number
          point_on_blueprint?: Json | null
          type?: Database["public"]["Enums"]["type"] | null
        }
        Update: {
          case_id?: number | null
          description?: string | null
          id?: number
          point_on_blueprint?: Json | null
          type?: Database["public"]["Enums"]["type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "Task_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "Case"
            referencedColumns: ["id"]
          },
        ]
      }
      TaskAttributes: {
        Row: {
          attribute_id: number
          id: number
          task_id: number
          value: Json | null
        }
        Insert: {
          attribute_id: number
          id?: number
          task_id: number
          value?: Json | null
        }
        Update: {
          attribute_id?: number
          id?: number
          task_id?: number
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "TaskAttribute_attribute_id_fkey"
            columns: ["attribute_id"]
            isOneToOne: false
            referencedRelation: "TaskAttributeType"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "TaskAttribute_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "Task"
            referencedColumns: ["id"]
          },
        ]
      }
      TaskAttributeType: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      TaskChangeLogs: {
        Row: {
          created_at: string
          id: number
          task_id: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          task_id?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          task_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "TaskChangeLogs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "Task"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "TaskChangeLogs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      TaskImages: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          id: number
          task_id: number
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          id?: number
          task_id: number
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          id?: number
          task_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "TaskImages_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "Task"
            referencedColumns: ["id"]
          },
        ]
      }
      UserCaseAccess: {
        Row: {
          case_id: number | null
          id: number
          user_id: string
        }
        Insert: {
          case_id?: number | null
          id?: number
          user_id: string
        }
        Update: {
          case_id?: number | null
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "UserCaseAccess_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "Case"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "UserCaseAccess_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          },
        ]
      }
      Users: {
        Row: {
          auth_user_id: string
          company_id: number | null
          email: string
          id: string
          name: string | null
          role: Database["public"]["Enums"]["roletype"] | null
        }
        Insert: {
          auth_user_id: string
          company_id?: number | null
          email: string
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["roletype"] | null
        }
        Update: {
          auth_user_id?: string
          company_id?: number | null
          email?: string
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["roletype"] | null
        }
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "Company"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      attributeType: "text" | "number" | "boolean"
      roletype: "Worker" | "Project manager" | "Super user"
      type: "Supervision" | "Error" | "Documentation"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      attributeType: ["text", "number", "boolean"],
      roletype: ["Worker", "Project manager", "Super user"],
      type: ["Supervision", "Error", "Documentation"],
    },
  },
} as const
