import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Supported locales for A&J Real Estate Group (bilingual EN/ES).
  locales: ["en", "es"],
  // Default replicates the current Webflow site (English).
  defaultLocale: "en",
  // Always prefix the locale so URLs are explicit and SEO-clean: /en/..., /es/...
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
