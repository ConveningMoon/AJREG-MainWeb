import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { teamSlugs } from "@/data/team";
import { getTeamMember } from "@/lib/team";
import { TeamMemberProfile } from "@/components/team/TeamMemberProfile";

// Refresh from Supabase at most hourly (falls back to seed if unreachable).
export const revalidate = 3600;

// Pre-render the four team profiles at build time.
export function generateStaticParams() {
  return teamSlugs.map((slug) => ({ slug }));
}

export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const member = await getTeamMember(slug);
  if (!member) notFound();

  return <TeamMemberProfile member={member} />;
}
