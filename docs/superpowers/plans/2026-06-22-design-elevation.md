# Design Elevation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate A&J Real Estate Group's visual language from generic template to "Exaggerated Minimalism" boutique editorial firm — oversized typography, dark dramatic sections, gold used boldly, sharp-edged corners throughout.

**Architecture:** Visual-only pass — no structural, routing, data, or i18n changes. Every component keeps its props and server/client classification. The hero headline is THE signature element (the bold moment); all other changes are disciplined refinements that support it.

**Tech Stack:** Next.js 15 App Router · TypeScript · Tailwind CSS v4 (CSS-first, `@theme` in globals.css) · next-intl · lucide-react

## Global Constraints

- All animations use `motion-safe:` prefix — prefers-reduced-motion MUST be respected
- Duration: 150–300ms micro-interactions; 450–550ms section entrances; `ease-out` entering, `ease-in` exiting
- Grid stagger: 40ms delay per item, `animation-fill-mode: both` (use `animate-[..._both]` shorthand)
- Corner language: `rounded-sm` (4px) for CTAs, cards, badges; `rounded-full` only for small inline language/tag pills
- Button hierarchy: primary = `bg-gold text-navy-950 rounded-sm`; secondary = `border border-gold/60 text-cream rounded-sm`
- No new i18n keys, no layout/routing changes, no data layer changes
- TypeScript check: `npx tsc --noEmit` after each task
- Visual check: `npm run dev` and inspect at localhost:3000/en

---

## File Map

| File | Action | What changes |
|------|--------|--------------|
| `src/app/globals.css` | Modify | Add `slideUp` + `slideUpFast` keyframes |
| `src/components/ui/Eyebrow.tsx` | Modify | Thicker/longer gold rule (`h-0.5 w-12`) |
| `src/components/layout/Navbar.tsx` | Modify | `rounded-full` → `rounded-sm` on "Free Guide" button |
| `src/components/layout/Footer.tsx` | Modify | Gold separator; larger column headings |
| `src/components/home/Hero.tsx` | Rewrite | Full navy bg; `clamp` headline; sharp portrait; gold bar; redesigned CTAs; slideUp animation |
| `src/components/home/WhoWeAre.tsx` | Rewrite | Dark navy-950 cards; color top border per member; role pill; stagger animation |
| `src/components/home/Stats.tsx` | Rewrite | Huge clamp numbers; label inline right; gold dividers between columns |
| `src/components/home/TestimonialsCarousel.tsx` | Rewrite | Dark navy-950 section; giant decorative quote mark; gold avatar; dark card bg |
| `src/components/home/SalesStories.tsx` | Rewrite | Taupe bg; asymmetric `lg:grid-cols-[1.4fr_1fr]`; gold play button; `rounded-sm` cards |
| `src/components/home/ContactSection.tsx` | Modify | Gold bar above headline; larger h2; `rounded-sm` primary CTA |
| `src/components/houses/PropertyCard.tsx` | Rewrite | Price in card body; gold FOR SALE badge; `·` spec text; full inquire button |
| `src/components/team/TeamMemberProfile.tsx` | Rewrite | Dark navy-900 profile hero; pull-quote tagline; gold avatar; dark "meet the rest" cards |

---

