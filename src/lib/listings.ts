import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { seedListings, type Listing } from "@/data/listings";

const seedById = Object.fromEntries(seedListings.map((l) => [l.id, l]));

function mapRow(r: Record<string, unknown>): Listing {
  const num = (v: unknown, d = 0) => (v == null ? d : Number(v));
  const str = (v: unknown, d = "") => (v == null ? d : String(v));
  const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

  const id = str(r.id ?? r.slug);
  const seed = seedById[id];

  return {
    id,
    name: str(r.name),
    neighborhood:   (r.neighborhood  ?? seed?.neighborhood  ?? undefined) as string | undefined,
    propertyType:   ((r.property_type ?? r.propertyType ?? seed?.propertyType) ?? undefined) as string | undefined,
    status:         ((r.status ?? seed?.status ?? "available") as Listing["status"]),
    priceUsd:       num(r.price_usd ?? r.price),
    address:        str(r.address),
    city:           str(r.city),
    state:          (str(r.state, "VA") as Listing["state"]) || "VA",
    sqft:           num(r.sqft),
    bedrooms:       num(r.bedrooms),
    bathroomsFull:  num(r.bathrooms_full ?? r.baths_full),
    bathroomsHalf:  num(r.bathrooms_half ?? r.baths_half),
    yearBuilt:      r.year_built ? num(r.year_built)     : seed?.yearBuilt,
    garageSpaces:   r.garage_spaces ? num(r.garage_spaces) : seed?.garageSpaces,
    lotSqft:        r.lot_sqft ? num(r.lot_sqft)         : seed?.lotSqft,
    imageUrl:       (r.image_url ?? r.imageUrl ?? seed?.imageUrl ?? undefined) as string | undefined,
    gallery:        arr(r.gallery).length  ? arr(r.gallery)  : (seed?.gallery  ?? []),
    description:    (r.description     ?? seed?.description    ?? undefined) as string | undefined,
    descriptionEn:  (r.description_en  ?? seed?.descriptionEn  ?? undefined) as string | undefined,
    descriptionEs:  (r.description_es  ?? seed?.descriptionEs  ?? undefined) as string | undefined,
    features:       arr(r.features).length    ? arr(r.features)    : (seed?.features    ?? []),
    featuresEn:     arr(r.features_en).length ? arr(r.features_en) : (seed?.featuresEn  ?? []),
    featuresEs:     arr(r.features_es).length ? arr(r.features_es) : (seed?.featuresEs  ?? []),
    floorPlanUrl:   ((r.floor_plan_url ?? r.floorPlanUrl ?? seed?.floorPlanUrl) ?? undefined) as string | undefined,
  };
}

export async function getListings(): Promise<Listing[]> {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("price_usd", { ascending: false });

    if (error || !data || data.length === 0) return seedListings;
    return data.map(mapRow);
  } catch {
    return seedListings;
  }
}

export async function getListing(id: string): Promise<Listing | null> {
  const listings = await getListings();
  return listings.find((l) => l.id === id) ?? null;
}
