import type { Metadata } from "next";
import { ItmanoBeacon } from "@/components/ItmanoBeacon";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CheckInForm } from "@/components/forms/CheckInForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.checkIn" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: { title: t("title"), description: t("description") },
  };
}

// Canal del CRM al que pertenece esta pagina — el beacon reporta la visita.
const CHANNEL_ID = process.env.NEXT_PUBLIC_ITMANO_CHECKIN_CHANNEL_ID ?? "chn_x5yxx15jt7wf";

export default async function CheckInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("checkIn");

  return (
    <>
      <ItmanoBeacon channelPublicId={CHANNEL_ID} />
    <main className="flex flex-1 flex-col bg-cream">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-16 lg:py-20">
        <div className="text-center">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h1 className="mt-5 font-display text-3xl font-semibold leading-[1.15] text-navy sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-navy-700">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-10 w-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-900/5 sm:p-10">
          <CheckInForm />
        </div>
      </div>
    </main>
    </>
  );
}
