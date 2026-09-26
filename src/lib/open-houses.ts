import "server-only";

const CRM_TENANT_ID = "tenant-aj";

const OPEN_HOUSE_COLUMNS = [
  "id",
  "tenant_id",
  "property_id",
  "starts_at",
  "ends_at",
  "timezone",
  "public_notes",
  "rsvp_enabled",
  "status",
  "revision",
  "updated_at",
  "properties(slug,name)",
].join(",");

export type PublicOpenHouse = {
  id: string;
  tenant_id: string;
  property_id: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  public_notes: string | null;
  rsvp_enabled: boolean;
  status: "scheduled" | "cancelled";
  revision: number;
  updated_at: string;
  properties: { slug: string; name: string } | null;
  /** Server observation time used to render the first countdown value. */
  fetched_at: string;
};

type PublicOpenHouseRow = Omit<PublicOpenHouse, "fetched_at">;

function isPublicOpenHouse(value: unknown): value is PublicOpenHouseRow {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.property_id === "string" &&
    typeof row.starts_at === "string" &&
    typeof row.ends_at === "string" &&
    typeof row.timezone === "string" &&
    typeof row.rsvp_enabled === "boolean" &&
    (row.status === "scheduled" || row.status === "cancelled")
  );
}

/**
 * Returns the event visitors should see for one published CRM property.
 *
 * The REST policy is column-scoped, so this deliberately never uses `select=*`.
 * A no-store request keeps cancellations and schedule changes immediately visible;
 * it is stricter than the CRM contract's five-minute maximum cache window.
 */
export async function getOpenHouseForProperty(
  propertyId: string
): Promise<PublicOpenHouse | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return null;

  const query = new URLSearchParams({
    select: OPEN_HOUSE_COLUMNS,
    tenant_id: `eq.${CRM_TENANT_ID}`,
    property_id: `eq.${propertyId}`,
    ends_at: `gt.${new Date().toISOString()}`,
    order: "starts_at.asc",
  });

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/open_houses?${query.toString()}`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) return null;

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) return null;

    const events = payload.filter(isPublicOpenHouse);
    const selected =
      events.find((event) => event.status === "scheduled") ??
      events.find((event) => event.status === "cancelled") ??
      null;

    return selected
      ? { ...selected, fetched_at: new Date().toISOString() }
      : null;
  } catch {
    // Property pages remain available when the CRM endpoint is temporarily down.
    return null;
  }
}
