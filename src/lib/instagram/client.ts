import axios from "axios";
import type { IGUserMedia, IGMediaInsights } from "@/types/instagram";

const GRAPH_API_BASE = "https://graph.instagram.com/v21.0";

function getAccessToken(): string {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) throw new Error("INSTAGRAM_ACCESS_TOKEN is not configured");
  return token;
}

function getBusinessAccountId(): string {
  const id = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  if (!id) throw new Error("INSTAGRAM_BUSINESS_ACCOUNT_ID is not configured");
  return id;
}

/**
 * Récupère la liste des médias récents du compte business
 */
export async function getUserMedia(limit = 25): Promise<IGUserMedia[]> {
  const accountId = getBusinessAccountId();
  const token = getAccessToken();

  const { data } = await axios.get(`${GRAPH_API_BASE}/${accountId}/media`, {
    params: {
      fields: "id,caption,media_type,media_url,permalink,timestamp,thumbnail_url",
      limit,
      access_token: token,
    },
  });

  return data.data as IGUserMedia[];
}

/**
 * Récupère les insights d'un média spécifique
 */
export async function getMediaInsights(
  mediaId: string
): Promise<IGMediaInsights> {
  const token = getAccessToken();

  const { data } = await axios.get(
    `${GRAPH_API_BASE}/${mediaId}/insights`,
    {
      params: {
        metric: "impressions,reach,saved,video_views,likes,comments,shares",
        access_token: token,
      },
    }
  );

  const metrics: Record<string, number> = {};
  for (const item of data.data) {
    metrics[item.name] = item.values[0]?.value ?? 0;
  }

  return {
    ig_media_id: mediaId,
    impressions: metrics.impressions ?? 0,
    reach: metrics.reach ?? 0,
    engagement:
      (metrics.likes ?? 0) +
      (metrics.comments ?? 0) +
      (metrics.shares ?? 0) +
      (metrics.saved ?? 0),
    saved: metrics.saved ?? 0,
    video_views: metrics.video_views ?? 0,
    likes: metrics.likes ?? 0,
    comments: metrics.comments ?? 0,
    shares: metrics.shares ?? 0,
  };
}

/**
 * Publie un conteneur média (vidéo) sur Instagram
 * Étape 1 : Créer le conteneur, Étape 2 : Publier
 */
export async function publishMedia(
  videoUrl: string,
  caption: string
): Promise<{ ig_media_id: string }> {
  const accountId = getBusinessAccountId();
  const token = getAccessToken();

  // Étape 1 : Créer le conteneur
  const { data: container } = await axios.post(
    `${GRAPH_API_BASE}/${accountId}/media`,
    null,
    {
      params: {
        media_type: "REELS",
        video_url: videoUrl,
        caption,
        access_token: token,
      },
    }
  );

  const containerId = container.id;

  // Attendre que le conteneur soit prêt (polling)
  let status = "IN_PROGRESS";
  while (status === "IN_PROGRESS") {
    await new Promise((r) => setTimeout(r, 5000));
    const { data: check } = await axios.get(
      `${GRAPH_API_BASE}/${containerId}`,
      { params: { fields: "status_code", access_token: token } }
    );
    status = check.status_code;
    if (status === "ERROR") {
      throw new Error(`Instagram container creation failed: ${containerId}`);
    }
  }

  // Étape 2 : Publier
  const { data: publish } = await axios.post(
    `${GRAPH_API_BASE}/${accountId}/media_publish`,
    null,
    { params: { creation_id: containerId, access_token: token } }
  );

  return { ig_media_id: publish.id };
}

/**
 * Envoie un DM via l'API Instagram
 */
export async function sendDirectMessage(
  recipientId: string,
  text: string
): Promise<void> {
  const accountId = getBusinessAccountId();
  const token = getAccessToken();

  await axios.post(
    `${GRAPH_API_BASE}/${accountId}/messages`,
    {
      recipient: { id: recipientId },
      message: { text },
    },
    { params: { access_token: token } }
  );
}
