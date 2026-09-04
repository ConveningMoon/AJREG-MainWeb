import type { Metadata } from "next";
import { Fragment } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { EditionContent } from "@/components/newsletter/EditionContent";
import { EditionViewBeacon } from "@/components/newsletter/EditionViewBeacon";
import { EditionByline } from "@/components/newsletter/EditionByline";
import { NewsletterSubscribeForm } from "@/components/forms/NewsletterSubscribeForm";
import { getEdition, getEditions } from "@/lib/newsletter";
import { formatDataAsOf, formatEditionDate, languageLabel } from "@/lib/newsletter-format";

// Same window as the archive. A dynamic segment only honours `revalidate` once
// it is in the prerender manifest, which is what generateStaticParams below is
// for; slugs published after the build still render on demand and cache from
// there (dynamicParams defaults to true).
export const revalidate = 300;

export async function generateStaticParams() {
  const editions = await getEditions();
  return routing.locales.flatMap((locale) =>
    editions.map((edition) => ({ locale, slug: edition.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const [edition, t] = await Promise.all([
    getEdition(slug),
    getTranslations({ locale, namespace: "meta.newsletter" }),
  ]);
  if (!edition) return {};
  return {
    title: edition.title,
    description: edition.dek ?? t("description"),
    openGraph: {
      title: edition.title,
      description: edition.dek ?? t("description"),
      type: "article",
      publishedTime: edition.publishedAt ?? undefined,
      images: edition.coverImageUrl ? [{ url: edition.coverImageUrl }] : undefined,
    },
  };
}

export default async function NewsletterEditionPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("newsletter");

  const edition = await getEdition(slug);
  // An edition whose `content` did not parse is not renderable: a 404 is
  // better than a page that renders half of it.
  if (!edition || !edition.content) notFound();

  const publishedLabel = formatEditionDate(edition.publishedAt, locale);
  const dataAsOfLabel = formatDataAsOf(edition.dataAsOf, locale);
  const langLabel = languageLabel(edition.language, locale);

  // Interleaved with "·" separators below — built as a list because whether a
  // leading dot is needed depends on what (if anything) rendered before it.
  // The byline is NOT in here: it carries a photo and its own markup, so it
  // sits on its own line above the dates instead of inside a run of text.
  const provenance: { key: string; node: React.ReactNode }[] = [];
  if (publishedLabel) {
    provenance.push({
      key: "published",
      node: (
        <time dateTime={edition.publishedAt ?? undefined}>
          {t("edition.published", { date: publishedLabel })}
        </time>
      ),
    });
  }
  if (dataAsOfLabel) {
    provenance.push({
      key: "dataAsOf",
      node: <span>{t("edition.dataAsOf", { date: dataAsOfLabel })}</span>,
    });
  }
  if (edition.sources.length > 0) {
    provenance.push({
      key: "sources",
      node: <span>{t("edition.sourceCount", { count: edition.sources.length })}</span>,
    });
  }

  return (
    <>
      <EditionViewBeacon editionId={edition.id} />
      <main className="flex flex-1 flex-col bg-cream">
        <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:py-14">
          <Link
            href="/newsletter"
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy-500 transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("edition.back")}
          </Link>

          {/* The headline runs the full width; the reading column narrows
              further down, once the sidebar joins it. */}
          <header className="mt-8 max-w-4xl">
            <span className="inline-flex items-center rounded-full bg-navy-100 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wider text-navy-600">
              {langLabel}
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] text-navy sm:text-5xl lg:text-[3.5rem]">
              {edition.title}
            </h1>
            {edition.dek && (
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-700">
                {edition.dek}
              </p>
            )}
            <EditionByline
              edition={edition}
              prefix={t("bylinePrefix")}
              size={34}
              className="mt-6 text-sm"
              linkAuthor
            />
          </header>

          {/* Provenance row — the byline, dates and source count are this
              newsletter's whole argument, so they sit above the fold rather
              than in a footnote. */}
          <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-navy-200 py-4 text-sm text-navy-500">
            {provenance.map((item, i) => (
              <Fragment key={item.key}>
                {i > 0 && (
                  <span className="text-gold" aria-hidden="true">
                    ·
                  </span>
                )}
                {item.node}
              </Fragment>
            ))}
          </div>

          {edition.coverImageUrl && (
            <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-blush/50 lg:aspect-[21/9]">
              <Image
                src={edition.coverImageUrl}
                alt=""
                fill
                sizes="(max-width: 1152px) 100vw, 1104px"
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="mt-12 lg:grid lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start lg:gap-16">
            <div>
              <EditionContent
                blocks={edition.content.blocks}
                sources={edition.sources}
                sourcesTitle={t("edition.sources")}
              />
            </div>

            {/* The form rides along the whole read instead of waiting at the
                bottom: most readers arrive straight at an edition from a
                shared link, and the moment they are convinced is somewhere in
                the middle of the article, not after the sources. */}
            <aside className="mt-14 lg:sticky lg:top-24 lg:mt-0">
              <div className="rounded-2xl bg-navy-900 p-7">
                <span className="block h-0.5 w-10 bg-gold" aria-hidden="true" />
                <h2 className="mt-5 font-display text-2xl font-semibold leading-tight text-cream">
                  {t("edition.ctaTitle")}
                </h2>
                <p className="mt-3 mb-6 text-sm leading-relaxed text-cream/70">
                  {t("edition.ctaSubtitle")}
                </p>
                <NewsletterSubscribeForm
                  tone="dark"
                  stacked
                  editionId={edition.id}
                />
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
