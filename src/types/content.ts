export type PostStatus = "draft" | "scheduled" | "published" | "archived";
export type PostFormat = "reel" | "story" | "carousel" | "static";
export type JobStatus = "pending" | "processing" | "completed" | "failed";
export type JobType = "transcription" | "golden_moments" | "render_reel" | "render_stories";

export interface Post {
  id: string;
  ig_media_id: string | null;
  ig_permalink: string | null;
  title: string;
  description: string | null;
  format: PostFormat;
  status: PostStatus;
  video_url: string | null;
  thumbnail_url: string | null;
  script: string | null;
  source_video_id: string | null;
  tags: string[];
  views: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagement_rate: number;
  leads_generated: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentJob {
  id: string;
  source_post_id: string | null;
  type: JobType;
  status: JobStatus;
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
}

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
}

export interface GoldenMoment {
  start: number;
  end: number;
  score: number;
  reason: string;
}