### Task 1: Foundation — animation tokens + Eyebrow

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/ui/Eyebrow.tsx`

**Interfaces:**
- Produces: `slideUp` and `slideUpFast` keyframes usable as `animate-[slideUp_Xms_ease-out_both]` in any component; updated `Eyebrow` with `h-0.5 w-12` rule (no prop changes)

- [ ] **Step 1: Add keyframes to globals.css**

Append to `src/app/globals.css` after the existing `popIn` keyframe block:

```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUpFast {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Full `src/app/globals.css` after edit:

```css
@import "tailwindcss";

@theme {
  --font-body: var(--font-body), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-display), ui-serif, Georgia, serif;

  --color-navy-50: #f1f4f6;
  --color-navy-100: #d2dadf;
  --color-navy-200: #b4c0c8;
  --color-navy-300: #96a7b1;
  --color-navy-400: #778d9a;
  --color-navy-500: #597383;
  --color-navy-600: #475e70;
  --color-navy-700: #344a5d;
  --color-navy-800: #22354a;
  --color-navy-900: #102037;
  --color-navy-950: #0a1321;

  --color-navy: #102037;
  --color-slate: #597383;
  --color-taupe: #49443e;
  --color-cream: #fff7f5;
  --color-blush: #e9d8d0;
  --color-gold: #c7a260;
  --color-accent: #c7a260;

  --color-background: #fff7f5;
  --color-foreground: #102037;
}

body {
  background: var(--color-background);
  color: var(--color-foreground);
}

html {
  scroll-padding-top: 4.5rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes popIn {
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slideUpFast {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 2: Update Eyebrow component**

Full `src/components/ui/Eyebrow.tsx`:

```tsx
export function Eyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold ${className}`}
    >
      <span className="h-0.5 w-12 bg-gold" aria-hidden="true" />
      {children}
    </span>
  );
}
```

- [ ] **Step 3: Type check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/components/ui/Eyebrow.tsx
git commit -m "feat: add slideUp keyframes + bolder Eyebrow rule"
```

---

### Task 2: Navbar + Footer — minor polish

**Files:**
- Modify: `src/components/layout/Navbar.tsx` (line ~150: "Free Guide" button)
- Modify: `src/components/layout/Footer.tsx` (border separator + column headings)

**Interfaces:**
- No prop changes. No new dependencies.

- [ ] **Step 1: Update Navbar — rounded-sm on "Free Guide" button**

In `src/components/layout/Navbar.tsx`, find both "Free Guide" button instances (desktop + mobile) and change `rounded-full` to `rounded-sm`:

Desktop button (around line 150):
```tsx
<button
  type="button"
  onClick={openNewsletter}
  className="rounded-sm bg-gold px-5 py-2 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
>
  {t("nav.freeGuide")}
</button>
```

Mobile button (around line 225):
```tsx
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
```

- [ ] **Step 2: Update Footer — gold separator + larger headings**

In `src/components/layout/Footer.tsx`:

1. Change the bottom border of the main footer grid div from:
   `<footer className="bg-navy-900 text-navy-100">`
   The section doesn't have a top border — look at the `<div className="border-t border-navy-800">` at the bottom and also the top of the footer. We need to add a gold top border on the footer itself.

Full `src/components/layout/Footer.tsx`:

```tsx
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
              <Link href="/contact-us" className="transition-colors hover:text-gold">
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
          <p>{t("footer.designedBy")}</p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Type check + visual verify**

```bash
npx tsc --noEmit
```

Run `npm run dev`, check `/en` — footer should now have a gold top separator and wider column headings.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Navbar.tsx src/components/layout/Footer.tsx
git commit -m "feat: rounded-sm nav CTA + gold footer separator"
```

---

### Task 3: Hero — the signature element

**Files:**
- Rewrite: `src/components/home/Hero.tsx`

**Interfaces:**
- Consumes: `Eyebrow` (Task 1), `slideUp` keyframe (Task 1), `useNewsletter()`, i18n keys `home.hero.*` (unchanged)
- Produces: Hero section with full navy-900 background, `clamp(3.5rem,8vw,8rem)` headline in cream, gold bar accent, `rounded-sm` CTAs, `rounded-none` portrait on desktop

- [ ] **Step 1: Rewrite Hero.tsx**

Full `src/components/home/Hero.tsx`:

```tsx
"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { useNewsletter } from "@/components/layout/NewsletterProvider";

export function Hero() {
  const t = useTranslations("home.hero");
  const openNewsletter = useNewsletter();

  return (
    <section className="relative overflow-hidden bg-navy-900">
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-14 lg:grid-cols-2 lg:gap-12 lg:py-24">
        {/* Copy */}
        <div className="order-2 lg:order-1 motion-safe:animate-[slideUp_550ms_ease-out_both]">
          {/* Gold accent bar — the section signature */}
          <span aria-hidden="true" className="mb-4 block h-1 w-20 bg-gold" />
          <Eyebrow>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {t("eyebrow")}
            </span>
          </Eyebrow>
          <h1
            className="mt-5 font-display font-semibold text-cream leading-[0.88] tracking-[-0.03em]"
            style={{ fontSize: "clamp(3.5rem, 8vw, 8rem)" }}
          >
            {t("headline")}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-navy-200 sm:text-lg">
            {t("subheadline")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/houses"
              className="group inline-flex items-center justify-center gap-2 rounded-sm bg-gold px-7 py-3.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              {t("ctaPrimary")}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <button
              type="button"
              onClick={openNewsletter}
              className="inline-flex items-center justify-center rounded-sm border border-gold/60 px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-gold/10 hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {t("ctaGuide")}
            </button>
          </div>
        </div>

        {/* Portrait */}
        <div
          className="order-1 lg:order-2 motion-safe:animate-[fadeIn_700ms_ease-out_both]"
          style={{ animationDelay: "150ms" }}
        >
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-lg shadow-2xl lg:max-w-none lg:rounded-none lg:ring-2 lg:ring-gold/40">
            <Image
              src="/images/Team_Portrait_2.webp"
              alt={t("portraitAlt")}
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Visual verify**

Run `npm run dev`. Open `/en`. The hero should:
- Be fully dark (navy-900 background)
- Show a thick gold bar above the eyebrow
- Headline should scale dramatically with viewport width (test at 375px, 768px, 1440px)
- Portrait should have no border-radius on desktop, gold ring outline
- Primary CTA should be gold with sharp edges; secondary should be ghost with gold border
- Page should slide up on load (test with reduced-motion OFF)
- On reduced-motion ON (browser settings), no animation

- [ ] **Step 4: Commit**

```bash
git add src/components/home/Hero.tsx
git commit -m "feat: hero — full navy bg, editorial clamp headline, gold CTAs, sharp portrait"
```

---

### Task 4: WhoWeAre — dark editorial team cards

**Files:**
- Rewrite: `src/components/home/WhoWeAre.tsx`

**Interfaces:**
- Consumes: `slideUp` keyframe (Task 1), `Eyebrow` (Task 1), `seedTeam` from `@/data/team`, i18n `home.whoWeAre.*` (unchanged)
- Produces: dark `bg-navy-950` cards with `border-t-[3px]` color per member, `rounded-sm bg-gold/15 text-gold` role pill, 40ms stagger entrance

- [ ] **Step 1: Rewrite WhoWeAre.tsx**

Full `src/components/home/WhoWeAre.tsx`:

```tsx
import { getTranslations } from "next-intl/server";
import { Globe, HeartHandshake, Users } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { seedTeam } from "@/data/team";

const memberKey = (slug: string) => slug.split("-")[0];

const memberBorderClass: Record<string, string> = {
  "adriana-melendez": "border-t-[3px] border-gold",
  "john-leonard": "border-t-[3px] border-slate",
  "viviane-chiu": "border-t-[3px] border-blush",
  "melany-valencia": "border-t-[3px] border-gold/70",
};

export async function WhoWeAre() {
  const t = await getTranslations("home.whoWeAre");

  const memberDesc: Record<string, string> = {
    adriana: t("members.adriana"),
    john: t("members.john"),
    viviane: t("members.viviane"),
    melany: t("members.melany"),
  };

  const badges = [
    { Icon: Globe, label: t("badgeLanguages") },
    { Icon: Users, label: t("badgeFamily") },
    { Icon: HeartHandshake, label: t("badgeAssist") },
  ];

  return (
    <section className="bg-cream py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-tight text-navy sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-navy-700">
            {t("intro")}
          </p>
        </div>

        <ul className="mt-8 flex flex-wrap gap-3">
          {badges.map(({ Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-2 rounded-full bg-blush/60 px-4 py-2 text-sm font-medium text-navy-800"
            >
              <Icon className="h-4 w-4 text-gold" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {seedTeam.map((m, i) => (
            <article
              key={m.slug}
              className={`flex flex-col overflow-hidden rounded-sm bg-navy-950 shadow-lg motion-safe:animate-[slideUp_450ms_ease-out_both] ${memberBorderClass[m.slug] ?? "border-t-[3px] border-gold"}`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-xl font-semibold text-cream">
                  {m.name}
                </h3>
                <p className="mt-2">
                  <span className="inline-block rounded-sm bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold">
                    {m.role}
                  </span>
                </p>
                <p className="mt-4 text-sm leading-relaxed text-navy-300">
                  {memberDesc[memberKey(m.slug)]}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Visual verify**

Open `/en`. Scroll to "Who We Are". Cards should be dark (navy-950) against the cream section background, each with a colored top border. Role should appear as a gold pill. Cards should stagger-in on page scroll (in a browser without reduced-motion).

- [ ] **Step 4: Commit**

```bash
git add src/components/home/WhoWeAre.tsx
git commit -m "feat: WhoWeAre — dark editorial cards with color accent borders"
```

---

### Task 5: Stats — typographic scale moment

**Files:**
- Rewrite: `src/components/home/Stats.tsx`

**Interfaces:**
- Consumes: i18n `home.stats.*` (unchanged)
- Produces: `clamp(4rem,9vw,7rem)` gold numbers with inline label to the right; `border-l border-gold/20` dividers between columns on desktop

- [ ] **Step 1: Rewrite Stats.tsx**

Full `src/components/home/Stats.tsx`:

```tsx
import { getTranslations } from "next-intl/server";

export async function Stats() {
  const t = await getTranslations("home.stats");

  const stats = [
    { value: "+100", label: t("housesLabel") },
    { value: "+20", label: t("familiesLabel") },
    { value: "+10", label: t("yearsLabel") },
  ];

  return (
    <section className="bg-navy-900 text-cream">
      <div className="mx-auto grid max-w-7xl px-6 py-12 sm:grid-cols-3 lg:py-16">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`px-8 py-6 ${
              i > 0
                ? "border-t border-gold/20 sm:border-t-0 sm:border-l sm:border-gold/20"
                : ""
            }`}
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p
                className="font-display font-semibold text-gold"
                style={{ fontSize: "clamp(4rem, 9vw, 7rem)", lineHeight: 1 }}
              >
                {s.value}
              </p>
              <p className="text-sm font-medium uppercase leading-tight tracking-wider text-navy-200">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Visual verify**

Numbers should be enormous, scaling with viewport. Label sits to the right of the number as a smaller superscript-like element. A subtle gold divider line separates the 3 stats on desktop. On mobile they stack vertically with a top border separating each.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/Stats.tsx
git commit -m "feat: Stats — editorial clamp numbers with inline label"
```

---

### Task 6: TestimonialsCarousel — dark immersive quote section

**Files:**
- Rewrite: `src/components/home/TestimonialsCarousel.tsx`

**Interfaces:**
- Consumes: `testimonials` from `@/data/testimonials`, `Eyebrow` (Task 1), `slideUp` keyframe (Task 1), i18n `home.testimonials.*` (unchanged)
- Produces: dark `bg-navy-950` section, decorative `"` at `text-[12rem] text-gold/8`, `bg-gold text-navy-950` avatar, `bg-navy-800` card, dark control buttons

- [ ] **Step 1: Rewrite TestimonialsCarousel.tsx**

Full `src/components/home/TestimonialsCarousel.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { testimonials } from "@/data/testimonials";

export function TestimonialsCarousel() {
  const t = useTranslations("home.testimonials");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count]
  );

  useEffect(() => {
    if (paused) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const id = setInterval(() => go(1), 6500);
    return () => clearInterval(id);
  }, [paused, go]);

  const active = testimonials[index];

  return (
    <section className="bg-navy-950 py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="flex flex-col items-center text-center">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-tight text-cream sm:text-5xl">
            {t("title")}
          </h2>
        </div>

        <div
          className="relative mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          aria-roledescription="carousel"
        >
          <div className="relative overflow-hidden rounded-sm bg-navy-800 p-8 sm:p-12">
            {/* Decorative large quote mark */}
            <span
              aria-hidden="true"
              className="pointer-events-none select-none absolute -top-2 left-4 font-display text-[12rem] leading-none text-gold/8"
            >
              &ldquo;
            </span>

            <div
              key={active.id}
              className="relative motion-safe:animate-[fadeIn_350ms_ease-out]"
            >
              <blockquote className="mt-4 flex min-h-[7rem] items-center justify-center text-center text-xl leading-relaxed text-cream sm:text-2xl">
                <p>"{active.quote}"</p>
              </blockquote>
              <div className="mt-8 flex flex-col items-center gap-3">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-gold font-display text-xl font-semibold text-navy-950"
                  aria-hidden="true"
                >
                  {active.family.charAt(0)}
                </span>
                <p className="font-display text-base font-semibold text-cream">
                  {t("familyLabel", { name: active.family })}
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={t("prev")}
            className="absolute -left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-navy-800 p-2.5 text-cream shadow-md ring-1 ring-gold/20 transition-colors hover:bg-navy-700 sm:-left-5 sm:block"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={t("next")}
            className="absolute -right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-navy-800 p-2.5 text-cream shadow-md ring-1 ring-gold/20 transition-colors hover:bg-navy-700 sm:-right-5 sm:block"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Dots */}
        <div className="mt-8 flex items-center justify-center gap-2.5">
          {testimonials.map((tm, i) => (
            <button
              key={tm.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={t("goTo", { n: i + 1 })}
              aria-current={i === index ? "true" : undefined}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-6 bg-gold" : "w-2.5 bg-navy-600 hover:bg-navy-500"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Visual verify**

The testimonials section should now be immersive dark (navy-950). The giant `"` should be barely visible in the background. Quote text should be cream and larger. Avatar should be gold with dark initials. Control arrows should be dark. Verify autoplay still works.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/TestimonialsCarousel.tsx
git commit -m "feat: Testimonials — dark immersive section with editorial quote typography"
```

---

### Task 7: SalesStories — asymmetric editorial grid

**Files:**
- Rewrite: `src/components/home/SalesStories.tsx`

**Interfaces:**
- Consumes: `salesStories` from `@/data/salesStories`, `Eyebrow` (Task 1), i18n `home.salesStories.*` (unchanged)
- Produces: `bg-taupe/15` section, `lg:grid-cols-[1.4fr_1fr]` asymmetric grid, first card `aspect-[4/5]`, `rounded-sm` cards, `bg-gold text-navy-950` play button

- [ ] **Step 1: Rewrite SalesStories.tsx**

Full `src/components/home/SalesStories.tsx`:

```tsx
import { getTranslations } from "next-intl/server";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { salesStories } from "@/data/salesStories";

export async function SalesStories() {
  const t = await getTranslations("home.salesStories");

  return (
    <section className="bg-taupe/15 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-tight text-navy sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-navy-700">
            {t("intro")}
          </p>
        </div>

        <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr]">
          {salesStories.map((story, i) => (
            <article
              key={story.id}
              className="flex flex-col overflow-hidden rounded-sm bg-white shadow-sm ring-1 ring-navy-900/5"
            >
              {/* Placeholder media panel */}
              <div
                className={`relative flex items-center justify-center bg-gradient-to-br from-navy-800 to-slate ${
                  i === 0 ? "aspect-[4/5]" : "aspect-[16/9]"
                }`}
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-navy-950 shadow-lg"
                  aria-hidden="true"
                >
                  <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
                </span>
                <span className="absolute bottom-3 left-4 font-display text-lg font-semibold text-cream">
                  {t("familyLabel", { name: story.family })}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <p className="flex-1 text-sm leading-relaxed text-navy-700">
                  "{story.quote}"
                </p>
                <Link
                  href="/houses"
                  className="group mt-5 inline-flex items-center gap-2 self-start text-sm font-semibold text-navy transition-colors hover:text-gold"
                >
                  {t("cta")}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Visual verify**

Section background should be warm taupe-tinted (not pink blush). On desktop, the first card should be noticeably wider (1.4fr) and taller (4/5 aspect ratio). The play button should be gold. Cards have sharp corners.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/SalesStories.tsx
git commit -m "feat: SalesStories — asymmetric editorial grid, taupe bg, gold play button"
```

---

### Task 8: ContactSection — gold bar + scale

**Files:**
- Modify: `src/components/home/ContactSection.tsx`

**Interfaces:**
- Consumes: `brand` from `@/lib/brand`, i18n `home.contactCta.*` (unchanged)
- Produces: centered `h-1 w-20 bg-gold` bar above headline; `text-4xl sm:text-5xl` headline; `rounded-sm` primary CTA

- [ ] **Step 1: Update ContactSection.tsx**

Full `src/components/home/ContactSection.tsx`:

```tsx
import { getTranslations } from "next-intl/server";
import { ArrowRight, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { brand } from "@/lib/brand";

export async function ContactSection() {
  const t = await getTranslations("home.contactCta");

  return (
    <section className="bg-navy-900 py-16 text-cream lg:py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        {/* Gold bar */}
        <span aria-hidden="true" className="mx-auto mb-6 block h-1 w-20 bg-gold" />
        <div className="flex justify-center">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
        </div>
        <h2 className="mt-5 font-display text-4xl font-semibold leading-tight sm:text-5xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-navy-200">
          {t("subtitle")}
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/contact-us"
            className="group inline-flex items-center justify-center gap-2 rounded-sm bg-gold px-7 py-3.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
          >
            {t("button")}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
          <a
            href={brand.phoneHref}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-navy-600 px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:border-gold hover:text-gold"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {t("callButton")}
          </a>
          <a
            href={brand.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-navy-600 px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:border-gold hover:text-gold"
          >
            {t("whatsappButton")}
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type check + visual verify**

```bash
npx tsc --noEmit
```

Section should now have a gold bar above the eyebrow (centered), a larger headline, and the primary CTA should be gold with sharp corners.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/ContactSection.tsx
git commit -m "feat: ContactSection — gold accent bar + scale headline"
```

---

### Task 9: PropertyCard — editorial card redesign

**Files:**
- Rewrite: `src/components/houses/PropertyCard.tsx`

**Interfaces:**
- Consumes: `Listing` type from `@/data/listings` (unchanged), i18n `houses.card.*` (unchanged)
- Produces: Price as prominent `font-display text-3xl` in card body; `bg-gold text-navy-950 rounded-sm` FOR SALE badge; `·`-separated spec text; full border button for "Inquire"

- [ ] **Step 1: Rewrite PropertyCard.tsx**

Full `src/components/houses/PropertyCard.tsx`:

```tsx
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Home, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Listing } from "@/data/listings";

const priceFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export async function PropertyCard({ listing }: { listing: Listing }) {
  const t = await getTranslations("houses.card");
  const baths = listing.bathroomsFull + (listing.bathroomsHalf > 0 ? 0.5 : 0);
  const bathsLabel = Number.isInteger(baths) ? String(baths) : baths.toFixed(1);

  const specsText = [
    t("beds", { count: listing.bedrooms }),
    t("baths", { count: bathsLabel }),
    t("sqft", { count: listing.sqft.toLocaleString("en-US") }),
  ].join(" · ");

  return (
    <article className="group flex flex-col overflow-hidden rounded-sm bg-white shadow-sm ring-1 ring-navy-900/5 transition-shadow hover:shadow-lg">
      {/* Media */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-navy-800 to-slate">
        {listing.imageUrl ? (
          <Image
            src={listing.imageUrl}
            alt={listing.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Home className="h-12 w-12 text-cream/40" aria-hidden="true" />
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-sm bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-navy-950">
          {t("forSale")}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <p className="font-display text-3xl font-semibold text-navy">
          {priceFmt.format(listing.priceUsd)}
        </p>
        <h3 className="mt-1 font-display text-lg font-semibold text-navy">
          {listing.name}
        </h3>
        <p className="mt-1 inline-flex items-start gap-1.5 text-sm text-navy-600">
          <MapPin
            className="mt-0.5 h-4 w-4 shrink-0 text-gold"
            aria-hidden="true"
          />
          {listing.address}, {listing.city}, {listing.state}
        </p>

        <p className="mt-4 border-t border-navy-100 pt-4 text-sm tracking-wide text-navy-500">
          {specsText}
        </p>

        <Link
          href="/contact-us"
          className="mt-5 inline-flex self-start rounded-sm border border-navy-300 px-4 py-2 text-sm font-semibold text-navy transition-colors hover:border-gold hover:bg-gold hover:text-navy-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {t("inquire")}
        </Link>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Visual verify**

Open `/en/houses`. Cards should show price prominently in EB Garamond at the top of the body. FOR SALE badge should be gold. Specs should read as `4 beds · 2 baths · 2,092 sqft`. Inquire button should be a real button with border that turns gold on hover.

- [ ] **Step 4: Commit**

```bash
git add src/components/houses/PropertyCard.tsx
git commit -m "feat: PropertyCard — editorial price, gold badge, sharp corners, real inquire button"
```

---

### Task 10: TeamMemberProfile — dark profile hero + pull-quote

**Files:**
- Rewrite: `src/components/team/TeamMemberProfile.tsx`

**Interfaces:**
- Consumes: `TeamMember` type from `@/data/team`, `Eyebrow` (Task 1), `brand` from `@/lib/brand`, i18n `team.*` + `common.*` (unchanged), `memberBorderClass` (defined locally, same as Task 4)
- Produces: `bg-navy-900` wrapper for back-link + profile grid; cream name at `text-5xl lg:text-6xl`; tagline as italic pull-quote with gold `"` prefix; `bg-gold text-navy-950` photo placeholder; dark "meet the rest" cards with `border-t-[3px] border-gold`

- [ ] **Step 1: Rewrite TeamMemberProfile.tsx**

Full `src/components/team/TeamMemberProfile.tsx`:

```tsx
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { brand } from "@/lib/brand";
import { seedTeam, type TeamMember } from "@/data/team";

const memberKey = (slug: string) => slug.split("-")[0];

const langLabelKey = { en: "english", es: "spanish", pt: "portuguese" } as const;

const memberBorderClass: Record<string, string> = {
  "adriana-melendez": "border-t-[3px] border-gold",
  "john-leonard": "border-t-[3px] border-slate",
  "viviane-chiu": "border-t-[3px] border-blush",
  "melany-valencia": "border-t-[3px] border-gold/70",
};

export async function TeamMemberProfile({ member }: { member: TeamMember }) {
  const t = await getTranslations("team");
  const tc = await getTranslations("common");
  const key = memberKey(member.slug);
  const bio = t.raw(`members.${key}.bio`) as string[];
  const tagline = t(`members.${key}.tagline`);
  const initial = member.name.charAt(0);
  const others = seedTeam.filter((m) => m.slug !== member.slug);

  return (
    <main className="flex flex-1 flex-col">
      {/* Dark profile hero */}
      <div className="bg-navy-900">
        <div className="mx-auto w-full max-w-5xl px-6 pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-300 transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("profile.back")}
          </Link>
        </div>

        <section className="py-10 lg:py-14">
          <div className="mx-auto grid max-w-5xl items-start gap-10 px-6 lg:grid-cols-[0.85fr_1.15fr]">
            {/* Photo / placeholder */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-gradient-to-br from-navy-800 to-slate shadow-sm">
              {member.photoUrl ? (
                <Image
                  src={member.photoUrl}
                  alt={member.name}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gold/10">
                  <span className="font-display text-7xl font-semibold text-gold">
                    {initial}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <Eyebrow>{member.role}</Eyebrow>
              <h1
                className="mt-4 font-display font-semibold leading-tight text-cream"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
              >
                {member.name}
              </h1>

              {/* Pull-quote tagline */}
              <div className="relative mt-5 pl-7">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 font-display text-4xl leading-none text-gold"
                >
                  &ldquo;
                </span>
                <p className="font-display text-lg italic leading-relaxed text-navy-200">
                  {tagline}
                </p>
              </div>

              <div className="mt-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-navy-400">
                  {t("profile.languagesLabel")}
                </span>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {member.languages.map((lang) => (
                    <li
                      key={lang}
                      className="rounded-full border border-navy-600 bg-navy-800 px-3.5 py-1.5 text-sm font-medium text-cream"
                    >
                      {tc(langLabelKey[lang])}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-7 space-y-4 text-base leading-relaxed text-navy-200">
                {bio.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact-us"
                  className="group inline-flex items-center justify-center gap-2 rounded-sm bg-gold px-7 py-3.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                >
                  {t("profile.contactCta", { name: member.name.split(" ")[0] })}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
                <a
                  href={brand.phoneHref}
                  className="inline-flex items-center justify-center gap-2 rounded-sm border border-gold/60 px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:border-gold hover:text-gold"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {t("profile.callCta")}
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Meet the rest — light section */}
      <section className="bg-cream border-t border-navy-100 py-12 lg:py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="font-display text-2xl font-semibold text-navy">
            {t("profile.otherTitle")}
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {others.map((m) => (
              <li key={m.slug}>
                <Link
                  href={`/team/${m.slug}`}
                  className={`group flex items-center justify-between gap-3 rounded-sm bg-navy-950 p-5 transition-opacity hover:opacity-90 ${memberBorderClass[m.slug] ?? "border-t-[3px] border-gold"}`}
                >
                  <span>
                    <span className="block font-display text-lg font-medium text-cream">
                      {m.name}
                    </span>
                    <span className="mt-1 inline-block rounded-sm bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold">
                      {m.role}
                    </span>
                  </span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-navy-400 transition-transform group-hover:translate-x-0.5 group-hover:text-gold"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Visual verify**

Open `/en/team/adriana-melendez`. The top section (back link + profile grid) should be on a dark navy-900 background. Name should be large cream EB Garamond. Tagline should appear as a pull-quote with a gold `"` mark. Photo placeholder should show gold initial. "Meet the rest" cards should be dark with color top borders. The light bio section below should contrast cleanly.

- [ ] **Step 4: Commit**

```bash
git add src/components/team/TeamMemberProfile.tsx
git commit -m "feat: TeamMemberProfile — dark hero, pull-quote tagline, gold avatar, dark team cards"
```

---

### Final: Build verification

- [ ] **Step 1: Full production build**

```bash
npm run build
```

Expected: all routes build successfully. If there are type errors or build errors, fix them before proceeding.

- [ ] **Step 2: Visual QA checklist**

Test each route and check:

| Route | Check |
|-------|-------|
| `/en` | Hero is dark; headline scales; stats are huge; testimonials dark; SalesStories asymmetric; WhoWeAre cards dark |
| `/es` | Same as /en — all i18n strings still render correctly |
| `/en/houses` | PropertyCard shows price prominently; FOR SALE badge is gold; specs are `·`-separated |
| `/en/team/adriana-melendez` | Dark hero; pull-quote tagline; gold initial; dark "meet the rest" cards |
| `/en/team/john-leonard` | Same template, different accent color on "meet the rest" cards |
| `/en/contact-us` | No visual regressions (this page wasn't changed) |
| Mobile 375px | Hero headline readable; no horizontal overflow; CTAs stack vertically; stats stack with top borders |
| Reduced-motion | No animations fire (verify via browser devtools: `prefers-reduced-motion: reduce`) |

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: design elevation QA — verified all routes build + render"
```
