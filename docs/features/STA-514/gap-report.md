# Gap Report: STA-514
AUDITED: 2026-10-26  DIFF: showcase `origin/dev..fc94bf9` (PNGs and docs excluded) + promo-videos `feat/sta-514-landing-shots`
VERDICT: DRIFT FOUND → resolved below, two items pending Harry's waiver

Each item is followed by its resolution (→).

## Criteria without tests
- Runbook-only ACs (AC1, AC14, AC18, AC13 partly, AC10 partly, AC12 rendered half, AC15 render): showcase has no component harness.
  → Runbook widened: LD-03 checks overflow and downloads in all four locales; LD-07 checks the note at 768/1024/1280/1440; LD-06 checks the phone/KPI clearance in all four locales.
- AC2: nothing tied the locale to its files.
  → `dashboard-shots.test.ts` asserts each locale's src is `/images/landing/dashboard/<locale>-<size>.png`. AC2 wording updated for the phone image (`fill` in a fixed-aspect frame).
- AC4: no rule caught a customer name or the shipped present-tense prediction.
  → `customerName` rule and present-tense return phrasings ("coming back tomorrow", "revient demain", "vuelve mañana", "wraca jutro") added, each rule self-tested.
- AC5: figures not pinned.
  → By design (hand-maintained social proof): AC5 now says tests guard parity, floor format and the Polish plural, and LD-08 checks the figures.
- AC7: no test.
  → Verified by LD-09; the AC6 guard keeps the old claim out. AC text updated.
- AC8: the AC6 guard does not check tense.
  → AC8 now: pill + link tested, future tense checked by LD-10.
- AC9: no test of the season.
  → `hero-fan.test.ts` fails outside October unless the season is `default` (skipped in October).
- AC11: fixture-only and no-prod not enforced.
  → `fixtureEmail()` refuses anything but `*.seed.stampeo.app`; `showcaseOrigin()` only takes localhost; hosts are hardcoded to dev. All tested.
- AC12: "screens show the Growth plan" not asserted.
  → `CAPTURE_PLAN` in `dashboard-shots.ts`; the plan line must name it first.

## Untested diff behavior
- hero-fan season flip → covered by the clock test above.
- Locale → capture wiring → src-per-locale test above, LD-02.
- Default `--out` from a promo-videos worktree resolves to a phantom showcase → `parseArgs` refuses and asks for `--out` (tested), LD-14 step 4.
- Locale override, cookie, Escape, `lang` check in the runner → LD-14 now shoots two locales at both sizes.
- Nothing keeps a trial banner out of frame → LD-14 EXPECT checks for banners and dialogs; the fixture (Aurevo) is not on trial.
- `PhoneMockup` background on its other consumers → LD-15.
- FeatureGrid icon row on all six tiles → LD-10 EXPECT covers every tile.

## Drift (in diff, not in plan)
- Phone image uses `fill`; bottom fade unplanned → plan LOADING and AC2 updated (fade added at polish).
- New capture tool instead of extending `dash_shot` → plan Decisions and File layout updated.
- `SHOWCASE_ORIGIN`, `FIXTURE_EMAIL` → now guarded and tested; in the plan.
- `--period` → in the plan.
- `whitespace-nowrap` on the strip → in the plan's File layout.
- PhoneMockup: four importers and the optional prop → plan File layout updated.

## Suspect tests
- `OFF_PICTURE.prediction` `\b` after accented letters → boundaries rewritten with a Unicode lookahead; every rule has positive and negative self-tests ("volverá", "wrócą" now caught).
- `hero-fan.test.ts` "shows the season the config names" is a tautology → pre-existing; the clock test is the real guard.
- `shot-spec.test.ts` default-out test mirrored the implementation → now injects `exists` and covers the refusal.
- `landing-shots.test.ts` distinct-only → replaced by the exact src per locale.
- Metrics compared by position only → accepted: label order is the same JSON array in every locale; LD-08 reads them.
- LD-13 EXPECT weakened to pass → reverted to the AC; the 1920 LCP is listed in Known state as a miss **pending Harry's waiver**.
- LD-04 / Known state wrote the 1440×900 misses into the pass condition → EXPECT restored; the misses on `/` and `/us` are listed **pending Harry's waiver**.

## Unrealistic or missing workflow tests
- `isMobile` literal test → deleted.
- Default `--out` from a worktree, desktop re-shoot → LD-14.
- Phone over KPI for es/pl → LD-06.
- Ink note at 1024–1279 and 1280 → LD-07.
- 390 overflow on `/`, `/es`, `/pl` → LD-03.
- Reduced motion → LD-16 (checked 2026-10-26: phone, note and arrow fully visible).
- Other PhoneMockup pages → LD-15.

## Waivers
- PENDING (Harry): AC10 at 1440×900, the frame's top edge is not above the fold on `/` (only the bar) and `/us` (part of the bar).
- PENDING (Harry): AC10 at 1920×1080, the desktop capture is the LCP element (~870ms throttled) instead of the hero.
