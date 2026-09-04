import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { NewsletterEdition } from "@/lib/newsletter";

/**
 * One edition in the archive grid. Every edition gets the same card: the
 * archive is a shelf of issues, not a homepage with a lead story, and a
 * uniform grid lets the reader scan titles instead of a hierarchy we invented.
 */
export function EditionCard({
  edition,
  dateLabel,
  readLabel,
  languageLabel,
  byline,
}: {
  edition: NewsletterEdition;
  /** Pre-formatted publication date — formatting needs the request locale. */
  dateLabel: string;
  readLabel: string;
  /** Pre-formatted display name for `edition.language` — also locale-dependent. */
  languageLabel: string;
  /** Pre-formatted "By {name}" (or null when the CRM hasn't backfilled a signer). */
  byline: string | null;
}) {
  return (
    <Link
      href={`/newsletter/${edition.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-blush/50">
        {edition.coverImageUrl && (
          <Image
            src={edition.coverImageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <span className="absolute left-4 top-4 rounded-full bg-cream/95 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wider text-navy-700 shadow-sm">
          {languageLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          {dateLabel}
        </p>
        <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-navy">
          {edition.title}
        </h3>
        {byline && (
          <p className="mt-1.5 text-xs font-medium text-navy-500">{byline}</p>
        )}
        {edition.dek && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-navy-700">
            {edition.dek}
          </p>
        )}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-navy transition-colors group-hover:text-gold">
          {readLabel}
          <ArrowUpRight className="h-4 w-4 text-gold" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
