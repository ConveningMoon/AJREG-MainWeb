import "server-only";

// ITMANO CRM contact webhook integration (server-to-server).
// The public site forwards ONLY the "Contact Us" form here, from the
// /api/contact-us route handler — never from the browser, because the
// request is authenticated with a shared secret header.
const CONTACT_CHANNEL_ID =
  process.env.ITMANO_CONTACT_CHANNEL_ID ?? "chn_qv8uhxg9qizl";
const WEBHOOK_URL = `https://app.itmano.com/api/contact/${CONTACT_CHANNEL_ID}/submit`;

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

/**
 * Sends a contact lead to the ITMANO contact webhook.
 *
 * Expected responses:
 * - 200 `{ ok: true }`                    → success
 * - 200 `{ ok: true, duplicate: true }`   → duplicate (email already a lead)
 * - 400 validation / 401 bad secret / 500 → error
 */
export async function submitContact(
  payload: ContactWebhookPayload
): Promise<ItmanoResult> {
  const secret = process.env.CONTACT_WEBHOOK_SECRET;
  if (!secret) {
    console.error(
      "[contact] CONTACT_WEBHOOK_SECRET is not set — cannot submit lead to CRM."
    );
    return "error";
  }

  try {
    const res = await fetch(WEBHOOK_URL, {
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
    console.error(`[contact] CRM webhook failed (${res.status}): ${text}`);
    return "error";
  } catch (err) {
    console.error("[contact] CRM webhook network error:", err);
    return "error";
  }
}
