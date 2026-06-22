import "server-only";
import type { ContactIntent, ContactLanguage } from "@/lib/contact-schema";

// ITMANO CRM intake integration. The public marketing site forwards ONLY the
// "Contact Us" form here (newsletter and any other forms are not wired). The
// channel id can be overridden via env; the contact channel is the default.
const BASE_URL = "https://app.itmano.com/api/intake";
const CONTACT_CHANNEL_ID =
  process.env.ITMANO_CONTACT_CHANNEL_ID ?? "chn_qv8uhxg9qizl";

export type ItmanoResult = "success" | "duplicate" | "error";

export type FormAnswer = {
  key: string;
  question: string;
  value: string;
  label: string;
};

export type ContactPayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  language: ContactLanguage;
  intent: ContactIntent;
  form_answers: FormAnswer[];
};

/**
 * Sends a contact lead to the ITMANO intake endpoint.
 *
 * Maps the HTTP response to a coarse result the UI can act on:
 * - `success`   → 2xx
 * - `duplicate` → 409 (or a body that reads as "already registered")
 * - `error`     → anything else / network failure
 */
export async function submitContact(
  payload: ContactPayload
): Promise<ItmanoResult> {
  try {
    const res = await fetch(`${BASE_URL}/${CONTACT_CHANNEL_ID}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (res.ok) return "success";
    if (res.status === 409) return "duplicate";

    // Some intake APIs signal a duplicate with a non-409 status + body hint.
    const body = await res.text().catch(() => "");
    if (/duplicat|already|exist|registrad/i.test(body)) return "duplicate";

    return "error";
  } catch {
    return "error";
  }
}
