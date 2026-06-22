"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { useNewsletter } from "@/components/layout/NewsletterProvider";

export function Hero() {
  const t = useTranslations("home.hero");
  const openNewsletter = useNewsletter();

  return (
    <section className="relative overflow-hidden bg-navy-900">
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-14 lg:grid-cols-2 lg:gap-12 lg:py-24">
        {/* Copy */}
        <div className="order-2 lg:order-1 motion-safe:animate-[slideUp_550ms_ease-out_both]">
          {/* Gold accent bar — the section signature */}
          <span aria-hidden="true" className="mb-4 block h-1 w-20 bg-gold" />
          <Eyebrow>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {t("eyebrow")}
            </span>
          </Eyebrow>
          <h1
            className="mt-5 font-display font-semibold text-cream leading-[0.88] tracking-[-0.03em]"
            style={{ fontSize: "clamp(3.5rem, 8vw, 8rem)" }}
          >
            {t("headline")}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-navy-200 sm:text-lg">
            {t("subheadline")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/houses"
              className="group inline-flex items-center justify-center gap-2 rounded-sm bg-gold px-7 py-3.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              {t("ctaPrimary")}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <button
              type="button"
              onClick={openNewsletter}
              className="inline-flex items-center justify-center rounded-sm border border-gold/60 px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-gold/10 hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {t("ctaGuide")}
            </button>
          </div>
        </div>

        {/* Portrait */}
        <div
          className="order-1 lg:order-2 motion-safe:animate-[fadeIn_700ms_ease-out_both]"
          style={{ animationDelay: "150ms" }}
        >
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-lg shadow-2xl lg:max-w-none lg:rounded-none lg:ring-2 lg:ring-gold/40">
            <Image
              src="/images/Team_Portrait_2.webp"
              alt={t("portraitAlt")}
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
