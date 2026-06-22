import { getTranslations } from "next-intl/server";

export async function Stats() {
  const t = await getTranslations("home.stats");

  const stats = [
    { value: "+100", label: t("housesLabel") },
    { value: "+20", label: t("familiesLabel") },
    { value: "+10", label: t("yearsLabel") },
  ];

  return (
    <section className="bg-navy-900 text-cream">
      <div className="mx-auto grid max-w-7xl px-6 py-12 sm:grid-cols-3 lg:py-16">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`px-8 py-6 ${
              i > 0
                ? "border-t border-gold/20 sm:border-t-0 sm:border-l sm:border-gold/20"
                : ""
            }`}
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p
                className="font-display font-semibold text-gold"
                style={{ fontSize: "clamp(4rem, 9vw, 7rem)", lineHeight: 1 }}
              >
                {s.value}
              </p>
              <p className="text-sm font-medium uppercase leading-tight tracking-wider text-navy-200">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
