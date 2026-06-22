import { getTranslations } from "next-intl/server";
import { ArrowRight, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { brand } from "@/lib/brand";

export async function ContactSection() {
  const t = await getTranslations("home.contactCta");

  return (
    <section className="relative overflow-hidden bg-navy-900 py-16 text-cream lg:py-24">
      {/* Dot-grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, #c7a260 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />
      {/* Decorative gold circles */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-gold/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full border border-gold/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full border border-gold/8"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <span aria-hidden="true" className="mx-auto mb-6 block h-0.5 w-20 bg-gold" />
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
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-7 py-3.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
          >
            {t("button")}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
          <a
            href={brand.phoneHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-600 px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:border-gold hover:text-gold"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {t("callButton")}
          </a>
          <a
            href={brand.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-600 px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:border-gold hover:text-gold"
          >
            {t("whatsappButton")}
          </a>
        </div>
      </div>
    </section>
  );
}
