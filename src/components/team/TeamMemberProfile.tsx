import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { brand } from "@/lib/brand";
import { seedTeam, type TeamMember } from "@/data/team";

// First slug segment maps to the i18n member key (adriana, john, viviane, melany).
const memberKey = (slug: string) => slug.split("-")[0];

const langLabelKey = { en: "english", es: "spanish", pt: "portuguese" } as const;

export async function TeamMemberProfile({ member }: { member: TeamMember }) {
  const t = await getTranslations("team");
  const tc = await getTranslations("common");
  const key = memberKey(member.slug);
  const bio = t.raw(`members.${key}.bio`) as string[];
  const tagline = t(`members.${key}.tagline`);
  const initial = member.name.charAt(0);
  const others = seedTeam.filter((m) => m.slug !== member.slug);

  return (
    <main className="flex flex-1 flex-col bg-cream">
      <div className="mx-auto w-full max-w-5xl px-6 pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 transition-colors hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("profile.back")}
        </Link>
      </div>

      <section className="py-10 lg:py-14">
        <div className="mx-auto grid max-w-5xl items-start gap-10 px-6 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Photo / placeholder */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 to-slate shadow-sm ring-1 ring-navy-900/5">
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
                <span className="font-display text-7xl font-semibold text-cream/70">
                  {initial}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <Eyebrow>{member.role}</Eyebrow>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-navy sm:text-5xl">
              {member.name}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-navy-700">
              {tagline}
            </p>

            <div className="mt-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-navy-500">
                {t("profile.languagesLabel")}
              </span>
              <ul className="mt-2 flex flex-wrap gap-2">
                {member.languages.map((lang) => (
                  <li
                    key={lang}
                    className="rounded-full bg-blush/60 px-3.5 py-1.5 text-sm font-medium text-navy-800"
                  >
                    {tc(langLabelKey[lang])}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7 space-y-4 text-base leading-relaxed text-navy-700">
              {bio.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact-us"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
              >
                {t("profile.contactCta", { name: member.name.split(" ")[0] })}
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <a
                href={brand.phoneHref}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-navy-300 px-7 py-3.5 text-sm font-semibold text-navy transition-colors hover:border-gold hover:text-gold"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {t("profile.callCta")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of the team */}
      <section className="border-t border-navy-100 py-12 lg:py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="font-display text-2xl font-semibold text-navy">
            {t("profile.otherTitle")}
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {others.map((m) => (
              <li key={m.slug}>
                <Link
                  href={`/team/${m.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-navy-900/5 transition-shadow hover:shadow-md"
                >
                  <span>
                    <span className="block font-display text-lg font-medium text-navy">
                      {m.name}
                    </span>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-gold">
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
