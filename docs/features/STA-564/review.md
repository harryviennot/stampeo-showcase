# STA-564 review (with STA-563's localisation)

One review per branch, fresh context, 17 Nov 2026. Diff `5181e6a..33337d9` on `feat/sta-564-go-live` (snapshots,
`bun.lock`, the STA-526 merge and the Next.js 16.4.6 bump skipped: reviewed in their own PRs). Lane: sketch harden
(pages) + standard (routing, SEO). No security review: the diff touches no auth, billing, Stripe, webhook or migration.

## Coverage (coverage-auditor): BLOCKERS → fixed

**BLOCK C1, AC1 market wiring untested end to end.** Prices and the trial come from `LandingPageShell`'s
`RegionPricingProvider`; no test checked that `PlatformPage` passes its market to the shell, and the test pinned
`PricingSection.props.market`, which decides no price. The homepage JSON-LD `offers` (price, currency per market) never
rendered in tests. Fixed (eff5819): `lib/seo/home-market.test.tsx` renders the real routes for `/`, `/en`, `/es`,
`/pl`, `/uk`, `/us` through the shell and checks the visible prices, the trial line and the JSON-LD offers per market;
re-checked by removing `market` from `PlatformPage`: 2 tests fail.

**BLOCK C2, claim guards read English only.** `lib/testing/landing-copy.ts` held only the English modules, so the
NO_CARD_CLAIM (FR/ES/PL branches included), em dash, price literal, unsourced figure, Stampeo-sender, tiers, plan-limit
and retention-figure guards never saw the French, Spanish or Polish copy, now the live homepage and feature pages. Token
parity (`{token}` per path, editor chips vs `sampleValues` vs `own.preview`) was unchecked. No violation found today; no
test could fail. Fixed (0ccc5c8): `lib/landing-pages/copy-languages.test.ts` runs the language-neutral guards and
token parity on en, fr, es, pl and the US overlay; English-word guards stay English-only, said in the file.

**BLOCK C3, feature pages tested at a state no URL serves.** `lib/testing/preview-page.tsx` rendered every feature and
loyalty page at market "us"; the live pages are int in fr/en/es/pl. Untested on the real state: the campaigns FAQ
"see pricing" link per locale (LpFaq drops it silently when its words are missing) and its int target, euro sample
money, the page-level em dash / raw token / sender checks outside English. Fixed (b0ca595):
`renderPreviewPage(slug, locale, market)` defaults to int; `lib/landing-pages/pages-rendered.test.tsx` checks every
page in every language, and the "see pricing" link per locale.

NOTEs taken (5d409d0, 0ccc5c8): legacy route bodies and heads mounted, no `**/landing-pages` folder, AC7's tracked
location on the rendered button, `metadata-copy.test.ts` reads the live homepage titles (fr/es/pl titles moved to the
singular search term, 7e21169), invented-names guard per locale, US overlay in the caps loop. Left for the PR
description: legacy route bodies and the legacy feature/loyalty heads
only checked by source regex; no check that no page lives under `**/landing-pages`; AC7's tracked location not checked
on the rendered button; share images untested; footer `#how` / `#faq` untested; legacy redirects untested; drift (the
`legacy` consent segment, footer anchors, proof figures by position, the unreachable US overlay of the previews' FAQs);
`metadata-copy.test.ts` checks a homepage title no live page prints; the invented-names guard covers English only;
"byte for byte" test names on regenerated snapshots; the US overlay outside the AC9 caps loop.

## Quality (code-quality-reviewer): BLOCKERS → fixed

| BLOCK | Fix |
|---|---|
| History comment in `copy/bundle.ts` | Rewritten to what the code does (ab8068f) |
| History comment in `live-pages.test.ts` | Rewritten (ab8068f) |
| Narrative comment in `legacy-pages.test.ts` | Rewritten (ab8068f) |
| Narrative comment in `consent-routes.ts` | Rewritten (ab8068f) |
| Wrong scanner-app path in `copy/previews/mobile-scanner.ts` | `src/locales/<language>/stamp.json` (ab8068f) |
| New `lib/legacy-pages.ts` in a 109-entry folder | Moved to `lib/seo/legacy-pages.ts`, importers updated (ab8068f) |

Also fixed while there: `legacy-pages.test.ts` hand-rolled its next-intl mock and restored the real module, so it
failed when run alone; it now uses `mockEnglishServerTranslations()`.

NOTEs for the PR description: the live feature pages are still named "previews" in code (follow-up issue); eight
near-identical loyalty route files (a factory would do); the brand-suffix regex in two places; over-explained comments in
`RelatedPreviews`, `BlogPostsSection`, `LockScreenSlice`, `live-metadata.ts`; three header-comment styles across the
locale bundles; `live-pages.test.ts` at 389 lines could split by describe; implementation-detail pins (source regexes,
classNames, `existsSync`, marketing figures) and duplicated assertions across test files.

## Waivers

None.
