import { getTranslations } from "next-intl/server";
import { Globe, HeartHandshake, Users } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { seedTeam } from "@/data/team";

// First slug segment maps to the i18n member key (adriana, john, viviane, melany).
const memberKey = (slug: string) => slug.split("-")[0];

export async function WhoWeAre() {
  const t = await getTranslations("home.whoWeAre");

  const memberDesc: Record<string, string> = {
    adriana: t("members.adriana"),
    john: t("members.john"),
    viviane: t("members.viviane"),
    melany: t("members.melany"),
  };

  const badges = [
    { Icon: Globe, label: t("badgeLanguages") },
    { Icon: Users, label: t("badgeFamily") },
    { Icon: HeartHandshake, label: t("badgeAssist") },
  ];

  return (
    <section className="bg-cream py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="mt-5 font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-navy-700">
            {t("intro")}
          </p>
        </div>

        <ul className="mt-8 flex flex-wrap gap-3">
          {badges.map(({ Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-2 rounded-full bg-blush/60 px-4 py-2 text-sm font-medium text-navy-800"
            >
              <Icon className="h-4 w-4 text-gold" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {seedTeam.map((m) => (
            <article
              key={m.slug}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5 transition-shadow hover:shadow-md"
            >
              <h3 className="font-display text-xl font-semibold text-navy">
                {m.name}
              </h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gold">
                {m.role}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-navy-600">
                {memberDesc[memberKey(m.slug)]}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
