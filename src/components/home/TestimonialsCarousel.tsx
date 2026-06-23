"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { testimonials } from "@/data/testimonials";

const avatarColors = [
  "bg-gold text-navy-950",
  "bg-slate text-cream",
  "bg-blush text-navy-900",
  "bg-navy-700 text-cream",
  "bg-gold/70 text-navy-950",
  "bg-taupe text-cream",
];

export function TestimonialsCarousel() {
  const t = useTranslations("home.testimonials");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count]
  );

  useEffect(() => {
    if (paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => go(1), 6500);
    return () => clearInterval(id);
  }, [paused, go]);

  const active = testimonials[index];
  const colorClass = avatarColors[index % avatarColors.length];

  return (
    <section className="bg-navy-950 py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="flex flex-col items-center text-center">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-tight text-cream sm:text-5xl">
            {t("title")}
          </h2>
        </div>

        <div
          className="relative mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          aria-roledescription="carousel"
        >
          <div className="relative overflow-hidden rounded-2xl bg-navy-800 p-8 sm:p-12">
            {/* Decorative quote mark */}
            <Quote
              className="absolute -top-1 left-5 h-16 w-16 rotate-180 text-gold/10"
              aria-hidden="true"
            />

            <div
              key={active.id}
              className="relative motion-safe:animate-[fadeIn_350ms_ease-out]"
            >
              {/* Attribution at top — avatar prominent */}
              <div className="mb-8 flex flex-col items-center gap-4">
                <span
                  className={`flex h-20 w-20 items-center justify-center rounded-full font-display text-2xl font-semibold shadow-lg ${colorClass}`}
                  aria-hidden="true"
                >
                  {active.family.charAt(0)}
                </span>
                <div className="text-center">
                  <p className="font-display text-lg font-semibold text-cream">
                    {t("familyLabel", { name: active.family })}
                  </p>
                  </div>
              </div>

              {/* Quote */}
              <blockquote className="text-center">
                <p className="text-base leading-relaxed text-navy-200 sm:text-lg">
                  &ldquo;{active.quote}&rdquo;
                </p>
              </blockquote>
            </div>
          </div>

          {/* Prev/Next buttons */}
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={t("prev")}
            className="absolute -left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-navy-800 p-2.5 text-cream shadow-md ring-1 ring-gold/20 transition-colors hover:bg-navy-700 sm:-left-5 sm:block"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={t("next")}
            className="absolute -right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-navy-800 p-2.5 text-cream shadow-md ring-1 ring-gold/20 transition-colors hover:bg-navy-700 sm:-right-5 sm:block"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Dots */}
        <div className="mt-8 flex items-center justify-center gap-2.5">
          {testimonials.map((tm, i) => (
            <button
              key={tm.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={t("goTo", { n: i + 1 })}
              aria-current={i === index ? "true" : undefined}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-7 bg-gold" : "w-2.5 bg-navy-600 hover:bg-navy-500"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
