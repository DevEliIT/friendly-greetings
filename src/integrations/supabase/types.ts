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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      gallery_categories: {
        Row: {
          created_at: string | null
          id: string
          is_protected: boolean
          name: string
          position: number | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_protected?: boolean
          name: string
          position?: number | null
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_protected?: boolean
          name?: string
          position?: number | null
          slug?: string
        }
        Relationships: []
      }
      gallery_photos: {
        Row: {
          caption: string | null
          category_id: string | null
          created_at: string | null
          id: string
          media_type: string
          position: number | null
          url: string
        }
        Insert: {
          caption?: string | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          media_type?: string
          position?: number | null
          url: string
        }
        Update: {
          caption?: string | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          media_type?: string
          position?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_photos_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "gallery_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          content_her: string | null
          content_him: string | null
          created_at: string | null
          id: string
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content_her?: string | null
          content_him?: string | null
          created_at?: string | null
          id?: string
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content_her?: string | null
          content_him?: string | null
          created_at?: string | null
          id?: string
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      post_media: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          media_type: string
          position: number | null
          post_id: string
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          media_type: string
          position?: number | null
          post_id: string
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          media_type?: string
          position?: number | null
          post_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_versions: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          persona: string
          post_id: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          persona: string
          post_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          persona?: string
          post_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_versions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_persona: string
          cover_type: string | null
          cover_url: string | null
          created_at: string | null
          id: string
          is_published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_persona: string
          cover_type?: string | null
          cover_url?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_persona?: string
          cover_type?: string | null
          cover_url?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
