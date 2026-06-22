import type { MetadataRoute } from "next";
import { teamSlugs } from "@/data/team";
import { seedListings } from "@/data/listings";
import { agentResources } from "@/data/resources";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    ...localizedEntries("",           { changeFrequency: "weekly",   priority: 1 }),
    ...localizedEntries("/houses",    { changeFrequency: "weekly",   priority: 0.9 }),
    ...localizedEntries("/contact-us",{ changeFrequency: "monthly",  priority: 0.8 }),
  ];

  const listingRoutes = seedListings.flatMap((l) =>
    localizedEntries(`/houses/${l.id}`, { changeFrequency: "weekly", priority: 0.85 })
  );

  const teamRoutes = teamSlugs.flatMap((slug) =>
    localizedEntries(`/team/${slug}`, { changeFrequency: "monthly", priority: 0.7 })
  );

  const resourceRoutes = agentResources.flatMap((r) =>
    localizedEntries(`/resources/${r.slug}`, { changeFrequency: "monthly", priority: 0.6 })
  );

  return [...staticRoutes, ...listingRoutes, ...teamRoutes, ...resourceRoutes];
}
