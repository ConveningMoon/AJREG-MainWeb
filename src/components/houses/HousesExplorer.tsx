"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { SlidersHorizontal, X } from "lucide-react";
import type { Listing, ListingStatus } from "@/data/listings";
import { PropertyCard } from "./PropertyCard";

const STATUS_OPTIONS = ["available", "pending", "sold"] as const;
const BED_OPTIONS = [1, 2, 3, 4] as const;

const PRICE_RANGES = [
  { id: "priceUnder200", min: 0, max: 200_000 },
  { id: "price200to300", min: 200_000, max: 300_000 },
  { id: "price300to400", min: 300_000, max: 400_000 },
  { id: "priceOver400", min: 400_000, max: Infinity },
] as const;

type PriceRangeId = (typeof PRICE_RANGES)[number]["id"];

const selectClass =
  "rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm font-medium text-navy transition-colors hover:border-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

export function HousesExplorer({ listings }: { listings: Listing[] }) {
  const t = useTranslations("houses");
  const [status, setStatus] = useState<"all" | ListingStatus>("all");
  const [city, setCity] = useState("all");
  const [minBeds, setMinBeds] = useState(0);
  const [price, setPrice] = useState<"all" | PriceRangeId>("all");

  const cities = useMemo(
    () => Array.from(new Set(listings.map((l) => l.city))).sort(),
    [listings]
  );

  const filtered = useMemo(
    () =>
      listings.filter((l) => {
        if (status !== "all" && (l.status ?? "available") !== status) return false;
        if (city !== "all" && l.city !== city) return false;
        if (minBeds > 0 && l.bedrooms < minBeds) return false;
        if (price !== "all") {
          const range = PRICE_RANGES.find((r) => r.id === price)!;
          if (l.priceUsd < range.min || l.priceUsd >= range.max) return false;
        }
        return true;
      }),
    [listings, status, city, minBeds, price]
  );

  const hasActiveFilters =
    status !== "all" || city !== "all" || minBeds > 0 || price !== "all";

  const clearFilters = () => {
    setStatus("all");
    setCity("all");
    setMinBeds(0);
    setPrice("all");
  };

  const statusLabel = (s: ListingStatus) =>
    s === "available" ? t("detail.available") : t(`detail.${s}`);

  if (listings.length === 0) {
    return (
      <p className="rounded-2xl bg-blush/40 px-6 py-12 text-center text-navy-700">
        {t("empty")}
      </p>
    );
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy-900/8">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-navy">
          <SlidersHorizontal className="h-4 w-4 text-gold" aria-hidden="true" />
          {t("filters.title")}
        </span>

        {/* Status pills */}
        <div
          role="group"
          aria-label={t("filters.statusLabel")}
          className="flex flex-wrap items-center gap-1.5"
        >
          <button
            type="button"
            onClick={() => setStatus("all")}
            aria-pressed={status === "all"}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              status === "all"
                ? "bg-navy text-cream"
                : "bg-navy-100/60 text-navy-600 hover:bg-navy-100"
            }`}
          >
            {t("filters.all")}
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              aria-pressed={status === s}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                status === s
                  ? "bg-gold text-navy-950"
                  : "bg-navy-100/60 text-navy-600 hover:bg-navy-100"
              }`}
            >
              {statusLabel(s)}
            </button>
          ))}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            aria-label={t("filters.cityLabel")}
            className={selectClass}
          >
            <option value="all">{t("filters.allCities")}</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={minBeds}
            onChange={(e) => setMinBeds(Number(e.target.value))}
            aria-label={t("filters.bedsLabel")}
            className={selectClass}
          >
            <option value={0}>{t("filters.anyBeds")}</option>
            {BED_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {t("filters.bedsPlus", { count: n })}
              </option>
            ))}
          </select>

          <select
            value={price}
            onChange={(e) => setPrice(e.target.value as "all" | PriceRangeId)}
            aria-label={t("filters.priceLabel")}
            className={selectClass}
          >
            <option value="all">{t("filters.anyPrice")}</option>
            {PRICE_RANGES.map((r) => (
              <option key={r.id} value={r.id}>
                {t(`filters.${r.id}`)}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-semibold text-navy-500 transition-colors hover:text-navy"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              {t("filters.clear")}
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="mb-5 text-sm text-navy-500" aria-live="polite">
        {t("filters.results", { count: filtered.length })}
      </p>

      {/* Grid / empty state */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-blush/40 px-6 py-12 text-center">
          <p className="text-navy-700">{t("filters.noResults")}</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 rounded-xl border border-navy-300 px-4 py-2 text-sm font-semibold text-navy transition-colors hover:border-gold hover:bg-gold hover:text-navy-950"
          >
            {t("filters.clear")}
          </button>
        </div>
      ) : (
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => (
            <PropertyCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
