# Quality Report: STA-519
REVIEWED: 2026-10-26  DIFF: showcase `feat/sta-514-landing-refresh..620b85b`; promo-videos `feat/sta-514-landing-shots..7987b29`
VERDICT: FINDINGS (small; none blocks the merge)

## Comments
- `components/ui/PhoneScreenshot.tsx:4-9`: says the fade uses `SCREEN`; the fade hard-codes `from-[var(--paper-hover)]`. Build the fade from `SCREEN` or fix the comment.
- `lib/landing/dashboard-shots.ts:5-7`, promo-videos `tools/screens/shot-spec.ts:28-29`: "scrolled to a card pair"; `busiest` scrolls to a single card. Say "a card".
- `lib/testing/analytics-claims.ts:5-6`: "Used by the landing's dashboard section and the Analytics feature page"; only the two copy tests import it.
- `lib/features/analytics-chart-plans.test.ts:12`: history ("at Harry's call (2026-10-26)"). Delete.
- `lib/features/analytics-chart-plans.ts:4-9`: docblock repeats the table. One line.
- promo-videos `tools/screens/shot-spec.ts:70-74`: 1 line became 5. One line.
- Density: showcase code 15.1% vs 4.8% baseline across touched files (new files 25–29% vs 11.6–13.4% neighbours); promo-videos 25% vs 18.1%. The fixes above bring them in line.

## File size
- `AnalyticsChartCards.tsx` 657 → 641 (already over ~500; shrank, no refactor asked). Move the new `ChartHeader` to its own file.

## Folder tree
- No folder at 30+ files.
- `lib/features/` sits next to the existing `lib/features.ts` (nav `FEATURE_ITEMS`); `@/lib/features` resolves to the file. Move to `lib/feature-pages/analytics/`.
- Feature-page captures read through `landingShot()` in `lib/landing/` (low priority rename).

## Flag-gated paths
None found.

## Test shape
- Ratio: showcase 184/239 = 0.77; promo-videos 24/76 = 0.32; combined 0.66.
- `lib/features/analytics-copy.test.ts`: `offenders` helper and the plan-line test copy `lib/landing/dashboard-copy.test.ts`. Share them.
- Same file: "the old dashboard mock and the unused sections list are gone" (dead keys, history name) and the `{seconds}` guard (placeholder the component no longer uses): delete.
- `lib/features/analytics-chart-plans.test.ts`: `NOT_BUILT_YET` test duplicates the every-chart test. Delete.
- `lib/landing/dashboard-shots.test.ts`: `VIEWS` typed by hand; derive from `SHOT_SIZES`.
- promo-videos `shot-spec.test.ts`: second "refuses" table duplicates the first. Merge.

## Waivers
None.
