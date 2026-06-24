import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { seedTeam } from "@/data/team";
import { brand } from "@/lib/brand";
import { SocialLinks } from "@/components/ui/SocialLinks";

export async function Footer() {
  const t = await getTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-gold/25 bg-navy-900 text-navy-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="lg:col-span-1">
          <Link
            href="/"
            className="relative block h-10 w-[160px]"
            aria-label={t("common.logoAlt")}
          >
            <Image
              src="/images/logo-white_2.webp"
              alt={t("common.logoAlt")}
              fill
              sizes="160px"
              className="object-contain object-left"
            />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-200">
            {t("footer.tagline")}
          </p>
          <SocialLinks className="mt-6 gap-4" iconClassName="h-5 w-5" />
        </div>

        {/* Quick links */}
        <nav aria-label={t("footer.quickLinks")}>
          <h2 className="font-display text-base font-semibold tracking-wide text-gold">
            {t("footer.quickLinks")}
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/" className="transition-colors hover:text-gold">
                {t("nav.home")}
              </Link>
            </li>
            <li>
              <Link href="/houses" className="transition-colors hover:text-gold">
                {t("nav.houses")}
              </Link>
            </li>
            <li>
              <Link
                href="/contact-us"
                className="transition-colors hover:text-gold"
              >
                {t("nav.contact")}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Team */}
        <nav aria-label={t("nav.ourTeam")}>
          <h2 className="font-display text-base font-semibold tracking-wide text-gold">
            {t("nav.ourTeam")}
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {seedTeam.map((m) => (
              <li key={m.slug}>
                <Link
                  href={`/team/${m.slug}`}
                  className="transition-colors hover:text-gold"
                >
                  {m.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h2 className="font-display text-base font-semibold tracking-wide text-gold">
            {t("footer.contactTitle")}
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href={brand.phoneHref}
                className="inline-flex items-center gap-2 transition-colors hover:text-gold"
              >
                <Phone className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                {brand.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={brand.emailHref}
                className="inline-flex items-center gap-2 break-all transition-colors hover:text-gold"
              >
                <Mail className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                {brand.emailDisplay}
              </a>
            </li>
            <li className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              {t("footer.coverage")}
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-navy-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-navy-300 sm:flex-row">
          <p>
            © {year} A&amp;J Real Estate Group. {t("footer.rights")}
          </p>
          <a
              href="https://itmano.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-gold"
            >
              {t("footer.designedBy")}
            </a>
        </div>
      </div>
    </footer>
  );
}
