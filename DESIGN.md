---
name: "A&J Real Estate Group"
description: "A warm, trustworthy bilingual real-estate identity grounded in deep navy, soft cream, and restrained gold."
colors:
  navy-50: "#f1f4f6"
  navy-100: "#d2dadf"
  navy-200: "#b4c0c8"
  navy-300: "#96a7b1"
  navy-400: "#778d9a"
  navy-500: "#597383"
  navy-600: "#475e70"
  navy-700: "#344a5d"
  navy-800: "#22354a"
  navy-900: "#102037"
  navy-950: "#0a1321"
  taupe: "#49443e"
  cream: "#fff7f5"
  blush: "#e9d8d0"
  gold: "#c7a260"
typography:
  display:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "clamp(2.75rem, 6vw, 6.5rem)"
    fontWeight: 600
    lineHeight: 0.9
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "normal"
  title:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "normal"
  body:
    fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0.2em"
rounded:
  sm: "0.25rem"
  md: "0.375rem"
  lg: "0.5rem"
  xl: "0.75rem"
  "2xl": "1rem"
  full: "9999px"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "5": "1.25rem"
  "6": "1.5rem"
  "8": "2rem"
  "10": "2.5rem"
  "12": "3rem"
  "16": "4rem"
  "24": "6rem"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.navy-950}"
    rounded: "{rounded.sm}"
    padding: "1rem 1.75rem"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    rounded: "{rounded.sm}"
    padding: "1rem 1.75rem"
  card:
    backgroundColor: "#ffffff"
    textColor: "{colors.navy-900}"
    rounded: "{rounded.2xl}"
    padding: "1.5rem"
  input:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.navy-900}"
    rounded: "{rounded.lg}"
    padding: "0.625rem 1rem"
  chip:
    backgroundColor: "{colors.navy-100}"
    textColor: "{colors.navy-700}"
    rounded: "{rounded.full}"
    padding: "0.25rem 0.75rem"
---

# Design System: A&J Real Estate Group

## Overview

**Creative North Star: "The Warm Welcome Home"**

The A&J visual system pairs the composure of a trusted real-estate advisor with the warmth of a family and community welcome. Deep navy establishes credibility, cream and blush keep pages humane and inviting, and restrained gold marks the moments that deserve attention. The result is clean and elegant without becoming remote, loud, or status-driven.

Editorial EB Garamond headlines supply aspiration and personality while Montserrat keeps navigation, forms, facts, and multilingual content clear. Real team, home, family, and community imagery should lead whenever suitable source material exists; decorative treatments remain subordinate to that human evidence.

**Key Characteristics:**

- Warm authority rather than corporate severity.
- Editorial display type paired with highly legible utility text.
- Deep navy anchors, warm light surfaces, and sparing gold accents.
- Real people, homes, and community context over generic luxury signaling.
- Clear actions, visible focus, and responsive layouts in English and Spanish.

## Colors

The palette moves from Harbor Navy through softened slate blues into warm cream and blush, with Heirloom Gold used as a deliberate accent rather than a field color.

### Primary

- **Harbor Navy:** Primary text, headings, global navigation, footer, and the system's strongest dark surfaces.
- **Deep Harbor:** Hero overlays and the deepest tonal layer where more contrast or atmosphere is required.
- **Slate Blue:** Muted copy, supporting information, secondary icons, and transitions between navy extremes.

### Secondary

- **Warm Taupe:** A warm dark neutral reserved for contexts where blue-black would feel too cool.

### Tertiary

- **Heirloom Gold:** Calls to action, eyebrow rules, active navigation, icons, and small emphasis details.

### Neutral

- **Soft Cream:** The default page ground and warm alternative to stark white.
- **Quiet Blush:** Soft section fills, selected controls, and low-emphasis supporting surfaces.
- **Navy Mist Scale:** The light and middle navy steps supply borders, dividers, muted text, and tonal layering without introducing unrelated grays.

### Named Rules

**The Gold Is a Signal Rule.** Use gold for actions, active states, icons, and short accents; its restraint is what gives it authority.

**The Warm Ground Rule.** Default public pages to cream or a deliberate navy field. Use pure white inside contained surfaces rather than as the site's overall atmosphere.

## Typography

**Display Font:** EB Garamond (with Georgia and serif fallbacks)
**Body Font:** Montserrat (with system sans-serif fallbacks)

**Character:** EB Garamond brings a cultivated, personal editorial voice to headlines, prices, quotations, and names. Montserrat carries body copy and interface language with modern clarity, including bilingual navigation and form content.

### Hierarchy

- **Display** (semibold, fluid hero scale, compact line height): Hero statements and rare high-impact editorial moments.
- **Headline** (semibold, responsive large scale, tight line height): Page and section headings, typically paired with a short eyebrow.
- **Title** (semibold, medium display scale, compact line height): Card, modal, and sidebar titles.
- **Body** (regular, base size, relaxed line height): Explanations, descriptions, form guidance, and long-form content; keep primary reading measures near 40–48rem.
- **Label** (semibold, small size, wide tracking, uppercase): Eyebrows, dates, metadata, chips, and compact utility labels.

### Named Rules

**The Editorial-and-Utility Rule.** Use EB Garamond to create emotional hierarchy and Montserrat to make information and actions effortless to scan.

**The Two-Voice Rule.** Do not add another display or body family. Express variation through scale, weight, case, and spacing within the established pair.

## Layout

Pages use a centered content frame that usually tops out at 80rem, with 1.5rem mobile gutters and occasional 2.5rem desktop gutters on more expressive sections. Reading-heavy and team surfaces narrow to 64–72rem; forms and focused tasks narrow further. Sections commonly use 3–4rem vertical padding on compact screens and 4–6rem on large screens.

