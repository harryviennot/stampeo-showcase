# UX Brief: STA-330 (Pricing display follows visitor region)
MODE: DESIGN   DOMAIN: showcase
VERDICT: READY

## Already shipped
The per-market machinery is all built; what is missing is only the "follow the
visitor, not the URL" wiring. Specifically:

- Market-driven pricing display ships today: `components/landing-variant/VariantLanding.tsx`
  (fetches one ladder via `getPlanCatalog`, passes `pricing` + `trialDays` down)
  and `components/pricing/MarketPricingPage.tsx` do exactly this per page-market.
- Client-side region detection with the exact sanctioned pattern already exists
  twice: `hooks/use-detected-country.ts` and `components/market/MarketSuggestion.tsx`
  (both `useSyncExternalStore` + `detectBrowserCountry` from `lib/phone-utils.ts`,
  server snapshot = null).
- **The "US visitor on a EUR page" problem already has a shipped, weaker answer:**
  the `MarketSuggestion` banner renders directly above the ladder in both
  `PricingSection.tsx:48` and `PricingPageContent.tsx:398` and offers the `/us`
  link to detected-US visitors. This issue upgrades that from "one click away"
  to "already correct" — the banner's placement is the strongest argument that no
  *additional* explanatory affordance is needed (see Rejected).
- Token interpolation, locale-aware money formatting, and trial-day sourcing all
  exist: `interpolatePricing` / `formatMoney` in `lib/pricing.ts`,
  `MARKETS[market].trialDays` in `lib/markets.ts`. All catalogs use plain
  `{trialDays}` interpolation, no ICU plurals (verified across
  `messages/en/*.json`; "dni" holds for both 14 and 30 in Polish), so client-side
  token replacement is safe.
- The skeleton idiom exists: `components/sections/Header.tsx:34` auth slot —
  `bg-[var(--muted)] animate-pulse rounded-*` at the final content's fixed size.
  `--muted: #e8e6e1` is in `globals.css:38`. No shared Skeleton component exists
  in `components/ui/` (`QRCodeSkeleton` is shape-specific).
- Nothing named `RegionPricingProvider`, `usePricingRegion`, `RegionText`, or
  `PriceSkeleton`/`TextSkeleton` exists anywhere in the repo.

**Data check.** `getPlanCatalog(currency)` (server-only, 300s revalidate, 2.5s
timeout) can serve both ladders; USD is live per the `markets.ts:99` comment
(all six Prices carry `currency_options.usd` since 2026-09-15). One gap:
`FALLBACK_PRICING` in `lib/pricing.ts:43` still has **no `usd` entry**, despite
its own comment saying USD lands there in the same change as the Stripe
`currency_options` (which shipped). So on backend failure, the USD fetch returns
the EUR ladder flagged `isFallback`. The design defines behavior for that case
(Proposed additions #2) and the implementer backfills the baked USD ladder.

## Placement
No new page and no route change — this is a behavior change inside the existing
price surfaces, orchestrated from the two server components that already own
ladder fetching: `VariantLanding.tsx` and `MarketPricingPage.tsx`. They fetch
both ladders (`Promise.all` on eur+usd, both ISR-cached) and wrap their trees in
the provider. Every visible price keeps rendering exactly where it renders today.

One structural caution: `VariantLanding.tsx:54-60` interpolates FAQ answers
**before** building `faqPageJsonLd`. The split must be explicit — JSON-LD keeps
the server-interpolated market-default strings, while the *visible* FAQ switches
to raw strings rendered through the client leaf. Do not feed client-resolved
values or skeletons into JSON-LD.

## Entry points
- None new. The feature has no navigation surface; visitors arrive at the
  existing landing and pricing pages exactly as today.
- The existing `MarketSuggestion` banner above both ladders remains the only
  visible region affordance (unchanged, out of scope).

## Proposed additions
- **Inline per-token skeleton chips, not card- or section-level skeletons** —
  JUSTIFICATION: prevents a mistake — quoting a currency the visitor may not be
  billed in, without blanking region-independent content. The chip is the
  Header.tsx idiom (`bg-[var(--muted)] animate-pulse rounded`) rendered *inside
  the same text element* as the number it replaces, sized in `ch`/`em` (`$49` ≈
  3ch; sentence tokens 3–5ch) so it inherits font-size and the line box, from
  `text-4xl` card headlines down to `text-xs` table-header prices. Card name,
  tagline, features, CTA, toggle all render normally at SSR.
- **Wrong-currency-fallback guard** — JUSTIFICATION: prevents a mistake — if the
  detected region's ladder came back `isFallback` in a different currency (the
  missing-`FALLBACK_PRICING.usd` case), the surface renders the page's market
  default instead of holding forever or showing euro amounts to a detected-US
  visitor. Same rule as "undetectable → page default", extended to
  "unpriceable → page default".
- **`aria-hidden` chips + no `aria-live`** — JUSTIFICATION: prevents a mistake
  (screen readers announcing a pulse placeholder). Detection is synchronous at
  hydration, so the held state lasts one frame for real users; announcing the
  swap would be noise.

