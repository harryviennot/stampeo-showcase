# Quality Report: STA-358
REVIEWED: 2026-10-10  DIFF: origin/dev...HEAD (merge-base ab9a0fa..cfb23bb), showcase feat/sta-358-seo-geo-hardening
VERDICT: FINDINGS

## Comments
- lib/og/metadata.ts:24-25: contradiction. "Next emits `/fr/opengraph-image`, which the proxy redirects." Since cfb23bb, proxy.ts:100 and lib/routing/share-image-paths.ts serve it with no redirect. Fix: "French is unprefixed; the proxy serves Next's `/fr/opengraph-image` as is."
- lib/hreflang.test.ts:50: contradiction. "The layout emits PILOT_HREFLANG", but this PR moved it to app/[locale]/page.tsx:27. Fix: "The homepage emits PILOT_HREFLANG…".
- lib/pricing.ts:205: contradiction, made stale by this PR. "/founding-partner + /programme-fondateur 307 to /pricing". Both now 308. Fix: "308".
- lib/llms-txt.ts:52-54: contradiction plus history. "Mirrors `app/sitemap.ts`…". The page list now lives in lib/sitemap.ts STATIC_PAGES. Fix: "Mirrors STATIC_PAGES in lib/sitemap.ts; the founding routes are absent from both (they 308 to /pricing)."
- app/[locale]/layout.tsx:60-62: contradiction (reads wrong). "No title or description here" sits below `title`/`description`. Fix: "openGraph and twitter carry no title or description: Next fills them from each page's own."
- app/[locale]/features/[slug]/page.tsx:73-75: over-explained and redundant. The `"x-default": localePath("en", localizedPaths.en)` override sets what localeAlternates already returns. Fix: delete the override and its comment.
- lib/seo-links.test.ts:2: history. "(STA-355 QA, blocker 2)". Fix: "The footer's sr-only sitemap navigation."
- lib/routing/auth-callback-locale.test.ts:3-4: history. "Only the LanguageSwitcher writes `NEXT_LOCALE` now". Fix: drop "now".
- lib/legacy-redirects.test.ts:83: history/process. "The supplied table (plan Reference A), restated as the expectation." Fix: "Every explicit rule, restated so a dropped entry fails."
- lib/benchmark.ts:4-6: unfollowable pointer to the unversioned workspace (`docs/audits/...`). Fix: copy the SQL and cohort rules to docs/features/STA-358/benchmark-sources.md and point there.
- scripts/indexnow.ts:59,61,76,86,90,94 and scripts/indexnow.test.ts:112: over-explained comments that restate the next line. Fix: delete.
- lib/routing/root-language.ts:1-20: over-explained. 15 of 23 lines are comments for two one-line functions. Fix: a one-line module doc; keep the "redirect never stored" why.
- components/market/RegionPricingProvider.tsx:40-44, RegionText.tsx:16-17, pricing/PricingPageContent.tsx:104-105, PricingTierCard.tsx:163-164, ROICalculator.tsx:40-41: the same rationale written 5 times across 14 suppressHydrationWarning sites. Fix: components/market/PriceText.tsx (`<span suppressHydrationWarning>`) carrying the comment once.
- components/sections/Footer.tsx:32-34 and Header.tsx:304-311: the same logic and comment twice (`market === "int" ? Link : NextLink`). Fix: components/market/MarketLink.tsx.
- Density: added 19.7% vs baseline 15.5%, i.e. 1.27x, under 1.5x.

## File size
- scripts/seo-smoke.ts: 0 -> 395 lines (new, over 300). Split into scripts/seo-smoke/html.ts (parsers) and scripts/seo-smoke/checks.ts (*Problems); scripts/seo-smoke.ts keeps createClient/buildChecks/main. Split the test the same way.
- docs/qa/seo-indexing.md: 643 lines (runbook). Consistent with docs/qa. No split required.
- No TS module passes 800 lines and no component passes 500 (Header.tsx goes from 532 to 521).

