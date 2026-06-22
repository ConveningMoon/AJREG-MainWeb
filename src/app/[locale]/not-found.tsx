import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// Locale-aware not-found, rendered inside the [locale] layout.
export default async function LocaleNotFound() {
  const t = await getTranslations("notFound");
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-navy">{t("title")}</h1>
      <p className="mt-3 text-navy-700">{t("description")}</p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
      >
        {t("backHome")}
      </Link>
    </main>
  );
}
