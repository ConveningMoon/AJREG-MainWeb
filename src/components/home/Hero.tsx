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
    <section className="relative flex min-h-[88vh] flex-col items-center justify-end overflow-hidden bg-navy-950">
      {/* Layer 1: Scenic background (base / fallback) */}
      <Image
        src="/images/main_hero_background.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
        aria-hidden="true"
      />

      {/* Layer 2: Team portrait fills the entire section */}
      <Image
        src="/images/Team_Portrait_2.webp"
        alt={t("portraitAlt")}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Layer 3: Gradient overlay — heavy at bottom for text legibility */}
      <div className="absolute inset-0 bg-linear-to-t from-navy-950 via-navy-950/55 to-navy-950/10" />
      {/* <div className="absolute inset-0 bg-linear-to-t from-white to-transparent" /> */}

      {/* Side vignette for depth */}
      <div className="absolute inset-0 bg-linear-to-r from-navy-950/40 via-transparent to-navy-950/40" />

      {/* Layer 4: Text block — center bottom */}
      <div className="relative w-full">
        <div className="mx-auto max-w-3xl px-1 pb-20 text-center">
          <div
            className="motion-safe:animate-[slideUp_500ms_ease-out_both]"
            style={{ animationDelay: "0ms" }}
          >
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
              fontSize: "clamp(2.75rem, 6vw, 6.5rem)",
              animationDelay: "150ms",
            }}
          >
            {t("headline")}
          </h1>

          <p
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-navy-200 sm:text-lg motion-safe:animate-[slideUp_550ms_ease-out_both]"
            style={{ animationDelay: "350ms" }}
          >
            {t("subheadline")}
          </p>

          <div
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center motion-safe:animate-[slideUp_500ms_ease-out_both]"
            style={{ animationDelay: "550ms" }}
          >
            <Link
              href="/houses"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-gold px-7 py-3.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
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
              className="inline-flex items-center justify-center rounded-md border border-gold/60 px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-gold/10 hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {t("ctaGuide")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
