import type { MetadataRoute } from "next";
import { teamSlugs } from "@/data/team";

const SITE_URL = "https://ajrealestateva.com";
const locales = ["en", "es"] as const;

function url(path: string): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}/${l}${path === "" ? "" : path}`])
      ),
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["/", "/houses", "/contact-us"].flatMap((path) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path === "/" ? "" : path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [
            l,
            `${SITE_URL}/${l}${path === "/" ? "" : path}`,
          ])
        ),
      },
    }))
  );

  const teamRoutes = teamSlugs.flatMap((slug) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}/team/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${SITE_URL}/${l}/team/${slug}`])
        ),
      },
    }))
  );

  return [...staticRoutes, ...teamRoutes];
}
