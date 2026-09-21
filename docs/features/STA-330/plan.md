# Plan: Region-detected pricing display

ISSUE: STA-330 (https://linear.app/stampeo/issue/STA-330/showcase-pricing-display-follows-page-market-instead-of-visitor-region)
BRANCH: feat/sta-330-region-detected-pricing
REPOS: showcase
MIGRATION: no
STATUS: APPROVED (2026-09-21, by user — plan-mode gate)

## Problem

Pricing display is tied to the URL market: `/us` + `/us/pricing` quote USD + 14-day
trial, every other page quotes EUR + 30 days. The goal was "US residents only ever
see US pricing", but a US visitor who switches language or clicks the logo from
`/us` lands on EUR pricing, and a French visitor browsing `/us` sees USD. Displayed
pricing must follow the visitor's detected region on every page. Display-only: the
billed price stays address-driven at onboarding (the `lib/markets.ts` "a hint,
never a price" invariant holds for billing; its doc comment gets amended for
display).

## Decisions

- Region resolution: detected US → USD ladder + 14 days everywhere; any other
  detected country → EUR + 30 everywhere (including on `/us` and `/uk`);
  undetectable → the page's market default. Mirrors
  `backend/app/core/pricing_region.py`.
- Detection is client-side only (`detectBrowserCountry()`: timezone →
  `navigator.language`): the standalone Docker build has no geo-IP header, and
  server-varying pricing would break ISR (STA-317 premise, amended not reversed —
  server-rendered/indexed content stays market-fixed; the visible numbers vary
  client-side after hydration).
- Trial-day numbers follow the region along with the currency: they are the same
  contractual promise the visitor gets at checkout.
- Hold-until-ready: price and trial slots render inline skeleton chips until
  detection resolves (user chose no wrong-currency flash over instant first paint).
  Detection is synchronous, so the held state lasts one hydration frame.
- JSON-LD and crawler-facing HTML keep the page's market default; FAQ JSON-LD
  stays server-interpolated.
- Copy variants (`variant.us.*` via `lib/market-copy.ts`) stay tied to the page;
  only money amounts and trial-day numbers swap.
- Both ladders (EUR + USD) are fetched server-side (`Promise.all`, ISR-cacheable)
  and handed to a client provider; `FALLBACK_PRICING` gains a baked `usd` entry
  (values captured from `GET /public/plans?currency=usd` on dev).
- Analytics guard rails (from the 2026-09-21 audit, non-negotiable):
  1. The provider never feeds `detectConsentRegime`/`consentRegimeForCountry` and
     adds no state to `lib/timezone-country.ts` — the consent regime is legally
     load-bearing and re-derived from that table on every snapshot.
  2. The provider mounts inside `VariantLanding`/`MarketPricingPage` only, never
     wrapping the layout's tracker siblings (GoogleAnalytics, MetaPixel,
     AttributionCapture, ConsentBanner) — a same-path remount double-fires
     page_view/PageView (Meta has no eventID dedup).
  3. Tree shape stays stable: no `ssr:false`, no Suspense gate, no
     `mounted ? <Page/> : <Skeleton/>` — AttributionCapture snapshots
     `body.dataset.landingVariant` stamped by LandingTracker's effect in the same
     commit; a delayed subtree freezes `variant: null` into the 182-day
     first-touch attribution cookie. Skeletons swap text inside stable spans.
  4. `getSnapshot` returns a primitive (identity-stable).
  5. No auto-navigation on detection; the MarketSuggestion banner link stays the
     only navigation affordance.

## UX decisions

(From ux-brief.md, MODE: DESIGN, VERDICT: READY.)

- PLACEMENT: behavior change inside the existing price surfaces, orchestrated from
  the two ladder owners `components/landing-variant/VariantLanding.tsx` and
  `components/pricing/MarketPricingPage.tsx`. No new page, no route change.
- ENTRY: none new; visitors arrive at the existing landing/pricing pages.
- ADDED: inline per-token skeleton chips (Header.tsx auth-slot idiom, sized in
  `ch` inside the same text element — card height pixel-identical before/after) —
  prevents quoting a currency the visitor may not be billed in. Unpriceable →
  page-default guard (detected ladder `isFallback` in the wrong currency falls
  back to the market default) — prevents a mixed-currency display. Chips are
  `aria-hidden`, no `aria-live` — prevents screen readers announcing a one-frame
  pulse. Each appears as an acceptance criterion below.
- REJECTED: "prices shown in USD for your region" hint (MarketSuggestion already
  sits above both ladders and answers it); any affordance on `/us` for
  EUR-detected visitors (correct prices are the feature); manual EUR/USD toggle;
  whole-card/section skeletons (CLS, hides the CTA); persisting region to a
  cookie for a server-correct first paint (breaks "hint, never a price" + ISR).
- MOBILE: at 390px cards stack single-column fully rendered with chips only in
  the price line and billed-yearly sub-label; trial sentences get a 2-3ch chip;
  the mobile comparison dropdown stays a dropdown with a chip in the `text-xs`
  price slot; ROICalculator is below the fold, detection settles before first
  input. Desktop is the same chips, no separate treatment.
- REUSES: `detectBrowserCountry` + the `use-detected-country`/`use-consent`
  useSyncExternalStore pattern; `interpolatePricing`/`formatMoney`/
  `yearlyCardView` unchanged; `PricingTierCard` extended additively with optional
  `loading?` only. / NEW: `RegionPricingProvider` + `RegionText` in
  `components/market/` (market glue, next to MarketSuggestion);
  `usePricingRegion()` in `hooks/`; `TextSkeleton` in `components/ui/` (generic
  inline chip, two consumers — clears the promotion bar).

## Non-goals

