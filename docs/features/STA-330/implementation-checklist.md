# Implementation checklist — STA-330

DIFF REVIEWED AGAINST THIS LIST: 2026-09-21

## Generic

- Input validation at the boundary — **N/A**: no new or changed routes; display-only change.
- Authorization / IDOR — **N/A**: public marketing pages, no object access.
- No secrets in code/tests/runbooks — **PASS**: none introduced; runbook uses no accounts.
- Errors explicit — **PASS**: `regionBilling` returns `null` for malformed input by contract (tested);
  `resolveRegionLadder`'s cross-currency fallback is a documented, tested decision, not a swallow;
  `usePricingRegion` throws outside a provider instead of silently rendering nothing.
- i18n via message files — **PASS with note**: no new user-facing strings; no locale file touched
  (catalog-parity and no-currency-glyph suites stay green). Note: the pre-resolution held state in
  ROICalculator/HeroDemo is the ellipsis character "…", punctuation rather than copy, because those
  values are embedded in ICU-interpolated strings that cannot hold a React element.
- Migrations — **N/A**: none.
- Test isolation — **PASS**: pure-function tests, no shared state; the module-level token regex
  resets `lastIndex` on every call.
- UI follows ux-brief — **PASS with two named deviations**: (1) ROICalculator and HeroDemo use "…"
  instead of skeleton chips (ICU-embedded strings, see above) — same "never show the wrong
  currency" guarantee, different glyph; (2) `TextSkeleton` uses `align-middle` rather than
  baseline-alignment — visually centers the chip in the line box, no layout effect.
- Naming/conventions — **PASS**: mirrors the `use-consent`/`MarketSuggestion`
  `useSyncExternalStore` pattern, kebab-case hook file next to `use-detected-country.ts`,
  provider/leaf in `components/market/`, generic chip in `components/ui/` per the brief.

## Stampeo trap list

- CHECK constraints before enum values — **N/A**: no DB writes.
- Silent COALESCE-to-zero — **N/A**: no analytics reads.
- Exhaustive frontend enum maps — **PASS**: `Record<RegionCurrency, Pricing>` is a closed
  two-member union enforced by the compiler at both call sites; `FALLBACK_PRICING` now carries
  both members (shape-tested).
- Overloaded stamp-named columns — **N/A**.
- Pass re-download triggers — **N/A**: no wallet-pass surface touched.
- Type-aware liveness definitions — **N/A**.
- Tier gates enforced — **N/A**: no gated feature; billed price still resolved server-side at
  checkout from the address (untouched).
- Stripe webhook object types — **N/A**.
- Rate-limit-safe test paths — **PASS**: runbook needs no login at all.
- One-active-program invariant — **N/A**.

## STA-330-specific guard rails (from plan.md, all verified against the diff)

- Consent path untouched: `lib/consent.ts`, `lib/timezone-country.ts` have zero diff; the provider
  calls `detectBrowserCountry()` only, with a module-level cache local to the provider file.
- Provider mounted inside VariantLanding/MarketPricingPage; layout tracker siblings
  (GoogleAnalytics, MetaPixel, AttributionCapture, ConsentBanner) and LandingTracker/JsonLd sit
  OUTSIDE it; no `ssr:false`, no Suspense gate, no conditional tree swap introduced.
- `getSnapshot` returns a primitive (the country string; a sentinel for SSR).
- No navigation on detection; MarketSuggestion behavior untouched.
- `PricingTierCard.handleCtaClick` (Meta/GA CTA tracking) untouched — the `loading` prop only
  swaps rendered text.
