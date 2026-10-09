import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ItmanoBeacon } from "@/components/ItmanoBeacon";
import { GiveawayEntry } from "@/components/giveaway/GiveawayEntry";
import { routing } from "@/i18n/routing";
import { giveawayConfig } from "@/lib/giveaway/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "giveaway.meta" });
  return {
    title: t("title"),
    description: t("description"),
    // Shared person to person (QR / link), never listed in search.
    robots: { index: false, follow: false },
  };
}

// Static on purpose: `?src=` is read in the browser, so the page can be cached
// at the edge (event Wi-Fi is the bottleneck, not our server).
export default async function GiveawayPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  // Both languages go to the client so the EN/ES toggle switches instantly.
  const [en, es] = await Promise.all(
    routing.locales.map(async (l) => {
      const messages = (await getMessages({ locale: l })) as Record<string, unknown>;
      return messages.giveaway as Record<string, unknown>;
    }),
  );

  return (
    <>
      <ItmanoBeacon channelPublicId={giveawayConfig.channelId} />
      <GiveawayEntry copy={{ en, es }} initialLang={locale === "es" ? "es" : "en"} />
    </>
  );
}
