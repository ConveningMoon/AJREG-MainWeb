# Design Elevation Spec — A&J Real Estate Group
**Date:** 2026-06-22
**Direction:** Moderno y Atrevido — Elevación Focalizada
**Style:** Exaggerated Minimalism (ui-ux-pro-max recommendation)

---

## Context

The site's current design is functional but reads as generic — standard two-column hero,
plain white cards, textbook trust bar stats, tiny quote icon in testimonials. EB Garamond
is barely used for impact; gold is confined to tiny accents; buttons are all the same pill
shape with no hierarchy.

**Goal:** Transform the visual language without changing the information architecture.
The site should feel like a boutique editorial real estate firm, not a SaaS template.

**Constraint from frontend-design skill:** "Spend your boldness in one place."
The oversized hero headline IS the signature element. Everything else is disciplined
and restrained — no scattered decoration.

---

## Design Token Changes (globals.css)

### New animation tokens
```css
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slideUpFast {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

Usage pattern: `motion-safe:animate-[slideUp_500ms_ease-out]` with stagger via
`[animation-delay:Xms]`. Stagger increment: 40ms per grid item (per ui-ux-pro-max:
30-50ms per item). All animations use `ease-out` on enter, `ease-in` on exit.

### Eyebrow upgrade
Current: `h-px w-8 bg-gold` (thin short rule)
New: `h-0.5 w-12 bg-gold` (2px thick, longer) — more authority without decoration

---

## Section Specs

### 1. Hero

**The signature moment.** Everything else on the page defers to this.

**Background:** Full `bg-navy-900` (not split diagonal). The hero is dark and immersive.

**Headline:**
```
font-display
font-weight: 700 (semibold is fine; no need for 900 which can feel heavy with Garamond)
font-size: clamp(3.5rem, 8vw, 8rem)
line-height: 0.88
letter-spacing: -0.03em
color: cream (#fff7f5)
```
This is the editorial typographic moment. Two or three lines that fill the viewport width.

**Subheadline:** Stays as Montserrat `text-base/lg text-navy-200`, `max-w-lg`, unchanged.

**Gold accent rule:** Replace the current Eyebrow with a standalone `h-1 w-20 bg-gold`
bar above the eyebrow text. Thicker, longer, more deliberate. The eyebrow text itself
stays in gold tracking-widest uppercase.

**CTA buttons:**
- Primary "Find your home": changes from rounded-full to `rounded-sm` (4px radius) with
  solid `bg-gold text-navy-950` — the sharp edge reads more editorial/premium vs soft pill.
- Secondary "Free Guide": `border border-gold/60 text-cream hover:bg-gold/10` —
  keeps the ghost treatment but in gold instead of navy-300.

**Portrait:**
- Remove `rounded-[2rem]`, use `rounded-none` — a sharp-edged photo feels architectural
  and non-generic in a world of soft rounded images.
- Add `ring-2 ring-gold/40` for a subtle gold frame at desktop size.
- On mobile, `rounded-lg` is acceptable.

**Entrance animation:** Copy block slides up `motion-safe:animate-[slideUp_550ms_ease-out]`.
Portrait fades in with 150ms delay.

**ASCII wireframe (desktop):**
```
┌─────────────────────────────────────────────────────────┐
│  bg-navy-900                                            │
│                                                         │
│   ▬▬▬▬▬▬▬▬▬▬▬▬  ← gold bar (h-1 w-20)                │
│   EYEBROW TEXT                                  ┌──────┐│
│                                                 │      ││
│   Finding Your                                  │      ││
│   Dream Home in                                 │ IMG  ││
│   Virginia                                      │      ││
│                                                 │ (no  ││
│   Subheadline text here                         │ rad) ││
│                                                 │      ││
│   [FIND HOME]  [ Free Guide ]                   └──────┘│
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### 2. WhoWeAre

**Change:** Team cards go dark — from `bg-white` to `bg-navy-950` with `text-cream`.
This creates a dramatic contrast against the cream section background, making the cards
"lift" visually without shadows or decoration.

Each card gets a **color accent bar** on top (`border-t-[3px]`):
- Adriana → `border-gold`
- John → `border-slate` (#597383)
- Viviane → `border-blush` (#e9d8d0)
- Melany → `border-gold/70`

**Role tag:** Changes from `text-xs uppercase tracking-wider text-gold` to a pill:
`inline-block bg-gold/15 text-gold text-xs font-semibold px-2 py-0.5 rounded-sm mt-1`

**Grid animation:** Each card staggers `motion-safe:animate-[slideUp_450ms_ease-out]`
with `[animation-delay:40ms]`, `[animation-delay:80ms]`, `[animation-delay:120ms]`,
`[animation-delay:160ms]`.

---

### 3. Stats

**Numbers go huge.** This is the trust bar — make it feel massive, not polite.

```
font-display
font-size: clamp(4rem, 9vw, 9rem)
font-weight: 600
color: gold (#c7a260)
line-height: 1
```

**Label treatment change:** Instead of centered below the number, place the label to
the right of the number as an inline superscript-like element:
```
+100   Homes Sold
       in Hampton Roads
```
Small text (`text-sm text-navy-200 leading-tight`), left-aligned to the number baseline.
This staggered reading is more editorial than a centered stack.

**Dividers:** `border-l border-gold/20` between stats at desktop (invisible on mobile).

**Background:** Keep `bg-navy-900`. Optionally add a CSS background-image with a subtle
texture at `opacity-[0.03]` if a pattern asset is available — otherwise skip (no decoration
without purpose).

**ASCII wireframe (desktop):**
```
┌────────────────────────────────────────────────────┐
│  bg-navy-900                                       │
│                                                    │
│   +100               │  +20               │  +10  │
│       Homes Sold      │      Families          Years│
│       in Hampton Roads│      Helped         Experience│
│                                                    │
└────────────────────────────────────────────────────┘
```

---

### 4. Testimonials

**Section goes dark** — `bg-navy-950`. This creates an immersive "quote moment" that
breaks the cream/cream rhythm of the page.

**Giant decorative quote mark:** A massive `"` character positioned as a background
element: `absolute top-4 left-6 font-display text-[12rem] leading-none text-gold/8
pointer-events-none select-none`. Not an icon — a text character at near-invisible
opacity. This is a typographic decoration, not a Lucide component.

**Quote text:** Increase to `text-xl sm:text-2xl text-cream` with `leading-relaxed`.
The quote fills the card more dramatically.

**Avatar circle:** Change from `bg-gradient-to-br from-navy-700 to-slate` to
`bg-gold text-navy-950` — gold avatar with dark initials. High contrast, on-brand.

**Dots:** Active dot to `bg-gold w-6`, inactive to `bg-navy-700`.

**Card background:** `bg-navy-800` (slightly lighter than section bg for depth).

**Controls (prev/next buttons):** `bg-navy-800 hover:bg-navy-700` instead of white.

---

### 5. SalesStories

**Editorial asymmetric grid.** Instead of uniform `sm:grid-cols-2`, use:

`lg:grid-cols-[1.4fr_1fr]` — all rows use this ratio, so card 1 is always 40% wider
than card 2. With 4 stories this means: row 1 has a wider card + narrower card,
row 2 has a wider card + narrower card. Simple to implement with CSS Grid, no row-spanning.

The first card (card index 0) additionally gets `aspect-[4/5]` media panel instead
of `16/9` — taller, more editorial. Cards 1-3 keep `aspect-[16/9]`.

**Section background:** `bg-taupe/15` instead of `bg-blush/30` — taupe reads warmer
and more architectural, less "default pink."

**Card design:**
- Remove `rounded-2xl`, use `rounded-sm` (4px) — consistent with the sharp-edge
  language from the hero and CTA buttons.
- Play button: `bg-gold text-navy-950` (was `bg-cream/90 text-navy`).
- Family label at bottom of media: `font-display text-xl text-cream` — same size
  bump as the rest of the display type.

---

### 6. PropertyCard

**Price moves out of overlay** — below the image in the card body as the dominant
element: `font-display text-3xl font-semibold text-navy` at the top of the body section.

**Image area:** Remove price overlay from image. The "FOR SALE" badge stays but
becomes `bg-gold text-navy-950 text-xs font-bold px-3 py-1 rounded-sm` (sharp edges).

**Specs bar:** Replace icon+text with text-only separated by `·`:
```
4 beds · 2 baths · 2,092 sqft
```
`text-sm text-navy-500 tracking-wide`. Cleaner, more editorial.

**Inquire button:** Upgrade from `text underline` link to a full button:
`border border-navy-300 rounded-sm px-4 py-2 text-sm font-semibold text-navy
hover:bg-gold hover:border-gold hover:text-navy-950` — this makes it a real CTA.

**Card corners:** `rounded-sm` (4px) throughout, consistent with the rest of the
sharp-edge language.

---

### 7. TeamMemberProfile

**Hero section of profile:** The top area (photo + name) shifts to `bg-navy-900`.
The name becomes cream EB Garamond at `text-5xl lg:text-6xl`. The Eyebrow (role)
uses the same gold pill from WhoWeAre.

**Tagline as visual pull-quote:** The tagline is rendered with decorative large
opening quotation mark: `font-display text-2xl text-navy-700 italic` with a
`"` prefix in `text-gold text-4xl leading-none`.

**Photo placeholder:** The initial letter circle changes to `bg-gold text-navy-950`
font-display text-7xl — consistent with the avatar treatment across the site.

**"Meet the rest" cards:** Same dark card treatment as WhoWeAre dark cards — navy-950
background, cream text, color border-top. Consistency across all team elements.

---

### 8. ContactSection (Home)

**Minor elevation only.** The section stays `bg-navy-900`. Changes:
- Headline: `font-display text-4xl sm:text-5xl` (slightly larger)
- Add a `h-0.5 w-20 bg-gold mx-auto mb-6` gold rule above the headline (same gold
  bar treatment as hero, but centered)
- CTA button becomes `rounded-sm bg-gold` (consistent sharp-edge language)

---

### 9. Footer

- Gold separator: `border-t-2 border-gold/25` (was `border-t border-navy-800`)
- Column headings: `text-sm` → `text-base font-semibold` with `tracking-wide`
- Tagline copy: slightly more breathing room `leading-relaxed`

---

### 10. Navbar

- The existing gold "Free Guide" pill is already `rounded-full`. Change to `rounded-sm`
  for consistency with the new sharp-edge language on CTAs.
- Active link underline: keep. This is clean and functional.
- Mobile menu: no changes beyond CTA button radius.

---

## Global Animation Rules (per ui-ux-pro-max)

| Rule | Value |
|------|-------|
| Micro-interactions | 150–300ms |
| Section entrances | 450–550ms |
| Easing (enter) | `ease-out` (cubic-bezier(0,0,0.2,1)) |
| Easing (exit) | `ease-in` |
| Grid stagger | 40ms per item |
| Reduced motion | `motion-safe:` prefix on ALL animations — required |
| No infinite decoration | Only `animate-spin` on loading states |
| No `width`/`height` animation | Only `transform` + `opacity` |

---

## Typography Scale (revised)

| Element | Size | Weight | Font | Color |
|---------|------|--------|------|-------|
| Hero headline | `clamp(3.5rem, 8vw, 8rem)` | 700 | EB Garamond | cream |
| Section h2 | `text-4xl sm:text-5xl` | 600 | EB Garamond | navy |
| Stats number | `clamp(4rem, 9vw, 9rem)` | 600 | EB Garamond | gold |
| Team name | `text-5xl lg:text-6xl` | 600 | EB Garamond | cream (on dark) |
| Card name | `text-xl` | 600 | EB Garamond | cream (on dark) |
| Body | `text-base/lg` | 400 | Montserrat | navy-700 |
| Eyebrow | `text-xs tracking-[0.25em]` | 600 | Montserrat | gold |
| Role pill | `text-xs` | 600 | Montserrat | gold (on gold/15 bg) |
| Specs text | `text-sm` | 400 | Montserrat | navy-500 |

---

## Consistency Rules

- **Corner radius language**: hero portrait `rounded-none`, CTAs `rounded-sm`, cards `rounded-sm`,
  badges `rounded-sm`, language badges `rounded-full` (only these — small inline pills).
  NO more `rounded-2xl` or `rounded-full` on large structural elements.
- **Button hierarchy**: primary = `bg-gold text-navy-950 rounded-sm`, secondary = `border border-gold/60 text-cream rounded-sm`
- **Shadow**: remove `shadow-sm ring-1 ring-navy-900/5` from dark cards (they don't need it on dark bg).
  Keep shadow on light-background cards only.
- **No emoji icons**: already using Lucide — maintain.
- **Spec text (PropertyCard)**: replace icon+text with `·`-separated plain text.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/app/globals.css` | Add `slideUp`, `slideUpFast` keyframes |
| `src/components/ui/Eyebrow.tsx` | Thicker/longer rule (`h-0.5 w-12`) |
| `src/components/home/Hero.tsx` | Full navy bg, `clamp` headline, `rounded-none` portrait, `rounded-sm` CTAs, gold bar, slideUp animation |
| `src/components/home/WhoWeAre.tsx` | Dark cards `bg-navy-950`, color border-top per member, role pill, stagger animation |
| `src/components/home/Stats.tsx` | Huge `clamp` numbers, inline label to right, gold dividers |
| `src/components/home/TestimonialsCarousel.tsx` | Dark section `bg-navy-950`, big decorative `"`, gold avatar, dark card bg |
| `src/components/home/SalesStories.tsx` | Asymmetric grid, `rounded-sm` cards, gold play button, taupe bg |
| `src/components/home/ContactSection.tsx` | Gold bar above headline, `rounded-sm` CTA, slightly larger headline |
| `src/components/houses/PropertyCard.tsx` | Price out of overlay, `·` specs, `rounded-sm`, inquire as real button, gold FOR SALE badge |
| `src/components/team/TeamMemberProfile.tsx` | Dark hero section, pull-quote tagline, gold avatar, dark "meet the rest" cards |
| `src/components/layout/Footer.tsx` | Gold separator `border-t-2 border-gold/25`, larger column headings |
| `src/components/layout/Navbar.tsx` | `rounded-sm` on "Free Guide" button |

---

## Out of Scope

- No structural layout changes to `/contact-us` page (form already well-executed)
- No changes to i18n keys or content
- No new pages
- No changes to data layer or Supabase integration
- No image assets added (placeholders remain, real images are a content task)
