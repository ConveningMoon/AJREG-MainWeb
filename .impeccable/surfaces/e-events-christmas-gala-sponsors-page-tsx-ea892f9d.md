---
version: 2
slug: "e-events-christmas-gala-sponsors-page-tsx-ea892f9d"
primary_target: "src/app/[locale]/events/christmas-gala/sponsors/page.tsx"
related_targets: ["src/components/events/gala/SponsorForm.tsx", "src/components/events/gala/BrandShowcase.tsx", "src/components/events/gala/gala.css"]
---

# Gala Christmas Party — sponsor landing

Scope: `/[locale]/events/christmas-gala/sponsors`, bilingual EN/ES. Mode: Persuade.
Audience: Hampton Roads business owners considering sponsorship of a Christmas celebration with A&J clients, local businesses and Latino communities. Applications go to Google Sheet + email to Adriana; she follows up personally. No checkout.

Confirmed facts: Saturday December 5, 2026, 7–11 PM, The Royal Courtyard at West Neck, 100+ guests, adults only, semi-formal, four existing tiers. A&J video production is included from $750. Applications close November 28, 2026. Spots-left values are client-requested display numbers. No invented testimonials or venue photography.

## Direction contract — revised at the user's request, 2026-10-13

THESIS: A warm winter invitation where a business becomes part of the celebration. Editorial typography, restrained gold framing and evergreen night light connect the pitch to Christmas.

OWN-WORLD: Navy and evergreen anchor the hero, brand canvas and application. Cream holds audience, packages and FAQ. EB Garamond titles and prices, Montserrat body and controls. Gold foil hairlines, a double video frame, a small holiday light strand and wine-colored display table are campaign art only.

STORY: Invitation video → centered application deadline → community → conceptual brand presence → package comparison → preparation steps → FAQ → application.

FIRST VIEWPORT: Left 7/12: short Christmas/community label, headline with an italic gold emphasis, supporting copy, event facts and CTAs. Right 5/12: real vertical invitation video fills the column width with native controls and uncropped content. The hero may extend beyond the first viewport to prioritize the video. On mobile: copy and CTAs, then video. Countdown has its own centered section after the complete hero.

SIGNATURE INTERACTION: BrandShowcase switches among screen, display table and community. These are conceptual illustrations, explicitly labeled, independent of any venue floor plan. Each view states the applicable package benefits. Native buttons expose their selected state, share one stable preview region and support keyboard input. LazyMotion animates only the changing artwork; reduced-motion disables the transition.

CONVERSION: Existing tier-to-form selection, URL preselection, sticky application bar and application validation remain. No new integration or lead destination.

## Campaign-local values

- Evergreen `#143b35` and wine `#512832` are confined to `gala.css`; bronze `#94664b` is a decorative package rule. Global tokens remain the brand source.
- Deep gold `#8a6a2f` for small text on cream and hover gold `#d4b273` are inherited from the original campaign.
- Snowfall, radial stage light, light strand and authored CSS brand canvas are campaign illustration. No new raster assets or third-party asset provenance to track.
- Pricing comparison keeps the Gold column and uses thin category rules. Preparation steps use cream panels on blush; open FAQ items gain a quiet background; the form sits on the evergreen night field.

## Finish verification

Review desktop 1440×900 and mobile 390×844, ES/EN; check page width, all canvas views, tier handoff, FAQ disclosure and countdown below the hero. Run TypeScript, scoped ESLint and production build. Never submit a live sponsor test application.
