import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { brand } from "@/lib/brand";
import { seedTeam, type TeamMember } from "@/data/team";
import { getResourceByAgent } from "@/data/resources";
import { AgentVideoSection } from "@/components/team/AgentVideoSection";
import { AgentResourceSection } from "@/components/team/AgentResourceSection";

const memberKey = (slug: string) => slug.split("-")[0];

const langLabelKey = { en: "english", es: "spanish", pt: "portuguese" } as const;

const memberAccent: Record<string, string> = {
  "adriana-melendez": "border-t-[3px] border-gold",
  "john-leonard":     "border-t-[3px] border-slate",
  "viviane-chiu":     "border-t-[3px] border-blush",
  "melany-valencia":  "border-t-[3px] border-gold/60",
};

export async function TeamMemberProfile({ member }: { member: TeamMember }) {
  const t  = await getTranslations("team");
  const tc = await getTranslations("common");
  const tr = await getTranslations("resources");

  const key      = memberKey(member.slug);
  const bio      = t.raw(`members.${key}.bio`) as string[];
  const tagline  = t(`members.${key}.tagline`);
  const initial  = member.name.charAt(0);
  const others   = seedTeam.filter((m) => m.slug !== member.slug);
  const resource = getResourceByAgent(member.slug);

  return (
    <main className="flex flex-1 flex-col">
      {/* ── SECTION 1: Dark hero — identity + video + primary CTAs ─────────── */}
      <section className="bg-navy-950 pb-14 pt-8">
        <div className="mx-auto max-w-5xl px-6">

          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-300 transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("profile.back")}
          </Link>

          {/* Identity header ─────────────────────────────────────────────── */}
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-block rounded-full bg-gold/15 px-3 py-0.5 text-xs font-semibold text-gold">
                {member.role}
              </span>
              <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-cream sm:text-5xl lg:text-6xl">
                {member.name}
              </h1>
            </div>

            {/* Avatar */}
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-linear-to-br from-gold to-gold/60 shadow-lg ring-2 ring-gold/30 sm:h-24 sm:w-24">
              {member.photoUrl ? (
                <Image
                  src={member.photoUrl}
                  alt={member.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-display text-3xl font-semibold text-navy-950 sm:text-4xl">
                  {initial}
                </span>
              )}
            </div>
          </div>

          {/* Tagline */}
          <div className="relative mt-5 pl-6">
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 font-display text-3xl leading-none text-gold"
            >
              &ldquo;
            </span>
            <p className="font-display text-lg italic leading-relaxed text-navy-300 sm:text-xl">
              {tagline}
            </p>
          </div>

          {/* Languages */}
          <ul className="mt-5 flex flex-wrap gap-2">
            {member.languages.map((lang) => (
              <li
                key={lang}
                className="rounded-full border border-navy-600 bg-navy-800 px-3.5 py-1 text-sm font-medium text-cream"
              >
                {tc(langLabelKey[lang])}
              </li>
            ))}
          </ul>

          {/* Gold divider */}
          <div className="mt-8 h-px w-full bg-gold/15" />

          {/* VIDEO — the star of the show ──────────────────────────────────── */}
          <div className="mt-8">
            <AgentVideoSection
              member={member}
              label={t("profile.videoLabel", { name: member.name.split(" ")[0] })}
              large
            />
          </div>

          {/* Primary CTAs — right below the video while attention is warm ─── */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact-us"
              className="group inline-flex flex-1 items-center justify-center gap-2 rounded-sm bg-gold px-7 py-4 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream sm:flex-none"
            >
              {t("profile.contactCta", { name: member.name.split(" ")[0] })}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <a
              href={brand.phoneHref}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-sm border border-gold/40 px-7 py-4 text-sm font-semibold text-cream transition-colors hover:border-gold hover:text-gold sm:flex-none"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {t("profile.callCta")}
            </a>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: Bio — light background, calm reading environment ─────── */}
      <section className="bg-cream py-12 lg:py-16">
        <div className="mx-auto max-w-3xl px-6">
          <span className="mb-1 block h-0.5 w-10 bg-gold" aria-hidden="true" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-taupe">
            {member.name.split(" ")[0]}
          </p>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-navy-800 sm:text-lg">
            {bio.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Free resource — secondary lead capture ───────────────── */}
      {resource && (
        <section className="border-y border-navy-100 bg-white py-10 lg:py-14">
          <div className="mx-auto max-w-5xl px-6">
            <AgentResourceSection
              resource={resource}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              titleText={tr(`${key}.title` as any)}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              descriptionText={tr(`${key}.description` as any)}
              ctaText={tr("cta")}
            />
          </div>
        </section>
      )}

      {/* ── SECTION 4: Meet the rest ─────────────────────────────────────────── */}
      <section className="bg-cream py-12 lg:py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="font-display text-2xl font-semibold text-navy">
            {t("profile.otherTitle")}
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {others.map((m) => (
              <li key={m.slug}>
                <Link
                  href={`/team/${m.slug}`}
                  className={`group flex items-center justify-between gap-3 rounded-sm bg-navy-950 p-5 transition-opacity hover:opacity-90 ${memberAccent[m.slug] ?? "border-t-[3px] border-gold"}`}
                >
                  <span>
                    <span className="block font-display text-lg font-medium text-cream">
                      {m.name}
                    </span>
                    <span className="mt-1 inline-block rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold">
                      {m.role}
                    </span>
                  </span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-navy-400 transition-transform group-hover:translate-x-0.5 group-hover:text-gold"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
