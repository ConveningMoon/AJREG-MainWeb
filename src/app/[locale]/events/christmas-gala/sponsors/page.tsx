import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, CalendarDays, Check, Clock, MapPin, MessageCircle, Phone, Minus } from "lucide-react";
import {
  formatUsd,
  galaEvent,
  sponsorTiers,
  type SponsorTier,
  type SponsorTierId,
} from "@/data/christmasGala";
import { brand } from "@/lib/brand";
import { Countdown } from "@/components/events/gala/Countdown";
import { Snowfall } from "@/components/events/gala/Snowfall";
import { StickyApplyBar } from "@/components/events/gala/StickyApplyBar";
import { ApplyButton } from "@/components/events/gala/ApplyButton";
import { SponsorForm } from "@/components/events/gala/SponsorForm";
import { RoomPlan } from "@/components/events/gala/RoomPlan";

const SITE_URL = "https://ajrealestateva.com";
const PATH = "/events/christmas-gala/sponsors";

// Comparison matrix: a cell is a benefit key (`packages.cells.*`), a raw
// value (ticket count) or false for "not included".
type Cell = string | number | false;
const matrix: { row: string; cells: Record<SponsorTierId, Cell> }[] = [
  { row: "tickets", cells: { gold: 7, silver: 5, bronze: 3, community: false } },
  { row: "table", cells: { gold: "tablePremium", silver: "yes", bronze: "yes", community: false } },
  { row: "video", cells: { gold: "videoDedicated", silver: "videoShort", bronze: "videoProduced", community: false } },
  { row: "logo", cells: { gold: "logoPremium", silver: "logoMaterials", bronze: "logoRotation", community: "logoRotation" } },
  { row: "talk", cells: { gold: "talkLong", silver: "talkShort", bronze: false, community: false } },
  { row: "raffle", cells: { gold: "yes", silver: "yes", bronze: "yes", community: false } },
  { row: "social", cells: { gold: "yes", silver: false, bronze: false, community: false } },
  { row: "recognition", cells: { gold: "yes", silver: "yes", bronze: "yes", community: "yes" } },
];

const audienceGroups = ["newOwners", "military", "hispanic", "sellers"] as const;
const screenSteps = ["film", "edit", "play"] as const;
const processSteps = ["apply", "call", "prepare", "night"] as const;
const faqItems = ["payment", "deadline", "video", "raffle", "guests", "community"] as const;

