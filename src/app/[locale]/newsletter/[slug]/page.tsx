import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { EditionContent } from "@/components/newsletter/EditionContent";
import { EditionViewBeacon } from "@/components/newsletter/EditionViewBeacon";
import { NewsletterSubscribeForm } from "@/components/forms/NewsletterSubscribeForm";
import { getEdition, getEditions } from "@/lib/newsletter";
import { formatDataAsOf, formatEditionDate } from "@/lib/newsletter-format";

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

  return (
    <>
      <EditionViewBeacon editionId={edition.id} />
      <main className="flex flex-1 flex-col bg-cream">
        <article className="mx-auto w-full max-w-3xl px-6 py-12 lg:py-16">
          <Link
            href="/newsletter"
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy-500 transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("edition.back")}
          </Link>

          {edition.coverImageUrl && (
            <div className="relative mt-7 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-blush/50">
              <Image
                src={edition.coverImageUrl}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          )}

          <header className="mt-9">
            <h1 className="font-display text-4xl font-semibold leading-[1.12] text-navy sm:text-5xl">
              {edition.title}
            </h1>
            {edition.dek && (
              <p className="mt-5 text-lg leading-relaxed text-navy-700">
                {edition.dek}
              </p>
            )}
            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-navy-200 pb-7 text-sm text-navy-500">
              {publishedLabel && (
                <time dateTime={edition.publishedAt ?? undefined}>
                  {t("edition.published", { date: publishedLabel })}
                </time>
              )}
              {dataAsOfLabel && (
                <span>{t("edition.dataAsOf", { date: dataAsOfLabel })}</span>
              )}
            </div>
          </header>

          <div className="mt-9">
            <EditionContent
              blocks={edition.content.blocks}
              sources={edition.sources}
              sourcesTitle={t("edition.sources")}
            />
          </div>

          {/* The form lives here too, not only on the archive: most readers
              arrive straight at an edition from a shared link, and without
              this they never see where to subscribe — and `edition_id` never
              gets written, so the CRM cannot tell which edition won them. */}
          <section className="mt-14 rounded-2xl bg-navy-900 p-7 sm:p-9">
            <h2 className="font-display text-2xl font-semibold text-cream">
              {t("edition.ctaTitle")}
            </h2>
            <p className="mt-2 mb-6 text-sm leading-relaxed text-cream/70">
              {t("edition.ctaSubtitle")}
            </p>
            <NewsletterSubscribeForm tone="dark" editionId={edition.id} />
          </section>
        </article>
      </main>
    </>
  );
}
