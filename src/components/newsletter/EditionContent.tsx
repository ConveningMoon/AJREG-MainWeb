import Image from "next/image";
import { Info, TriangleAlert } from "lucide-react";
import type { NewsletterBlock, NewsletterSource } from "@/lib/newsletter";

// Renders an edition's body from the CRM's block contract. The CRM stores
// blocks, never HTML, precisely so a public page like this one has nothing to
// sanitize — so this renders React, not dangerouslySetInnerHTML.
//
// Layout rule: running prose keeps a comfortable reading measure, while the
// figures — data plates, images, pull quotes, callouts — take the full column
// and break past the text edge. This newsletter's whole claim is that every
// number carries its source, so the numbers are what get the room.

/** Reading measure for running text; figures deliberately ignore it. */
const MEASURE = "max-w-[38rem]";

/** How a source is named in the "Sources" list; collapses when both match. */
function sourceLabel(source: NewsletterSource): string {
  const title = source.title.trim();
  const publisher = (source.publisher ?? "").trim();
  if (!publisher || publisher === title) return title;
  return `${title} — ${publisher}`;
}

/**
 * Figures arrive with their context inside the value — "$415,000 (+5.1%
 * interanual)". Splitting the trailing parenthetical lets the number itself
 * carry the size and the change read as a second line, instead of a headline
 * that wraps mid-parenthesis. A value without one is left exactly as written.
 */
function splitStatValue(value: string): { lead: string; note?: string } {
  const match = value.match(/^(.*?)\s*\(([^()]*)\)\s*$/);
  if (match && match[1].trim()) {
    return { lead: match[1].trim(), note: match[2].trim() };
  }
  return { lead: value };
}

/**
 * The [1][2] markers after a paragraph or a figure, pointing at the numbered
 * "Sources" list below. A marker for a source the edition never declared is
 * dropped rather than rendered as a dead link.
 */
function sourceMarks(
  sourceIds: string[] | undefined,
  indexById: Map<string, number>
): number[] {
  return (sourceIds ?? [])
    .map((id) => indexById.get(id))
    .filter((n): n is number => n !== undefined);
}

