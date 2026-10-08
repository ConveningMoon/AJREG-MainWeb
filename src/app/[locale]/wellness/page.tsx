import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ItmanoBeacon } from "@/components/ItmanoBeacon";
import { WellnessCheck } from "@/components/wellness/WellnessCheck";
import { routing } from "@/i18n/routing";
import { wellnessConfig } from "@/lib/wellness/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "wellness.meta" });
  return {
    title: t("title"),
    description: t("description"),
    // Shared person to person (QR / link), never listed in search.
    robots: { index: false, follow: false },
  };
}

// Static on purpose: `?src=` is read in the browser, so the page can be cached
// at the edge (event Wi-Fi is the bottleneck, not our server).
export default async function WellnessPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  // Both languages go to the client so the EN/ES toggle switches instantly,
  // mid-quiz, without a navigation that would drop the answers.
  const [en, es] = await Promise.all(
    routing.locales.map(async (l) => {
      const messages = (await getMessages({ locale: l })) as Record<string, unknown>;
      return messages.wellness as Record<string, unknown>;
    }),
  );

  return (
    <>
      <ItmanoBeacon channelPublicId={wellnessConfig.channelId} />
      <WellnessCheck
        copy={{ en, es }}
        initialLang={locale === "es" ? "es" : "en"}
      />
    </>
  );
}
