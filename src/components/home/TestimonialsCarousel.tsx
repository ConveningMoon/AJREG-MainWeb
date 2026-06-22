"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { testimonials } from "@/data/testimonials";

export function TestimonialsCarousel() {
  const t = useTranslations("home.testimonials");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count]
  );

  // Gentle autoplay; respects reduced-motion and pauses on hover/focus.
  useEffect(() => {
    if (paused) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const id = setInterval(() => go(1), 6500);
    return () => clearInterval(id);
  }, [paused, go]);

  const active = testimonials[index];

  return (
    <section className="bg-cream py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="flex flex-col items-center text-center">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="mt-5 font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">
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
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-navy-900/5 sm:p-12">
            <Quote
              className="mx-auto h-10 w-10 text-blush"
              aria-hidden="true"
              fill="currentColor"
            />
            <div
              key={active.id}
              className="motion-safe:animate-[fadeIn_350ms_ease-out]"
            >
              <blockquote className="mt-6 flex min-h-[7rem] items-center justify-center text-center text-lg leading-relaxed text-navy-800 sm:text-xl">
                <p>“{active.quote}”</p>
              </blockquote>
              <div className="mt-8 flex flex-col items-center gap-3">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-navy-700 to-slate font-display text-xl font-semibold text-cream"
                  aria-hidden="true"
                >
                  {active.family.charAt(0)}
                </span>
                <p className="font-display text-base font-semibold text-navy">
                  {t("familyLabel", { name: active.family })}
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={t("prev")}
            className="absolute -left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white p-2.5 text-navy shadow-md ring-1 ring-navy-900/10 transition-colors hover:bg-navy hover:text-cream sm:-left-5 sm:block"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={t("next")}
            className="absolute -right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white p-2.5 text-navy shadow-md ring-1 ring-navy-900/10 transition-colors hover:bg-navy hover:text-cream sm:-right-5 sm:block"
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
                i === index ? "w-6 bg-gold" : "w-2.5 bg-navy-200 hover:bg-navy-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