Desktop layouts favor purposeful two-column compositions and three-column card grids. They collapse to a single clear flow on small screens, with two-column intermediate states where the content remains scannable. Navigation switches from the full link row and utility actions to a stacked mobile menu; the top utility bar is intentionally hidden below the medium breakpoint.

Spacing follows a quarter-rem base rhythm with 0.75rem, 1rem, 1.5rem, 2rem, 3rem, 4rem, and 6rem as the most visible composition steps. Keep copy close to the heading it explains, and use larger gaps to separate ideas or sections rather than padding every element equally.

**The Clear Path Rule.** Each surface should make the next action obvious in the reading order, with layout supporting the action rather than competing with it.

## Elevation & Depth

The system is flat by default and uses a restrained hybrid of tonal layering, thin low-opacity rings, image overlays, and responsive elevation. White cards on cream grounds generally receive a quiet one-pixel navy ring and soft shadow; stronger shadows appear on hovering cards, floating menus, dialogs, and media controls. Dark surfaces create depth primarily through adjacent navy tones and gradients.

### Shadow Vocabulary

- **Surface Rest** (`box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`): White cards and form containers at rest, paired with a faint navy ring.
- **Interactive Lift** (`box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`): Hovering cards and dropdowns that move above surrounding content.
- **Dialog Lift** (`box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25)`): Modal and full-attention overlays only.

### Named Rules

**The Earned Elevation Rule.** Keep static sections calm. Add conspicuous shadow only when an element floats, opens, or responds to interaction.

## Shapes

The base system mixes compact gently squared controls with softly rounded content surfaces. Primary global actions and profile controls often use a subtle quarter-rem corner; form fields use a half-rem corner; content cards and dialogs use a one-rem corner. Pills and circles are reserved for statuses, compact selectors, avatars, and icon controls.

Thin borders and low-opacity rings provide structure without hard boxing. Image media clips to the containing card or gallery radius. Decorative geometry may enrich a confirmed campaign, but it does not redefine the global shape language.

**The Radius Has a Job Rule.** Use small corners for decisive controls, larger corners for welcoming containers, and full pills only for compact categorical elements.

## Components

### Buttons

Buttons are confident and compact, with gold reserved for the primary action and outline treatments for secondary choices.

- **Shape:** Gently squared in the global brand system, with pill variants used in form-led flows where already established.
- **Primary:** Heirloom Gold background, Deep Harbor text, semibold Montserrat, and generous horizontal padding.
- **Hover / Focus:** A modest gold tint or opacity shift, occasional half-step lift, and a two-pixel visible outline with offset. Disabled controls retain their shape and reduce opacity without losing their label.
- **Secondary / Ghost:** Transparent on dark fields with a restrained gold border; on light fields, navy text and border gain gold emphasis on hover.

### Chips

- **Style:** Compact uppercase or medium-weight labels with full pill geometry. Status chips use gold for available/affirmative states and the navy mist range for quiet states.
- **State:** Selected filters move to a gold field with deep navy text; unselected filters use a faint navy fill or outline.

### Cards / Containers

Cards feel calm and editorial rather than dense or dashboard-like.

- **Corner Style:** Soft one-rem corners for primary content cards; three-quarter-rem corners for smaller grouped surfaces.
- **Background:** White on cream for light cards, or middle navy on deep navy for dark grouped content.
- **Shadow Strategy:** Faint shadow and ring at rest, with stronger lift only for interactive cards.
- **Border:** One-pixel navy-tinted rings or borders at low opacity.
- **Internal Padding:** Commonly 1.25–2rem, increasing for focused or modal content.

### Inputs / Fields

- **Style:** Warm translucent cream or white field, navy text, light navy border, and a half-rem to three-quarter-rem corner.
- **Focus:** Border shifts to gold and gains a soft two-pixel gold ring; native outlines are replaced only when this visible treatment is present.
- **Error / Disabled:** Errors use direct red text and soft red surfaces. Disabled actions reduce opacity and preserve readable labels.

### Navigation

The global navigation sits on Harbor Navy with cream links, Heirloom Gold active and hover states, and a short underline that grows beneath desktop links. The header remains sticky, the logo retains clear space, and the mobile menu expands into a straightforward stacked list. Language controls stay compact, uppercase, and visibly indicate the active locale.

### Eyebrow

The signature section label pairs a short gold rule with a small uppercase Montserrat label and generous tracking. It previews hierarchy without competing with the EB Garamond heading that follows.

## Do's and Don'ts

### Do:

- **Do** anchor global surfaces in the confirmed navy, slate, cream, blush, and gold identity.
- **Do** pair expressive EB Garamond hierarchy with clear Montserrat copy and controls.
- **Do** use real team, home, family, and community imagery when approved source assets exist.
- **Do** preserve visible keyboard focus, sufficient contrast, reduced-motion behavior, and responsive English/Spanish layouts.
- **Do** keep event-specific color, illustration, and motion decisions in that event's surface brief unless repeated use establishes them as a system pattern.

### Don't:

- **Don't** flood a page with gold or use it as a large generic background; it is a directional accent.
- **Don't** replace warm cream with stark white across entire pages or substitute unrelated cool grays for the navy tonal scale.
- **Don't** introduce a third font family or use decorative display type for form labels and body copy.
- **Don't** use heavy shadow on every container; elevation must communicate hierarchy or interaction.
- **Don't** promote the Feel Good Social raspberry palette, particles, botanical marks, or invitation composition into global tokens or reusable rules.
