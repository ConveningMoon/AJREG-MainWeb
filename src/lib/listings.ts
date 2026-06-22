import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { seedListings, type Listing } from "@/data/listings";

// Maps a Supabase `listings` row (snake_case) to the UI `Listing` contract.
// Tolerant of a couple of column-name variants so a minor schema mismatch
// degrades gracefully instead of crashing.
function mapRow(r: Record<string, unknown>): Listing {
  const num = (v: unknown, d = 0) => (v == null ? d : Number(v));
  const str = (v: unknown, d = "") => (v == null ? d : String(v));
  return {
    id: str(r.id ?? r.slug),
    name: str(r.name),
    priceUsd: num(r.price_usd ?? r.price),
    address: str(r.address),
    city: str(r.city),
    state: (str(r.state, "VA") as Listing["state"]) || "VA",
    sqft: num(r.sqft),
    bedrooms: num(r.bedrooms),
    bathroomsFull: num(r.bathrooms_full ?? r.baths_full),
    bathroomsHalf: num(r.bathrooms_half ?? r.baths_half),
    imageUrl: (r.image_url ?? r.imageUrl ?? undefined) as string | undefined,
  };
}

/**
 * Returns property listings. Reads from the Supabase `listings` table and falls
 * back to the static seed if the table is missing, empty, or unreachable — so
 * the page always renders while the database is being populated.
 */
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
