# Quality Report: STA-514
REVIEWED: 2026-10-26  DIFF: showcase `origin/dev..fc94bf9` (7 commits) · promo-videos `main..2df98e1` (3 commits)
VERDICT: FINDINGS

## Comments
- promo-videos `tools/screens/landing-shots.ts:2`: history "(STA-514)". Delete.
- promo-videos `tools/screens/shot-spec.ts:7`: history "(STA-514)". Delete.
- showcase `lib/landing-dashboard-copy.test.ts:45-49`: history ("still", "STA-519 moves them").
- showcase `lib/hero-fan.ts:254-256`: says "set it back to default once Halloween is over" while the line is already "default".
- showcase `components/ui/PhoneMockup.tsx:14-15`: says "behind the status bar"; the prop sets the whole screen's background.
- promo-videos `tools/screens/shot-spec.test.ts:8-9`: repeats the docstring of `shot-spec.ts`. Delete.
- promo-videos `tools/screens/shot-spec.ts:28-33`: the parseArgs JSDoc repeats the usage line. Keep one line.
- Density: showcase non-test 18.3% (baseline 16.4%), tests 14.9% (19.1%): fine. promo-videos non-test 22.8% vs 11.6% for its neighbours: the fixes above bring it in line.

## File size
None found.

## Folder tree
- showcase `lib/` (98 → 103 files): move the new landing files into the existing `lib/landing/` (`dashboard-shots.ts` + test, `dashboard-copy.test.ts`, `metrics.test.ts`, `feature-grid.test.ts`); update the path in promo-videos `shot-spec.ts`.
- showcase `lib/product-claims.test.ts` duplicates the job of the existing `lib/plans/product-claims.test.ts`: move the location-claim guard there.
- `BrowserFrame` (private in `VariantDashboardShot.tsx`) is hand-copied in `components/features/analytics/DashboardSection.tsx`: move it to `components/ui/BrowserFrame.tsx` next to `PhoneMockup`.

## Flag-gated paths
None found.

## Test shape
- Ratios: showcase 216 test / 192 code = 1.13 (0.77 counting catalog JSON); promo-videos 59/159 = 0.37.
- `lib/product-claims.test.ts:14-47`: rebuilds the machinery of `lib/plans/product-claims.test.ts` (own regex, lists looped inside tests) and scans only landing.json. Fold into the `plans/` file's `WORDING` + `it.each` tables + locale loop.
- `lib/product-claims.test.ts:57-59`: pins the geolocation tile to `tiles[2]`. Find it by link.
- `lib/landing-dashboard-copy.test.ts:44-67`: greps another component's source for `useTranslations("landing.dashboard")` and `td("…")`; a rename fails it with no user-visible change. Preferred: move the leftover keys into `features.analytiques.custom.dashboard` in this PR and delete the describe.
- `lib/landing-metrics.test.ts:21,23`: raw U+00A0 / U+202F inside a character class. Use escapes; share the fr/pl pattern.
- promo-videos `tools/screens/shot-spec.test.ts:18-21`: asserts literal config values (`isMobile`). Delete.

## Waivers
None.

---
Outside the reviewer's remit: commit 2485142 sets `HERO_FAN_SEASON = "default"`; if it merges before 31 Oct the Halloween fan goes early (already planned: hold the commit back if the release is before 1 Nov).
