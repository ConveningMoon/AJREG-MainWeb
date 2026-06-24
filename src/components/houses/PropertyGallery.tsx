"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Home, ZoomIn } from "lucide-react";

type Props = {
  images: string[];
  name: string;
  imageAltPattern: string;
};

export function PropertyGallery({ images, name, imageAltPattern }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const open  = (i: number) => setLightbox(i);
  const close = () => setLightbox(null);

  const prev = useCallback(() =>
    setLightbox((i) => (i !== null ? (i - 1 + images.length) % images.length : 0)),
    [images.length]
  );
  const next = useCallback(() =>
    setLightbox((i) => (i !== null ? (i + 1) % images.length : 0)),
    [images.length]
  );

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape")     close();
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, prev, next]);

  const altFor = (n: number) =>
    imageAltPattern.replace("{name}", name).replace("{n}", String(n + 1));

  if (images.length === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-md bg-linear-to-br from-navy-800 to-slate">
        <Home className="h-16 w-16 text-cream/20" aria-hidden="true" />
      </div>
    );
  }

  const [main, ...extras] = images;
  const thumbs = extras.slice(0, 4);

  return (
    <>
      {/*
        Gallery: 4-col × 2-row grid.
        Main image: col-span-2 row-span-2 (fills top-left 2×2).
        Up to 4 thumbnail slots fill the remaining 4 cells.
        All cells are square. Gap: 15px.
      */}
      <div
        className="grid grid-cols-4 grid-rows-2"
        style={{ gap: "15px" }}
      >
        {/* Main image — 2×2 */}
        <button
          type="button"
          onClick={() => open(0)}
          className="group relative col-span-2 row-span-2 aspect-square overflow-hidden rounded-md bg-navy-800 focus-visible:outline-2 focus-visible:outline-gold"
          aria-label={altFor(0)}
        >
          <Image
            src={main}
            alt={altFor(0)}
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-navy-950/0 opacity-0 transition-all group-hover:bg-navy-950/20 group-hover:opacity-100">
            <ZoomIn className="h-8 w-8 text-white drop-shadow" aria-hidden="true" />
          </div>
        </button>

        {/* Thumbnail slots (up to 4) */}
        {Array.from({ length: 4 }).map((_, idx) => {
          const src = thumbs[idx];
          const isLast = idx === 3 && images.length > 5;
          if (!src) {
            return (
              <div
                key={`empty-${idx}`}
                className="aspect-square rounded-md bg-navy-100"
                aria-hidden="true"
              />
            );
          }
          return (
            <button
              key={src}
              type="button"
              onClick={() => open(idx + 1)}
              className="group relative aspect-square overflow-hidden rounded-md bg-navy-800 focus-visible:outline-2 focus-visible:outline-gold"
              aria-label={isLast ? `View all ${images.length} photos` : altFor(idx + 1)}
            >
              <Image
                src={src}
                alt={altFor(idx + 1)}
                fill
                sizes="(min-width: 1024px) 22vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {isLast && (
                <div className="absolute inset-0 flex items-center justify-center bg-navy-950/65">
                  <span className="font-display text-2xl font-semibold text-cream">
                    +{images.length - 5}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 rounded-full bg-navy-800/80 p-2 text-cream hover:bg-navy-700"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 rounded-full bg-navy-800/80 p-3 text-cream hover:bg-navy-700"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div
            className="relative h-full max-h-[80vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={lightbox}
              src={images[lightbox]}
              alt={altFor(lightbox)}
              fill
              sizes="90vw"
              className="object-contain"
              priority
            />
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 rounded-full bg-navy-800/80 p-3 text-cream hover:bg-navy-700"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-navy-800/80 px-4 py-1.5 text-sm text-cream">
            {lightbox + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
