# Graph Report - .  (2026-07-13)

## Corpus Check
- Large corpus: 121 files � ~603,302 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 349 nodes · 551 edges · 43 communities (15 shown, 28 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Resources Funnel & Forms
- Design Elevation Changelog
- Houses Listing Pages
- Contact & Locale Layout
- Package Dependencies
- Home Page & Reviews
- CLAUDE.md Project Changelog
- Contact Form & Webhook
- TypeScript Config
- Sales Stories & Video
- Hero & Newsletter Modal
- Logo Brand Assets
- Testimonials Carousel
- Next.js Config
- ESLint Config
- MCP Config
- PostCSS Config
- Supabase Client
- Favicon Image
- Adriana Portrait Photo
- Adriana Meléndez Portrait
- Adriana Avatar Photo
- John Leonard Avatar
- Melany Valencia Avatar
- Viviane Chiu Avatar
- John Hero Portrait
- Melany Hero Portrait (PNG)
- Melany Hero Portrait (WebP)
- Viviane Hero Portrait
- Home CTA Background
- Logo (White Version)
- Main Hero Background
- Adriana Guide Cover
- John Guide Cover
- Melany Guide Cover
- Viviane Guide Cover
- Adriana Bio Photo
- John Bio Photo
- Melany Bio Photo
- Team Group Portrait
- Viviane Bio Photo

## God Nodes (most connected - your core abstractions)
1. `CLAUDE.md — A&J Real Estate Group Project Master Doc` - 22 edges
2. `compilerOptions` - 16 edges
3. `Eyebrow()` - 15 edges
4. `Design Elevation Implementation Plan` - 15 edges
5. `Changelog 2026-06-22: Design Elevation 'Exaggerated Minimalism' completed` - 14 edges
6. `Design Elevation Spec — Exaggerated Minimalism` - 13 edges
7. `brand` - 11 edges
8. `SDD Progress Ledger (Design Elevation)` - 11 edges
9. `Task 3: Hero — the signature element` - 10 edges
10. `Task 4: WhoWeAre — dark editorial team cards` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Task 6: TestimonialsCarousel — dark immersive quote section` --implements--> `TestimonialsCarousel()`  [EXTRACTED]
  docs/superpowers/plans/2026-06-22-design-elevation.md → src/components/home/TestimonialsCarousel.tsx
- `Exaggerated Minimalism (design style direction)` --semantically_similar_to--> `Changelog 2026-06-22: Design Elevation 'Exaggerated Minimalism' completed`  [INFERRED] [semantically similar]
  docs/superpowers/specs/2026-06-22-design-elevation-spec.md → CLAUDE.md
- `A&J Real Estate Group logo (Logo.PNG) — navy house-outline mark with hand-lettered 'Group' script and key icon` --conceptually_related_to--> `CLAUDE.md confirmed brand color tokens (navy #102037 primary, slate #597383, taupe #49443e, crema #fff7f5, blush #e9d8d0, gold #c7a260)`  [INFERRED]
  public/images/Logo.PNG → CLAUDE.md
- `Task 8: ContactSection — gold bar + scale` --implements--> `ContactSection()`  [EXTRACTED]
  docs/superpowers/plans/2026-06-22-design-elevation.md → src/components/home/ContactSection.tsx
- `Task 3: Hero — the signature element` --implements--> `Hero()`  [EXTRACTED]
  docs/superpowers/plans/2026-06-22-design-elevation.md → src/components/home/Hero.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Design Elevation 'Exaggerated Minimalism' Initiative** — docs_superpowers_plans_2026_06_22_design_elevation, docs_superpowers_specs_2026_06_22_design_elevation_spec, superpowers_sdd_progress, claude_md_design_elevation_completed [EXTRACTED 0.95]
- **Components sharing Task 1's Eyebrow + slideUp foundation** — docs_superpowers_plans_2026_06_22_design_elevation_task_1_foundation, docs_superpowers_plans_2026_06_22_design_elevation_task_3_hero, docs_superpowers_plans_2026_06_22_design_elevation_task_4_whoweare, docs_superpowers_plans_2026_06_22_design_elevation_task_6_testimonialscarousel, docs_superpowers_plans_2026_06_22_design_elevation_task_7_salesstories, docs_superpowers_plans_2026_06_22_design_elevation_task_10_teammemberprofile [INFERRED 0.85]
- **Subagent-Driven Development workflow for Design Elevation tasks** — superpowers_sdd_progress, docs_superpowers_plans_2026_06_22_design_elevation, docs_superpowers_plans_2026_06_22_design_elevation_subagent_driven_development [EXTRACTED 0.90]

## Communities (43 total, 28 thin omitted)

### Community 0 - "Resources Funnel & Forms"
Cohesion: 0.07
Nodes (35): POST(), generateMetadata(), ResourcePage(), Labels, ResourceForm(), Step1Data, step1Schema, generateMetadata() (+27 more)

### Community 1 - "Design Elevation Changelog"
Cohesion: 0.11
Nodes (40): Changelog 2026-06-22: Design Elevation 'Exaggerated Minimalism' completed, Mini-Fase 6a: Home UI Polish (planned, in curso), Design Elevation Implementation Plan, Subagent-Driven Development (SDD) workflow, Task 10: TeamMemberProfile — dark profile hero + pull-quote, Task 1: Foundation — animation tokens + Eyebrow, Task 2: Navbar + Footer — minor polish, Task 3: Hero — the signature element (+32 more)

### Community 2 - "Houses Listing Pages"
Cohesion: 0.09
Nodes (23): generateMetadata(), priceFmt, PropertyDetailPage(), HousesPage(), FloorPlanCarousel(), Props, ListingsGrid(), priceFmt (+15 more)

### Community 3 - "Contact & Locale Layout"
Cohesion: 0.11
Nodes (14): ebGaramond, montserrat, Footer(), LocaleSwitcher(), Navbar(), TopBar(), ICONS, SocialLinks() (+6 more)

### Community 4 - "Package Dependencies"
Cohesion: 0.07
Nodes (28): dependencies, @hookform/resolvers, lucide-react, motion, next, next-intl, react, react-dom (+20 more)

### Community 5 - "Home Page & Reviews"
Cohesion: 0.12
Nodes (13): ContactSection(), avatarColors, GoogleReviews(), Labels, Props, Stats(), useCountUp(), memberAccent (+5 more)

### Community 6 - "CLAUDE.md Project Changelog"
Cohesion: 0.11
Nodes (21): CLAUDE.md — A&J Real Estate Group Project Master Doc, Changelog 2026-07-07: Agent video, lead magnets, Contact Us to ITMANO webhook, Changelog 2026-06-19: CLAUDE.md created, initial architecture defined, Changelog 2026-06-22: Fase 0 Project setup completed, Changelog 2026-06-22: Fase 1 Global layout completed, Changelog 2026-06-22: Fase 2 Home page completed, Changelog 2026-06-22: Fase 3 Houses listings completed, Changelog 2026-06-22: Fase 4 Team + Contact completed (+13 more)

### Community 7 - "Contact Form & Webhook"
Cohesion: 0.15
Nodes (15): POST(), reasonByIntent, ContactForm(), intentLabelKey, langLabelKey, Status, ContactFormValues, ContactIntent (+7 more)

### Community 8 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 9 - "Sales Stories & Video"
Cohesion: 0.24
Nodes (12): SalesStories(), useCardsPerSlide(), AgentVideoSection(), Props, Props, VideoModal(), salesStories, SalesStory (+4 more)

### Community 10 - "Hero & Newsletter Modal"
Cohesion: 0.36
Nodes (5): Hero(), NewsletterModal(), NewsletterContext, NewsletterProvider(), useNewsletter()

### Community 11 - "Logo Brand Assets"
Cohesion: 0.29
Nodes (7): CLAUDE.md open decision: real assets status — Logo.PNG and Team_Portrait_2.webp already in the repo, CLAUDE.md confirmed brand color tokens (navy #102037 primary, slate #597383, taupe #49443e, crema #fff7f5, blush #e9d8d0, gold #c7a260), CLAUDE.md changelog (Fase 5 SEO): favicon generated from Logo.PNG via generateMetadata in [locale]/layout.tsx, House-outline icon (roof + walls, small arched window) forming the top of the logo, Key icon appended to the hand-lettered 'Group' script (real estate / homeownership motif), A&J Real Estate Group logo (Logo.PNG) — navy house-outline mark with hand-lettered 'Group' script and key icon, 'A&J' serif wordmark + 'REAL ESTATE' letter-spaced caption

### Community 12 - "Testimonials Carousel"
Cohesion: 0.40
Nodes (4): avatarColors, TestimonialsCarousel(), Testimonial, testimonials

## Ambiguous Edges - Review These
- `CLAUDE.md — A&J Real Estate Group Project Master Doc` → `README.md (create-next-app boilerplate)`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to
- `Design Elevation Implementation Plan` → `Mini-Fase 6a: Home UI Polish (planned, in curso)`  [AMBIGUOUS]
  CLAUDE.md · relation: conceptually_related_to

## Knowledge Gaps
- **157 isolated node(s):** `vercel`, `eslintConfig`, `withNextIntl`, `nextConfig`, `name` (+152 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `CLAUDE.md — A&J Real Estate Group Project Master Doc` and `README.md (create-next-app boilerplate)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Design Elevation Implementation Plan` and `Mini-Fase 6a: Home UI Polish (planned, in curso)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Eyebrow()` connect `Design Elevation Changelog` to `Houses Listing Pages`, `Contact & Locale Layout`, `Home Page & Reviews`, `Sales Stories & Video`, `Hero & Newsletter Modal`, `Testimonials Carousel`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **Why does `CLAUDE.md — A&J Real Estate Group Project Master Doc` connect `CLAUDE.md Project Changelog` to `Design Elevation Changelog`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `Changelog 2026-06-22: Design Elevation 'Exaggerated Minimalism' completed` connect `Design Elevation Changelog` to `CLAUDE.md Project Changelog`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Are the 10 inferred relationships involving `Changelog 2026-06-22: Design Elevation 'Exaggerated Minimalism' completed` (e.g. with `Task 10: TeamMemberProfile — dark profile hero + pull-quote` and `Task 2: Navbar + Footer — minor polish`) actually correct?**
  _`Changelog 2026-06-22: Design Elevation 'Exaggerated Minimalism' completed` has 10 INFERRED edges - model-reasoned connections that need verification._
- **What connects `vercel`, `eslintConfig`, `withNextIntl` to the rest of the system?**
  _159 weakly-connected nodes found - possible documentation gaps or missing edges._