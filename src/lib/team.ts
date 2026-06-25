import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { seedTeam, teamSlugs, type TeamMember } from "@/data/team";

const slugOrder = teamSlugs as readonly string[];

const seedBySlug = Object.fromEntries(seedTeam.map((m) => [m.slug, m]));

// Maps a Supabase `team` row to the UI `TeamMember` contract.
// Falls back to seed values for photo URLs when the DB row has none, so
// locally hosted images always show while Supabase is being populated.
function mapRow(r: Record<string, unknown>): TeamMember {
  const str = (v: unknown, d = "") => (v == null ? d : String(v));
  const langs = Array.isArray(r.languages)
    ? (r.languages as string[]).filter((l): l is TeamMember["languages"][number] =>
        l === "en" || l === "es" || l === "pt"
      )
    : [];
  const slug = str(r.slug ?? r.id);
  const seed = seedBySlug[slug];
  return {
    slug,
    name: str(r.name),
    role: str(r.role),
    languages: langs,
    shortBio: str(r.short_bio ?? r.shortBio),
    fullBio: (r.full_bio ?? r.fullBio ?? undefined) as string | undefined,
    photoUrl:    (r.photo_url    ?? r.photoUrl    ?? seed?.photoUrl    ?? undefined) as string | undefined,
    bioPhotoUrl: (r.bio_photo_url ?? r.bioPhotoUrl ?? seed?.bioPhotoUrl ?? undefined) as string | undefined,
  };
}

/**
 * Returns team members. Reads from the Supabase `team` table and falls back to
 * the static seed if the table is missing, empty, or unreachable — so the team
 * pages always render while the database is being populated. Results keep the
 * canonical order defined in `teamSlugs`.
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from("team").select("*");
    if (error || !data || data.length === 0) return seedTeam;
    return data
      .map(mapRow)
      .sort((a, b) => slugOrder.indexOf(a.slug) - slugOrder.indexOf(b.slug));
  } catch {
    return seedTeam;
  }
}

export async function getTeamMember(slug: string): Promise<TeamMember | null> {
  const members = await getTeamMembers();
  return members.find((m) => m.slug === slug) ?? null;
}
