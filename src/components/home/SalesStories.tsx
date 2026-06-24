"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { salesStories } from "@/data/salesStories";

function useCardsPerSlide(): number {
  const [n, setN] = useState(3); // default for SSR
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setN(1);
      else if (window.innerWidth < 1024) setN(2);
      else setN(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return n;
}

export function SalesStories() {
  const t = useTranslations("home.salesStories");
  const cardsPerSlide = useCardsPerSlide();
  const [slide, setSlide] = useState(0);

  const totalSlides = Math.ceil(salesStories.length / cardsPerSlide);

  // Clamp to valid slide when screen resizes
  useEffect(() => {
    setSlide((s) => Math.min(s, Math.ceil(salesStories.length / cardsPerSlide) - 1));
  }, [cardsPerSlide]);

  const go = useCallback(
    (dir: number) => setSlide((s) => Math.max(0, Math.min(totalSlides - 1, s + dir))),
    [totalSlides]
  );

  const visible = salesStories.slice(
    slide * cardsPerSlide,
    (slide + 1) * cardsPerSlide
  );

  return (
    <section className="bg-taupe/15 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-tight text-navy sm:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-navy-700">
              {t("intro")}
            </p>
          </div>

          {/* Prev / Next — top-right on desktop */}
          {totalSlides > 1 && (
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => go(-1)}
                disabled={slide === 0}
                aria-label={t("prev")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-300 bg-white text-navy transition-colors hover:border-navy hover:bg-navy hover:text-cream disabled:opacity-30"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                disabled={slide === totalSlides - 1}
                aria-label={t("next")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-300 bg-white text-navy transition-colors hover:border-navy hover:bg-navy hover:text-cream disabled:opacity-30"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {/* Cards grid — key forces remount + fade animation on slide change */}
        <div
          key={slide}
          className="mt-10 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 motion-safe:animate-[fadeIn_300ms_ease-out]"
          aria-roledescription="carousel"
        >
          {visible.map((story) => (
            <article
              key={story.id}
              className="flex flex-col overflow-hidden rounded-sm bg-white shadow-sm ring-1 ring-navy-900/8"
            >
              {/* Vertical video placeholder — 9:16 */}
              <div className="relative flex items-center justify-center bg-linear-to-br from-navy-800 to-slate"
                   style={{ aspectRatio: "9 / 16" }}>
                {/* Dot pattern for depth */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage: "radial-gradient(circle, #fff7f5 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                  aria-hidden="true"
                />

                <button
                  type="button"
                  aria-label={`${t("familyLabel", { name: story.family })} story`}
                  className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gold text-navy-950 shadow-xl transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
                >
                  <Play className="ml-1 h-7 w-7" fill="currentColor" aria-hidden="true" />
                </button>

                <span className="absolute bottom-4 left-4 font-display text-lg font-medium text-cream drop-shadow-sm">
                  {t("familyLabel", { name: story.family })}
                </span>
              </div>

              {/* Quote + CTA */}
              <div className="flex flex-1 flex-col p-5">
                <p className="flex-1 text-sm leading-relaxed text-navy-700">
                  &ldquo;{story.quote}&rdquo;
                </p>
                <Link
                  href="/houses"
                  className="group mt-5 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-navy transition-colors hover:text-gold"
                >
                  {t("cta")}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Dots + mobile nav */}
        {totalSlides > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={slide === 0}
              aria-label={t("prev")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-navy-300 bg-white text-navy transition-colors hover:border-navy hover:bg-navy hover:text-cream disabled:opacity-30 sm:hidden"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSlide(i)}
                  aria-label={t("goTo", { n: i + 1 })}
                  aria-current={i === slide ? "true" : undefined}
                  className={`h-2.5 rounded-full transition-all ${
                    i === slide ? "w-7 bg-navy" : "w-2.5 bg-navy-300 hover:bg-navy-500"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => go(1)}
              disabled={slide === totalSlides - 1}
              aria-label={t("next")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-navy-300 bg-white text-navy transition-colors hover:border-navy hover:bg-navy hover:text-cream disabled:opacity-30 sm:hidden"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
