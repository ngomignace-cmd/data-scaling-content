export interface IGWebhookPayload {
  object: "instagram";
  entry: IGWebhookEntry[];
}

export interface IGWebhookEntry {
  id: string;
  time: number;
  messaging?: IGMessagingEvent[];
  changes?: IGChangeEvent[];
}

export interface IGMessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text: string;
    attachments?: { type: string; payload: { url: string } }[];
  };
}

export interface IGChangeEvent {
  field: string;
  value: Record<string, unknown>;
}

export interface IGMediaInsights {
  ig_media_id: string;
  impressions: number;
  reach: number;
  engagement: number;
  saved: number;
  video_views: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface IGUserMedia {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  permalink: string;
  timestamp: string;
  thumbnail_url?: string;
}
