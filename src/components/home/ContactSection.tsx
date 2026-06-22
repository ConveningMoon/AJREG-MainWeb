import { getTranslations } from "next-intl/server";
import { ArrowRight, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { brand } from "@/lib/brand";

export async function ContactSection() {
  const t = await getTranslations("home.contactCta");

  return (
    <section className="bg-navy-900 py-16 text-cream lg:py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        {/* Gold bar */}
        <span aria-hidden="true" className="mx-auto mb-6 block h-1 w-20 bg-gold" />
        <div className="flex justify-center">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
        </div>
        <h2 className="mt-5 font-display text-4xl font-semibold leading-tight sm:text-5xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-navy-200">
          {t("subtitle")}
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/contact-us"
            className="group inline-flex items-center justify-center gap-2 rounded-sm bg-gold px-7 py-3.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
          >
            {t("button")}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
          <a
            href={brand.phoneHref}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-navy-600 px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:border-gold hover:text-gold"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {t("callButton")}
          </a>
          <a
            href={brand.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-navy-600 px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:border-gold hover:text-gold"
          >
            {t("whatsappButton")}
          </a>
        </div>
      </div>
    </section>
  );
}
