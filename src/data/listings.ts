/**
 * Property listings data layer.
 *
 * The `Listing` shape is the single contract the UI depends on. Today the data
 * is seeded statically below; in Phase 3 the same shape will be served from a
 * Supabase table (and later, potentially the CRM) without changing any
 * component. Keep field names stable.
 */
export type Listing = {
  id: string;
  name: string;
  priceUsd: number;
  address: string;
  city: string;
  state: "VA" | "NC";
  sqft: number;
  bedrooms: number;
  bathroomsFull: number;
  bathroomsHalf: number;
  imageUrl?: string;
};

// Seed from the current Webflow site (confirm final list before launch).
export const seedListings: Listing[] = [
  {
    id: "oakmont-manor",
    name: "Oakmont Manor",
    priceUsd: 370000,
    address: "3033 Somme Avenue",
    city: "Norfolk",
    state: "VA",
    sqft: 2092,
    bedrooms: 4,
    bathroomsFull: 2,
    bathroomsHalf: 1,
  },
  {
    id: "westfield-house-locust",
    name: "Westfield House",
    priceUsd: 299900,
    address: "3154 Locust Avenue",
    city: "Norfolk",
    state: "VA",
    sqft: 1206,
    bedrooms: 4,
    bathroomsFull: 2,
    bathroomsHalf: 0,
  },
  {
    id: "westfield-house-central",
    name: "Westfield House",
    priceUsd: 149900,
    address: "307 Central Avenue",
    city: "Suffolk",
    state: "VA",
    sqft: 840,
    bedrooms: 3,
    bathroomsFull: 1,
    bathroomsHalf: 0,
  },
];
