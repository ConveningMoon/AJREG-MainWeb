import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Montserrat, EB_Garamond } from "next/font/google";
import { routing } from "@/i18n/routing";
import { TopBar } from "@/components/layout/TopBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NewsletterProvider } from "@/components/layout/NewsletterProvider";
import "../globals.css";

const SITE_URL = "https://ajrealestateva.com";

const montserrat = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const ebGaramond = EB_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const ogLocale = locale === "es" ? "es_US" : "en_US";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("siteName"),
      template: `%s | ${t("siteName")}`,
    },
    description: t("home.description"),
    openGraph: {
      siteName: t("siteName"),
      locale: ogLocale,
      type: "website",
      images: [{ url: "/images/Team_Portrait_2.webp", width: 1200, height: 630, alt: t("siteName") }],
    },
    twitter: { card: "summary_large_image" },
    alternates: {
      languages: {
        en: `${SITE_URL}/en`,
        es: `${SITE_URL}/es`,
      },
    },
    icons: {
      icon: "/Favicon.png",
      apple: "/Favicon.png",
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${montserrat.variable} ${ebGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-body">
        <NextIntlClientProvider>
          <NewsletterProvider>
            <TopBar />
            <Navbar />
            <div id="main-content" className="flex flex-1 flex-col">{children}</div>
            <Footer />
          </NewsletterProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
