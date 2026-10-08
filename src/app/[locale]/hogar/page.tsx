import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { HogarCalculator } from "@/components/hogar/HogarCalculator";
import { ItmanoBeacon } from "@/components/ItmanoBeacon";
import { routing } from "@/i18n/routing";
import { hogarConfig } from "@/lib/hogar/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hogar.meta" });
  return {
    title: t("title"),
    description: t("description"),
    // Shared person to person (QR / link), never listed in search.
    robots: { index: false, follow: false },
  };
}

// Static on purpose: `?src=` and `?lang=` are read in the browser, so the page
// can be cached at the edge (event Wi-Fi is the bottleneck, not our server).
export default async function HogarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  // Both languages go to the client so the ES/EN toggle switches instantly,
  // mid-flow, without a navigation that would drop the answers.
  const [en, es] = await Promise.all(
    routing.locales.map(async (l) => {
      const messages = (await getMessages({ locale: l })) as Record<string, unknown>;
      return messages.hogar as Record<string, unknown>;
    }),
  );

  return (
    <>
      <ItmanoBeacon channelPublicId={hogarConfig.channelId} />
      <HogarCalculator copy={{ en, es }} initialLang={locale === "es" ? "es" : "en"} />
    </>
  );
}
