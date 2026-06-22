“use client”;

import { useCallback, useEffect, useState } from “react”;
import { useTranslations } from “next-intl”;
import { ChevronLeft, ChevronRight } from “lucide-react”;
import { Eyebrow } from “@/components/ui/Eyebrow”;
import { testimonials } from “@/data/testimonials”;

export function TestimonialsCarousel() {
  const t = useTranslations(“home.testimonials”);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count]
  );

  useEffect(() => {
    if (paused) return;
    if (
      typeof window !== “undefined” &&
      window.matchMedia(“(prefers-reduced-motion: reduce)”).matches
    )
      return;
    const id = setInterval(() => go(1), 6500);
    return () => clearInterval(id);
  }, [paused, go]);

  const active = testimonials[index];

  return (
    <section className=”bg-navy-950 py-16 lg:py-24”>
      <div className=”mx-auto max-w-4xl px-6”>
        <div className=”flex flex-col items-center text-center”>
          <Eyebrow>{t(“eyebrow”)}</Eyebrow>
          <h2 className=”mt-5 font-display text-4xl font-semibold leading-tight text-cream sm:text-5xl”>
            {t(“title”)}
          </h2>
        </div>

        <div
          className=”relative mt-12”
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          aria-roledescription=”carousel”
        >
          <div className=”relative overflow-hidden rounded-sm bg-navy-800 p-8 sm:p-12”>
            {/* Decorative large quote mark */}
            <span
              aria-hidden=”true”
              className=”pointer-events-none select-none absolute -top-2 left-4 font-display text-[12rem] leading-none text-gold/8”
            >
              &ldquo;
            </span>

            <div
              key={active.id}
              className=”relative motion-safe:animate-[fadeIn_350ms_ease-out]”
            >
              <blockquote className=”mt-4 flex min-h-[7rem] items-center justify-center text-center text-xl leading-relaxed text-cream sm:text-2xl”>
                <p>”{active.quote}”</p>
              </blockquote>
              <div className=”mt-8 flex flex-col items-center gap-3”>
                <span
                  className=”flex h-14 w-14 items-center justify-center rounded-full bg-gold font-display text-xl font-semibold text-navy-950”
                  aria-hidden=”true”
                >
                  {active.family.charAt(0)}
                </span>
                <p className=”font-display text-base font-semibold text-cream”>
                  {t(“familyLabel”, { name: active.family })}
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <button
            type=”button”
            onClick={() => go(-1)}
            aria-label={t(“prev”)}
            className=”absolute -left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-navy-800 p-2.5 text-cream shadow-md ring-1 ring-gold/20 transition-colors hover:bg-navy-700 sm:-left-5 sm:block”
          >
            <ChevronLeft className=”h-5 w-5” aria-hidden=”true” />
          </button>
          <button
            type=”button”
            onClick={() => go(1)}
            aria-label={t(“next”)}
            className=”absolute -right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-navy-800 p-2.5 text-cream shadow-md ring-1 ring-gold/20 transition-colors hover:bg-navy-700 sm:-right-5 sm:block”
          >
            <ChevronRight className=”h-5 w-5” aria-hidden=”true” />
          </button>
        </div>

        {/* Dots */}
        <div className=”mt-8 flex items-center justify-center gap-2.5”>
          {testimonials.map((tm, i) => (
            <button
              key={tm.id}
              type=”button”
              onClick={() => setIndex(i)}
              aria-label={t(“goTo”, { n: i + 1 })}
              aria-current={i === index ? “true” : undefined}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? “w-6 bg-gold” : “w-2.5 bg-navy-600 hover:bg-navy-500”
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
