import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { WhoWeAre } from "@/components/home/WhoWeAre";
import { Stats } from "@/components/home/Stats";
import { GoogleReviews } from "@/components/home/GoogleReviews";
import { SalesStories } from "@/components/home/SalesStories";
import { ContactSection } from "@/components/home/ContactSection";
import { googleReviewsData } from "@/data/googleReviews";
import { brand } from "@/lib/brand";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.home" });
  return {
    title: { absolute: t("title") },
    description: t("description"),
    openGraph: { title: t("title"), description: t("description") },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tReviews = await getTranslations({ locale, namespace: "home.googleReviews" });

  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <WhoWeAre />
      <Stats />
      <GoogleReviews
        data={googleReviewsData}
        labels={{
          eyebrow:       tReviews("eyebrow"),
          title:         tReviews("title"),
          subtitle:      tReviews("subtitle"),
          viewAll:       tReviews("viewAll"),
          verifiedLabel: tReviews("verifiedLabel"),
        }}
        mapsUrl={brand.googleMapsUrl}
      />
      <SalesStories />
      <ContactSection />
    </main>
  );
}
