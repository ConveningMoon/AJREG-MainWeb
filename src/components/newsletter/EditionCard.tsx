import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { NewsletterEdition } from "@/lib/newsletter";

/**
 * One edition in the archive grid. `featured` gives the newest edition a wider
 * cover and larger type so the page opens on something to read rather than on
 * a uniform wall of cards.
 */
export function EditionCard({
  edition,
  dateLabel,
  readLabel,
  featured = false,
}: {
  edition: NewsletterEdition;
  /** Pre-formatted publication date — formatting needs the request locale. */
  dateLabel: string;
  readLabel: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/newsletter/${edition.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      <div
        className={`relative w-full overflow-hidden bg-blush/50 ${
          featured ? "aspect-[16/9]" : "aspect-[3/2]"
        }`}
      >
        {edition.coverImageUrl && (
          <Image
            src={edition.coverImageUrl}
            alt=""
            fill
            sizes={featured ? "(max-width: 1024px) 100vw, 60vw" : "(max-width: 1024px) 100vw, 33vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>

      <div className={`flex flex-1 flex-col ${featured ? "p-7 sm:p-9" : "p-6"}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          {dateLabel}
        </p>
        <h3
          className={`mt-3 font-display font-semibold leading-tight text-navy ${
            featured ? "text-2xl sm:text-3xl" : "text-xl"
          }`}
        >
          {edition.title}
        </h3>
        {edition.dek && (
          <p
            className={`mt-3 leading-relaxed text-navy-700 ${
              featured ? "text-base" : "line-clamp-3 text-sm"
            }`}
          >
            {edition.dek}
          </p>
        )}
        <span className="mt-auto inline-flex items-center pt-5 gap-1.5 text-sm font-semibold text-navy transition-colors group-hover:text-gold">
          {readLabel}
          <ArrowUpRight className="h-4 w-4 text-gold" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
