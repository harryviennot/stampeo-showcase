# Quality Report: STA-546
REVIEWED: 2026-11-12  DIFF: origin/dev (34601c3)..922be3d, docs excluded
VERDICT: FINDINGS

## Comments
- lib/landing-pages/pages.test.ts:458: history - "the Outcomes page: results, not how (STA-546 stage C)". Fix: drop "(STA-546 stage C)".
- lib/copy-claim-guards.ts:35: history - "which is how the first version of this guard failed" (moved verbatim from i18n-catalogs.test.ts). Fix: delete the clause.
- lib/landing-pages/copy/types.ts:27: contradiction - "A third-party figure, quoted exactly"; OUTCOMES.comeBack.headStart.text (copy/outcomes.ts:36) is a paraphrase that opens with our own "Give new customers a head start:". Fix: "A third-party figure, printed with its source under it."
- components/landing-pages/features/DesignSpotlight.tsx:5-11: over-explained - 7-line docstring on an 8-line body, cross-references "the Outcomes figure". Fix: "The card-style carousel under the page's heading, on its tinted band, without the gallery's CTA."
- components/landing-pages/features/DesignSpotlight.tsx:18: the comment explains a copy of LpSection's `py-16 lg:py-24` + `bg-[var(--blog-bg)]` (LpSection.tsx:8, :81) instead of sharing it. Fix: export one tinted-band class constant from LpSection.tsx and use it in both.
- components/landing-pages/features/FeaturesHeroVisual.tsx:6-14: over-explained - 9 lines on a 10-line component. Fix: two lines (banner over the card's top edge; peeking cards from xl).
- Density: components/landing-pages/** added 16.8% (142/847) vs baseline 5.2% components/features (307/5961), 4.9% components/sections (85/1721), 8.3% components/card (111/1338). Flagged. Worst: PhoneCrop.tsx 6/15, FeaturesHeroVisual.tsx 9/26, DesignSpotlight.tsx 7/22, PlanLine.tsx 5/18, banner.tsx 6/25, AurevoCard.tsx 12/53.
- Density, not flagged: touched existing TSX 11.3% (15/133) vs 7.6% on base (1.49x); lib code 13.8% (70/508, moved guards excluded) vs 22.8%; app pages 4.8% vs 24.3% (app/[locale]/us); tests 4.5% vs 10.2%.

## File size
- lib/landing-pages/pages.test.ts: 0 -> 581 lines (growth > 300). Split: lib/landing-pages/registry.test.ts (registry, routes, shell, metadata, links, proof: :100-287), lib/landing-pages/shared-sections.test.ts (:289-359, :413-435), lib/landing-pages/page-visuals.test.ts (Features + Outcomes :361-411, :458-581, after the parametrize below).
- No module or component crosses 800/500. Largest touched component: NotificationPhoneDemo.tsx 103 -> 134.

## Folder tree
- lib/ (84 files): lib/copy-claim-guards.ts. Move to: lib/testing/copy-claims.ts, next to lib/testing/analytics-claims.ts (same role: claim regexes shared by copy tests).
- Note (below threshold): components/landing-pages/ sits beside components/landing-variant/, and lib/landing-pages/ beside lib/landing/. Not flagged.

## Flag-gated paths
- None found. No flag; the pages are URL-only noindex routes.

## Test shape
- Ratio: 797 test lines / 1512 code lines = 0.53 (0.63 counting test helpers jsx-source.ts + copy-claim-guards.ts, 149 lines). Under 3:1.
- lib/landing-pages/pages.test.ts:437-456: implementation detail - pins default-param spelling ("animate = true", "width = 280", "icon ?? (", "{body && (") and that untouched callers still read `<NotificationPhoneDemo />` / `<CardStyleGallery />` / `<QRCodeSkeleton size={100} />`. Fix: delete.
- lib/landing-pages/pages.test.ts:154-166, :317-333: implementation detail - Tailwind class strings ("py-16 lg:py-24", "scroll-mt-", "[mask-image:…", "lg:max-h-none", "justify-center") and "id={anchor ? section : undefined}". Fix: delete; keep the data-landing-section and demo-anchor checks.
- lib/landing-pages/pages.test.ts:275-280: implementation detail - pins `getTranslations("variant.metrics")` and `proofFigures(` in LpHero; proofFigures is tested at :261-273. Fix: delete.
- lib/landing-pages/pages.test.ts:390-392, :409, :492, :554: implementation detail - expression text ("messages.banners.map(lpBanner)", "eager={false}", "alt={FEATURES.analytics.alt}", "alt={OUTCOMES.regulars.alt}"). Fix: delete; keep the animate={false} and lpBanner invariants.
- lib/landing-pages/pages.test.ts:35-57 + :109: implementation detail - PLAN_SECTIONS copies LANDING_PAGES.sections verbatim. Fix: delete the equality; :110-116 and :132 keep the invariants.
- lib/landing-pages/pages.test.ts:377-382 vs :535-540: duplicate. Fix: test.each([["features","messages.broadcast"],["outcomes","slowDays.noFees"]]).
- lib/landing-pages/pages.test.ts:384-394, :487-496, :542-548, :573-580: duplicate. Fix: one test.each over pages: every NotificationPhoneDemo/NotificationBanner in landingTree is still and fed by lpBanner.
- lib/landing-pages/pages.test.ts:300-302, :344-359, :404-410: duplicate (PhoneScreenshot only in SampleCapture, with caption). Fix: keep :344-359.
- lib/landing-pages/pages.test.ts:481-485: duplicate of :132 (a missing component already fails section order). Fix: delete.
- lib/landing-pages/copy.test.ts:164-168: tests splitAccent against live copy, repeating pages.test.ts:498-503. Fix: literal fixture string.
- lib/landing-pages/copy.test.ts:205-207: duplicate of the forbidden-pattern table. Fix: one more row in the test.each at :68-76.
- lib/landing-pages/pages.test.ts:90, :170, :363, :438, :461 (five read-and-strip helpers), :315 + :364 (filesWith twice), :365 tagIn vs 11 inline openingTags(...).find(...): copied setup. Fix: add code(file) and findTag(source, name) to lib/testing/jsx-source.ts.

## Waivers
(filled by the main agent only if the user explicitly waives a finding)

## Main agent's routing (12 Nov 2026)
- AC15 pins (:437-456): the default-spelling pins go, but AC15 is an acceptance criterion of the approved plan, so one behaviour pin per extended component stays: its existing call sites still pass none of the new props. The rendering itself is checked visually (runbook LP-15). Partial disagreement, recorded here.
- Everything else is accepted and goes to the fix stage.
