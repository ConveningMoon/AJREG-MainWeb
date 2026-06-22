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
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-3 lg:py-16">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-5xl font-semibold text-gold lg:text-6xl">
              {s.value}
            </p>
            <p className="mt-2 text-sm font-medium uppercase tracking-wider text-navy-200">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
