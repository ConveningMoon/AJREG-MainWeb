import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowDown,
  Clock3,
  Dumbbell,
  Flower2,
  Gamepad2,
  Heart,
  MapPin,
  ShoppingBag,
  Utensils,
} from "lucide-react";
import { ItmanoBeacon } from "@/components/ItmanoBeacon";
import { EventDocumentTheme } from "@/components/events/EventDocumentTheme";
import { FeelGoodSocialForm } from "@/components/events/FeelGoodSocialForm";
import styles from "./FeelGoodSocial.module.css";

const CHANNEL_ID =
  process.env.NEXT_PUBLIC_ITMANO_FEEL_GOOD_SOCIAL_CHANNEL_ID ??
  "chn_xk4qyhwgff6e";

const SITE_URL = "https://ajrealestateva.com";

type ParticleStyle = CSSProperties & {
  "--x": string;
  "--y": string;
  "--duration": string;
  "--delay": string;
  "--rotation": string;
  "--drift-x": string;
  "--drift-y": string;
  "--opacity": number;
  "--particle-color": string;
};

const particles: ParticleStyle[] = [
  { "--x": "5%", "--y": "13%", "--duration": "7.2s", "--delay": "-1s", "--rotation": "-14deg", "--drift-x": "18px", "--drift-y": "-30px", "--opacity": 0.32, "--particle-color": "#a4134c" },
  { "--x": "14%", "--y": "72%", "--duration": "8.4s", "--delay": "-4s", "--rotation": "12deg", "--drift-x": "-16px", "--drift-y": "-22px", "--opacity": 0.3, "--particle-color": "#c95d82" },
  { "--x": "34%", "--y": "7%", "--duration": "6.8s", "--delay": "-2s", "--rotation": "8deg", "--drift-x": "12px", "--drift-y": "-18px", "--opacity": 0.22, "--particle-color": "#7f1640" },
  { "--x": "48%", "--y": "82%", "--duration": "9s", "--delay": "-6s", "--rotation": "-20deg", "--drift-x": "20px", "--drift-y": "-26px", "--opacity": 0.26, "--particle-color": "#a4134c" },
  { "--x": "62%", "--y": "15%", "--duration": "7.7s", "--delay": "-3s", "--rotation": "15deg", "--drift-x": "-18px", "--drift-y": "-24px", "--opacity": 0.28, "--particle-color": "#c95d82" },
  { "--x": "77%", "--y": "68%", "--duration": "8.8s", "--delay": "-5s", "--rotation": "-9deg", "--drift-x": "14px", "--drift-y": "-32px", "--opacity": 0.25, "--particle-color": "#7f1640" },
  { "--x": "91%", "--y": "22%", "--duration": "6.9s", "--delay": "-2.5s", "--rotation": "22deg", "--drift-x": "-20px", "--drift-y": "-20px", "--opacity": 0.3, "--particle-color": "#a4134c" },
  { "--x": "88%", "--y": "88%", "--duration": "9.2s", "--delay": "-7s", "--rotation": "-18deg", "--drift-x": "-14px", "--drift-y": "-28px", "--opacity": 0.2, "--particle-color": "#c95d82" },
];

