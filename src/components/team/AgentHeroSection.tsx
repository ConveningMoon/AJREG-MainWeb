"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Phone } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { brand } from "@/lib/brand";
import type { TeamMember } from "@/data/team";

const heroPortraitBySlug: Record<string, string> = {
  "john-leonard":    "/images/hero-team/John_Portrait.webp",
  "viviane-chiu":    "/images/hero-team/Viviane_Portrait.webp",
  "melany-valencia": "/images/hero-team/Melany_Portrait.webp",
};

type Props = {
  member: TeamMember;
  backLabel: string;
  tagline: string;
  languageLabels: Partial<Record<"en" | "es" | "pt", string>>;
  contactCta: string;
  callCta: string;
};

export function AgentHeroSection({
  member,
  backLabel,
  tagline,
  languageLabels,
  contactCta,
  callCta,
}: Props) {
  const portrait = heroPortraitBySlug[member.slug];
  const firstName = member.name.split(" ")[0];

  return (
    <section className="relative overflow-hidden bg-navy-950" style={{ minHeight: "620px" }}>

      {/* Atmospheric gold glow behind portrait side */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-[0.18]"
        style={{
          background:
            "radial-gradient(ellipse 70% 90% at 100% 60%, #c7a260 0%, transparent 68%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid min-h-[620px] max-w-5xl items-stretch px-6 lg:grid-cols-[1fr_420px]">

        {/* ── LEFT: content ── */}
        <div className="flex flex-col justify-center py-16 lg:py-20">

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-300 transition-colors hover:text-gold"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {backLabel}
            </Link>
          </motion.div>

          {/* Role pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12, ease: "easeOut" }}
            className="mt-10"
          >
            <span className="inline-block rounded-sm bg-gold/15 px-3 py-0.5 text-xs font-semibold text-gold">
              {member.role}
            </span>
          </motion.div>

          {/* Agent name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="mt-3 font-display text-5xl font-semibold leading-tight text-cream sm:text-6xl lg:text-7xl"
          >
            {member.name}
          </motion.h1>

          {/* Gold accent bar — grows from left */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.38, ease: "easeOut" }}
            style={{ transformOrigin: "left" }}
            className="mt-7 h-0.5 w-16 bg-gold"
            aria-hidden="true"
          />

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.46, ease: "easeOut" }}
            className="mt-5 max-w-sm font-display text-lg italic leading-relaxed text-navy-200 sm:text-xl"
          >
            &ldquo;{tagline}&rdquo;
          </motion.p>

          {/* Language badges */}
          <motion.ul
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.54, ease: "easeOut" }}
            className="mt-6 flex flex-wrap gap-2"
          >
            {member.languages.map((lang) => (
              <li
                key={lang}
                className="rounded-full border border-navy-600 bg-navy-800 px-3.5 py-1 text-sm font-medium text-cream"
              >
                {languageLabels[lang] ?? lang}
              </li>
            ))}
          </motion.ul>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.62, ease: "easeOut" }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              href="/contact-us"
              className="group inline-flex items-center gap-2 rounded-sm bg-gold px-7 py-4 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              {contactCta}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <a
              href={brand.phoneHref}
              className="inline-flex items-center gap-2 rounded-sm border border-gold/40 px-7 py-4 text-sm font-semibold text-cream transition-colors hover:border-gold hover:text-gold"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {callCta}
            </a>
          </motion.div>
        </div>

        {/* ── RIGHT: portrait — fills column, no box, bleeds from bottom ── */}
        <div className="relative hidden lg:block">

          {/* Left-edge fade so portrait merges into background */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-navy-950 to-transparent"
            aria-hidden="true"
          />

          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, delay: 0.12, ease: "easeOut" }}
          >
            {portrait ? (
              <Image
                src={portrait}
                alt={firstName}
                fill
                sizes="420px"
                className="object-contain object-bottom"
                priority
              />
            ) : (
              <div className="flex h-full items-end justify-center">
                <span className="font-display text-[11rem] font-semibold leading-none text-cream/5">
                  {member.name.charAt(0)}
                </span>
              </div>
            )}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
