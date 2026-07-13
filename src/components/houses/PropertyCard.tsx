"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Bed, Bath, Maximize2, MapPin, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Listing } from "@/data/listings";

const priceFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

// Same status → color mapping used on the detail page, so the badge is
// consistent wherever a listing appears.
const STATUS_BADGE_COLORS: Record<string, string> = {
  available: "bg-gold text-navy-950",
  pending:   "bg-amber-100 text-amber-800",
  sold:      "bg-navy-100 text-navy-700",
};

export function PropertyCard({ listing }: { listing: Listing }) {
  const t = useTranslations("houses.card");
  const tDetail = useTranslations("houses.detail");
  const cursorRef = useRef<HTMLSpanElement>(null);
  const [cursorVisible, setCursorVisible] = useState(false);
  const baths = listing.bathroomsFull + (listing.bathroomsHalf > 0 ? 0.5 : 0);
  const bathsLabel = Number.isInteger(baths) ? String(baths) : baths.toFixed(1);
  const statusKey = listing.status ?? "available";
  const statusLabel = statusKey === "available" ? t("forSale") : tDetail(statusKey as "pending" | "sold");

  // Custom cursor bubble: positioned directly via the DOM on mousemove so the
  // card doesn't re-render on every pixel of movement.
  const onMediaMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    const rect = e.currentTarget.getBoundingClientRect();
    cursor.style.left = `${e.clientX - rect.left}px`;
    cursor.style.top = `${e.clientY - rect.top}px`;
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy-900/8 transition-shadow hover:shadow-xl">
      {/* Media — clicking goes to detail page */}
      <Link
        href={`/houses/${listing.id}`}
        onMouseMove={onMediaMouseMove}
        onMouseEnter={() => setCursorVisible(true)}
        onMouseLeave={() => setCursorVisible(false)}
        className="relative block aspect-4/3 overflow-hidden bg-linear-to-br from-navy-800 to-slate lg:cursor-none"
      >
        {listing.imageUrl ? (
          <Image
            src={listing.imageUrl}
            alt={listing.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-14 w-14 text-cream/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M3 9.75L12 3l9 6.75V21H3V9.75z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 21V12h6v9" />
            </svg>
          </div>
        )}
        <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${STATUS_BADGE_COLORS[statusKey]}`}>
          {statusLabel}
        </span>
        {/* Cursor-follow "view" bubble (desktop hover only) */}
        <span
          ref={cursorRef}
          aria-hidden="true"
          className={`pointer-events-none absolute z-10 hidden -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-gold/95 text-navy-950 shadow-lg shadow-navy-950/30 backdrop-blur-sm transition-[opacity,scale] duration-200 lg:flex h-16 w-16 ${
            cursorVisible ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <ArrowUpRight className="h-5 w-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">{t("viewLabel")}</span>
        </span>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <p className="font-display text-3xl font-semibold text-navy">
          {priceFmt.format(listing.priceUsd)}
        </p>
        <Link href={`/houses/${listing.id}`} className="mt-1 hover:text-gold transition-colors">
          <h3 className="font-display text-lg font-semibold text-navy">
            {listing.name}
          </h3>
        </Link>
        <p className="mt-1 inline-flex items-start gap-1.5 text-sm text-navy-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
          {listing.address}, {listing.city}, {listing.state}
        </p>

        {/* Specs row */}
        <div className="mt-4 flex items-center gap-4 border-t border-navy-100 pt-4 text-sm text-navy-500">
          <span className="inline-flex items-center gap-1">
            <Bed className="h-4 w-4 text-gold/80" aria-hidden="true" />
            {t("beds", { count: listing.bedrooms })}
          </span>
          <span className="inline-flex items-center gap-1">
            <Bath className="h-4 w-4 text-gold/80" aria-hidden="true" />
            {t("baths", { count: bathsLabel })}
          </span>
          <span className="inline-flex items-center gap-1">
            <Maximize2 className="h-4 w-4 text-gold/80" aria-hidden="true" />
            {t("sqft", { count: listing.sqft.toLocaleString("en-US") })}
          </span>
        </div>

        <Link
          href={`/houses/${listing.id}`}
          className="mt-5 inline-flex self-start rounded-xl border border-navy-300 px-4 py-2 text-sm font-semibold text-navy transition-colors hover:border-gold hover:bg-gold hover:text-navy-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {t("viewDetails")}
        </Link>
      </div>
    </article>
  );
}
