// Single place for everything about the Home Wellness Check that is a
// decision, not code: who it routes to, which CRM channel, what is still TBD.

export const wellnessConfig = {
  /** ITMANO public intake channel ("Good For Her" event). Public id, no secret. */
  channelId:
    process.env.NEXT_PUBLIC_ITMANO_WELLNESS_CHANNEL_ID ?? "chn_tg9y844y2ef4",
  /** Used when the link carries no ?src= (the QR/short link should always carry it). */
  defaultSrc: "melany-event-2026-10-09",
  agent: {
    name: "Melany",
    /** Melany's direct line (E.164): target of the SMS / WhatsApp / call buttons. */
    phoneE164: "+13218880712",
    email: "adrysofirealestate@gmail.com",
  },
  brokerage: {
    /**
     * TODO(confirm): exact legal name of the brokerage, as it must appear next
     * to the Equal Housing mark. Left null on purpose — nothing is invented.
     * The result screen shows "A&J Real Estate Group" until this is set.
     */
    legalName: null as string | null,
    displayName: "A&J Real Estate Group",
  },
  /** Bump when the consent copy in messages changes (stored with every lead). */
  consentVersion: "2026-10-08",
} as const;

/** Keep ?src= values to a safe, short token — it ends up in the CRM source URL. */
export function sanitizeSrc(raw: string | null | undefined): string {
  const cleaned = (raw ?? "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  return cleaned.slice(0, 64) || wellnessConfig.defaultSrc;
}
