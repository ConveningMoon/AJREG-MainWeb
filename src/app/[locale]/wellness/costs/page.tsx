import type { Metadata } from "next";
import Image from "next/image";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/wellness/PrintButton";
import { routing } from "@/i18n/routing";
import styles from "@/components/wellness/Wellness.module.css";

const ITEMS = [
  "tax",
  "insurance",
  "flood",
  "hoa",
  "maintenance",
  "utilities",
  "moving",
  "repairs",
  "closing",
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "wellness.costs.meta" });
  return { title: t("title"), description: t("description"), robots: { index: false, follow: false } };
}

export default async function CostsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "wellness.costs" });

  return (
    <div className={`${styles.page} print:bg-white`}>
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8 print:max-w-none print:py-0">
        <Image src="/images/Logo.PNG" alt="A&J Real Estate Group" width={96} height={58} className="h-12 w-auto" priority />
        <h1 className="mt-6 font-display text-4xl leading-tight font-semibold text-navy-900">{t("title")}</h1>
        <p className="mt-3 text-base leading-relaxed text-navy-700">{t("intro")}</p>
        <ul className="mt-6 grid gap-2.5">
          {ITEMS.map((id) => (
            <li key={id} className="flex items-start gap-3 rounded-xl bg-white p-3.5 ring-1 ring-navy-900/10 print:break-inside-avoid">
              <span aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 rounded border-2 border-navy-900/40" />
              <span className="text-[15px] leading-snug text-navy-900">{t(`items.${id}`)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs leading-relaxed text-navy-600">{t("note")}</p>
        <div className="mt-6 print:hidden">
          <PrintButton label={t("print")} className={styles.secondary} />
        </div>
      </main>
    </div>
  );
}
