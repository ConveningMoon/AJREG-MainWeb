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
    <section className="relative overflow-hidden bg-cream">
      {/* Soft navy field behind the portrait on larger screens */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 hidden h-full w-1/2 bg-navy-900 lg:block"
        style={{ clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0 100%)" }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:gap-12 lg:py-20">
        {/* Copy */}
        <div className="order-2 lg:order-1">
          <Eyebrow>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {t("eyebrow")}
            </span>
          </Eyebrow>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.1] text-navy sm:text-5xl lg:text-6xl">
            {t("headline")}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-navy-700 sm:text-lg">
            {t("subheadline")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/houses"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-navy-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
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
              className="inline-flex items-center justify-center rounded-full border border-navy-300 px-7 py-3.5 text-sm font-semibold text-navy transition-colors hover:border-gold hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {t("ctaGuide")}
            </button>
          </div>
        </div>

        {/* Portrait */}
        <div className="order-1 lg:order-2">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-navy-900/10 lg:max-w-none">
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
