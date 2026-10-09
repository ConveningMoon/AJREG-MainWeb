// Everything about the Good For Her giveaway that is a decision, not code.

export const giveawayConfig = {
  /** ITMANO public intake channel ("Good For Her" event). Public id, no secret. */
  channelId:
    process.env.NEXT_PUBLIC_ITMANO_GIVEAWAY_CHANNEL_ID ?? "chn_tg9y844y2ef4",
  /** Used when the link carries no ?src= (the QR/short link should always carry it). */
  defaultSrc: "melany-event-2026-10-09",
  /** Bump when the consent copy in messages changes (stored with every entry). */
  consentVersion: "2026-10-09",
} as const;

/** Keep ?src= values to a safe, short token — it ends up in the CRM source URL. */
export function sanitizeSrc(raw: string | null | undefined): string {
  const cleaned = (raw ?? "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  return cleaned.slice(0, 64) || giveawayConfig.defaultSrc;
}
