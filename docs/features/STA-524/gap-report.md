# Gap Report: STA-524 (Stage 1)
AUDITED: 2026-10-27  DIFF: 93241b8..efc21e3 (showcase)
VERDICT: DRIFT FOUND (gaps too)

## Criteria without tests
- AC1: nothing checks `/help` renders with `lang="en"` (fr/es/pl help.json hold English, so only `lang` would differ).
- AC3: the help HOME metadata (`app/[locale]/help/page.tsx` generateMetadata: robots + no alternates) is untested; no test asserts either help route has no canonical or hreflang alternates.

## Untested diff behavior
- Which consent predicate each call site uses (MetaPixel.tsx:44, GoogleAnalytics.tsx:52, ConsentBanner.tsx:79, ContactLink.tsx:29, ContactFormClient.tsx:243, use-cta-tracking.ts:40/48, privacy/lifecycle.ts:86). One swapped predicate would load the Meta pixel on /help with every test green.
- scripts/seo-smoke.ts:66 `/help` entry not pinned by checks.test.ts; the smoke never reads X-Robots-Tag or hreflang.

## Drift (in diff, not in plan)
- lib/internal-links.ts:259: the `isHelpPath` early return accepts a next-intl localized `Link` to /help in en/es/pl, which renders `/en/help` and 308s, the defect the plan's stage 1 decision rules out. internal-links.test.ts:182-189 locks it in. ESCALATE: fix (localized links to /help must be flagged).
- legacy-redirects.ts:161-163: helpRules also redirects /fr/help/*. Harmless and tested; plan AC2 updated to say so.

## Suspect tests
- internal-links.test.ts:182-189 (see Drift).
- legacy-redirects.test.ts:71-73: `isLiveRoute` now counts any /help/<slug> as live while [slug] 404s for every slug; can't catch a redirect to a missing help page.
- config.test.ts:20-22 and routes.test.ts:41-43 can't fail while HELP_INDEXABLE is false (a literal `index: false` passes); nothing checks next.config calls `helpHeaders()` rather than `helpHeaders(false)`. The one-switch decision is untested.
- consent-routes.test.ts:311-318 `servesMarkup` (`/<[A-Za-z]/`) lets any page without `<` in its own file skip the footer rule.
- google-analytics.test.ts:841: path-independent, repeats existing assertions.
- locale-negotiation.test.ts:142 `/help/add-a-team-member` line can't fail.
- discovery.test.ts:34 IndexNow rebuilds from buildSitemap(), only fails when the sitemap test does.

## Unrealistic or missing workflow tests
- Tests use `/en/help/...` as a browser path (unreachable: 308). Harmless.
- Missing: first landing on /help with everything accepted never loads the Meta pixel (shouldLoadMetaPixel with mayRunAdvertising("/help")).
- Missing: EEA first visit to /help shows the banner (consentSurface with mayRunAnyTag("/help")).
- Missing: a `?gclid=` landing on /help writes no ad carrier (HELP_CLICK only has fbclid).
- capture.test.ts "a stored paid click is left as it is" should also assert `src` is kept.
- Missing: a "Still stuck?" ContactLink tap on /help after the pixel loaded elsewhere sends no Meta Contact event.
- Missing (data, not a repo test): a business already slugged `help` (dev + prod check before merge).

## Waivers
(filled by the main agent only if the user explicitly waives a gap)
