import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // El script de medicion y su endpoint se sirven desde ESTE dominio, no desde
  // app.itmano.com. Asi la medicion es first-party: los bloqueadores de rastreo
  // no la tocan, no depende de CORS, y no se cruza con el bot-check del otro
  // dominio, que desde una IP de VPN puede devolver un reto en vez de la
  // respuesta. intake.js deriva su base de su propio `src`.
  async rewrites() {
    return [
      { source: "/intake.js",         destination: "https://app.itmano.com/intake.js" },
      { source: "/api/intake/:path*", destination: "https://app.itmano.com/api/intake/:path*" },
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