function PetalField() {
  return (
    <div className={styles.petalField} aria-hidden="true">
      {particles.map((style, index) => {
        const Icon = index % 3 === 0 ? Heart : Flower2;
        return (
          <Icon
            key={`${style["--x"]}-${style["--y"]}`}
            className={`${styles.particle} ${index % 2 === 0 ? "h-7 w-7" : "h-5 w-5"}`}
            style={style}
            fill={index % 3 === 0 ? "currentColor" : "none"}
            strokeWidth={index % 3 === 0 ? 1.5 : 1.25}
          />
        );
      })}
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: "en", namespace: "feelGoodSocial" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: { canonical: `${SITE_URL}/en/events/feel-good-social` },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/en/events/feel-good-social`,
      title: t("meta.title"),
      description: t("meta.description"),
    },
  };
}

export default async function FeelGoodSocialPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  // The event campaign was requested in English, including when someone
  // reaches it through the site's locale switcher.
  const t = await getTranslations({ locale: "en", namespace: "feelGoodSocial" });

  const activities = [
    { key: "workouts", Icon: Dumbbell },
    { key: "games", Icon: Gamepad2 },
    { key: "vendors", Icon: ShoppingBag },
    { key: "food", Icon: Utensils },
  ] as const;

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Feel Good Social",
    description: t("meta.description"),
    startDate: "2026-09-20T13:00:00-04:00",
    endDate: "2026-09-20T17:00:00-04:00",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: "Sandbridge Farmhouse",
    },
    organizer: {
      "@type": "Organization",
      name: "A&J Real Estate Group",
      url: SITE_URL,
    },
    url: `${SITE_URL}/en/events/feel-good-social`,
  };

  return (
    <>
      <EventDocumentTheme />
      <ItmanoBeacon channelPublicId={CHANNEL_ID} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <main className={styles.eventPage}>
        <section className="relative isolate overflow-hidden bg-[#f9dce6]">
          <PetalField />
          <div className="mx-auto grid min-h-[calc(100svh-7rem)] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:px-10 lg:py-20">
            <div className="relative z-10">
              <div className="flex items-end gap-4 text-[#7f1640] sm:gap-6">
                <span className="pb-3 text-sm font-bold uppercase tracking-[0.2em] sm:pb-5">
                  {t("hero.month")}
                </span>
                <span className="font-display text-[7.5rem] font-semibold leading-[0.72] tracking-[-0.04em] sm:text-[10rem]">
                  20
                </span>
                <span className="pb-2 text-sm font-semibold tabular-nums sm:pb-4">
                  2026
                </span>
              </div>

              <h1 className="mt-10 max-w-3xl text-balance font-display text-5xl font-semibold leading-[0.9] tracking-[-0.035em] text-[#38152c] sm:text-7xl lg:text-8xl">
                {t("hero.title")}
              </h1>
              <p className="mt-7 max-w-xl text-lg font-medium leading-relaxed text-[#6e3d58] sm:text-xl">
                {t("hero.subtitle")}
              </p>

              <div className="mt-8 flex flex-col gap-3 text-sm font-semibold text-[#55243d] sm:flex-row sm:flex-wrap sm:gap-6">
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-[#a4134c]" aria-hidden="true" />
                  {t("details.time")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#a4134c]" aria-hidden="true" />
                  {t("details.venue")}
                </span>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href="#rsvp"
                  className="inline-flex items-center justify-center rounded-full bg-[#a4134c] px-7 py-3.5 font-semibold text-white transition-[background-color,box-shadow,transform] hover:-translate-y-0.5 hover:bg-[#88103f] hover:shadow-[0_14px_30px_-16px_rgba(98,8,48,0.9)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a4134c]"
                >
                  {t("hero.cta")}
                </a>
                <a
                  href="#experience"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-3 font-semibold text-[#6d1a43] underline decoration-[#c95d82] decoration-2 underline-offset-8 transition-colors hover:text-[#a4134c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a4134c]"
                >
                  {t("hero.secondaryCta")}
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[31rem] lg:ml-auto">
              <div className="relative overflow-hidden rounded-2xl bg-[#a4134c] px-8 py-10 text-white shadow-[0_28px_65px_-24px_rgba(83,10,47,0.65)] sm:px-11 sm:py-12">
                <Flower2
                  className="absolute -right-14 -top-14 h-52 w-52 text-[#f4b8cb]/35"
                  strokeWidth={0.8}
                  aria-hidden="true"
                />
                <Heart
                  className="absolute bottom-10 right-10 h-8 w-8 text-[#f9dce6]/50"
                  fill="currentColor"
                  strokeWidth={1}
                  aria-hidden="true"
                />
                <p className="max-w-sm text-balance font-display text-5xl font-semibold leading-[0.98] tracking-[-0.03em] sm:text-6xl">
                  {t("hero.posterStatement")}
                </p>
                <div className="mt-12 border-t border-white/30 pt-6">
                  <p className="text-sm leading-relaxed text-[#ffe8ef]">
                    {t("hero.posterBody")}
                  </p>
                  <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-[#ffdbe7]">
                    {t("hero.host")}
                  </p>
                </div>
              </div>
              <div
                className="absolute -bottom-5 -left-5 flex h-24 w-24 rotate-[-8deg] items-center justify-center rounded-full bg-[#f4b8cb] text-center text-xs font-extrabold uppercase tracking-[0.12em] text-[#6d1a43] shadow-[0_16px_34px_-18px_rgba(83,10,47,0.8)]"
                aria-hidden="true"
              >
                {t("hero.seal")}
              </div>
            </div>
          </div>
        </section>

        <section id="experience" className="bg-[#fff9f8] px-6 py-24 lg:px-10 lg:py-32">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:gap-24">
            <div>
              <h2 className="text-balance font-display text-4xl font-semibold leading-[1.02] tracking-[-0.03em] text-[#38152c] sm:text-6xl">
                {t("experience.title")}
              </h2>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#715265]">
                {t("experience.body")}
              </p>
            </div>

            <ul className="border-b border-[#dba8ba]">
              {activities.map(({ key, Icon }) => (
                <li
                  key={key}
                  className="grid gap-3 border-t border-[#dba8ba] py-7 sm:grid-cols-[3rem_10rem_1fr] sm:items-center sm:gap-6"
                >
                  <Icon className="h-7 w-7 text-[#a4134c]" strokeWidth={1.5} aria-hidden="true" />
                  <h3 className="font-display text-3xl font-semibold text-[#38152c]">
                    {t(`activities.${key}.title`)}
                  </h3>
                  <p className="leading-relaxed text-[#715265]">
                    {t(`activities.${key}.body`)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="overflow-hidden bg-[#102037] text-white">
          <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
            <div className="px-6 py-20 lg:px-10 lg:py-24">
              <p className="font-display text-[6.5rem] font-semibold leading-[0.72] tracking-[-0.04em] text-[#f4b8cb] sm:text-[9rem]">
                1–5
              </p>
              <p className="mt-7 text-xl font-semibold uppercase tracking-[0.18em] text-[#f9dce6]">
                {t("details.timeSuffix")}
              </p>
              <p className="mt-8 max-w-md text-lg leading-relaxed text-[#d8e0e6]">
                {t("details.timeBody")}
              </p>
            </div>
            <div className="relative isolate bg-[#f4b8cb] px-6 py-20 text-[#38152c] lg:px-12 lg:py-24">
              <Flower2
                className="absolute -bottom-16 -right-12 -z-10 h-72 w-72 text-[#a4134c]/18"
                strokeWidth={0.7}
                aria-hidden="true"
              />
              <MapPin className="h-8 w-8 text-[#a4134c]" strokeWidth={1.5} aria-hidden="true" />
              <h2 className="mt-8 max-w-md text-balance font-display text-5xl font-semibold leading-[0.95] tracking-[-0.03em] sm:text-6xl">
                {t("details.venue")}
              </h2>
              <p className="mt-7 max-w-md text-lg leading-relaxed text-[#6e3d58]">
                {t("details.venueBody")}
              </p>
            </div>
          </div>
        </section>

        <section id="rsvp" className="relative isolate overflow-hidden bg-[#f9dce6] px-6 py-24 lg:px-10 lg:py-32">
          <Heart
            className={`${styles.settledParticle} left-[5%] top-16 h-12 w-12`}
            fill="currentColor"
            strokeWidth={1}
            aria-hidden="true"
          />
          <Flower2
            className={`${styles.settledParticle} bottom-20 right-[4%] h-20 w-20`}
            strokeWidth={0.8}
            aria-hidden="true"
          />
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-20">
            <div>
              <h2 className="text-balance font-display text-5xl font-semibold leading-[0.98] tracking-[-0.03em] text-[#38152c] sm:text-7xl">
                {t("rsvp.title")}
              </h2>
              <p className="mt-7 max-w-md text-lg leading-relaxed text-[#715265]">
                {t("rsvp.body")}
              </p>
              <div className="mt-10 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.14em] text-[#7f1640]">
                <Heart className="h-5 w-5" fill="currentColor" aria-hidden="true" />
                {t("rsvp.note")}
              </div>
            </div>

            <div className="rounded-2xl bg-[#fff9f8] p-6 shadow-[0_26px_60px_-30px_rgba(83,10,47,0.65)] sm:p-10">
              <FeelGoodSocialForm />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
