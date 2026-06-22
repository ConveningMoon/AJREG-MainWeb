import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { WhoWeAre } from "@/components/home/WhoWeAre";
import { Stats } from "@/components/home/Stats";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { SalesStories } from "@/components/home/SalesStories";
import { ContactSection } from "@/components/home/ContactSection";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <WhoWeAre />
      <Stats />
      <TestimonialsCarousel />
      <SalesStories />
      <ContactSection />
    </>
  );
}