function formatDeadline(locale: string) {
  return new Intl.DateTimeFormat(locale === "es" ? "es-US" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  }).format(new Date(galaEvent.sponsorDeadline));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "christmasGala.meta" });
  // Absolute URL: some link previewers (WhatsApp) ignore relative og:image.
  const shareImage = `${SITE_URL}/images/events/christmas-gala-sponsors-og-${locale === "es" ? "es" : "en"}.jpg`;
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${SITE_URL}/${locale}${PATH}`,
      languages: { en: `${SITE_URL}/en${PATH}`, es: `${SITE_URL}/es${PATH}` },
    },
    openGraph: {
      type: "website",
      siteName: "A&J Real Estate Group",
      locale: locale === "es" ? "es_US" : "en_US",
      url: `${SITE_URL}/${locale}${PATH}`,
      title: t("shareTitle"),
      description: t("shareDescription"),
      images: [{ url: shareImage, width: 1200, height: 630, alt: t("imageAlt"), type: "image/jpeg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("shareTitle"),
      description: t("shareDescription"),
      images: [shareImage],
    },
  };
}

const primaryCta =
  "inline-flex items-center justify-center gap-2 rounded-sm bg-gold px-7 py-4 text-base font-semibold text-navy-950 transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-[#d4b273] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold motion-reduce:hover:translate-y-0";
const ghostCta =
  "inline-flex items-center justify-center gap-2 rounded-sm border border-gold/50 px-7 py-4 text-base font-semibold text-cream transition-colors hover:border-gold hover:bg-gold/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

export default async function ChristmasGalaSponsorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "christmasGala" });
  const deadline = formatDeadline(locale);

  const tierName = (id: SponsorTierId) => t(`tiers.${id}`);
  const cellText = (cell: Cell) =>
    typeof cell === "number" ? String(cell) : cell ? t(`packages.cells.${cell}` as never) : null;

  const SpotsLeft = ({ tier, dark }: { tier: SponsorTier; dark?: boolean }) => (
    <p className={`flex items-center gap-2 text-xs font-semibold ${dark ? "text-gold" : "text-[#8a6a2f]"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
      {t("packages.spotsLeft", { count: tier.spotsLeft })}
    </p>
  );

  return (
    <main className="bg-cream">
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section
        id="gala-hero"
        aria-labelledby="gala-title"
        className="relative isolate overflow-hidden bg-navy-950 text-cream"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_78%_35%,rgb(199_162_96/0.16),transparent_70%),radial-gradient(ellipse_60%_80%_at_10%_110%,rgb(52_74_93/0.55),transparent_70%)]"
        />
        <Snowfall className="absolute inset-0 -z-10 h-full w-full" />

        <div className="mx-auto grid max-w-7xl gap-14 px-6 pb-16 pt-12 sm:pt-16 lg:grid-cols-12 lg:items-center lg:gap-12 lg:px-10 lg:pb-20 lg:pt-16">
          <div className="lg:col-span-7">
            <h1
              id="gala-title"
              className="font-display text-[clamp(2.75rem,6vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.02em] text-balance"
            >
              {t("hero.title")}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-100">{t("hero.subtitle")}</p>

            <ul className="mt-8 grid gap-3 text-sm text-navy-100 sm:grid-cols-2">
              <li className="flex items-start gap-3 sm:col-span-2">
                <span className="font-display text-xl italic text-cream">{t("hero.eventName")}</span>
              </li>
              <li className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                {t("hero.date")}
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                {t("hero.time")}
              </li>
              <li className="flex items-start gap-3 sm:col-span-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <a
                  href={galaEvent.venueMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-gold/40 underline-offset-4 transition-colors hover:text-cream hover:decoration-gold"
                >
                  {t("hero.venue")}
                </a>
              </li>
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <ApplyButton className={primaryCta}>
                {t("hero.apply")}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </ApplyButton>
              <a href="#packages" className={ghostCta}>
                {t("hero.compare")}
              </a>
            </div>

          </div>

          {/* Venue screen holding the invitation video (in production). */}
          {/* Mobile: countdown right after the CTAs, then the screen.
              Desktop: screen, then countdown, keeping both inside 900px. */}
          <div className="flex flex-col lg:col-span-5">
            <figure className="order-2 mt-12 lg:order-1 lg:mt-0">
              <div className="rounded-md bg-gradient-to-b from-navy-700 to-navy-800 p-2 shadow-xl ring-1 ring-gold/25">
                <div
                  role="img"
                  aria-label={t("hero.screenAlt")}
                  className="relative grid aspect-video place-items-center overflow-hidden rounded-sm bg-[radial-gradient(ellipse_at_center,#22354a,#0a1321_75%)]"
                >
                  <Image
                    src="/images/logo-white_2.webp"
                    alt=""
                    width={576}
                    height={340}
                    className="absolute w-2/5 opacity-[0.08]"
                  />
                  <span className="relative text-center">
                    <span className="block font-display text-2xl font-semibold text-cream sm:text-3xl">
                      {t("hero.screenLabel")}
                    </span>
                    <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.2em] text-navy-200">
                      {t("hero.screenSoon")}
                    </span>
                  </span>
                </div>
              </div>
            </figure>
            <div className="order-1 rounded-md lg:order-2 lg:mt-10 bg-navy-900/70 px-6 py-6 ring-1 ring-gold/20 sm:px-8">
              <Countdown deadlineLabel={t("countdown.deadline", { date: deadline })} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Audience ───────────────────────────────────────────────────── */}
      <section aria-labelledby="audience-title" className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 id="audience-title" className="font-display text-4xl font-semibold leading-tight text-navy text-balance sm:text-5xl">
              {t("audience.title")}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-navy-600">{t("audience.lead")}</p>
            <p className="mt-8 inline-flex rounded-full bg-blush/60 px-4 py-2 text-sm font-medium text-taupe">
              {t("audience.facts")}
            </p>
          </div>
          <dl className="divide-y divide-navy-100 border-y border-navy-100 lg:col-span-7">
            {audienceGroups.map((group) => (
              <div key={group} className="grid gap-2 py-7 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-8">
                <dt className="font-display text-2xl font-semibold leading-snug text-navy">
                  {t(`audience.groups.${group}.title`)}
                </dt>
                <dd className="leading-relaxed text-navy-600">{t(`audience.groups.${group}.body`)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Screens + video production ─────────────────────────────────── */}
      <section aria-labelledby="screens-title" className="bg-navy-900 text-cream">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6">
              <h2 id="screens-title" className="font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">
                {t("screens.title")}
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-navy-100">{t("screens.lead")}</p>
              <p className="mt-6 flex items-center gap-2 font-semibold text-gold">
                <Check className="h-5 w-5" aria-hidden="true" />
                {t("screens.included")}
              </p>
            </div>
            <div className="lg:col-span-6">
              <RoomPlan
                labels={{
                  yours: t("screens.plan.yours"),
                  screens: t("screens.plan.screens"),
                  vendors: t("screens.plan.vendors"),
                  guests: t("screens.plan.guests"),
                  note: t("screens.plan.note"),
                }}
              />
            </div>
          </div>

          <ol className="mt-16 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {screenSteps.map((step, i) => (
              <li key={step} className="border-t border-navy-600 pt-6">
                <span className="font-display text-lg tabular-nums text-navy-300" aria-hidden="true">
                  {i + 1}.
                </span>
                <h3 className="mt-1 font-display text-2xl font-semibold">{t(`screens.steps.${step}.title`)}</h3>
                <p className="mt-2 leading-relaxed text-navy-100">{t(`screens.steps.${step}.body`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Packages ───────────────────────────────────────────────────── */}
      <section id="packages" aria-labelledby="packages-title" className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="max-w-2xl">
          <h2 id="packages-title" className="font-display text-4xl font-semibold leading-tight text-navy sm:text-5xl">
            {t("packages.title")}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-navy-600">{t("packages.lead")}</p>
        </div>

        {/* Below lg: one card per tier. */}
        <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:hidden">
          {sponsorTiers.map((tier) => {
            const gold = tier.id === "gold";
            return (
              <li
                key={tier.id}
                className={`flex flex-col rounded-2xl p-7 ${
                  gold ? "bg-navy-900 text-cream ring-2 ring-gold" : "bg-white text-navy shadow-sm ring-1 ring-navy-900/5"
                }`}
              >
                {gold && (
                  <span className="mb-4 self-start rounded-full bg-gold px-3 py-1 text-xs font-semibold text-navy-950">
                    {t("packages.mostVisible")}
                  </span>
                )}
                <h3 className="font-display text-2xl font-semibold">{tierName(tier.id)}</h3>
                <p className={`mt-1 font-display text-5xl font-semibold tabular-nums ${gold ? "text-gold" : "text-navy"}`}>
                  {formatUsd(tier.priceUsd)}
                </p>
                <p className={`mt-2 text-sm font-medium ${gold ? "text-navy-100" : "text-navy-500"}`}>
                  {t("packages.tickets", { count: tier.tickets })}
                </p>
                <div className="mt-3">
                  <SpotsLeft tier={tier} dark={gold} />
                </div>
                <ul className={`mt-6 flex-1 space-y-3 border-t pt-6 text-sm ${gold ? "border-gold/25" : "border-navy-100"}`}>
                  {tier.benefits.map((benefit) => (
                    <li key={benefit} className="flex gap-3">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${gold ? "text-gold" : "text-navy-400"}`} aria-hidden="true" />
                      <span className={gold ? "text-navy-50" : "text-navy-700"}>{t(`benefits.${benefit}`)}</span>
                    </li>
                  ))}
                </ul>
                <ApplyButton
                  tier={tier.id}
                  className={`mt-8 inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                    gold ? "bg-gold text-navy-950 hover:bg-[#d4b273]" : "border border-navy-900 text-navy hover:bg-navy-900 hover:text-cream"
                  }`}
                >
                  {t("packages.applyFor", { tier: tierName(tier.id) })}
                </ApplyButton>
              </li>
            );
          })}
        </ul>

        {/* lg+: one comparison table, Gold column framed. */}
        <div className="mt-14 hidden lg:block">
          <table className="w-full table-fixed border-separate border-spacing-0 text-left">
            <caption className="sr-only">{t("packages.compareTitle")}</caption>
            <colgroup>
              <col className="w-[22%]" />
              {sponsorTiers.map((tier) => (
                <col key={tier.id} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <td />
                {sponsorTiers.map((tier) => {
                  const gold = tier.id === "gold";
                  return (
                    <th
                      key={tier.id}
                      scope="col"
                      className={`px-5 pb-8 pt-7 align-top font-normal ${
                        gold ? "rounded-t-2xl bg-navy-900 text-cream shadow-[inset_0_1px_0_#c7a260,inset_1px_0_0_#c7a260,inset_-1px_0_0_#c7a260]" : "text-navy"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-display text-2xl font-semibold">{tierName(tier.id)}</span>
                        {gold && (
                          <span className="rounded-full bg-gold px-2.5 py-0.5 text-xs font-semibold text-navy-950">
                            {t("packages.mostVisible")}
                          </span>
                        )}
                      </span>
                      <span className={`mt-2 block font-display text-5xl font-semibold tabular-nums ${gold ? "text-gold" : ""}`}>
                        {formatUsd(tier.priceUsd)}
                      </span>
                      <span className="mt-4 block">
                        <SpotsLeft tier={tier} dark={gold} />
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {matrix.map(({ row, cells }) => (
                <tr key={row}>
                  <th scope="row" className="border-t border-navy-100 py-5 pr-6 text-sm font-semibold text-navy-800">
                    {t(`packages.rows.${row}`)}
                  </th>
                  {sponsorTiers.map((tier) => {
                    const gold = tier.id === "gold";
                    const cell = cells[tier.id];
                    const text = cellText(cell);
                    return (
                      <td
                        key={tier.id}
                        className={`border-t px-5 py-5 text-sm ${
                          gold
                            ? "border-gold/20 bg-navy-900 text-navy-50 shadow-[inset_1px_0_0_#c7a260,inset_-1px_0_0_#c7a260]"
                            : "border-navy-100 text-navy-700"
                        }`}
                      >
                        {cell === false ? (
                          <span className={`flex items-center ${gold ? "text-navy-400" : "text-navy-300"}`}>
                            <Minus className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">{t("packages.cells.no")}</span>
                          </span>
                        ) : (
                          <span className="flex items-start gap-2.5">
                            <Check className={`mt-0.5 h-4 w-4 shrink-0 ${gold ? "text-gold" : "text-navy-400"}`} aria-hidden="true" />
                            <span className={cell === "yes" ? "sr-only" : ""}>{text}</span>
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <td />
                {sponsorTiers.map((tier) => {
                  const gold = tier.id === "gold";
                  return (
                    <td key={tier.id} className={`px-5 pb-7 pt-6 ${gold ? "rounded-b-2xl bg-navy-900 shadow-[inset_0_-1px_0_#c7a260,inset_1px_0_0_#c7a260,inset_-1px_0_0_#c7a260]" : ""}`}>
                      <ApplyButton
                        tier={tier.id}
                        className={`inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-3.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                          gold
                            ? "bg-gold text-navy-950 hover:bg-[#d4b273]"
                            : "border border-navy-900 text-navy hover:bg-navy-900 hover:text-cream"
                        }`}
                      >
                        {t("packages.applyFor", { tier: tierName(tier.id) })}
                      </ApplyButton>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section aria-labelledby="process-title" className="bg-blush/40">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <h2 id="process-title" className="font-display text-4xl font-semibold leading-tight text-navy sm:text-5xl">
            {t("process.title")}
          </h2>
          <ol className="relative mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <span aria-hidden="true" className="absolute left-0 right-0 top-[0.6875rem] hidden h-px bg-navy-200 lg:block" />
            {processSteps.map((step, i) => (
              <li key={step} className="relative">
                <span
                  aria-hidden="true"
                  className={`relative flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    i === processSteps.length - 1 ? "bg-gold text-navy-950" : "bg-navy-900 text-cream"
                  }`}
                >
                  {i + 1}
                </span>
                <h3 className="mt-5 font-display text-2xl font-semibold text-navy">{t(`process.steps.${step}.title`)}</h3>
                <p className="mt-2 leading-relaxed text-navy-600">{t(`process.steps.${step}.body`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section aria-labelledby="faq-title" className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <h2 id="faq-title" className="font-display text-4xl font-semibold leading-tight text-navy text-balance sm:text-5xl lg:col-span-4">
            {t("faq.title")}
          </h2>
          <div className="divide-y divide-navy-100 border-y border-navy-100 lg:col-span-8">
            {faqItems.map((item) => (
              <details key={item} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-sm py-5 font-display text-xl font-semibold text-navy transition-colors hover:text-navy-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold [&::-webkit-details-marker]:hidden">
                  {t(`faq.items.${item}.q`)}
                  <span
                    aria-hidden="true"
                    className="relative h-4 w-4 shrink-0 before:absolute before:left-0 before:top-1/2 before:h-px before:w-4 before:bg-navy-400 after:absolute after:left-1/2 after:top-0 after:h-4 after:w-px after:bg-navy-400 after:transition-transform group-open:after:scale-y-0"
                  />
                </summary>
                <p className="max-w-2xl pb-6 leading-relaxed text-navy-600">
                  {t(`faq.items.${item}.a`, { date: deadline })}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Apply ──────────────────────────────────────────────────────── */}
      <section id="apply" aria-labelledby="apply-title" className="scroll-mt-16 bg-navy-950 text-cream">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-10 lg:px-10 lg:py-28">
          <div className="lg:col-span-4 lg:row-start-1">
            <h2 id="apply-title" className="font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">
              {t("form.title")}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-navy-100">{t("form.lead")}</p>
          </div>

          <div className="relative rounded-2xl bg-white p-6 text-navy shadow-xl sm:p-10 lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1">
            <SponsorForm deadline={galaEvent.sponsorDeadline} />
          </div>

          {/* Mobile order: heading → form → Adriana. Desktop: side column. */}
          <div className="lg:col-span-4 lg:row-start-2 lg:self-start">
            <div className="flex items-center gap-4 border-t border-gold/20 pt-8">
              <Image
                src="/images/adriana_2b.webp"
                alt="Adriana Meléndez"
                width={1462}
                height={1844}
                sizes="64px"
                className="h-16 w-16 shrink-0 rounded-full bg-cream object-cover object-[50%_12%]"
              />
              <div>
                <p className="font-display text-xl font-semibold">Adriana Meléndez</p>
                <p className="text-sm text-navy-200">A&amp;J Real Estate Group</p>
              </div>
            </div>
            <p className="mt-6 font-display text-2xl italic leading-snug text-cream text-balance">{t("close.title")}</p>
            <p className="mt-3 text-sm text-navy-200">{t("close.body")}</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                href={brand.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-gold/50 px-5 py-3 text-sm font-semibold transition-colors hover:border-gold hover:bg-gold/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <MessageCircle className="h-4 w-4 text-gold" aria-hidden="true" />
                {t("close.whatsapp")}
              </a>
              <a
                href={brand.phoneHref}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-navy-600 px-5 py-3 text-sm font-semibold transition-colors hover:border-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <Phone className="h-4 w-4 text-gold" aria-hidden="true" />
                {t("close.call", { phone: brand.phoneDisplay })}
              </a>
            </div>
          </div>

        </div>
      </section>

      <StickyApplyBar />
    </main>
  );
}
