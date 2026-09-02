// Date helpers for the newsletter pages. Kept out of lib/newsletter.ts because
// that module is server-only and these are also useful from client components.

/** `published_at` is a timestamptz. */
export function formatEditionDate(iso: string | null, locale: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * `data_as_of` is a Postgres `date` (YYYY-MM-DD, no time): parsing it at noon
 * UTC keeps a negative timezone from rolling it back to the previous day.
 */
export function formatDataAsOf(iso: string | null, locale: string): string {
  if (!iso) return "";
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
