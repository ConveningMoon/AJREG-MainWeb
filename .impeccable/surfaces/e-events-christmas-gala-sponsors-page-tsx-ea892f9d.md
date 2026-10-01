---
version: 1
slug: "e-events-christmas-gala-sponsors-page-tsx-ea892f9d"
primary_target: "src/app/[locale]/events/christmas-gala/sponsors/page.tsx"
related_targets: ["src/components/events/gala/SponsorForm.tsx"]
---

# Gala Christmas Party — sponsor landing

Scope: `/[locale]/events/christmas-gala/sponsors`, bilingual EN/ES. Mode: Persuade.
Audience: Hampton Roads business owners (lenders, insurers, home services, food, retail, legal) deciding whether to sponsor A&J's client-appreciation gala. Job: understand the room, the screens offer and the packages, then apply. Applications go to a Google Sheet + email to Adriana (not ITMANO); Adriana follows up personally, so there is no checkout.
Proof on hand: flyer facts only (date Sat Dec 5 2026 7–11 PM, The Royal Courtyard at West Neck, 100+ guests, adults only, semi-formal, four tiers and benefits). Video produced by A&J (filming + editing) is included from $750. Spots-left numbers are client-requested display values (data/christmasGala.ts). No photos or video yet: media slots are labeled placeholders; the invitation video is in production.
Constraints: deadline Nov 28 2026 shown as a live countdown. No invented testimonials, past-sponsor logos or response times.

## Direction contract

THESIS: A sponsorship proposal read like a short, confident pitch in chapters — audience first, screens second, price third — instead of the category's flyer-wall of tiers and clip-art.

OWN-WORLD: Winter-night navy (navy-950/900) owns the opening, the screens chapter and the application; warm cream holds the comparison and FAQ for reading. Heirloom gold only on actions, the countdown digits and the Gold tier frame. EB Garamond for headlines, prices and countdown numerals; Montserrat for everything else. Thin gold hairlines, quarter-rem decisive controls, no eyebrows, no section numbers, no icon-tile card grids.

STORY: The visitor learns who will be in the room, sees that A&J will film their video for the screens, compares four packages in one table, and applies in two minutes knowing Adriana will call.

FIRST VIEWPORT: Left 7/12: H1 at display scale, one supporting sentence, the event facts line, a live countdown to the deadline, gold "Apply to sponsor" + outline "Compare packages". Right 5/12: a 16:9 venue-screen frame holding the invitation-video placeholder. Slow snowfall canvas behind, paused under reduced motion.

FORM: Proposal in chapters (structure 2 of 3 presented; surface seed e019eabc), with a sticky deadline bar and tier → form handoff as the signature interaction.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Cited adaptations
- Countdown sits in the right column under the invitation-video screen on desktop (not under the event facts) so H1, facts, CTAs and the live clock all fit inside a 1440×900 first viewport; on mobile it follows the CTAs directly, before the screen.
- Media slots are titled placeholders (no play affordance) until the invitation video and photos exist; the screens chapter uses an authored, labeled illustrative room plan.
- Gold beyond the OWN-WORLD list (hero fact icons, contact icons, the "Included from $750" accent, spots-left text, the final "your night" step dot) follows DESIGN.md's Gold Is a Signal Rule, which allows gold on icons and short accents.

## Event-local values (documenter, 2026-10-01)
These stay on this surface. They are not system tokens, and DESIGN.md / design.json are unchanged.
- `#8a6a2f` deep gold text for the spots-left line on cream. Heirloom gold `#c7a260` on cream is too low-contrast for small text; on navy the line uses `text-gold`.
- `#d4b273` lighter gold hover on primary actions (page, form, sticky bar). The rest of the site uses `hover:bg-gold/85`. Either fits the "modest gold tint" rule; reuse elsewhere would need a token.
- Snowfall canvas, room-plan SVG, winter radial glows and the gold inset-hairline Gold-tier column are event illustration/motion only.
- Not approved: two large custom shadows on static elements, the venue-screen frame `0 40px 80px -30px` and the form card `0 30px 60px -30px`. Both fall outside the Shadow Vocabulary and the Earned Elevation Rule. They are open for the finish review, not recorded as a pattern.
