/**
 * Team data layer.
 *
 * `TeamMember` is the UI contract. Seeded statically now; in Phase 4 the same
 * shape will be served from Supabase. Full bios must be extracted from the
 * current team pages before launch.
 */
export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  languages: ("en" | "es" | "pt")[];
  shortBio: string;
  fullBio?: string;
  photoUrl?: string;     // square avatar (1:1) — hero circles + cards
  bioPhotoUrl?: string;  // portrait (4:5) — bio section
  videoUrl?: string;     // YouTube URL — default / ES video
  videoUrlEn?: string;   // YouTube URL — EN-specific override
};

export const teamSlugs = [
  "adriana-melendez",
  "john-leonard",
  "viviane-chiu",
  "melany-valencia",
] as const;

export const seedTeam: TeamMember[] = [
  {
    slug: "adriana-melendez",
    name: "Adriana Meléndez",
    role: "Lead Agent",
    languages: ["es", "en"],
    shortBio:
      "Trusted Virginia/North Carolina real estate expert and mother of three.",
    photoUrl:    "/images/avatars/adriana_avatar.webp",
    bioPhotoUrl: "/images/team/adriana_bio.webp",
    videoUrl:    "https://youtu.be/fO5rhnHGeno",
    videoUrlEn:  "https://youtu.be/fMvN5jw4_sI",
  },
  {
    slug: "john-leonard",
    name: "John Leonard",
    role: "Agent",
    languages: ["en"],
    shortBio:
      "Active duty Navy serviceman who brings discipline and strategic precision.",
    photoUrl:    "/images/avatars/jhon_avatar.webp",
    bioPhotoUrl: "/images/team/john_bio.webp",
  },
  {
    slug: "viviane-chiu",
    name: "Viviane Chiu",
    role: "Agent",
    languages: ["en", "es", "pt"],
    shortBio:
      "Civil engineer and multicultural mom offering analytical, trilingual service.",
    photoUrl:    "/images/avatars/viviane_avatar.webp",
    bioPhotoUrl: "/images/team/viviane_bio.webp",
  },
  {
    slug: "melany-valencia",
    name: "Melany Valencia",
    role: "Agent",
    languages: ["es", "en"],
    shortBio:
      "Bilingual new mom bringing fresh energy and understanding of growing families.",
    photoUrl:    "/images/avatars/melany_avatar.webp",
    bioPhotoUrl: "/images/team/melany_bio.webp",
  },
];

/**
 * Finds the team member a newsletter byline refers to, or null.
 *
 * The CRM stores the signature as a plain denormalized string (a snapshot of
 * `agents.name` taken when the edition was signed), not as a slug or an id —
 * `author_agent_id` is deliberately internal and never exposed to `anon`. So
 * the only way back to a profile page is the name, matched against this seed.
 *
 * The comparison strips accents and case on purpose: the CRM row for Adriana
 * reads "Adriana Melendez" while this seed spells it "Adriana Meléndez", and a
 * literal match would silently drop the link for the agent who signs the most.
 *
 * Returns null for anyone not on the public team — an agent who left, or one
 * the site never listed. A byline with no profile is still a valid byline; it
 * just is not a link.
 */
export function teamMemberByName(name: string | null | undefined): TeamMember | null {
  const wanted = normalizeName(name);
  if (!wanted) return null;
  return seedTeam.find((m) => normalizeName(m.name) === wanted) ?? null;
}

function normalizeName(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
