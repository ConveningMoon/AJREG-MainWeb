"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Home, ZoomIn } from "lucide-react";

type Props = {
  images: string[];
  name: string;
  imageAltPattern: string; // "{name} — photo {n}"
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
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, prev, next]);

  const altFor = (n: number) =>
    imageAltPattern.replace("{name}", name).replace("{n}", String(n + 1));

  const hasImages = images.length > 0;

  if (!hasImages) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-linear-to-br from-navy-800 to-slate">
        <Home className="h-16 w-16 text-cream/20" aria-hidden="true" />
      </div>
    );
  }

  const [main, ...thumbs] = images;

  return (
    <>
      {/* Gallery grid */}
      <div className="grid gap-2 sm:grid-cols-[2fr_1fr]">
        {/* Main image */}
        <button
          type="button"
          onClick={() => open(0)}
          className="group relative aspect-video overflow-hidden rounded-2xl bg-navy-800 focus-visible:outline-2 focus-visible:outline-gold"
          aria-label={altFor(0)}
        >
          <Image
            src={main}
            alt={altFor(0)}
            fill
            priority
            sizes="(min-width: 768px) 60vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <ZoomIn className="h-8 w-8 text-white drop-shadow" aria-hidden="true" />
          </div>
        </button>

        {/* Thumbnails column */}
        {thumbs.length > 0 && (
          <div className="grid grid-rows-2 gap-2">
            {thumbs.slice(0, 2).map((src, idx) => {
              const isLast = idx === 1 && images.length > 3;
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => open(idx + 1)}
                  className="group relative overflow-hidden rounded-2xl bg-navy-800 focus-visible:outline-2 focus-visible:outline-gold"
                  aria-label={isLast ? `View all ${images.length} photos` : altFor(idx + 1)}
                >
                  <Image
                    src={src}
                    alt={altFor(idx + 1)}
                    fill
                    sizes="(min-width: 768px) 28vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {isLast && (
                    <div className="absolute inset-0 flex items-center justify-center bg-navy-950/60">
                      <span className="font-semibold text-cream text-lg">+{images.length - 3}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
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
            className="absolute left-4 rounded-full bg-navy-800/80 p-3 text-cream hover:bg-navy-700 disabled:opacity-30"
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

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-navy-800/80 px-4 py-1.5 text-sm text-cream">
            {lightbox + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
