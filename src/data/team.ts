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
    bioPhotoUrl: "/images/team/adriana_bio.png",
  },
  {
    slug: "john-leonard",
    name: "John Leonard",
    role: "Agent",
    languages: ["en"],
    shortBio:
      "Active duty Navy serviceman who brings discipline and strategic precision.",
    photoUrl:    "/images/avatars/jhon_avatar.webp",
    bioPhotoUrl: "/images/team/jhon_bio.png",
  },
  {
    slug: "viviane-chiu",
    name: "Viviane Chiu",
    role: "Agent",
    languages: ["en", "es", "pt"],
    shortBio:
      "Civil engineer and multicultural mom offering analytical, trilingual service.",
    photoUrl:    "/images/avatars/viviane_avatar.webp",
    bioPhotoUrl: "/images/team/viviane_bio.png",
  },
  {
    slug: "melany-valencia",
    name: "Melany Valencia",
    role: "Agent",
    languages: ["es", "en"],
    shortBio:
      "Bilingual new mom bringing fresh energy and understanding of growing families.",
    photoUrl:    "/images/avatars/melany_avatar.webp",
    bioPhotoUrl: "/images/team/melany_bio.png",
  },
];
