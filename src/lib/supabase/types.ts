import type { Post } from "@/types/content";
import type { Lead } from "@/types/lead";
import type { AnalyticsSnapshot } from "@/types/analytics";

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: Post;
        Insert: Omit<Post, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Post, "id" | "created_at" | "updated_at">>;
      };
      leads: {
        Row: Lead;
        Insert: Omit<Lead, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Lead, "id" | "created_at" | "updated_at">>;
      };
      analytics: {
        Row: AnalyticsSnapshot;
        Insert: Omit<AnalyticsSnapshot, "id" | "created_at">;
        Update: Partial<Omit<AnalyticsSnapshot, "id" | "created_at">>;
      };
      settings: {
        Row: { id: string; key: string; value: Record<string, unknown>; description: string | null; created_at: string; updated_at: string };
        Insert: { key: string; value: Record<string, unknown>; description?: string };
        Update: { value?: Record<string, unknown>; description?: string };
      };
      conversations: {
        Row: {
          id: string;
          lead_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          ig_message_id: string | null;
          intent_detected: string | null;
          sentiment: number | null;
          action_taken: string | null;
          sent_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["conversations"]["Row"], "id" | "created_at">;
        Update: Partial<Omit<Database["public"]["Tables"]["conversations"]["Row"], "id" | "created_at">>;
      };
      content_jobs: {
        Row: {
          id: string;
          source_post_id: string | null;
          type: string;
          status: string;
          priority: number;
          input_data: Record<string, unknown>;
          output_data: Record<string, unknown> | null;
          error_message: string | null;
          attempts: number;
          max_attempts: number;
          shotstack_render_id: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["content_jobs"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Database["public"]["Tables"]["content_jobs"]["Row"], "id" | "created_at" | "updated_at">>;
      };
    };
  };
}
