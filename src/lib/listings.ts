import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { seedListings, type Listing } from "@/data/listings";

function mapRow(r: Record<string, unknown>): Listing {
  const num = (v: unknown, d = 0) => (v == null ? d : Number(v));
  const str = (v: unknown, d = "") => (v == null ? d : String(v));
  const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

  return {
    id: str(r.id ?? r.slug),
    name: str(r.name),
    neighborhood: (r.neighborhood as string) ?? undefined,
    propertyType: (r.property_type ?? r.propertyType) as string | undefined,
    status: (r.status as Listing["status"]) ?? "available",
    priceUsd: num(r.price_usd ?? r.price),
    address: str(r.address),
    city: str(r.city),
    state: (str(r.state, "VA") as Listing["state"]) || "VA",
    sqft: num(r.sqft),
    bedrooms: num(r.bedrooms),
    bathroomsFull: num(r.bathrooms_full ?? r.baths_full),
    bathroomsHalf: num(r.bathrooms_half ?? r.baths_half),
    yearBuilt: r.year_built ? num(r.year_built) : undefined,
    garageSpaces: r.garage_spaces ? num(r.garage_spaces) : undefined,
    lotSqft: r.lot_sqft ? num(r.lot_sqft) : undefined,
    imageUrl: (r.image_url ?? r.imageUrl ?? undefined) as string | undefined,
    gallery: arr(r.gallery),
    description: (r.description as string) ?? undefined,
    features: arr(r.features),
    floorPlanUrl: (r.floor_plan_url ?? r.floorPlanUrl) as string | undefined,
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
