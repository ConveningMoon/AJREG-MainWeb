import type { MetadataRoute } from "next";
import { teamSlugs } from "@/data/team";
import { seedListings } from "@/data/listings";
import { agentResources } from "@/data/resources";
import { getEditions } from "@/lib/newsletter";

const SITE_URL = "https://ajrealestateva.com";
const locales  = ["en", "es"] as const;

function localizedEntries(
  path: string,
  opts: { changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"]; priority?: number } = {}
): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    lastModified: new Date(),
    changeFrequency: opts.changeFrequency ?? ("monthly" as const),
    priority: opts.priority ?? 0.7,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}/${l}${path}`])
      ),
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    ...localizedEntries("",           { changeFrequency: "weekly",   priority: 1 }),
    ...localizedEntries("/houses",    { changeFrequency: "weekly",   priority: 0.9 }),
    ...localizedEntries("/contact-us",{ changeFrequency: "monthly",  priority: 0.8 }),
    ...localizedEntries("/newsletter",{ changeFrequency: "weekly",   priority: 0.8 }),
    ...localizedEntries("/check-in",  { changeFrequency: "yearly",   priority: 0.3 }),
  ];

  // Published editions live in the CRM, so the list is read at build/revalidate
  // time; getEditions() returns [] if the read fails and the sitemap still
  // ships the rest of the site.
  const editionRoutes = (await getEditions()).flatMap((edition) =>
    localizedEntries(`/newsletter/${edition.slug}`, {
      changeFrequency: "monthly",
      priority: 0.6,
    })
  );

  const listingRoutes = seedListings.flatMap((l) =>
    localizedEntries(`/houses/${l.id}`, { changeFrequency: "weekly", priority: 0.85 })
  );

  const teamRoutes = teamSlugs.flatMap((slug) =>
    localizedEntries(`/team/${slug}`, { changeFrequency: "monthly", priority: 0.7 })
  );

  const resourceRoutes = agentResources.flatMap((r) =>
    localizedEntries(`/resources/${r.slug}`, { changeFrequency: "monthly", priority: 0.6 })
  );

  return [...staticRoutes, ...listingRoutes, ...teamRoutes, ...resourceRoutes, ...editionRoutes];
}
