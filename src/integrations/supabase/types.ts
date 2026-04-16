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
      access_group_calendars: {
        Row: {
          access_group_id: string
          created_at: string
          description: string | null
          google_calendar_id: string
          id: string
          is_active: boolean
        }
        Insert: {
          access_group_id: string
          created_at?: string
          description?: string | null
          google_calendar_id: string
          id?: string
          is_active?: boolean
        }
        Update: {
          access_group_id?: string
          created_at?: string
          description?: string | null
          google_calendar_id?: string
          id?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "access_group_calendars_access_group_id_fkey"
            columns: ["access_group_id"]
            isOneToOne: true
            referencedRelation: "access_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      access_group_features: {
        Row: {
          access_group_id: string
          created_at: string
          feature_id: string
        }
        Insert: {
          access_group_id: string
          created_at?: string
          feature_id: string
        }
        Update: {
          access_group_id?: string
          created_at?: string
          feature_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_group_features_access_group_id_fkey"
            columns: ["access_group_id"]
            isOneToOne: false
            referencedRelation: "access_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_group_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
        ]
      }
      access_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
        }
        Relationships: []
      }
      activity_log: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["activity_entity_type"]
          event_type: Database["public"]["Enums"]["activity_event_type"]
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["activity_entity_type"]
          event_type: Database["public"]["Enums"]["activity_event_type"]
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["activity_entity_type"]
          event_type?: Database["public"]["Enums"]["activity_event_type"]
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      app_ideas: {
        Row: {
          app_category: string | null
          app_description: string | null
          app_for: string | null
          app_name: string | null
          app_type: string | null
          bm_completion: number
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
          pb_completion: number
          persona_description: string | null
          updated_at: string | null
          user_demography: string | null
          user_id: string
          uv_completion: number
          ux_completion: number
        }
        Insert: {
          app_category?: string | null
          app_description?: string | null
          app_for?: string | null
          app_name?: string | null
          app_type?: string | null
          bm_completion?: number
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
          pb_completion?: number
          persona_description?: string | null
          updated_at?: string | null
          user_demography?: string | null
          user_id: string
          uv_completion?: number
          ux_completion?: number
        }
        Update: {
          app_category?: string | null
          app_description?: string | null
          app_for?: string | null
          app_name?: string | null
          app_type?: string | null
          bm_completion?: number
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
          pb_completion?: number
          persona_description?: string | null
          updated_at?: string | null
          user_demography?: string | null
          user_id?: string
          uv_completion?: number
          ux_completion?: number
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
            referencedRelation: "app_idea_artifacts"
            referencedColumns: ["app_idea_id"]
          },
          {
            foreignKeyName: "artifacts_app_idea_id_fkey"
            columns: ["app_idea_id"]
            isOneToOne: false
            referencedRelation: "app_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_connections: {
        Row: {
          connected_at: string
          google_calendar_id: string
          id: string
          is_active: boolean
          user_id: string
        }
        Insert: {
          connected_at?: string
          google_calendar_id: string
          id?: string
          is_active?: boolean
          user_id: string
        }
        Update: {
          connected_at?: string
          google_calendar_id?: string
          id?: string
          is_active?: boolean
          user_id?: string
        }
        Relationships: []
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
          workflow_mode: string
        }
        Insert: {
          app_idea_id?: string | null
          created_at?: string
          id?: string
          title?: string | null
          user_id: string
          workflow_mode?: string
        }
        Update: {
          app_idea_id?: string | null
          created_at?: string
          id?: string
          title?: string | null
          user_id?: string
          workflow_mode?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_app_idea_id_fkey"
            columns: ["app_idea_id"]
            isOneToOne: false
            referencedRelation: "app_idea_artifacts"
            referencedColumns: ["app_idea_id"]
          },
          {
            foreignKeyName: "chat_sessions_app_idea_id_fkey"
            columns: ["app_idea_id"]
            isOneToOne: false
            referencedRelation: "app_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      coaches: {
        Row: {
          book_for: string | null
          booking_url: string | null
          created_at: string
          description: string | null
          id: string
          image: string | null
          languages: string[] | null
          name: string | null
          order_index: number | null
          proceed_to_payment: string | null
          rate_per_hour: number | null
          skills: string[] | null
          updated_at: string | null
        }
        Insert: {
          book_for?: string | null
          booking_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          languages?: string[] | null
          name?: string | null
          order_index?: number | null
          proceed_to_payment?: string | null
          rate_per_hour?: number | null
          skills?: string[] | null
          updated_at?: string | null
        }
        Update: {
          book_for?: string | null
          booking_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          languages?: string[] | null
          name?: string | null
          order_index?: number | null
          proceed_to_payment?: string | null
          rate_per_hour?: number | null
          skills?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          course_name: string
          course_type: string | null
          created_at: string
          id: string
          is_active: boolean
          main_video_url: string | null
          old_course_id: number | null
          program_id: string
          short_name: string | null
          summary: string | null
          tags: string[] | null
          thumbnail: string | null
          unique_slug: string | null
        }
        Insert: {
          course_name: string
          course_type?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          main_video_url?: string | null
          old_course_id?: number | null
          program_id: string
          short_name?: string | null
          summary?: string | null
          tags?: string[] | null
          thumbnail?: string | null
          unique_slug?: string | null
        }
        Update: {
          course_name?: string
          course_type?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          main_video_url?: string | null
          old_course_id?: number | null
          program_id?: string
          short_name?: string | null
          summary?: string | null
          tags?: string[] | null
          thumbnail?: string | null
          unique_slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      cta_access_groups: {
        Row: {
          access_group_id: string
          created_at: string
          cta_id: string
        }
        Insert: {
          access_group_id: string
          created_at?: string
          cta_id: string
        }
        Update: {
          access_group_id?: string
          created_at?: string
          cta_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cta_access_groups_access_group_id_fkey"
            columns: ["access_group_id"]
            isOneToOne: false
            referencedRelation: "access_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cta_access_groups_cta_id_fkey"
            columns: ["cta_id"]
            isOneToOne: false
            referencedRelation: "ctas"
            referencedColumns: ["id"]
          },
        ]
      }
      ctas: {
        Row: {
          created_at: string
          cta_label: string | null
          cta_type: Database["public"]["Enums"]["cta_type"]
          description: string | null
          id: string
          lesson_id: string
          position: number
          title: string
          url: string | null
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          cta_type: Database["public"]["Enums"]["cta_type"]
          description?: string | null
          id?: string
          lesson_id: string
          position?: number
          title: string
          url?: string | null
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          cta_type?: Database["public"]["Enums"]["cta_type"]
          description?: string | null
          id?: string
          lesson_id?: string
          position?: number
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ctas_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          access_group_id: string | null
          activations_id: number | null
          build_access: boolean
          build_expires_at: string | null
          calendar_access: boolean
          calendar_expires_at: string | null
          created_at: string
          enrollment_method: string
          id: string
          internal_details: string | null
          product_id: number | null
          programs_access: boolean
          programs_expires_at: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_group_id?: string | null
          activations_id?: number | null
          build_access?: boolean
          build_expires_at?: string | null
          calendar_access?: boolean
          calendar_expires_at?: string | null
          created_at: string
          enrollment_method?: string
          id?: string
          internal_details?: string | null
          product_id?: number | null
          programs_access?: boolean
          programs_expires_at?: string | null
          status?: string | null
          updated_at: string
          user_id?: string | null
        }
        Update: {
          access_group_id?: string | null
          activations_id?: number | null
          build_access?: boolean
          build_expires_at?: string | null
          calendar_access?: boolean
          calendar_expires_at?: string | null
          created_at?: string
          enrollment_method?: string
          id?: string
          internal_details?: string | null
          product_id?: number | null
          programs_access?: boolean
          programs_expires_at?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_access_group_id_fkey"
            columns: ["access_group_id"]
            isOneToOne: false
            referencedRelation: "access_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      features: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          hours: number | null
          id: string
          message: string | null
          name: string
          package: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          hours?: number | null
          id?: string
          message?: string | null
          name: string
          package: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          hours?: number | null
          id?: string
          message?: string | null
          name?: string
          package?: string
          user_id?: string | null
        }
        Relationships: []
      }
      lesson_access_groups: {
        Row: {
          access_group_id: string
          created_at: string
          lesson_id: string
        }
        Insert: {
          access_group_id: string
          created_at?: string
          lesson_id: string
        }
        Update: {
          access_group_id?: string
          created_at?: string
          lesson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_access_groups_access_group_id_fkey"
            columns: ["access_group_id"]
            isOneToOne: false
            referencedRelation: "access_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_access_groups_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          access_group_ids: string[] | null
          cohort_visibility: Json | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          lesson_type: string | null
          module_id: string
          old_lesson_id: number | null
          position: number
          text_content: string | null
          thumbnail: string | null
          title: string
        }
        Insert: {
          access_group_ids?: string[] | null
          cohort_visibility?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          lesson_type?: string | null
          module_id: string
          old_lesson_id?: number | null
          position?: number
          text_content?: string | null
          thumbnail?: string | null
          title: string
        }
        Update: {
          access_group_ids?: string[] | null
          cohort_visibility?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          lesson_type?: string | null
          module_id?: string
          old_lesson_id?: number | null
          position?: number
          text_content?: string | null
          thumbnail?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          duration_days: number | null
          emoji: string | null
          id: string
          is_active: boolean
          old_module_id: number | null
          position: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          duration_days?: number | null
          emoji?: string | null
          id?: string
          is_active?: boolean
          old_module_id?: number | null
          position?: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          duration_days?: number | null
          emoji?: string | null
          id?: string
          is_active?: boolean
          old_module_id?: number | null
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          annual_stripe_price_id: string | null
          build_duration_days: number | null
          calendar_duration_days: number | null
          created_at: string
          email_template: string | null
          id: number
          internal_details: string | null
          is_active: boolean | null
          monthly_stripe_price_id: string | null
          notion_reference: string | null
          one_off_stripe_price_id: string | null
          product_name: string
          programs_duration_days: number | null
          stripe_product_id: string | null
        }
        Insert: {
          annual_stripe_price_id?: string | null
          build_duration_days?: number | null
          calendar_duration_days?: number | null
          created_at?: string
          email_template?: string | null
          id?: number
          internal_details?: string | null
          is_active?: boolean | null
          monthly_stripe_price_id?: string | null
          notion_reference?: string | null
          one_off_stripe_price_id?: string | null
          product_name: string
          programs_duration_days?: number | null
          stripe_product_id?: string | null
        }
        Update: {
          annual_stripe_price_id?: string | null
          build_duration_days?: number | null
          calendar_duration_days?: number | null
          created_at?: string
          email_template?: string | null
          id?: number
          internal_details?: string | null
          is_active?: boolean | null
          monthly_stripe_price_id?: string | null
          notion_reference?: string | null
          one_off_stripe_price_id?: string | null
          product_name?: string
          programs_duration_days?: number | null
          stripe_product_id?: string | null
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
      programs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          position: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          position?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          position?: number
          title?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          position: number
          resource_type: string | null
          title: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          position?: number
          resource_type?: string | null
          title: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          position?: number
          resource_type?: string | null
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
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
          subtasks: Json | null
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
          subtasks?: Json | null
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
          subtasks?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_app_idea_id_fkey"
            columns: ["app_idea_id"]
            isOneToOne: false
            referencedRelation: "app_idea_artifacts"
            referencedColumns: ["app_idea_id"]
          },
          {
            foreignKeyName: "tasks_app_idea_id_fkey"
            columns: ["app_idea_id"]
            isOneToOne: false
            referencedRelation: "app_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lesson_progress: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
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
      videos: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          original_url: string | null
          transcript: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          original_url?: string | null
          transcript?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          original_url?: string | null
          transcript?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      app_idea_artifacts: {
        Row: {
          app_category: string | null
          app_description: string | null
          app_idea_id: string | null
          app_name: string | null
          app_type: string | null
          artifact_created_at: string | null
          artifact_id: string | null
          artifact_type: Database["public"]["Enums"]["artifact_type"] | null
          content: Json | null
          idea_generation: string | null
          one_liner: string | null
          persona_description: string | null
          status: string | null
          user_demography: string | null
          user_id: string | null
          version: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      activity_entity_type: "lesson" | "cta"
      activity_event_type: "cta_clicked" | "lesson_completed"
      app_role: "admin" | "user"
      artifact_type:
        | "business_model"
        | "validation"
        | "product_brief"
        | "db_design"
        | "kanban"
        | "master_prompt"
        | "ui_ux"
        | "social_content"
        | "landing_copy"
        | "paywall_prompts"
      build_feature:
        | "ai_tools"
        | "templates"
        | "analytics"
        | "integrations"
        | "api_access"
        | "custom_branding"
      connect_feature: "slack" | "discord" | "notion" | "zapier" | "webhooks"
      cta_type: "external_link" | "upgrade"
      enrollment_method:
        | "manual"
        | "stripe"
        | "invitation"
        | "bulk_import"
        | "api"
        | "auto_signup"
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
      activity_entity_type: ["lesson", "cta"],
      activity_event_type: ["cta_clicked", "lesson_completed"],
      app_role: ["admin", "user"],
      artifact_type: [
        "business_model",
        "validation",
        "product_brief",
        "db_design",
        "kanban",
        "master_prompt",
        "ui_ux",
        "social_content",
        "landing_copy",
        "paywall_prompts",
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
      cta_type: ["external_link", "upgrade"],
      enrollment_method: [
        "manual",
        "stripe",
        "invitation",
        "bulk_import",
        "api",
        "auto_signup",
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
