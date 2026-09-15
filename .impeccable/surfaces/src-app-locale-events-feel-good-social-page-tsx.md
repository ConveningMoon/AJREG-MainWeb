---
version: 1
slug: "src-app-locale-events-feel-good-social-page-tsx"
primary_target: "src/app/[locale]/events/feel-good-social/page.tsx"
related_targets: ["src/components/events/FeelGoodSocialForm.tsx", "src/app/[locale]/events/feel-good-social/FeelGoodSocial.module.css"]
---

# Feel Good Social giveaway page

Scope: `src/app/[locale]/events/feel-good-social/page.tsx` and its dedicated giveaway component. Visitor mode: Operate.

Audience: women already attending Feel Good Social and opening the page on a phone. Job: enter the onsite giveaway quickly while optionally sharing useful real-estate context. Primary action: submit a giveaway entry. Constraints: English-only campaign content; do not show event time or venue, invent prize details, eligibility rules, or winner mechanics; preserve A&J global chrome, the existing ITMANO channel ID, its first-party beacon, and the intake contract.

## Direction contract

THESIS: A gift ticket in hand turns the entire page into one compact, thumb-friendly entry surface rather than an event landing page.

OWN-WORLD: A&J navy and cream support the campaign's petal pink, raspberry, blush, and restrained gold. A crisp geometric gift SVG provides the focal object over a sparse dotted gift-wrap ground; EB Garamond carries warmth while Montserrat keeps the form fast to scan.

STORY: The visitor sees the gift and giveaway purpose immediately, enters contact details, then chooses whether buying, selling, investing, or only the giveaway is relevant. Conditional optional questions use the CRM's exact scoring vocabulary.

FIRST VIEWPORT: On a 390px phone, the gift, giveaway title, and first contact fields appear as one centered composition with no event logistics or competing navigation inside the campaign surface.

FORM: Two-step progressive entry. Step changes use short exponential ease-out movement, the form scrolls smoothly back into view, and reduced motion removes spatial movement without erasing feedback. Seed key: direct-brief-raffle-mobile.

QUALITY BAR: At 390px, match the clarity and touch comfort of a polished native signup flow while retaining A&J's editorial warmth: gift and purpose understood at a glance, 48px controls, no horizontal overflow, no hidden required context, and no continuous decorative motion after the gift settles. Desktop may breathe wider but must remain one focused task rather than expanding back into a campaign landing page.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

Memorable moment: a wrapped gift arrives once with a soft, weighted settling motion; afterward the interface stays calm and task-focused. Unresolved: prize, drawing, eligibility, and winner-notification details remain intentionally unclaimed because they were not supplied.
