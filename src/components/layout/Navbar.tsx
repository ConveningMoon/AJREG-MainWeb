"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { seedTeam } from "@/data/team";
import { brand } from "@/lib/brand";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { useNewsletter } from "./NewsletterProvider";

export function Navbar() {
  const t = useTranslations();
  const pathname = usePathname();
  const openNewsletter = useNewsletter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const teamRef = useRef<HTMLLIElement>(null);

  // Close the "Our Team" dropdown on outside click / Escape.
  useEffect(() => {
    if (!teamOpen) return;
    const onClick = (e: MouseEvent) => {
      if (teamRef.current && !teamRef.current.contains(e.target as Node)) {
        setTeamOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setTeamOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [teamOpen]);

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/houses", label: t("nav.houses") },
    { href: "/contact-us", label: t("nav.contact") },
  ] as const;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkClass = (active: boolean) =>
    `relative text-sm font-medium transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:bg-gold after:transition-all ${
      active
        ? "text-gold after:w-full"
        : "text-cream/90 hover:text-gold after:w-0 hover:after:w-full"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-navy-900 shadow-sm shadow-navy-950/30">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3.5">
        {/* Logo */}
        <Link
          href="/"
          className="relative block h-9 w-[140px] shrink-0"
          aria-label={t("common.logoAlt")}
          onClick={() => setMobileOpen(false)}
        >
          <Image
            src="/images/logo-white_2.webp"
            alt={t("common.logoAlt")}
            fill
            sizes="140px"
            className="object-contain object-left"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-8 lg:flex">
          <li>
            <Link href="/" className={linkClass(isActive("/"))}>
              {t("nav.home")}
            </Link>
          </li>
          <li>
            <Link href="/houses" className={linkClass(isActive("/houses"))}>
              {t("nav.houses")}
            </Link>
          </li>

          {/* Our Team dropdown */}
          <li className="relative" ref={teamRef}>
            <button
              type="button"
              onClick={() => setTeamOpen((v) => !v)}
              aria-expanded={teamOpen}
              aria-haspopup="true"
              className={`inline-flex items-center gap-1 ${linkClass(
                isActive("/team")
              )}`}
            >
              {t("nav.ourTeam")}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  teamOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>
            {teamOpen && (
              <ul className="absolute left-1/2 top-full mt-3 w-64 -translate-x-1/2 overflow-hidden rounded-xl bg-cream py-2 shadow-xl ring-1 ring-navy-900/10 motion-safe:animate-[popIn_180ms_ease-out]">
                {seedTeam.map((m) => (
                  <li key={m.slug}>
                    <Link
                      href={`/team/${m.slug}`}
                      onClick={() => setTeamOpen(false)}
                      className="block px-4 py-2.5 transition-colors hover:bg-blush/50"
                    >
                      <span className="block font-display text-base font-medium text-navy">
                        {m.name}
                      </span>
                      <span className="block text-xs text-navy-500">
                        {m.role}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li>
            <Link
              href="/contact-us"
              className={linkClass(isActive("/contact-us"))}
            >
              {t("nav.contact")}
            </Link>
          </li>
        </ul>

        {/* Desktop actions */}
        <div className="hidden items-center gap-5 lg:flex">
          <a
            href={brand.phoneHref}
            className="inline-flex items-center gap-2 text-sm font-semibold text-cream transition-colors hover:text-gold"
          >
            <Phone className="h-4 w-4 text-gold" aria-hidden="true" />
            {brand.phoneDisplay}
          </a>
          <button
            type="button"
            onClick={openNewsletter}
            className="rounded-sm bg-gold px-5 py-2 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
          >
            {t("nav.freeGuide")}
          </button>
          <LocaleSwitcher />
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? t("common.closeMenu") : t("common.openMenu")}
          className="text-cream lg:hidden"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="border-t border-navy-800 bg-navy-900 lg:hidden"
        >
          <ul className="space-y-1 px-6 py-4">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-2 text-base font-medium ${
                    isActive(l.href) ? "text-gold" : "text-cream/90"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-1">
              <p className="py-1 text-xs font-semibold uppercase tracking-wider text-navy-400">
                {t("nav.ourTeam")}
              </p>
              <ul className="space-y-1 pl-3">
                {seedTeam.map((m) => (
                  <li key={m.slug}>
                    <Link
                      href={`/team/${m.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="block py-1.5 text-sm text-cream/80 hover:text-gold"
                    >
                      {m.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>

          <div className="space-y-4 border-t border-navy-800 px-6 py-4">
            <a
              href={brand.phoneHref}
              className="inline-flex items-center gap-2 text-sm font-semibold text-cream"
            >
              <Phone className="h-4 w-4 text-gold" aria-hidden="true" />
              {brand.phoneDisplay}
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                openNewsletter();
              }}
              className="block w-full rounded-sm bg-gold px-5 py-2.5 text-center text-sm font-semibold text-navy-950"
            >
              {t("nav.freeGuide")}
            </button>
            <LocaleSwitcher className="pt-1" />
          </div>
        </div>
      )}
    </header>
  );
}
