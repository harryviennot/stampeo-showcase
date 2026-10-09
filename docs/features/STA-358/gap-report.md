# Gap Report: STA-358
AUDITED: 2026-10-10  DIFF: origin/dev...feat/sta-358-seo-geo-hardening (204 files)
VERDICT: DRIFT FOUND

## Criteria without tests
- R-AC1: no page inherits a canonical it did not declare. No test found; the smoke "Canonical" checks cover only 6 pages that all declare one. Nothing asserts that login, onboarding, reset-password, email-preferences or demo/wallet-select emit no canonical.
- R-AC6: junk stays 404. Only "not redirected" is asserted; no test checks the 404 status.
- R-AC8 (self-canonical half): every sitemap URL is self-canonical and indexable. No test found.
- R-AC9: no test drives the www 301, the /us and /uk rewrite with the market cookie, text/markdown negotiation or the merchant-slug rewrite through proxy.ts.
- AC3 (link half): no test checks that the Header and Footer on /us link to /us/pricing, not /en/us/pricing.
- AC5 (partial): `/` and `/en/pricing` are not checked; the trial length is checked only on /us; one amount anywhere on the page passes.
- AC6: nothing checks for hydration errors, tracker remounts or `suppressHydrationWarning`.
- AC8 (Article image half): nothing checks that the per-post OG image URL returns 200.
- AC9 (page wiring): only the builders are tested, and CI runs on the fallback ladder, so the Offer path never renders.
- AC11 (partial): only the broadcast quota is checked against the feature meta descriptions. Geofencing, scheduling, locations and analytics are not.
- AC13 (blog half): no test that the blog has no unsourced statistic.
- AC17: no test for the breadcrumb, the localised dates or the reading time.
- AC18 (partial): no test for the RSS `<link rel=alternate>`.
- AC19: only the helper is tested; a page can drop its full openGraph block and still pass.
- AC20 (partial): blog titles are allowed 70 characters; blog descriptions have no 160 check; privacy and terms titles are not covered.
- AC21: no test that homepage titles name the category or that pricing titles carry `{starterPrice}`.
- AC22 (partial): nothing asserts that the /us metadata uses `{trialDays}`.
- AC23 (render half): the `market` prop wiring in VariantSectorCards is untested.
- AC24: no test for the author "Harry Viennot" or the "program" spelling.
- AC25 (session half): the Header's signed-in state and sign-out are untested.
- AC26: no test for font preload or image sizes.
- AC29 (partial): no test that the key file is served on a built server, or that the workflow fails soft.
- AC30 (partial): hreflang is asserted on 2 URLs, not 6.

## Untested diff behavior
- lib/legacy-redirects.ts: doubled-locale rules followed by blog, pilot or EXPLICIT rules give two 308 hops (`/en/en/blog/<fr-slug>`, `/en/en/us`, `/en/en/founding-partner`). AC4 and R-AC4 forbid redirect chains.
- lib/auth/use-has-session.ts: notifySessionChanged, the focus re-read and signOut are untested.
- components/auth/PkceCallbackHandler.tsx: the code exchange on `/?code=` is untested beyond isPkceCallback.
- scripts/indexnow.ts: exits 0 on any IndexNow status, including 403 and 422, so failures are silent.
- .github/workflows/indexnow.yml: `sleep 180` assumes the deploy has finished.
- VariantSectorCards market prop, the Header/Footer next/link switch, the features page x-default override, BlogHeader `t.rich`, readingMinutes, MarketPricingPage wiring and the llms.txt route: all untested at page level.

## Drift (in diff, not in plan)
- Offline scanning is withdrawn site-wide: the scanner page section, OfflineToggleDemo, copy in 4 locales, the posts, llms.txt, and an offlineScan guard.
- "No card required" claims are removed, with a noCard guard.
- `lib/plan-facts.ts` sets `pro.scheduledDesigns: "coming_soon"`, contradicting Reference B ("yes").
- The llms.txt PRODUCT section is reshaped: "Team & multi-location" removed, and "Peak hours" tied to employee tracking.
- Third-party sources are banned on the broadcasts page, through a product-claims test.
- `/fr/**/opengraph-image` passes through the proxy instead of redirecting; the lib/og/metadata.ts comment is stale.
- app/llms.txt/route.ts: Cache-Control replaced by revalidate = 300.

