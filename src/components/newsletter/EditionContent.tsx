import Image from "next/image";
import { Info, TriangleAlert } from "lucide-react";
import type { NewsletterBlock, NewsletterSource } from "@/lib/newsletter";

// Renders an edition's body from the CRM's block contract. The CRM stores
// blocks, never HTML, precisely so a public page like this one has nothing to
// sanitize — so this renders React, not dangerouslySetInnerHTML.

/** How a source is named in the "Sources" list; collapses when both match. */
function sourceLabel(source: NewsletterSource): string {
  const title = source.title.trim();
  const publisher = (source.publisher ?? "").trim();
  if (!publisher || publisher === title) return title;
  return `${title} — ${publisher}`;
}

/**
 * The [1][2] markers after a paragraph or a stat, pointing at the numbered
 * "Sources" list below. A figure that cites something the edition never
 * declared is dropped rather than rendered as a dead marker.
 */
function SourceMarks({
  sourceIds,
  indexById,
}: {
  sourceIds: string[] | undefined;
  indexById: Map<string, number>;
}) {
  const marks = (sourceIds ?? [])
    .map((id) => indexById.get(id))
    .filter((n): n is number => n !== undefined);
  if (marks.length === 0) return null;

  return (
    <span className="ml-1 inline-flex gap-0.5 align-super">
      {marks.map((n) => (
        <a
          key={n}
          href={`#source-${n}`}
          className="text-[0.65em] font-semibold text-gold hover:underline"
        >
          [{n}]
        </a>
      ))}
    </span>
  );
}

function Block({
  block,
  indexById,
}: {
  block: NewsletterBlock;
  indexById: Map<string, number>;
}) {
  switch (block.type) {
    case "heading":
      return block.level === 2 ? (
        <h2 className="mt-12 font-display text-3xl font-semibold leading-tight text-navy first:mt-0 sm:text-4xl">
          {block.text}
        </h2>
      ) : (
        <h3 className="mt-9 font-display text-2xl font-semibold leading-snug text-navy first:mt-0">
          {block.text}
        </h3>
      );

    case "paragraph":
      return (
        <p className="mt-5 text-[1.0625rem] leading-[1.8] text-navy-800">
          {block.text}
          <SourceMarks sourceIds={block.sourceIds} indexById={indexById} />
        </p>
      );

    case "list": {
      const items = block.items.map((item, i) => (
        <li key={i} className="pl-1.5">
          {item}
        </li>
      ));
      const className =
        "mt-5 space-y-2 pl-6 text-[1.0625rem] leading-[1.8] text-navy-800 marker:text-gold";
      return block.style === "number" ? (
        <ol className={`${className} list-decimal marker:font-semibold`}>{items}</ol>
      ) : (
        <ul className={`${className} list-disc`}>{items}</ul>
      );
    }

    case "image":
      return (
        <figure className="mt-9">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-blush/50">
            <Image
              src={block.url}
              alt={block.alt}
              fill
              sizes="(max-width: 768px) 100vw, 720px"
              className="object-cover"
            />
          </div>
          {block.caption && (
            <figcaption className="mt-3 text-center text-sm text-navy-500">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "quote":
      return (
        <blockquote className="mt-9 border-l-[3px] border-gold py-1 pl-6">
          <p className="font-display text-2xl italic leading-relaxed text-navy">
            {block.text}
          </p>
          {block.attribution && (
            <cite className="mt-3 block text-sm font-medium not-italic text-navy-500">
              {block.attribution}
            </cite>
          )}
        </blockquote>
      );

    case "callout": {
      const warning = block.tone === "warning";
      const Icon = warning ? TriangleAlert : Info;
      return (
        <div
          className={`mt-8 flex gap-3.5 rounded-2xl p-5 ${
            warning
              ? "bg-gold/12 ring-1 ring-gold/35"
              : "bg-navy-50 ring-1 ring-navy-200"
          }`}
        >
          <Icon
            className={`mt-0.5 h-5 w-5 shrink-0 ${warning ? "text-gold" : "text-navy-500"}`}
            aria-hidden="true"
          />
          <p className="text-[0.95rem] leading-relaxed text-navy-800">{block.text}</p>
        </div>
      );
    }

    case "stat":
      return (
        <div className="mt-8 rounded-2xl bg-navy-900 px-7 py-6">
          <p className="font-display text-5xl font-semibold leading-none text-gold">
            {block.value}
          </p>
          <p className="mt-2.5 text-sm leading-relaxed text-cream/70">
            {block.label}
            <SourceMarks sourceIds={block.sourceIds} indexById={indexById} />
          </p>
        </div>
      );
  }
}

export function EditionContent({
  blocks,
  sources,
  sourcesTitle,
}: {
  blocks: NewsletterBlock[];
  sources: NewsletterSource[];
  sourcesTitle: string;
}) {
  // Sources are numbered by their position in the list, and blocks reference
  // them by id — this map is what turns one into the other.
  const indexById = new Map(sources.map((s, i) => [s.id, i + 1]));

  return (
    <article>
      {blocks.map((block, i) => (
        <Block key={i} block={block} indexById={indexById} />
      ))}

      {sources.length > 0 && (
        <section className="mt-14 border-t border-navy-200 pt-7">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-navy-500">
            {sourcesTitle}
          </h2>
          <ol className="mt-4 space-y-2.5 text-sm leading-relaxed text-navy-700">
            {sources.map((source, i) => (
              <li key={source.id} id={`source-${i + 1}`} className="flex gap-2.5">
                <span className="shrink-0 font-semibold text-gold">[{i + 1}]</span>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="underline decoration-navy-300 underline-offset-4 transition-colors hover:text-navy hover:decoration-gold"
                >
                  {sourceLabel(source)}
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}
