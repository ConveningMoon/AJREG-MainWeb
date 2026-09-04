import Image from "next/image";
import type { NewsletterEdition } from "@/lib/newsletter";

/**
 * Who signs an edition: the agent, the agency, or both.
 *
 * The CRM keeps these as two independent optional columns, so neither one
 * being present tells you anything about the other — an edition can carry a
 * personal byline, an agency byline, both, or none at all. Rendering assumes
 * nothing and simply shows what came back.
 *
 * The photo belongs to the person and only to the person: a face next to a
 * company name reads as someone who did not write the piece.
 */

/** Initials fallback for a signer with no photo uploaded yet. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "·";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

function Avatar({ name, url, size }: { name: string; url: string | null; size: number }) {
  if (!url) {
    return (
      <span
        aria-hidden="true"
        className="flex shrink-0 items-center justify-center rounded-full bg-navy-100 font-semibold text-navy-600"
        style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      >
        {initialsOf(name)}
      </span>
    );
  }

  return (
    <span
      className="relative shrink-0 overflow-hidden rounded-full bg-navy-100"
      style={{ width: size, height: size }}
    >
      <Image
        src={url}
        alt=""
        fill
        sizes={`${size}px`}
        // `top` rather than `center`: the CRM stores the agent's full-length
        // cover photo, so centering it crops the face out and leaves a torso.
        className="object-cover object-top"
      />
    </span>
  );
}

export function EditionByline({
  edition,
  prefix,
  size = 24,
  className = "",
}: {
  edition: Pick<
    NewsletterEdition,
    "authorName" | "authorTitle" | "authorOrgName" | "authorAvatarUrl"
  >;
  /** Localized "By" — the rest of the line is names, which aren't translated. */
  prefix: string;
  size?: number;
  className?: string;
}) {
  const person = edition.authorName?.trim() || null;
  const agency = edition.authorOrgName?.trim() || null;
  if (!person && !agency) return null;

  const title = edition.authorTitle?.trim() || null;

  return (
    <div className={`flex items-center gap-2 text-navy-500 ${className}`}>
      {person && <Avatar name={person} url={edition.authorAvatarUrl} size={size} />}
      <span className="min-w-0 truncate">
        {prefix}{" "}
        {/* rel="author" wraps only the person: that is the signal a search
            engine uses to attribute the piece to a human. */}
        {person && (
          <span rel="author" className="font-medium text-navy-700">
            {person}
            {title && `, ${title}`}
          </span>
        )}
        {person && agency && " · "}
        {agency}
      </span>
    </div>
  );
}
