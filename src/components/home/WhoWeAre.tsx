import { getTranslations } from "next-intl/server";
import { Globe, HeartHandshake, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { seedTeam } from "@/data/team";

const memberKey = (slug: string) => slug.split("-")[0];

const memberAccent: Record<string, { border: string; avatar: string; text: string }> = {
  "adriana-melendez": { border: "border-t-[3px] border-gold",      avatar: "bg-gold",      text: "text-navy-950" },
  "john-leonard":     { border: "border-t-[3px] border-slate",     avatar: "bg-slate",     text: "text-cream" },
  "viviane-chiu":     { border: "border-t-[3px] border-blush",     avatar: "bg-blush",     text: "text-navy-900" },
  "melany-valencia":  { border: "border-t-[3px] border-gold/60",   avatar: "bg-gold/60",   text: "text-navy-950" },
};

export async function WhoWeAre() {
  const t = await getTranslations("home.whoWeAre");

  const memberDesc: Record<string, string> = {
    adriana: t("members.adriana"),
    john:    t("members.john"),
    viviane: t("members.viviane"),
    melany:  t("members.melany"),
  };

  const badges = [
    { Icon: Globe,         label: t("badgeLanguages") },
    { Icon: Users,         label: t("badgeFamily") },
    { Icon: HeartHandshake, label: t("badgeAssist") },
  ];

  return (
    <section className="bg-cream py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-tight text-navy sm:text-5xl">
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
          {seedTeam.map((m, i) => {
            const accent = memberAccent[m.slug] ?? { border: "border-t-[3px] border-gold", avatar: "bg-gold", text: "text-navy-950" };
            const key = memberKey(m.slug);
            return (
              <Link
                key={m.slug}
                href={`/team/${m.slug}`}
                className={`group flex flex-col overflow-hidden rounded-2xl bg-navy-950 transition-transform hover:-translate-y-1 motion-safe:animate-[slideUp_450ms_ease-out_both] ${accent.border}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex flex-1 flex-col p-6">
                  {/* Avatar placeholder */}
                  <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${accent.avatar}`}>
                    <span className={`font-display text-xl font-semibold ${accent.text}`}>
                      {m.name.charAt(0)}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-semibold text-cream">
                    {m.name}
                  </h3>
                  <p className="mt-2">
                    <span className="inline-block rounded-full bg-gold/15 px-3 py-0.5 text-xs font-semibold text-gold">
                      {m.role}
                    </span>
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-navy-300">
                    {memberDesc[key]}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
