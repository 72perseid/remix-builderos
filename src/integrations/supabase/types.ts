export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      app_ideas: {
        Row: {
          app_category: string | null
          app_description: string | null
          app_for: string | null
          app_name: string | null
          app_type: string | null
          created_at: string | null
          currently_building: boolean | null
          figma_link: string | null
          id: string
          idea_generation: string | null
          invited_users_id: number[] | null
          is_artifact_active: boolean | null
          is_board_active: boolean | null
          kanban_board_id: number | null
          logo: string | null
          logo_text: string | null
          one_liner: string | null
          persona_description: string | null
          updated_at: string | null
          user_demography: string | null
          user_id: string
        }
        Insert: {
          app_category?: string | null
          app_description?: string | null
          app_for?: string | null
          app_name?: string | null
          app_type?: string | null
          created_at?: string | null
          currently_building?: boolean | null
          figma_link?: string | null
          id?: string
          idea_generation?: string | null
          invited_users_id?: number[] | null
          is_artifact_active?: boolean | null
          is_board_active?: boolean | null
          kanban_board_id?: number | null
          logo?: string | null
          logo_text?: string | null
          one_liner?: string | null
          persona_description?: string | null
          updated_at?: string | null
          user_demography?: string | null
          user_id: string
        }
        Update: {
          app_category?: string | null
          app_description?: string | null
          app_for?: string | null
          app_name?: string | null
          app_type?: string | null
          created_at?: string | null
          currently_building?: boolean | null
          figma_link?: string | null
          id?: string
          idea_generation?: string | null
          invited_users_id?: number[] | null
          is_artifact_active?: boolean | null
          is_board_active?: boolean | null
          kanban_board_id?: number | null
          logo?: string | null
          logo_text?: string | null
          one_liner?: string | null
          persona_description?: string | null
          updated_at?: string | null
          user_demography?: string | null
          user_id?: string
        }
        Relationships: []
      }
      artifacts: {
        Row: {
          app_idea_id: string
          content: Json | null
          created_at: string
          id: string
          status: string | null
          type: Database["public"]["Enums"]["artifact_type"]
          user_id: string
          version: number | null
        }
        Insert: {
          app_idea_id: string
          content?: Json | null
          created_at?: string
          id?: string
          status?: string | null
          type: Database["public"]["Enums"]["artifact_type"]
          user_id: string
          version?: number | null
        }
        Update: {
          app_idea_id?: string
          content?: Json | null
          created_at?: string
          id?: string
          status?: string | null
          type?: Database["public"]["Enums"]["artifact_type"]
          user_id?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "artifacts_app_idea_id_fkey"
            columns: ["app_idea_id"]
            isOneToOne: false
            referencedRelation: "app_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      business_models: {
        Row: {
          app_idea_id: string | null
          competitive_advantage: string | null
          created_at: string | null
          generated_model: Json | null
          id: string
          target_market: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          app_idea_id?: string | null
          competitive_advantage?: string | null
          created_at?: string | null
          generated_model?: Json | null
          id?: string
          target_market?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          app_idea_id?: string | null
          competitive_advantage?: string | null
          created_at?: string | null
          generated_model?: Json | null
          id?: string
          target_market?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_models_app_idea_id_fkey"
            columns: ["app_idea_id"]
            isOneToOne: false
            referencedRelation: "app_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          app_idea_id: string | null
          created_at: string
          id: string
          title: string | null
          user_id: string
        }
        Insert: {
          app_idea_id?: string | null
          created_at?: string
          id?: string
          title?: string | null
          user_id: string
        }
        Update: {
          app_idea_id?: string | null
          created_at?: string
          id?: string
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_app_idea_id_fkey"
            columns: ["app_idea_id"]
            isOneToOne: false
            referencedRelation: "app_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      database_designs: {
        Row: {
          app_idea_id: string | null
          app_roadmap: string | null
          created_at: string | null
          generated_design: Json | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          app_idea_id?: string | null
          app_roadmap?: string | null
          created_at?: string | null
          generated_design?: Json | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          app_idea_id?: string | null
          app_roadmap?: string | null
          created_at?: string | null
          generated_design?: Json | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "database_designs_app_idea_id_fkey"
            columns: ["app_idea_id"]
            isOneToOne: false
            referencedRelation: "app_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          activations_id: number | null
          annual_stripe_price_id: string | null
          connect_features:
            | Database["public"]["Enums"]["connect_feature"][]
            | null
          created_at: string
          duration_days: number | null
          email: string | null
          email_template: string | null
          enrollment_method: string | null
          enrollment_term_days: string | null
          entity_id: number | null
          entity_type: number | null
          event_types: string[] | null
          id: number
          internal_details: string | null
          monthly_stripe_price_id: string | null
          one_off_stripe_price_id: string | null
          periodicity: string | null
          perks: string[] | null
          price_list: string[] | null
          products_id: number | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          activations_id?: number | null
          annual_stripe_price_id?: string | null
          connect_features?:
            | Database["public"]["Enums"]["connect_feature"][]
            | null
          created_at?: string
          duration_days?: number | null
          email?: string | null
          email_template?: string | null
          enrollment_method?: string | null
          enrollment_term_days?: string | null
          entity_id?: number | null
          entity_type?: number | null
          event_types?: string[] | null
          id?: number
          internal_details?: string | null
          monthly_stripe_price_id?: string | null
          one_off_stripe_price_id?: string | null
          periodicity?: string | null
          perks?: string[] | null
          price_list?: string[] | null
          products_id?: number | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          activations_id?: number | null
          annual_stripe_price_id?: string | null
          connect_features?:
            | Database["public"]["Enums"]["connect_feature"][]
            | null
          created_at?: string
          duration_days?: number | null
          email?: string | null
          email_template?: string | null
          enrollment_method?: string | null
          enrollment_term_days?: string | null
          entity_id?: number | null
          entity_type?: number | null
          event_types?: string[] | null
          id?: number
          internal_details?: string | null
          monthly_stripe_price_id?: string | null
          one_off_stripe_price_id?: string | null
          periodicity?: string | null
          perks?: string[] | null
          price_list?: string[] | null
          products_id?: number | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_products_id_fkey"
            columns: ["products_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          annual_stripe_price_id: string | null
          build_features: string[] | null
          category: string | null
          connect_features: string[] | null
          course_id: number[] | null
          created_at: string
          duration_days: number | null
          email_template: string | null
          event_types: string[] | null
          events: boolean | null
          id: number
          internal_details: string | null
          lab_room: boolean | null
          logo_ai: boolean | null
          monthly_price: number | null
          monthly_stripe_price_id: string | null
          notion_reference: string | null
          one_off_stripe_price_id: string | null
          periodicity: string | null
          perks: string[] | null
          price_list: string[] | null
          product_name: string
          programs_id: number | null
          stripe_product_id: string | null
          yearly_price: number | null
        }
        Insert: {
          annual_stripe_price_id?: string | null
          build_features?: string[] | null
          category?: string | null
          connect_features?: string[] | null
          course_id?: number[] | null
          created_at?: string
          duration_days?: number | null
          email_template?: string | null
          event_types?: string[] | null
          events?: boolean | null
          id?: number
          internal_details?: string | null
          lab_room?: boolean | null
          logo_ai?: boolean | null
          monthly_price?: number | null
          monthly_stripe_price_id?: string | null
          notion_reference?: string | null
          one_off_stripe_price_id?: string | null
          periodicity?: string | null
          perks?: string[] | null
          price_list?: string[] | null
          product_name: string
          programs_id?: number | null
          stripe_product_id?: string | null
          yearly_price?: number | null
        }
        Update: {
          annual_stripe_price_id?: string | null
          build_features?: string[] | null
          category?: string | null
          connect_features?: string[] | null
          course_id?: number[] | null
          created_at?: string
          duration_days?: number | null
          email_template?: string | null
          event_types?: string[] | null
          events?: boolean | null
          id?: number
          internal_details?: string | null
          lab_room?: boolean | null
          logo_ai?: boolean | null
          monthly_price?: number | null
          monthly_stripe_price_id?: string | null
          notion_reference?: string | null
          one_off_stripe_price_id?: string | null
          periodicity?: string | null
          perks?: string[] | null
          price_list?: string[] | null
          product_name?: string
          programs_id?: number | null
          stripe_product_id?: string | null
          yearly_price?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          country: string | null
          created_at: string | null
          discord_channel_id: string | null
          discord_user_id: string | null
          discord_username: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          last_seen: string | null
          linkedin_profile: string | null
          location: string | null
          onboarded: boolean | null
          profile_image: string | null
          role: string | null
          stripe_customer_id: string | null
          timezone: string | null
          twitter_profile: string | null
          updated_at: string | null
          visibility: boolean | null
          xano_id: number | null
        }
        Insert: {
          bio?: string | null
          country?: string | null
          created_at?: string | null
          discord_channel_id?: string | null
          discord_user_id?: string | null
          discord_username?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          last_seen?: string | null
          linkedin_profile?: string | null
          location?: string | null
          onboarded?: boolean | null
          profile_image?: string | null
          role?: string | null
          stripe_customer_id?: string | null
          timezone?: string | null
          twitter_profile?: string | null
          updated_at?: string | null
          visibility?: boolean | null
          xano_id?: number | null
        }
        Update: {
          bio?: string | null
          country?: string | null
          created_at?: string | null
          discord_channel_id?: string | null
          discord_user_id?: string | null
          discord_username?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          last_seen?: string | null
          linkedin_profile?: string | null
          location?: string | null
          onboarded?: boolean | null
          profile_image?: string | null
          role?: string | null
          stripe_customer_id?: string | null
          timezone?: string | null
          twitter_profile?: string | null
          updated_at?: string | null
          visibility?: boolean | null
          xano_id?: number | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          app_idea_id: string | null
          category: string | null
          checklist: Json | null
          color: string | null
          completed_date: string | null
          created_at: string | null
          description: string | null
          estimated_effort: string | null
          id: string
          planned_date: string | null
          position: number | null
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          app_idea_id?: string | null
          category?: string | null
          checklist?: Json | null
          color?: string | null
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          estimated_effort?: string | null
          id?: string
          planned_date?: string | null
          position?: number | null
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          app_idea_id?: string | null
          category?: string | null
          checklist?: Json | null
          color?: string | null
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          estimated_effort?: string | null
          id?: string
          planned_date?: string | null
          position?: number | null
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_app_idea_id_fkey"
            columns: ["app_idea_id"]
            isOneToOne: false
            referencedRelation: "app_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "user"
      artifact_type:
        | "business_model"
        | "validation"
        | "product_brief"
        | "db_design"
        | "kanban"
      build_feature:
        | "ai_tools"
        | "templates"
        | "analytics"
        | "integrations"
        | "api_access"
        | "custom_branding"
      connect_feature: "slack" | "discord" | "notion" | "zapier" | "webhooks"
      enrollment_method:
        | "manual"
        | "stripe"
        | "invitation"
        | "bulk_import"
        | "api"
      enrollment_status:
        | "active"
        | "pending"
        | "expired"
        | "cancelled"
        | "paused"
      periodicity_type: "daily" | "weekly" | "monthly" | "yearly" | "one_time"
      product_category:
        | "course"
        | "program"
        | "subscription"
        | "bundle"
        | "service"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      artifact_type: [
        "business_model",
        "validation",
        "product_brief",
        "db_design",
        "kanban",
      ],
      build_feature: [
        "ai_tools",
        "templates",
        "analytics",
        "integrations",
        "api_access",
        "custom_branding",
      ],
      connect_feature: ["slack", "discord", "notion", "zapier", "webhooks"],
      enrollment_method: [
        "manual",
        "stripe",
        "invitation",
        "bulk_import",
        "api",
      ],
      enrollment_status: [
        "active",
        "pending",
        "expired",
        "cancelled",
        "paused",
      ],
      periodicity_type: ["daily", "weekly", "monthly", "yearly", "one_time"],
      product_category: [
        "course",
        "program",
        "subscription",
        "bundle",
        "service",
      ],
    },
  },
} as const
