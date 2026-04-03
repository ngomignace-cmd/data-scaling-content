export const LEAD_STATUS_LABELS: Record<string, string> = {
  new: "Nouveau",
  qualifying: "En qualification",
  qualified: "Qualifié",
  booked: "Call booké",
  show: "Show",
  no_show: "No Show",
  closed_won: "Closé (Gagné)",
  closed_lost: "Closé (Perdu)",
};

export const KANBAN_COLUMNS = [
  "new",
  "qualifying",
  "qualified",
  "booked",
  "show",
  "closed_won",
] as const;

export const POST_FORMAT_LABELS: Record<string, string> = {
  reel: "Reel",
  story: "Story",
  carousel: "Carousel",
  static: "Image",
};

export const ANALYTICS_SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 heures
