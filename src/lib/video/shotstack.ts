import axios from "axios";

const SHOTSTACK_API_URL = "https://api.shotstack.io";

function getConfig() {
  const apiKey = process.env.SHOTSTACK_API_KEY;
  const env = process.env.SHOTSTACK_ENV ?? "stage";
  if (!apiKey) throw new Error("SHOTSTACK_API_KEY is not configured");
  return { apiKey, env };
}

function getClient() {
  const { apiKey, env } = getConfig();
  return axios.create({
    baseURL: `${SHOTSTACK_API_URL}/${env}`,
    headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
  });
}

export interface ShotstackClip {
  asset: {
    type: "video" | "title" | "audio";
    src?: string;
    text?: string;
    style?: string;
  };
  start: number;
  length: number;
  fit?: "crop" | "cover" | "contain";
  position?: "center" | "top" | "bottom";
}

/**
 * Soumet un rendu vidéo à Shotstack
 */
export async function submitRender(clips: ShotstackClip[]): Promise<string> {
  const client = getClient();

  const timeline = {
    tracks: [
      {
        clips: clips.filter((c) => c.asset.type === "video" || c.asset.type === "title"),
      },
      {
        clips: clips.filter((c) => c.asset.type === "audio"),
      },
    ],
  };

  const { data } = await client.post("/render", {
    timeline,
    output: {
      format: "mp4",
      resolution: "hd",
      aspectRatio: "9:16",
    },
  });

  return data.response.id as string;
}

/**
 * Vérifie le statut d'un rendu
 */
export async function checkRenderStatus(renderId: string): Promise<{
  status: "queued" | "rendering" | "done" | "failed";
  url?: string;
}> {
  const client = getClient();
  const { data } = await client.get(`/render/${renderId}`);

  const status = data.response.status;
  return {
    status,
    url: status === "done" ? data.response.url : undefined,
  };
}
