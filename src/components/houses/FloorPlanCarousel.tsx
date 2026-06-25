"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";

type Props = {
  images: string[];
  name: string;
  altPattern: string;
  placeholder: string;
};

export function FloorPlanCarousel({ images, name, altPattern, placeholder }: Props) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const total = images.length;
  const hasMultiple = total > 1;

  const prev = useCallback(
    () => setCurrent((i) => (i - 1 + total) % total),
    [total]
  );
  const next = useCallback(
    () => setCurrent((i) => (i + 1) % total),
    [total]
  );

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape")     setLightbox(false);
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, prev, next]);

  const altFor = (n: number) =>
    altPattern.replace("{name}", name).replace("{n}", String(n + 1));

  if (total === 0) {
    return (
      <div className="mt-4 flex h-40 items-center justify-center rounded-xl bg-blush/40 text-sm text-navy-500">
        {placeholder}
      </div>
    );
  }

  return (
    <>
      {/* Main viewer */}
      <div className="mt-4 overflow-hidden rounded-xl bg-navy-50 ring-1 ring-navy-900/5">
        <div className="relative">
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="group relative block w-full"
            aria-label={altFor(current)}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                key={current}
                src={images[current]}
                alt={altFor(current)}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-contain transition-opacity duration-300"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-navy-950/0 opacity-0 transition-all group-hover:bg-navy-950/15 group-hover:opacity-100 rounded-xl">
              <Maximize2 className="h-7 w-7 text-white drop-shadow" aria-hidden="true" />
            </div>
          </button>

          {/* Prev / Next arrows */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous floor plan"
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md text-navy-700 transition hover:bg-white hover:text-gold"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next floor plan"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md text-navy-700 transition hover:bg-white hover:text-gold"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {/* Dots + counter */}
        {hasMultiple && (
          <div className="flex items-center justify-center gap-3 border-t border-navy-100 py-3">
            <div className="flex items-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  aria-label={altFor(i)}
                  aria-current={i === current ? "true" : undefined}
                  className={`h-2 rounded-full transition-all ${
                    i === current ? "w-6 bg-navy" : "w-2 bg-navy-300 hover:bg-navy-500"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-navy-500 tabular-nums">
              {current + 1}/{total}
            </span>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Floor plan viewer"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 rounded-full bg-navy-800/80 p-2 text-cream hover:bg-navy-700"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {hasMultiple && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 rounded-full bg-navy-800/80 p-3 text-cream hover:bg-navy-700"
              aria-label="Previous floor plan"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <div
            className="relative h-full max-h-[85vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={`lb-${current}`}
              src={images[current]}
              alt={altFor(current)}
              fill
              sizes="90vw"
              className="object-contain"
              priority
            />
          </div>

          {hasMultiple && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 rounded-full bg-navy-800/80 p-3 text-cream hover:bg-navy-700"
              aria-label="Next floor plan"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-navy-800/80 px-4 py-1.5 text-sm text-cream tabular-nums">
            {current + 1} / {total}
          </div>
        </div>
      )}
    </>
  );
}