function SourceMarks({
  sourceIds,
  indexById,
}: {
  sourceIds: string[] | undefined;
  indexById: Map<string, number>;
}) {
  const marks = sourceMarks(sourceIds, indexById);
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

/**
 * One figure. Reads top-down the way a market report prints it: what it
 * measures, the number, then the movement — with the receipt in the corner.
 */
function StatPlate({
  block,
  indexById,
}: {
  block: Extract<NewsletterBlock, { type: "stat" }>;
  indexById: Map<string, number>;
}) {
  const { lead, note } = splitStatValue(block.value);
  const marks = sourceMarks(block.sourceIds, indexById);

  return (
    <div className="relative flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5">
      <span className="h-0.5 w-10 bg-gold" aria-hidden="true" />

      <div className="mt-4 flex items-start justify-between gap-3">
        <p className="text-[0.6875rem] font-semibold uppercase leading-relaxed tracking-[0.16em] text-navy-500">
          {block.label}
        </p>
        {marks.length > 0 && (
          <span className="flex shrink-0 gap-0.5 pt-0.5">
            {marks.map((n) => (
              <a
                key={n}
                href={`#source-${n}`}
                className="text-[0.6875rem] font-semibold text-gold hover:underline"
              >
                [{n}]
              </a>
            ))}
          </span>
        )}
      </div>

      <p
        className={`mt-auto pt-3 font-display font-semibold leading-none text-navy ${
          // A value that carries its own clause ("1,607 frente a 1,665
          // viviendas vendidas") cannot take headline size without wrapping
          // into a puzzle.
          lead.length > 18 ? "text-2xl leading-tight" : "text-[2.5rem]"
        }`}
        style={{ textWrap: "balance" }}
      >
        {lead}
      </p>

      {note && (
        <p className="mt-2.5 text-sm font-medium text-slate">{note}</p>
      )}
    </div>
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
        <h2
          className={`mt-14 font-display text-3xl font-semibold leading-tight text-navy first:mt-0 sm:text-4xl ${MEASURE}`}
        >
          {block.text}
        </h2>
      ) : (
        <h3
          className={`mt-10 font-display text-2xl font-semibold leading-snug text-navy first:mt-0 ${MEASURE}`}
        >
          {block.text}
        </h3>
      );

    case "paragraph":
      return (
        <p
          className={`mt-5 text-[1.0625rem] leading-[1.8] text-navy-800 ${MEASURE}`}
        >
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
      const className = `mt-5 space-y-2 pl-6 text-[1.0625rem] leading-[1.8] text-navy-800 marker:text-gold ${MEASURE}`;
      return block.style === "number" ? (
        <ol className={`${className} list-decimal marker:font-semibold`}>
          {items}
        </ol>
      ) : (
        <ul className={`${className} list-disc`}>{items}</ul>
      );
    }

    case "image":
      return (
        <figure className="mt-10">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-blush/50">
            <Image
              src={block.url}
              alt={block.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 780px"
              className="object-cover"
            />
          </div>
          {block.caption && (
            <figcaption className="mt-3 text-sm text-navy-500">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "quote":
      return (
        <blockquote className="mt-10 border-l-[3px] border-gold py-1 pl-7">
          <p className="font-display text-2xl italic leading-relaxed text-navy sm:text-[1.75rem]">
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
          className={`mt-10 flex gap-4 rounded-2xl p-6 ${
            warning ? "bg-gold/12 ring-1 ring-gold/35" : "bg-blush/50"
          }`}
        >
          <Icon
            className={`mt-0.5 h-5 w-5 shrink-0 ${
              warning ? "text-gold" : "text-taupe"
            }`}
            aria-hidden="true"
          />
          <p className="text-[0.9375rem] leading-relaxed text-navy-800">
            {block.text}
          </p>
        </div>
      );
    }

    case "stat":
      // Never reached: stats are pulled into runs before rendering.
      return <StatPlate block={block} indexById={indexById} />;
  }
}

type Group =
  | { kind: "block"; block: NewsletterBlock }
  | { kind: "stats"; blocks: Extract<NewsletterBlock, { type: "stat" }>[] };

/**
 * Figures usually arrive in runs — three price indicators, then two on sales
 * volume. Rendered one per row they read as a stack of billboards and push the
 * article apart; grouped, a run reads as what it is: one panel of readings.
 */
function groupBlocks(blocks: NewsletterBlock[]): Group[] {
  const groups: Group[] = [];
  for (const block of blocks) {
    const last = groups[groups.length - 1];
    if (block.type === "stat") {
      if (last?.kind === "stats") last.blocks.push(block);
      else groups.push({ kind: "stats", blocks: [block] });
    } else {
      groups.push({ kind: "block", block });
    }
  }
  return groups;
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
  // Sources are numbered by their position in the list and blocks reference
  // them by id — this map is what turns one into the other.
  const indexById = new Map(sources.map((s, i) => [s.id, i + 1]));
  const groups = groupBlocks(blocks);

  return (
    <article>
      {groups.map((group, i) =>
        group.kind === "stats" ? (
          <div key={i} className="mt-10 grid gap-4 sm:grid-cols-2">
            {group.blocks.map((block, j) => (
              <StatPlate key={j} block={block} indexById={indexById} />
            ))}
          </div>
        ) : (
          <Block key={i} block={group.block} indexById={indexById} />
        )
      )}

      {sources.length > 0 && (
        <section className="mt-16 border-t border-navy-200 pt-7">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-navy-500">
            {sourcesTitle}
          </h2>
          <ol className="mt-4 grid gap-2.5 text-sm leading-relaxed text-navy-700 sm:grid-cols-2">
            {sources.map((source, i) => (
              <li key={source.id} id={`source-${i + 1}`} className="flex gap-2.5">
                <span className="shrink-0 font-semibold text-gold">
                  [{i + 1}]
                </span>
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
