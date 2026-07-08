import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
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
