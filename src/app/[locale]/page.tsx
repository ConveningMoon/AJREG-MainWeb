import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

// Placeholder Home page for Phase 0. Real sections (Hero, WhoWeAre, Stats,
// Testimonials, SalesStories, Contact) are built in Phase 2.
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-display text-sm uppercase tracking-[0.25em] text-accent">
        A&amp;J Real Estate Group
      </p>
      <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold text-navy sm:text-5xl">
        {t("heroHeadline")}
      </h1>
      <p className="mt-6 max-w-xl text-lg text-navy-700">{t("heroSubheadline")}</p>
      <p className="mt-10 text-sm text-navy-400">
        Phase 0 scaffolding · {locale.toUpperCase()}
      </p>
    </main>
  );
}
