import axios from "axios";

function getConfig() {
  const apiKey = process.env.CALENDLY_API_KEY;
  const eventTypeUrl = process.env.CALENDLY_EVENT_TYPE_URL;
  if (!apiKey) throw new Error("CALENDLY_API_KEY is not configured");
  if (!eventTypeUrl) throw new Error("CALENDLY_EVENT_TYPE_URL is not configured");
  return { apiKey, eventTypeUrl };
}

function getClient() {
  const { apiKey } = getConfig();
  return axios.create({
    baseURL: "https://api.calendly.com",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });
}

/**
 * Retourne le lien de booking Calendly
 */
export function getBookingLink(): string {
  const { eventTypeUrl } = getConfig();
  return eventTypeUrl;
}

/**
 * Récupère les détails d'un événement Calendly
 */
export async function getEventDetails(eventUuid: string): Promise<{
  name: string;
  email: string;
  start_time: string;
  end_time: string;
  status: string;
}> {
  const client = getClient();

  const { data } = await client.get(
    `/scheduled_events/${eventUuid}`
  );

  const event = data.resource;
  return {
    name: event.name,
    email: event.invitees_counter > 0 ? "" : "",
    start_time: event.start_time,
    end_time: event.end_time,
    status: event.status,
  };
}

/**
 * Liste les événements à venir
 */
export async function getUpcomingEvents(
  userUri: string,
  count = 10
): Promise<
  { uuid: string; name: string; start_time: string; status: string }[]
> {
  const client = getClient();

  const { data } = await client.get("/scheduled_events", {
    params: {
      user: userUri,
      count,
      status: "active",
      min_start_time: new Date().toISOString(),
      sort: "start_time:asc",
    },
  });

  return data.collection.map(
    (event: { uri: string; name: string; start_time: string; status: string }) => ({
      uuid: event.uri.split("/").pop(),
      name: event.name,
      start_time: event.start_time,
      status: event.status,
    })
  );
}
