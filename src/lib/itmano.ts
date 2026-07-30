import "server-only";

// ITMANO CRM contact webhook integration (server-to-server).
// The public site forwards ONLY the "Contact Us" form here, from the
// /api/contact-us route handler — never from the browser, because the
// request is authenticated with a shared secret header.
const CONTACT_CHANNEL_ID =
  process.env.ITMANO_CONTACT_CHANNEL_ID ?? "chn_qv8uhxg9qizl";
const WEBHOOK_URL = `https://app.itmano.com/api/contact/${CONTACT_CHANNEL_ID}/submit`;

// Client check-in / lead status-update form — its own channel in the CRM,
// same "contact" webhook type + shared secret, submitted from
// /api/check-in/route.ts.
const CHECKIN_CHANNEL_ID =
  process.env.ITMANO_CHECKIN_CHANNEL_ID ?? "chn_x5yxx15jt7wf";
const CHECKIN_WEBHOOK_URL = `https://app.itmano.com/api/contact/${CHECKIN_CHANNEL_ID}/submit`;

export type ItmanoResult = "success" | "duplicate" | "error";

export type ContactWebhookPayload = {
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  reason: "buy" | "sell" | "invest";
  message?: string; // max 2000 chars
  language?: "es" | "en" | "pt";
};

export type CheckInWebhookPayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  reason: "buy" | "sell";
  message?: string; // max 2000 chars
  language?: "es" | "en" | "pt";
  form_answers: { key: string; question: string; value: string; label: string }[];
};

/**
 * POSTs a lead payload to an ITMANO "contact" webhook URL, authenticated
 * with the shared CONTACT_WEBHOOK_SECRET header. Shared by every channel of
 * this webhook type (Contact Us, client check-in, …).
 *
 * Expected responses:
 * - 200 `{ ok: true }`                    → success
 * - 200 `{ ok: true, duplicate: true }`   → duplicate (email already a lead)
 * - 400 validation / 401 bad secret / 500 → error
 */
async function postContactWebhook(
  url: string,
  payload: ContactWebhookPayload | CheckInWebhookPayload,
  logTag: string
): Promise<ItmanoResult> {
  const secret = process.env.CONTACT_WEBHOOK_SECRET;
  if (!secret) {
    console.error(
      `[${logTag}] CONTACT_WEBHOOK_SECRET is not set — cannot submit lead to CRM.`
    );
    return "error";
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-contact-secret": secret,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (res.ok) {
      const body = (await res.json().catch(() => null)) as
        | { ok?: boolean; duplicate?: boolean }
        | null;
      if (body?.ok) return body.duplicate ? "duplicate" : "success";
      return "error";
    }

    // 400 (validation), 401 (secret), 500 — log server-side, generic to UI.
    const text = await res.text().catch(() => "");
    console.error(`[${logTag}] CRM webhook failed (${res.status}): ${text}`);
    return "error";
  } catch (err) {
    console.error(`[${logTag}] CRM webhook network error:`, err);
    return "error";
  }
}

/** Sends a "Contact Us" lead to the ITMANO contact webhook. */
export async function submitContact(
  payload: ContactWebhookPayload
): Promise<ItmanoResult> {
  return postContactWebhook(WEBHOOK_URL, payload, "contact");
}

/** Sends a client check-in / lead status-update to its ITMANO channel. */
export async function submitCheckIn(
  payload: CheckInWebhookPayload
): Promise<ItmanoResult> {
  return postContactWebhook(CHECKIN_WEBHOOK_URL, payload, "check-in");
}