## Suspect tests
- plan-facts "match the backend tier definitions" restates PLAN_FACTS and never reads the backend.
- sitemap inventory count is rebuilt from the same sources the sitemap iterates.
- blog/title.test.ts allows 70 characters with no description check.
- The `rendered` helpers re-implement " | Stampeo" instead of reading the layout template.
- page-robots matches a source regex.
- seo-smoke priceProblems passes on any amount anywhere on the page.

## Unrealistic or missing workflow tests
- Article image test uses an English slug under fr and es.
- metadata-copy lengths are measured only with FALLBACK_PRICING.
- Missing:
  - a NEXT_LOCALE=en visitor on an unprefixed deep URL stays in French
  - the LanguageSwitcher then `/`
  - a merchant QR on an English phone through the proxy
  - Header sign-out without a reload
  - a cross-tab session update
  - the OAuth `/?code=` landing
  - hydration in a cross-region browser
  - Offers with the backend up
  - doubled-prefix chains
  - IndexNow 403 and 422
- founding-routes pins Next's internal digest.
- seo-links pins source text.

## Waivers
(filled by the main agent only if the user explicitly waives a gap)

## Resolution (2026-10-10, coordinator)
Fixed in F1 (refactors and bug fixes) and F2 (coverage); both are merged into feat/sta-358-seo-geo-hardening.

**Bugs fixed:**
- **Doubled-prefix redirect chains:** every doubled variant now gets one 308 to the final page. Pinned per rule family in `lib/seo/legacy-redirects.test.ts`.
- **IndexNow fail-silent:** non-2xx responses now print a `::warning::` and still exit 0. `reportFor()` is tested for 200/202/400/403/422/429/500/0.
- **The founding gate** now has a single dispatch point.
- **The legal titles' double brand,** found by F2.

**Covered by the built-server smoke (`scripts/seo-smoke.ts`, 72 checks, green on dev-backend and CI-fallback builds):**

| ACs | What the smoke checks |
|---|---|
| R-AC1, R-AC2 | Private routes: noindex, no canonical |
| R-AC6 | Junk paths are 404 |
| R-AC8 | All 94 sitemap URLs: 200, self-canonical, indexable |
| AC3 | The `/us` links |
| AC5 | Prices on 5 pages, with ≥ 3 amounts each, plus the trial length |
| AC8 | Article image returns 200 |
| AC9 | Offer currency |
| AC14–16, AC30 | hreflang on 7 URLs |
| AC17 | Blog header and breadcrumb |
| AC18 | RSS link |
| AC19 | OpenGraph |
| AC23 | `$10` and no € on `/us` |
| AC26 | Font preloads |
| AC28 | Footer links, no hidden header nav |
| AC29 | IndexNow key file |

**Covered by unit tests:**

| ACs | Test |
|---|---|
| AC11 (beyond broadcasts) | `lib/plans/plan-facts.test.ts` |
| AC13 (blog half) | `lib/plans/product-claims.test.ts`, with explicit, ratcheted allowances |
| AC20 (blog descriptions, legal titles) | `lib/blog/title.test.ts`, `lib/seo/metadata-copy.test.ts` |
| AC21, AC22 | `lib/seo/metadata-copy.test.ts` |
| AC24 | `lib/blog/posts.test.ts` |
| AC26 (images) | `lib/landing/theme-images.test.ts` |
| R-AC9 and the missing workflows | `lib/routing/proxy-behaviour.test.ts`: www 301, pilot rewrite plus cookie, markdown negotiation, merchant QR on an English phone, a NEXT_LOCALE=en deep URL stays French |
| AC25 (hook and sign-out) | `lib/auth/use-has-session.test.ts` |

**Suspect tests addressed:**
- The change-detector tests are deleted.
- founding-routes asserts the URL and status, not Next's digest.
- The seo-links source-text assertions are replaced by the smoke check.
- The Article image test uses real slugs.

**Drift:** recorded in plan.md under "Scope additions during implementation".

**Proposed waivers (await Harry's explicit OK). They are not covered by automated tests:**
1. **AC6 hydration (no hydration error, no tracker remount):** covered by the browser harness `scripts/qa-region-pricing-cdp.mjs` (48/48) and by the region-pricing runbook, not by `bun test`, because the repo has no DOM runner in CI.
2. **The PKCE `/?code=` exchange in `PkceCallbackHandler`:** only `isPkceCallback` is unit-tested. The exchange needs a DOM and supabase-js; it is covered manually by runbook SX-30 on the dev host.
3. **The Header component's signed-in rendering:** the hook, sign-out and the SSR markup are tested; the component swap is covered manually by runbook SX-29.

## Waivers
(pending Harry's explicit approval of the three items above)
