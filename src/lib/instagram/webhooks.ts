import crypto from "crypto";
import type { IGWebhookPayload, IGMessagingEvent } from "@/types/instagram";

/**
 * Vérifie la signature HMAC-SHA256 du webhook Instagram
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature) return false;

  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  if (!appSecret) throw new Error("INSTAGRAM_APP_SECRET is not configured");

  const expectedSignature =
    "sha256=" +
    crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Extrait les messages DM d'un payload webhook
 */
export function extractMessages(
  payload: IGWebhookPayload
): IGMessagingEvent[] {
  const messages: IGMessagingEvent[] = [];

  for (const entry of payload.entry) {
    if (entry.messaging) {
      for (const event of entry.messaging) {
        if (event.message?.text) {
          messages.push(event);
        }
      }
    }
  }

  return messages;
}

/**
 * Vérifie le token de vérification lors de l'enregistrement du webhook
 */
export function verifySubscription(
  mode: string | null,
  token: string | null,
  challenge: string | null
): string | null {
  const verifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken && challenge) {
    return challenge;
  }

  return null;
}
