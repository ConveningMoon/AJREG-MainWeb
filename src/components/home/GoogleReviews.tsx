"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ExternalLink, Star } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { PlaceReviewData, GoogleReview } from "@/data/googleReviews";

const avatarColors = [
  "bg-gold text-navy-950",
  "bg-slate text-cream",
  "bg-blush text-navy-900",
  "bg-navy-700 text-cream",
  "bg-gold/70 text-navy-950",
];

/* Google "G" colored icon — inline SVG to avoid external network requests */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-gold text-gold" : "fill-transparent text-navy-600"}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function ReviewCard({
  review,
  colorClass,
  verifiedLabel,
}: {
  review: GoogleReview;
  colorClass: string;
  verifiedLabel: string;
}) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-2xl bg-navy-800 p-6 ring-1 ring-white/5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-lg font-semibold shadow-md ${colorClass}`}
            aria-hidden="true"
          >
            {review.author.charAt(0)}
          </span>
          <div>
            <p className="font-semibold leading-tight text-cream">{review.author}</p>
            <p className="mt-0.5 text-xs text-navy-400">{review.relativeTime}</p>
          </div>
        </div>
        <GoogleIcon className="mt-0.5 h-5 w-5 shrink-0" />
      </div>

      {/* Stars */}
      <StarRow rating={review.rating} />

      {/* Text */}
      <p className="line-clamp-4 text-sm leading-relaxed text-navy-200">
        &ldquo;{review.text}&rdquo;
      </p>

      {/* Verified badge */}
      <p className="mt-auto text-xs text-navy-500">{verifiedLabel}</p>
    </article>
  );
}

type Labels = {
  eyebrow: string;
  title: string;
  subtitle: string;
  viewAll: string;
  verifiedLabel: string;
};

type Props = {
  data: PlaceReviewData;
  labels: Labels;
  mapsUrl: string;
};

export function GoogleReviews({ data, labels, mapsUrl }: Props) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Duplicate the set so the -50% translation produces a seamless infinite loop.
  const loop = [...data.reviews, ...data.reviews];

  // Pace the loop by the amount of content so speed feels constant regardless of count.
  const duration = data.reviews.length * 9;

  const colorFor = (review: GoogleReview) =>
    avatarColors[data.reviews.indexOf(review) % avatarColors.length];

  return (
    <section className="overflow-hidden bg-navy-950 py-16 lg:py-24">
      {/* Header */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center text-center">
          <Eyebrow>{labels.eyebrow}</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-tight text-cream sm:text-5xl">
            {labels.title}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-navy-300">
            {labels.subtitle}
          </p>

          {/* Aggregate rating badge */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-navy-800 px-5 py-2.5 text-sm ring-1 ring-white/5">
            <Star className="h-4 w-4 fill-gold text-gold" aria-hidden="true" />
            <span className="font-semibold text-gold">{data.rating}</span>
            <span className="text-navy-500">·</span>
            <span className="text-navy-300">{data.totalReviews} reviews</span>
          </div>
        </div>
      </div>

      {/* Marquee — continuous, infinite right-to-left scroll (full bleed) */}
      <div className="relative mt-12" aria-roledescription="carousel" aria-label={labels.title}>
        {/* Edge fade masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-linear-to-r from-navy-950 to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-linear-to-l from-navy-950 to-transparent sm:w-24" />

        {reduced ? (
          /* Reduced-motion fallback: static responsive grid, no animation */
          <div className="mx-auto grid max-w-6xl gap-5 px-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                colorClass={colorFor(review)}
                verifiedLabel={labels.verifiedLabel}
              />
            ))}
          </div>
        ) : (
          <motion.div
            className="flex w-max gap-5 px-2.5"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration, ease: "linear", repeat: Infinity }}
          >
            {loop.map((review, i) => (
              <div key={`${review.id}-${i}`} className="w-[300px] shrink-0 sm:w-[340px]">
                <ReviewCard
                  review={review}
                  colorClass={colorFor(review)}
                  verifiedLabel={labels.verifiedLabel}
                />
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="mt-10 flex justify-center">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold transition-colors hover:text-gold/80 hover:underline"
          >
            {labels.viewAll}
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
