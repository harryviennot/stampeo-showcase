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