## Folder tree
- lib/ (88 entries at merge-base, 106 at HEAD). Move to lib/seo/: sitemap, legacy-redirects, page-robots, acquisition-metadata, metadata-copy.test. Move to lib/plans/: plan-facts, benchmark, product-claims.test.
- lib/structured-data/ (new, 1 file): merge json-ld.test.tsx into lib/structured-data.test.ts.

## Flag-gated paths
- components/pricing/MarketPricingPage.tsx:53 and lib/structured-data.ts:119-129: `isFoundingProgramOpen()` (false since 2026-08-04) is threaded into the new `pricingFaqJsonLd(…, foundingOpen)`. Fix: drop the parameter and the foundingOnly items.
- app/[locale]/founding-partner/page.tsx:40 and programme-fondateur/page.tsx:40 vs lib/legacy-redirects.ts:53-57: the same gate is decided in two layers. Fix: one dispatch point. Cleanup issue: missing.

## Test shape
- Ratio: 1.08 added test lines per added code line. No test file over 800 lines.
- lib/auth/auth-routes.test.ts:52 and lib/page-robots.test.ts:18: identical `pagesUnder()`. Fix: export it from lib/testing/app-folders.ts.
- lib/metadata-copy.test.ts, product-claims.test.ts, plan-facts.test.ts and no-currency-glyph.test.ts: 4 catalog loaders and 3 JSON string walkers. Fix: lib/testing/catalogs.ts (loadCatalog, catalogStrings, strictTranslator).
- scripts/indexnow.test.ts: the key literal 4 times, plus the key-file regex copied from indexnow.ts. Fix: one const; export findKeyFile() from indexnow.ts.
- lib/plan-facts.test.ts:26-67 and lib/benchmark.test.ts:9-23: restate PLAN_FACTS / BENCHMARK verbatim (change detectors). Fix: delete; the copy-agreement tests pin the behaviour.
- plan-facts.test.ts / llms-txt.test.ts / product-claims.test.ts / structured-data.test.ts: re-assert single PLAN_FACTS values. Fix: delete.
- lib/legacy-redirects.test.ts:84-124: REFERENCE_A restates EXPLICIT entry for entry; PROBES already sends every rule to a live page. Fix: drop the table or keep only cases the rule list cannot express.
- lib/seo-links.test.ts:101-122: asserts on source text. Fix: renderToStaticMarkup or leave it to scripts/seo-smoke.ts.
- lib/routing/founding-routes.test.ts:33: matches Next's internal digest. Fix: assert the URL and status.
- lib/blog/title.test.ts:30: unexplained `<= 70`. Fix: name the constant and its why.
- lib/plan-facts.test.ts:224 and product-claims.test.ts:220: both define describe("broadcasts feature page"). Fix: one file.

## Waivers
(filled by the main agent only if the user explicitly waives a finding)

## Resolution (2026-10-10, coordinator)
Every finding above was addressed in F1, merged at bbc7039:
- the comments
- the smoke split into `scripts/seo-smoke/{html,checks,client}.ts`
- `lib/seo/` and `lib/plans/` (`lib/` went from 106 to 93 entries)
- the json-ld test merged
- the founding gate: one dispatch point, the dead FounderProgramPage path and its copy deleted
- the PriceText and MarketLink components
- `lib/testing/catalogs.ts` and `pagesUnder`
- `findKeyFile`
- change detectors deleted
- `POST_TITLE_MAX` named
- the duplicate describe merged

**Residual (tracked as follow-ups, not blocking):**
- `scripts/seo-smoke.ts` is 345 lines after F2 added 39 checks. That is above the ~300 guidance and well under 800; the check list can move into `scripts/seo-smoke/` later.
- `isFoundingProgramOpen()` still gates `PricingPageContent`, `PricingSection` and `yearlyCardView`. It is the same dead path in pre-existing pricing code, and its cleanup is follow-up work.
