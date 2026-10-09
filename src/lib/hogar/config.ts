// Everything about the family affordability calculator (/hogar) that is a
// decision, not code: which CRM channel, who it routes to, what is still TBD.
// The financial parameters themselves live in lib/affordability.ts.

import { brand } from "../brand.ts";

export const hogarConfig = {
  /** ITMANO public intake channel ("Carpa Familiar" event). Public id, no secret. */
  channelId: process.env.NEXT_PUBLIC_ITMANO_HOGAR_CHANNEL_ID ?? "chn_qsf1vrmg8tsc",
  /** Used when the link carries no ?src= (the QR should always carry it). */
  defaultSrc: "adriana-evento-familiar-2026-10-11",
  eventDate: "2026-10-11",
  leadMagnet: "family-affordability-calculator",
  agent: {
    name: "Adriana",
    /** Adriana's WhatsApp / direct line (E.164) — the same number the rest of the site uses. */
    phoneE164: "+14077159052",
    phoneDisplay: brand.phoneDisplay,
  },
  /**
   * One brokerage name for every lead magnet: set `legalName` once, in
   * brand.brokerage (still pending the exact legal name).
   */
  brokerage: brand.brokerage,
  /** Bump when the consent copy in messages changes (stored with every lead). */
  consentVersion: "2026-10-08",
} as const;

/** Keep ?src= values to a safe, short token — it ends up in the CRM source URL. */
export function sanitizeSrc(raw: string | null | undefined): string {
  const cleaned = (raw ?? "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  return cleaned.slice(0, 64) || hogarConfig.defaultSrc;
}
