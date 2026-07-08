import "server-only";
import { seedTeam, teamSlugs, type TeamMember } from "@/data/team";

// Team members are static site content. They previously lived in the AJREG
// Supabase project (now retired); the ITMANO CRM — the current data source for
// listings — models team members as tenant `agents`, which are not exposed to
// the anon role. Per the migration plan, the team is served straight from the
// typed seed in `@/data/team`, keeping the canonical order from `teamSlugs`.
const slugOrder = teamSlugs as readonly string[];

export async function getTeamMembers(): Promise<TeamMember[]> {
  return [...seedTeam].sort(
    (a, b) => slugOrder.indexOf(a.slug) - slugOrder.indexOf(b.slug),
  );
}

export async function getTeamMember(slug: string): Promise<TeamMember | null> {
  return seedTeam.find((m) => m.slug === slug) ?? null;
}
