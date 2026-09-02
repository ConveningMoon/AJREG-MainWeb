import "server-only";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Newsletter editions come from the ITMANO CRM database (tenant A&J =
// `tenant-aj`), the same Supabase project that serves the listings. The CRM
// grants the `anon` role SELECT on a fixed COLUMN LIST and an RLS row filter
// (status = 'published', not degraded by billing), so:
//
//   · the column list below must be requested one by one — `select("*")` is
//     denied for anon and returns 401, it does not silently drop columns;
//   · drafts / archived editions simply do not exist for this site, there is
//     nothing for us to filter out;
//   · `category` is NOT granted to anon today, so the site can neither filter
//     nor display it (that is a grant change on the CRM side).
const CRM_TENANT_ID = "tenant-aj";

const EDITION_COLUMNS = [
  "id", "tenant_id", "channel_id", "slug", "title", "dek", "language",
  "translation_group_id", "cover_image_url", "content", "sources",
  "data_as_of", "status", "published_at", "created_at",
].join(",");

// ── Content blocks ───────────────────────────────────────────────────────────
// The CRM never stores HTML: an edition's body is a list of validated blocks
// (its own `lib/newsletters/content.ts`), which is what makes it safe to render
// AI/user-authored text. We mirror that contract here and render it as React —
// no dangerouslySetInnerHTML anywhere on this site.

const HeadingBlock   = z.object({ type: z.literal("heading"), level: z.union([z.literal(2), z.literal(3)]), text: z.string() });
const ParagraphBlock = z.object({ type: z.literal("paragraph"), text: z.string(), sourceIds: z.array(z.string()).optional() });
const ListBlock      = z.object({ type: z.literal("list"), style: z.enum(["bullet", "number"]), items: z.array(z.string()) });
const ImageBlock     = z.object({ type: z.literal("image"), url: z.string(), alt: z.string(), caption: z.string().optional() });
const QuoteBlock     = z.object({ type: z.literal("quote"), text: z.string(), attribution: z.string().optional() });
const CalloutBlock   = z.object({ type: z.literal("callout"), tone: z.enum(["info", "warning"]), text: z.string() });
const StatBlock      = z.object({ type: z.literal("stat"), label: z.string(), value: z.string(), sourceIds: z.array(z.string()).optional() });

const NewsletterBlockSchema = z.discriminatedUnion("type", [
  HeadingBlock, ParagraphBlock, ListBlock, ImageBlock, QuoteBlock, CalloutBlock, StatBlock,
]);

const NewsletterContentSchema = z.object({
  v: z.literal(1),
  blocks: z.array(NewsletterBlockSchema),
});

const NewsletterSourceSchema = z.object({
  id: z.string(),
  url: z.string(),
  title: z.string(),
  publisher: z.string().default(""),
  published_at: z.string().optional(),
  accessed_at: z.string().optional(),
});

export type NewsletterBlock   = z.infer<typeof NewsletterBlockSchema>;
export type NewsletterContent = z.infer<typeof NewsletterContentSchema>;
export type NewsletterSource  = z.infer<typeof NewsletterSourceSchema>;

export type NewsletterEdition = {
  id: string;
  slug: string;
  title: string;
  dek: string | null;
  /** ISO 639-1 code as stored by the CRM ("es", "en", "pt", …). */
  language: string;
  /** Groups the language variants of the same edition together. */
  translationGroupId: string | null;
  coverImageUrl: string;
  content: NewsletterContent | null;
  sources: NewsletterSource[];
  /** Postgres `date` (YYYY-MM-DD): the day the edition's data was accurate. */
  dataAsOf: string | null;
  publishedAt: string | null;
};

/** Defensive parse — a malformed row must not take the whole page down. */
function parseContent(raw: unknown): NewsletterContent | null {
  const parsed = NewsletterContentSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

function parseSources(raw: unknown): NewsletterSource[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r) => NewsletterSourceSchema.safeParse(r))
    .filter((r): r is { success: true; data: NewsletterSource } => r.success)
    .map((r) => r.data);
}

function mapRow(r: Record<string, unknown>): NewsletterEdition {
  return {
    id:                 String(r.id),
    slug:               String(r.slug),
    title:              String(r.title),
    dek:                (r.dek as string | null) ?? null,
    language:           String(r.language ?? "es"),
    translationGroupId: (r.translation_group_id as string | null) ?? null,
    coverImageUrl:      String(r.cover_image_url ?? ""),
    content:            parseContent(r.content),
    sources:            parseSources(r.sources),
    dataAsOf:           (r.data_as_of as string | null) ?? null,
    publishedAt:        (r.published_at as string | null) ?? null,
  };
}

/**
 * Every published edition, newest first. Returns [] on any failure — the
 * newsletter page still renders its subscription form, which is the part that
 * actually earns something.
 */
export async function getEditions(): Promise<NewsletterEdition[]> {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("newsletter_editions")
      .select(EDITION_COLUMNS)
      .eq("tenant_id", CRM_TENANT_ID)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error || !data) {
      if (error) console.error("[newsletter] CRM read failed:", error.message);
      return [];
    }
    return (data as unknown as Record<string, unknown>[]).map(mapRow);
  } catch (err) {
    console.error("[newsletter] CRM read threw:", err);
    return [];
  }
}

/**
 * The editions to list for `locale`, one per translation group.
 *
 * An edition can be published in several languages sharing a
 * `translation_group_id`; showing every variant would list the same story
 * twice. Within a group we prefer the variant written in the visitor's
 * language and fall back to the most recent one — a Spanish-only edition is
 * still worth showing to an English reader, an empty archive is not.
 */
export function editionsForLocale(
  editions: NewsletterEdition[],
  locale: string
): NewsletterEdition[] {
  const groups = new Map<string, NewsletterEdition[]>();
  for (const edition of editions) {
    // A null group id means "no translations" — key it by its own id so it
    // can never collide with another standalone edition.
    const key = edition.translationGroupId ?? `solo:${edition.id}`;
    const bucket = groups.get(key);
    if (bucket) bucket.push(edition);
    else groups.set(key, [edition]);
  }

  // `editions` arrives newest-first and Map preserves insertion order, so the
  // resulting list keeps that order without re-sorting.
  return [...groups.values()].map(
    (variants) => variants.find((e) => e.language === locale) ?? variants[0]
  );
}

/** One published edition by slug, or null if it does not exist. */
export async function getEdition(slug: string): Promise<NewsletterEdition | null> {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("newsletter_editions")
      .select(EDITION_COLUMNS)
      .eq("tenant_id", CRM_TENANT_ID)
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      if (error) console.error("[newsletter] CRM read failed:", error.message);
      return null;
    }
    return mapRow(data as unknown as Record<string, unknown>);
  } catch (err) {
    console.error("[newsletter] CRM read threw:", err);
    return null;
  }
}
