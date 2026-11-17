# STA-564: the Platform pages go live; the old pages move to /legacy

Approved by Harry on 17 Nov 2026 in chat: the new pages replace the live ones before shipping, the old ones stay forever
at `/legacy`, nothing under `/landing-pages` reaches production, two more trial buttons on Platform. Lane: sketch harden
(pages) + standard (routing, SEO). Branch `feat/sta-564-go-live`, stacked on `feat/sta-552-feature-previews`.

## What changes

| Page | URL (unchanged) | Renders |
|---|---|---|
| Homepage | `/`, `/en`, `/es`, `/pl` (market int), `/us` (market us), `/uk` (market uk) | `PlatformPage` |
| Feature pages | `/features/<localised slug>` in each locale | the six feature previews |
| Loyalty programs | `LOYALTY_SLUGS` per locale | the loyalty programs preview |
| Old pages | `/legacy`, `/{en,es,pl}/legacy`, `/us/legacy`, `/uk/legacy`, `…/legacy/features/<slug>`, `…/legacy<loyalty slug>` | today's pages, unchanged |

## Acceptance criteria

- **AC1** Given each locale and market, when a visitor opens the homepage URL, then it renders Platform in that
  language and market (US: dollars, 14 days, "punch card" H1; int and uk: euros, 30 days).
- **AC2** Given each locale, when a visitor opens a feature page or the loyalty programs page at today's localised URL,
  then it renders the matching Platform-style page in that language.
- **AC3** Given any old page, when a visitor opens its `/legacy` URL, then it renders exactly what that page rendered
  before, with `noindex`; no `/legacy` URL is in the sitemap, `llms.txt`, the markdown proxy, any hreflang cluster or menu.
- **AC4** Given any `/landing-pages/...` or `/us/landing-pages/...` URL, when opened, then it is not found. The three
  US ad variants (how-it-works, features, outcomes) are deleted with the code only they use (git history keeps them).
- **AC5** Given the new live pages, then they are indexable and carry the head the old pages carried at the same URL:
  canonical, hreflang cluster (feature slug mapping, pilot hreflang on the homepage), sitemap entries, JSON-LD
  (homepage's, plus FAQPage on pages with a FAQ), Open Graph.
- **AC6** Given the header and footer on any page, then their feature and loyalty links lead to the live localised
  URLs, and geolocation shows "Soon".
- **AC7** Given the Platform page, then a trial button sits after "Stamps, points or levels" and another after "Run it
  from your computer or your phone", each tracked with its own CTA location.
- **AC8** Given the new homepage, then `LandingTracker` reports its own landing variant (`lp_platform`), distinct from
  the legacy homepage's (`wallet`), so sign-ups are attributable per version.
- **AC9** Copy per locale stays within its layout: the English length caps of `copy.test.ts`, +20% for fr/es/pl.

## Not in scope

Renaming the `landing-pages` code folders. PostHog persistence and identity (separate change). The demo card's look (STA-565).

## Docs decision

Answered in the PR description.
