import { getTranslations, setRequestLocale } from "next-intl/server";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ListingsGrid } from "@/components/houses/ListingsGrid";
import { getListings } from "@/lib/listings";

// Refresh listings from Supabase at most hourly (falls back to seed if the
// table is empty or unreachable).
export const revalidate = 3600;

export default async function HousesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("houses.hero");
  const listings = await getListings();

  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-cream pt-12 lg:pt-16">
        <div className="mx-auto max-w-7xl px-6">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.1] text-navy sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-navy-700 sm:text-lg">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="bg-cream py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-6">
          <ListingsGrid listings={listings} />
        </div>
      </section>
    </main>
  );
}
