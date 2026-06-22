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

  const key     = memberKey(member.slug);
  const bio     = t.raw(`members.${key}.bio`) as string[];
  const tagline = t(`members.${key}.tagline`);
  const initial = member.name.charAt(0);
  const others  = seedTeam.filter((m) => m.slug !== member.slug);
  const resource = getResourceByAgent(member.slug);

  return (
    <main className="flex flex-1 flex-col">
      {/* Dark hero */}
      <div className="bg-navy-900">
        <div className="mx-auto w-full max-w-5xl px-6 pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-300 transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("profile.back")}
          </Link>
        </div>

        <section className="py-10 lg:py-14">
          <div className="mx-auto grid max-w-5xl items-start gap-10 px-6 lg:grid-cols-[0.85fr_1.15fr]">
            {/* Left column: photo + video */}
            <div className="flex flex-col gap-5">
              {/* Photo placeholder */}
              <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-linear-to-br from-navy-800 to-slate shadow-sm">
                {member.photoUrl ? (
                  <Image
                    src={member.photoUrl}
                    alt={member.name}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="font-display text-7xl font-semibold text-gold/60">
                      {initial}
                    </span>
                  </div>
                )}
              </div>

              {/* Video placeholder */}
              <AgentVideoSection
                member={member}
                label={t("profile.videoLabel", { name: member.name.split(" ")[0] })}
              />
            </div>

            {/* Right column: info */}
            <div>
              <span className="inline-block rounded-full bg-gold/15 px-3 py-0.5 text-xs font-semibold text-gold">
                {member.role}
              </span>
              <h1 className="mt-4 font-display text-5xl font-semibold leading-tight text-cream lg:text-6xl">
                {member.name}
              </h1>

              {/* Tagline */}
              <div className="relative mt-5 pl-7">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 font-display text-4xl leading-none text-gold"
                >
                  &ldquo;
                </span>
                <p className="font-display text-xl italic leading-relaxed text-navy-200">
                  {tagline}
                </p>
              </div>

              {/* Languages */}
              <div className="mt-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-navy-400">
                  {t("profile.languagesLabel")}
                </span>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {member.languages.map((lang) => (
                    <li
                      key={lang}
                      className="rounded-full border border-navy-600 bg-navy-800 px-3.5 py-1.5 text-sm font-medium text-cream"
                    >
                      {tc(langLabelKey[lang])}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bio */}
              <div className="mt-7 space-y-4 text-base leading-relaxed text-navy-200">
                {bio.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact-us"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-7 py-3.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                >
                  {t("profile.contactCta", { name: member.name.split(" ")[0] })}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
                <a
                  href={brand.phoneHref}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gold/40 px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:border-gold hover:text-gold"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {t("profile.callCta")}
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Free resource band */}
      {resource && (
        <div className="bg-cream border-y border-navy-100 py-10 lg:py-14">
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
        </div>
      )}

      {/* Meet the rest */}
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
                  className={`group flex items-center justify-between gap-3 rounded-2xl bg-navy-950 p-5 transition-opacity hover:opacity-90 ${memberAccent[m.slug] ?? "border-t-[3px] border-gold"}`}
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
