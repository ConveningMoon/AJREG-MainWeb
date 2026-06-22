import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { teamSlugs } from "@/data/team";
import { getTeamMember } from "@/lib/team";
import { TeamMemberProfile } from "@/components/team/TeamMemberProfile";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const [member, t] = await Promise.all([
    getTeamMember(slug),
    getTranslations({ locale, namespace: "meta.team" }),
  ]);
  if (!member) return {};
  const title = t("title", { name: member.name });
  const description = t("description", { name: member.name, role: member.role });
  return {
    title,
    description,
    openGraph: { title, description },
  };
}

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