## Rejected additions
- **"Prices shown in USD for your region" hint near the ladder on non-US pages** —
  the `MarketSuggestion` banner already sits directly above both ladders for
  exactly this visitor and names the region; a second line answers a question the
  banner already answers, and for banner-dismissed visitors the price shown *is*
  the price billed, so the residual question is curiosity, not a mistake. Clears
  none of the three bars.
- **Affordance on `/us` for a EUR-detected visitor** — deliberately nothing. The
  page never claims "US pricing" in visible copy; the money and trial numbers
  will be correct for that visitor (EUR + 30), which is the entire point.
  `suggestedMarket()` intentionally never fires on market pages
  (`market-suggestion.ts:29`). The residual oddity — US-flavored copy with euro
  amounts — is a copy-scoping fact the plan already settled.
- **Manual currency switcher (EUR/USD toggle)** — a permanent control every
  visitor pays for, to serve a case detection plus the banner already covers.
- **Whole-card / whole-section skeletons** — hides the CTA and the
  region-independent 90% of each card, and collapses card height (massive CLS at
  390px) for information that is known at SSR.
- **Persisting the detected region to a cookie for a server-rendered correct
  first paint** — `MARKET_COOKIE` is documented as "a hint, never a price"
  (`markets.ts:199`), and cookie-varying pricing breaks the ISR cacheability the
  whole architecture is built on.

## Mobile shape
At 390px the pricing cards stack single-column (`max-w-md mx-auto`,
cheap-to-expensive), and during the held frame each card is fully rendered —
badge, name, tagline, feature list, h-12 CTA — with chips only in the price line
and the billed-yearly sub-label. The headline chip sits inside the `text-4xl`
span on the same baseline as `/month`, so card height is pixel-identical before
and after resolution; the only possible movement is a one-line wrap change in
the sub-label sentence, contained inside the card. The trial reassurance lines
(hero, `ctaSubtext` under each CTA, final CTA) render their sentence with a
2–3ch chip where the day-count goes. The mobile comparison view (tier dropdown
trigger + rows, `PricingPageContent.tsx:231-315`) shows tier name plus a chip in
the `text-xs` price slot; the dropdown stays a dropdown — no sheet, no new
interaction. ROICalculator resolves via the same hook; it is below the fold and
interactive, so detection has long settled before first input. Tap targets
unchanged (CTAs h-12, dropdown py-3.5). Desktop is the same chips in the
3-column grid and the table `<thead>` prices — no separate desktop treatment.

## Components to reuse
- `hooks/use-detected-country.ts` + `lib/phone-utils.ts#detectBrowserCountry` —
  the detection pattern (subscribe no-op, null server snapshot).
- `lib/pricing.ts` — `interpolatePricing`, `formatMoney`, `yearlyCardView`
  unchanged; the client leaf calls them with the region ladder.
- `lib/markets.ts` — `MARKETS[*].trialDays` as the market-default source; the
  pure resolver lives in `lib/region-pricing.ts` with unit tests (mirrors
  `backend/app/core/pricing_region.py`).
- `components/pricing/PricingTierCard.tsx` — **extend additively** with an
  optional `loading?: boolean` (chips in the price + subLabel slots);
  `price: number` and all existing props untouched, current call sites render
  identically.
- `PricingSection.tsx`, `PricingPageContent.tsx`, `ROICalculator.tsx` — already
  client components; they switch from the `pricing` prop to the hook with no
  structural change.
- `components/sections/Header.tsx:34` — the skeleton class idiom the chip copies.

## New components required
- **`RegionPricingProvider`** — nothing on the ladder holds two ladders + a
  client-resolved region; context is the only way server pages can hand both to
  arbitrary leaves. Lives in `components/market/` — the existing shared market
  family (home of `MarketSuggestion`), not `components/ui/`, because it is market
  glue, not a visual atom.
- **`usePricingRegion()`** — the read side (`{ pricing, trialDays, ready }`);
  lives in `hooks/` next to `use-detected-country.ts`.
- **`RegionText`** — client leaf that splits a raw i18n string on `{token}`s and
  renders text + chips until ready, then `interpolatePricing` output; needed
  because `VariantHero`/`VariantFAQ`/`VariantFinalCTA`/`VariantDifferentiator`
  are async server components whose sentences must stay server-rendered around a
  client number. Lives in `components/market/`.
- **`TextSkeleton`** (the inline chip) — generic, and immediately has two
  consumers (`RegionText`, `PricingTierCard` loading slots), which is the
  promotion bar; lives in `components/ui/`.

## Open questions for the user
None blocking. Three non-blocking notes, resolved at the plan gate:
1. Backfill `FALLBACK_PRICING.usd` in this change — YES (in plan).
2. SSR HTML contains chips, not numbers, on price surfaces; `<noscript>` hedge —
   SKIPPED by default (user accepted the no-JS trade-off).
3. `MarketSuggestion`'s premise weakens once prices follow the visitor — copy
   revisit flagged for stampeo-copywriting, out of scope here.
