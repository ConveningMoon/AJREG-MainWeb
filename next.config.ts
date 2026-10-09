import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // El script de medicion y su endpoint se sirven desde ESTE dominio, no desde
  // app.itmano.com. Asi la medicion es first-party: los bloqueadores de rastreo
  // no la tocan, no depende de CORS, y no se cruza con el bot-check del otro
  // dominio, que desde una IP de VPN puede devolver un reto en vez de la
  // respuesta. intake.js deriva su base de su propio `src`.
  // Short, QR-friendly link for the family calculator: /hogar?src=... lands on
  // the Spanish version (the audience is Spanish-first) with the query intact.
  // Runs before the locale proxy, so it is not redirected to /en by browser language.
  async redirects() {
    return [
      { source: "/hogar", destination: "/es/hogar", permanent: false },
      // The giveaway first shipped at /wellness; keep any link already shared alive.
      { source: "/:locale(en|es)/wellness", destination: "/:locale/giveaway", permanent: false },
    ];
  },
  async rewrites() {
    return [
      { source: "/intake.js",         destination: "https://app.itmano.com/intake.js" },
      { source: "/api/intake/:path*", destination: "https://app.itmano.com/api/intake/:path*" },
      // Newsletter: subscriptions go through /api/intake above; this one is
      // the read counter for an edition rendered on THIS domain (/newsletter/
      // <slug>). Same first-party reasoning.
      { source: "/api/newsletters/:path*", destination: "https://app.itmano.com/api/newsletters/:path*" },
    ];
  },
  images: {
    remotePatterns: [
      // Webflow CDN where the current site's assets live (used while we
      // migrate images; can be removed once assets are hosted locally).
      { protocol: "https", hostname: "cdn.prod.website-files.com" },
      { protocol: "https", hostname: "assets-global.website-files.com" },
      // YouTube thumbnails for embedded video placeholders
      { protocol: "https", hostname: "img.youtube.com" },
      // Supabase Storage — ITMANO CRM project (property images live here now).
      { protocol: "https", hostname: "kvmjlrvlnhiarrqxulkr.supabase.co" },
    ],
  },
};

export default withNextIntl(nextConfig);
