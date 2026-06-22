import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail, MapPin, Phone } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { ContactForm } from "@/components/forms/ContactForm";
import { brand } from "@/lib/brand";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.contact" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: { title: t("title"), description: t("description") },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  const details = [
    {
      Icon: Phone,
      label: t("info.callLabel"),
      value: brand.phoneDisplay,
      href: brand.phoneHref,
    },
    {
      Icon: Mail,
      label: t("info.emailLabel"),
      value: brand.emailDisplay,
      href: brand.emailHref,
    },
  ];

  return (
    <main className="flex flex-1 flex-col bg-cream">
      <section className="pt-12 lg:pt-16">
        <div className="mx-auto max-w-7xl px-6">
          <Eyebrow>{t("hero.eyebrow")}</Eyebrow>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.1] text-navy sm:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-navy-700 sm:text-lg">
            {t("hero.subtitle")}
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1.4fr_1fr]">
          <ContactForm locale={locale} />

          {/* Contact details */}
          <aside className="flex flex-col gap-8">
            <div className="rounded-2xl bg-navy-900 p-7 text-cream">
              <h2 className="font-display text-2xl font-semibold">
                {t("info.title")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-navy-200">
                {t("info.subtitle")}
              </p>

              <ul className="mt-6 space-y-4">
                {details.map(({ Icon, label, value, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="group flex items-start gap-3 transition-colors hover:text-gold"
                    >
                      <Icon
                        className="mt-0.5 h-5 w-5 shrink-0 text-gold"
                        aria-hidden="true"
                      />
                      <span>
                        <span className="block text-xs font-semibold uppercase tracking-wider text-navy-300">
                          {label}
                        </span>
                        <span className="block">{value}</span>
                      </span>
                    </a>
                  </li>
                ))}
                <li className="flex items-start gap-3">
                  <MapPin
                    className="mt-0.5 h-5 w-5 shrink-0 text-gold"
                    aria-hidden="true"
                  />
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-navy-300">
                      {t("info.coverageLabel")}
                    </span>
                    <span className="block">{t("info.coverageValue")}</span>
                  </span>
                </li>
              </ul>

              <div className="mt-7 border-t border-navy-700 pt-6">
                <span className="block text-xs font-semibold uppercase tracking-wider text-navy-300">
                  {t("info.followLabel")}
                </span>
                <SocialLinks className="mt-3" linkClassName="text-cream" />
              </div>
            </div>

            <a
              href={brand.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-navy-200 bg-white px-6 py-4 text-sm font-semibold text-navy transition-colors hover:border-gold hover:text-gold"
            >
              {t("info.whatsappCta")}
            </a>
          </aside>
        </div>
      </section>
    </main>
  );
}