- Checkout/onboarding pricing (address-driven, backend) — untouched.
- `programme-fondateur` frozen EUR pricing and `/llms.txt` prose prices — frozen
  history and crawler prose, deliberately untouched.
- JSON-LD / structured data — keeps the per-URL market default.
- MarketSuggestion banner behavior — unchanged (its copy weakens once prices
  follow the visitor; flagged for stampeo-copywriting separately).
- The two pre-existing analytics bugs found by the audit — filed as STA-331
  (LandingTracker double-fire) and STA-332 (forcePrefix double page_view),
  not fixed on this branch.
- `variant.us.*` copy scope — wording stays per-page.

## Edge cases considered

- Detection returns null (no browser, unmapped timezone + regionless language) →
  page market default.
- Backend `/public/plans?currency=usd` fails → baked `FALLBACK_PRICING.usd`.
- Detected ladder resolved `isFallback` in a different currency → page market
  default (never mixed currencies).
- `/uk` (EUR/30 market) + US-detected visitor → USD/14, handled naturally by
  country-based resolution.
- No-JS visitors see skeleton chips where prices were server-rendered —
  considered and accepted (optional `<noscript>` hedge deliberately skipped).
- Googlebot renders JS from US infrastructure → visible USD on EUR pages while
  JSON-LD says EUR — accepted; UA-gating rejected as cloaking risk.
- Polish/French/Spanish trial strings use plain `{trialDays}` (no ICU plural
  forms; "dni" holds for 14 and 30) — client-side substitution is safe.

## Acceptance criteria

- AC1: Given a US-detected browser (e.g. America/New_York timezone), when any
  price-bearing showcase page renders (`/`, `/fr`, `/pricing`, `/uk`), then all
  amounts show $ and trial mentions say 14, and NOT € / 30.
- AC2: Given a France-detected browser, when `/us` or `/us/pricing` renders, then
  amounts show € and trial says 30, and NOT $ / 14.
- AC3: Given detection returns null, when a page renders, then the page's
  market-default ladder shows (EUR on `/`, USD on `/us`).
- AC4: Given any page pre-hydration, when prices are not yet resolved, then token
  slots show `aria-hidden` skeleton chips and NOT any currency amount, and layout
  does not shift on resolve.
- AC5: Given any region, when fetching raw HTML (curl), then JSON-LD quotes the
  market default and FAQ JSON-LD contains no literal `{starterPrice}`.
- AC6: Given an existing visitor with GA/Pixel cookies, when they switch locale
  or the region swap resolves, then `_ga`/`_fbp` are unchanged, `gtag('config')`/
  `fbq('init')` do not re-fire, and exactly one page_view fires per real path
  change (none for the swap itself).
- AC6b: Given a visitor with no stored consent choice, when the provider
  resolves, then consent state and banner visibility are identical to before this
  change.
- AC6c: Given a landing page load, when attribution is captured, then
  `stampeo_attribution` records the correct `landing_variant` (LandingTracker
  subtree not delayed).
- AC7: `bun test lib` green, including the existing `no-currency-glyph`,
  `i18n-catalogs`, `market-copy`, `market-suggestion`, and `consent` suites.
- AC8: Given the detected region's ladder resolved `isFallback` in a different
  currency, when prices render, then the page's market-default ladder shows and
  NOT a mixed-currency display.

## Touched areas and risks

- `PricingTierCard.tsx` now carries STA-319/320 Meta/GA CTA tracking in
  `handleCtaClick` — the `loading` prop addition must not touch that logic.
- `lib/timezone-country.ts` is shared with the consent regime (legal): read-only
  reuse via `detectBrowserCountry()`, never edited.
- ISR cacheability: both ladder fetches keep `revalidate: 300`; no page becomes
  dynamic.
- i18n: raw token strings move client-side; `no-currency-glyph` and catalog
  parity tests guard the message files.
- SEO: rendered-vs-JSON-LD currency mismatch on EUR pages for US-rendered
  crawls — accepted trade-off, documented.
- Next.js is a breaking-changes build: consult `node_modules/next/dist/docs/`
  before touching any framework API (per AGENTS.md).

## Docs impact (preliminary)

- Amend `docs/features/STA-317/plan.md` with a dated note (client-side display
  variation now exists; server/indexed content stays market-fixed).
- Rewrite stale in-code comments: "market fixes the currency at render time"
  (VariantLanding, MarketPricingPage), market-suggestion headers, the
  `stampeo_market` cookie block in `lib/markets.ts`.
- `docs/qa/us-market-landing.md`: `/us` no longer guarantees USD for every
  visitor; cross-link the new `docs/qa/region-pricing.md` runbook.
- Help-center: pricing pages are pre-signup marketing; likely no business-owner
  doc change — re-answer at Phase 7 with the real diff.

---

## Amendment (2026-09-21, post coverage audit)

- **Ellipsis idiom sanctioned for string-interpolated slots.** Two held-state
  surfaces cannot hold a React element: HeroDemo's reward lines feed WalletCard
  string fields, and ROICalculator's figures interpolate into ICU sentences.
  Both render the ellipsis character "…" instead of a TextSkeleton chip while
  the region is unresolved — same no-wrong-currency guarantee, different glyph.
  AC4's "skeleton chips" reads as "chips, or the ellipsis where an element
  cannot go".
- **PricingTierCard's `loading` also suppresses the discount pair** (both
  numbers would be chips). Inert while no discount is active (founding program
  closed 2026-08-04); recorded in the runbook for the next promo.
- Coverage gaps 1-3 from gap-report.md closed with lib tests in the same
  branch (fallback-in-matching-currency, exact baked USD amounts, real catalog
  FAQ strings interpolate brace-free in both ladders).
