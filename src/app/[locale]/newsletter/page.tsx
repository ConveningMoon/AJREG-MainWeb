import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Newspaper } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ItmanoBeacon } from "@/components/ItmanoBeacon";
import { NewsletterSubscribeForm } from "@/components/forms/NewsletterSubscribeForm";
import { EditionCard } from "@/components/newsletter/EditionCard";
import { getEditions, editionsForLocale } from "@/lib/newsletter";
import { formatEditionDate, languageLabel } from "@/lib/newsletter-format";

// Editions are published from the CRM, which has no way to purge this site's
// cache — so the archive refreshes on its own. Five minutes is the same window
// the CRM uses for its own hosted archive.
export const revalidate = 300;

// Newsletter channel in the CRM — the beacon reports the visit so the CRM can
// tell a traffic problem from a form problem.
const CHANNEL_ID =
  process.env.NEXT_PUBLIC_ITMANO_NEWSLETTER_CHANNEL_ID ?? "chn_aoad7icta5o2";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.newsletter" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: { title: t("title"), description: t("description") },
  };
}

export default async function NewsletterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("newsletter");

  const editions = editionsForLocale(await getEditions(), locale);

  return (
    <>
      <ItmanoBeacon channelPublicId={CHANNEL_ID} />
      <main className="flex flex-1 flex-col">
        {/* Capture first: the subscription is the point of the page, the
            archive is the proof that it is worth subscribing to. */}
        <section className="relative overflow-hidden bg-navy-900">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, #fff7f5 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
            aria-hidden="true"
          />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:py-24">
            <div>
              <Eyebrow>{t("page.eyebrow")}</Eyebrow>
              <h1 className="mt-6 max-w-xl font-display text-4xl font-semibold leading-[1.1] text-cream sm:text-5xl lg:text-6xl">
                {t("page.title")}
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-cream/75 sm:text-lg">
                {t("page.subtitle")}
              </p>
            </div>

            <div className="rounded-2xl bg-navy-800/70 p-7 ring-1 ring-cream/10 backdrop-blur-sm sm:p-9">
              <h2 className="font-display text-2xl font-semibold text-cream">
                {t("page.formTitle")}
              </h2>
              <p className="mt-2 mb-6 text-sm leading-relaxed text-cream/70">
                {t("page.formSubtitle")}
              </p>
              <NewsletterSubscribeForm tone="dark" />
            </div>
          </div>
        </section>

        <section className="bg-cream py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <Eyebrow>{t("archive.eyebrow")}</Eyebrow>
            <h2 className="mt-5 font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">
              {t("archive.title")}
            </h2>

            {editions.length === 0 ? (
              <div className="mt-10 rounded-2xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-navy-900/5">
                <Newspaper
                  className="mx-auto h-9 w-9 text-navy-300"
                  strokeWidth={1.2}
                  aria-hidden="true"
                />
                <p className="mt-4 text-navy-600">{t("archive.empty")}</p>
              </div>
            ) : (
              // Two columns until xl: with a handful of editions, three
              // narrow cards read as an empty shelf rather than a grid.
              <div className="mt-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                {editions.map((edition) => (
                  <EditionCard
                    key={edition.id}
                    edition={edition}
                    dateLabel={formatEditionDate(edition.publishedAt, locale)}
                    readLabel={t("archive.read")}
                    languageLabel={languageLabel(edition.language, locale)}
                    bylinePrefix={t("bylinePrefix")}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
