import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { brand } from "@/lib/brand";

export async function ContactSection() {
  const t = await getTranslations("home.contactCta");

  return (
    <section className="relative overflow-hidden py-16 text-cream lg:py-24">
      {/* Background image */}
      <Image
        src="/images/home_final_cta_bg.webp"
        alt=""
        fill
        className="object-cover object-center"
        aria-hidden="true"
      />

      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-navy-950/80" aria-hidden="true" />

      {/* Dot-grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
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

      <div className="relative mx-auto max-w-3xl px-6 text-center">
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
            className="group inline-flex items-center justify-center gap-2 rounded-md bg-gold px-7 py-3.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
          >
            {t("button")}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
          <a
            href={brand.phoneHref}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-cream/30 px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:border-gold hover:text-gold"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {t("callButton")}
          </a>
          <a
            href={brand.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-cream/30 px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:border-gold hover:text-gold"
          >
            {t("whatsappButton")}
          </a>
        </div>
      </div>
    </section>
  );
}
