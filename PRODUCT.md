# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A&J Real Estate Group serves families, military households, first-time buyers,
relocating clients, and Spanish-speaking households across Hampton Roads,
Virginia, and North Carolina. Campaign pages may also serve local community
audiences who are meeting the team outside a real-estate transaction.

## Product Purpose

The public website helps visitors understand the team, explore homes and
resources, contact an agent, and register for A&J community initiatives. Success
means a visitor can quickly understand the offer and complete the relevant
contact or registration flow with confidence.

## Positioning

A&J combines local real-estate expertise with a warm, family-centered and
multilingual service model. Its public presence connects property guidance with
real community relationships rather than presenting the team as a remote lead
brokerage.

## Operating Context

The site is a Next.js App Router marketing application deployed to Vercel. It
uses locale-prefixed routes, first-party proxy paths for ITMANO CRM intake and
measurement, and direct campaign links that do not always appear in primary
navigation.

## Capabilities and Constraints

- English and Spanish are supported globally; individual campaign surfaces may
  intentionally launch in one confirmed language.
- Forms submit to ITMANO CRM using the exact channel contract supplied for each
  campaign, including the required empty honeypot field.
- CRM view measurement must load through the local `/intake.js` rewrite with the
  correct public channel ID.
- Marketing copy must not invent prices, availability, attendance limits,
  addresses, testimonials, or other unconfirmed event and business claims.

## Brand Commitments

The product is A&J Real Estate Group. Its durable voice is warm, trustworthy,
modern, close to families, and community-minded. Existing logo assets and the
navy, slate, cream, blush and gold identity remain authoritative. A confirmed
campaign may extend that identity with an event-specific palette while keeping
the A&J brand recognizable.

## Evidence on Hand

- Brand tokens and global typography: `src/app/globals.css`
- Logo and team imagery: `public/images/`
- Product and implementation record: `CLAUDE.md`
- Existing CRM intake and measurement patterns: `next.config.ts`,
  `src/components/ItmanoBeacon.tsx`, and newsletter form components
- The Feel Good Social date, time, venue name, audience, activities, and ITMANO
  channel contract were supplied by the user; no exact street address or event
  photography was supplied.

## Product Principles

- Make the next action obvious without pressuring the visitor.
- Keep every factual claim traceable to supplied content or repository evidence.
- Treat bilingual and mobile behavior as product requirements, not finishing
  touches.
- Keep CRM submissions and view measurement observable and contract-accurate.
- Express warmth through real clarity, care, and community context.

## Accessibility & Inclusion

Use semantic HTML, keyboard-visible focus states, useful labels and status
messages, sufficient contrast, reduced-motion support, and responsive layouts.
Event language should be welcoming and avoid assumptions about a participant's
fitness level or prior experience.
