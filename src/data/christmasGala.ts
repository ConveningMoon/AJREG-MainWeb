// Gala Christmas Party 2026 — sponsor campaign facts.
// Single source of truth for dates, tiers and prices; every visible string
// lives in messages/*.json under `christmasGala`.

export const galaEvent = {
  // Saturday, December 5, 2026 · 7:00–11:00 PM Eastern (EST, UTC-5).
  startsAt: "2026-12-05T19:00:00-05:00",
  endsAt: "2026-12-05T23:00:00-05:00",
  // Sponsor applications close one week before the event.
  sponsorDeadline: "2026-11-28T23:59:59-05:00",
  venueName: "The Royal Courtyard at West Neck",
  venueStreet: "3100 Arnold Palmer Dr",
  venueCity: "Virginia Beach, VA 23456",
  venueMapUrl:
    "https://www.google.com/maps/search/?api=1&query=3100+Arnold+Palmer+Dr+Virginia+Beach+VA+23456",
  expectedGuests: 100,
} as const;

export const sponsorTierIds = ["gold", "silver", "bronze", "community"] as const;
export type SponsorTierId = (typeof sponsorTierIds)[number];

// Benefit keys resolve to `christmasGala.benefits.<key>` in i18n.
export type SponsorBenefit =
  | "logoPremium"
  | "logoMaterials"
  | "logoRotation"
  | "tablePremium"
  | "table"
  | "videoDedicated"
  | "videoShort"
  | "videoProduced"
  | "talkLong"
  | "talkShort"
  | "raffle"
  | "socialSpotlight"
  | "recognition"
  | "recognitionMaterials";

export type SponsorTier = {
  id: SponsorTierId;
  priceUsd: number;
  tickets: number;
  hasTable: boolean;
  // Video shot and edited by the A&J team for the venue screens ($750+).
  videoProduction: boolean;
  // Display-only scarcity count. There is no real cap today — the client asked
  // for a visible number per tier to keep momentum. Change it here when needed.
  spotsLeft: number;
  benefits: SponsorBenefit[];
};

export const sponsorTiers: SponsorTier[] = [
  {
    id: "gold",
    priceUsd: 2000,
    tickets: 7,
    hasTable: true,
    videoProduction: true,
    spotsLeft: 2,
    benefits: [
      "logoPremium",
      "tablePremium",
      "videoDedicated",
      "talkLong",
      "raffle",
      "socialSpotlight",
    ],
  },
  {
    id: "silver",
    priceUsd: 1250,
    tickets: 5,
    hasTable: true,
    videoProduction: true,
    spotsLeft: 3,
    benefits: ["logoMaterials", "table", "videoShort", "talkShort", "raffle", "recognition"],
  },
  {
    id: "bronze",
    priceUsd: 750,
    tickets: 3,
    hasTable: true,
    videoProduction: true,
    spotsLeft: 4,
    benefits: ["logoRotation", "table", "videoProduced", "raffle", "recognition"],
  },
  {
    id: "community",
    priceUsd: 350,
    tickets: 0,
    hasTable: false,
    videoProduction: false,
    spotsLeft: 6,
    benefits: ["logoRotation", "recognitionMaterials"],
  },
];

export const getSponsorTier = (id: SponsorTierId) =>
  sponsorTiers.find((tier) => tier.id === id)!;

export const formatUsd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
