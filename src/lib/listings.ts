import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { seedListings, type Listing } from "@/data/listings";

// Listings now come from the ITMANO CRM database (tenant A&J = `tenant-aj`),
// which is the single source of truth. The CRM exposes published properties to
// the anon role with column-level SELECT (migration 047) + an RLS row filter
// (published_to_web = true, migration 045). We therefore SELECT an explicit
// column list — `select("*")` is denied for anon on that table.
const CRM_TENANT_ID = "tenant-aj";

const LISTING_COLUMNS = [
  "id", "slug", "name", "neighborhood", "state", "property_type", "status",
  "list_price", "address", "city", "sqft", "bedrooms",
  "bathrooms_full", "bathrooms_half", "year_built", "garage_spaces", "lot_sqft",
  "description_en", "description_es", "features_en", "features_es",
  "image_url", "gallery", "floor_plans", "detail_pdf_url",
].join(",");

// CRM property_type is a coarse enum; the site shows a friendly label. Seeded
// listings keep their richer label (e.g. "Residential · Detached").
const PROPERTY_TYPE_LABELS: Record<string, string> = {
  residential: "Residential",
  condo: "Condo",
  townhouse: "Townhouse",
  land: "Land",
  commercial: "Commercial",
  multifamily: "Multifamily",
};

// CRM status → site status. The CRM's post-funnel "in_process" maps to "pending".
const STATUS_MAP: Record<string, Listing["status"]> = {
  available: "available",
  in_process: "pending",
  pending: "pending",
  sold: "sold",
};

const seedById = Object.fromEntries(seedListings.map((l) => [l.id, l]));

function mapRow(r: Record<string, unknown>): Listing {
  const num = (v: unknown, d = 0) => (v == null ? d : Number(v));
  const str = (v: unknown, d = "") => (v == null ? d : String(v));
  const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

  // The public URL segment (/houses/<slug>) is the listing id on the site.
  const id = str(r.slug ?? r.id);
  const seed = seedById[id];

  return {
    id,
    name: str(r.name),
    neighborhood:   (r.neighborhood ?? seed?.neighborhood ?? undefined) as string | undefined,
    propertyType:   (seed?.propertyType ?? PROPERTY_TYPE_LABELS[str(r.property_type)] ?? undefined) as string | undefined,
    status:         (STATUS_MAP[str(r.status)] ?? seed?.status ?? "available"),
    priceUsd:       num(r.list_price ?? r.price_usd ?? r.price),
    address:        str(r.address),
    city:           str(r.city),
    state:          (str(r.state, "VA") as Listing["state"]) || "VA",
    sqft:           num(r.sqft),
    bedrooms:       num(r.bedrooms),
    bathroomsFull:  num(r.bathrooms_full),
    bathroomsHalf:  num(r.bathrooms_half),
    yearBuilt:      r.year_built ? num(r.year_built) : seed?.yearBuilt,
    garageSpaces:   r.garage_spaces ? num(r.garage_spaces) : seed?.garageSpaces,
    lotSqft:        r.lot_sqft ? num(r.lot_sqft) : seed?.lotSqft,
    imageUrl:       (r.image_url ?? seed?.imageUrl ?? undefined) as string | undefined,
    gallery:        arr(r.gallery).length ? arr(r.gallery) : (seed?.gallery ?? []),
    description:    (seed?.description ?? undefined) as string | undefined,
    descriptionEn:  (r.description_en ?? seed?.descriptionEn ?? undefined) as string | undefined,
    descriptionEs:  (r.description_es ?? seed?.descriptionEs ?? undefined) as string | undefined,
    features:       (seed?.features ?? []),
    featuresEn:     arr(r.features_en).length ? arr(r.features_en) : (seed?.featuresEn ?? []),
    featuresEs:     arr(r.features_es).length ? arr(r.features_es) : (seed?.featuresEs ?? []),
    floorPlans:     arr(r.floor_plans).length ? arr(r.floor_plans) : (seed?.floorPlans ?? []),
    detailPdfUrl:   (r.detail_pdf_url ?? seed?.detailPdfUrl ?? undefined) as string | undefined,
  };
}

export async function getListings(): Promise<Listing[]> {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("properties")
      .select(LISTING_COLUMNS)
      .eq("tenant_id", CRM_TENANT_ID)
      .eq("published_to_web", true)
      .order("list_price", { ascending: false });

    if (error || !data || data.length === 0) return seedListings;
    return (data as unknown as Record<string, unknown>[]).map(mapRow);
  } catch {
    return seedListings;
  }
}

export async function getListing(id: string): Promise<Listing | null> {
  const listings = await getListings();
  return listings.find((l) => l.id === id) ?? null;
}
