import { getTranslations } from "next-intl/server";
import { Globe, HeartHandshake, Users, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { seedTeam } from "@/data/team";

const memberKey = (slug: string) => slug.split("-")[0];

const memberAccent: Record<
  string,
  { topGradient: string; avatar: string; avatarText: string; divider: string }
> = {
  "adriana-melendez": {
    topGradient: "bg-linear-to-b from-gold/25 to-navy-950",
    avatar: "bg-gold",
    avatarText: "text-navy-950",
    divider: "bg-gold/20",
  },
  "john-leonard": {
    topGradient: "bg-linear-to-b from-slate/35 to-navy-950",
    avatar: "bg-slate",
    avatarText: "text-cream",
    divider: "bg-slate/25",
  },
  "viviane-chiu": {
    topGradient: "bg-linear-to-b from-blush/30 to-navy-950",
    avatar: "bg-blush",
    avatarText: "text-navy-900",
    divider: "bg-blush/25",
  },
  "melany-valencia": {
    topGradient: "bg-linear-to-b from-gold/15 to-navy-950",
    avatar: "bg-gold/70",
    avatarText: "text-navy-950",
    divider: "bg-gold/15",
  },
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
    { Icon: Globe,          label: t("badgeLanguages") },
    { Icon: Users,          label: t("badgeFamily") },
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

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {seedTeam.map((m, i) => {
            const accent = memberAccent[m.slug] ?? memberAccent["adriana-melendez"];
            const key = memberKey(m.slug);
            return (
              <Link
                key={m.slug}
                href={`/team/${m.slug}`}
                className="group flex flex-col overflow-hidden rounded-sm bg-navy-950 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 motion-safe:animate-[slideUp_450ms_ease-out_both]"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Gradient header with avatar */}
                <div className={`relative flex flex-col items-center px-5 pb-6 pt-8 ${accent.topGradient}`}>
                  <ArrowRight
                    className="absolute right-4 top-4 h-4 w-4 text-cream/20 transition-colors group-hover:text-gold/60"
                    aria-hidden="true"
                  />
                  <div
                    className={`flex h-20 w-20 items-center justify-center rounded-full shadow-lg ring-4 ring-navy-950 ${accent.avatar}`}
                  >
                    <span className={`font-display text-3xl font-semibold ${accent.avatarText}`}>
                      {m.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="mt-4 text-center font-display text-xl font-semibold leading-tight text-cream">
                    {m.name}
                  </h3>
                  <span className="mt-2 inline-block rounded-full bg-gold/20 px-3 py-0.5 text-xs font-semibold text-gold">
                    {m.role}
                  </span>
                </div>

                {/* Accent hairline divider */}
                <div className={`h-px ${accent.divider}`} />

                {/* Description */}
                <div className="flex-1 p-5">
                  <p className="text-sm leading-relaxed text-navy-300">
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
