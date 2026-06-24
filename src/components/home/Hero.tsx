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
    <section className="relative flex min-h-[88vh] items-center overflow-hidden bg-navy-950">
      {/* Scenic background */}
      <Image
        src="/images/main_hero_background.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
        aria-hidden="true"
      />
      {/* Strong left-to-right gradient: text side is fully readable, portrait side stays visible */}
      <div className="absolute inset-0 bg-linear-to-r from-navy-950/95 via-navy-950/70 to-navy-950/20" />
      {/* Bottom fade for smooth section transition */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-navy-950/50 to-transparent" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-[1fr_1.25fr] lg:gap-16 lg:py-28">
        {/* Left column — copy */}
        <div>
          <div className="motion-safe:animate-[slideUp_500ms_ease-out_both]">
            <Eyebrow>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {t("eyebrow")}
              </span>
            </Eyebrow>
          </div>

          <h1
            className="mt-5 font-display font-semibold text-cream leading-[0.9] tracking-[-0.03em] motion-safe:animate-[slideUp_650ms_ease-out_both]"
            style={{
              fontSize: "clamp(2.75rem, 5.5vw, 6rem)",
              animationDelay: "150ms",
            }}
          >
            {t("headline")}
          </h1>

          <p
            className="mt-6 max-w-lg text-base leading-relaxed text-navy-200 sm:text-lg motion-safe:animate-[slideUp_550ms_ease-out_both]"
            style={{ animationDelay: "350ms" }}
          >
            {t("subheadline")}
          </p>

          <div
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center motion-safe:animate-[slideUp_500ms_ease-out_both]"
            style={{ animationDelay: "550ms" }}
          >
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

        {/* Right column — team portrait (visible on desktop) */}
        <div
          className="hidden lg:block motion-safe:animate-[fadeIn_700ms_ease-out_both]"
          style={{ animationDelay: "300ms" }}
        >
          <div className="relative w-full overflow-hidden rounded-none shadow-2xl ring-2 ring-gold/25"
               style={{ aspectRatio: "3 / 2" }}>
            <Image
              src="/images/Team_Portrait_2.webp"
              alt={t("portraitAlt")}
              fill
              priority
              sizes="55vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
