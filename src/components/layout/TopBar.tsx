import { getTranslations } from "next-intl/server";
import { Mail, MapPin } from "lucide-react";
import { brand } from "@/lib/brand";
import { SocialLinks } from "@/components/ui/SocialLinks";

// Slim utility bar above the navbar. Hidden on mobile to keep the header clean.
export async function TopBar() {
  const t = await getTranslations();
  return (
    <div className="hidden bg-navy-950 text-navy-100 md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs">
        <div className="flex items-center gap-6">
          <a
            href={brand.emailHref}
            className="inline-flex items-center gap-2 transition-colors hover:text-gold"
          >
            <Mail className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
            {brand.emailDisplay}
          </a>
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
            {t("topbar.coverage")}
          </span>
        </div>
        <SocialLinks
          iconClassName="h-4 w-4"
          className="gap-4"
          linkClassName="text-navy-100"
        />
      </div>
    </div>
  );
}
