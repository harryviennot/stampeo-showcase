# Quality Report: STA-520
REVIEWED: 2026-10-26  DIFF: showcase 3434294..93ad96b (sta-519 worktree), promo-videos 7fdee31..1e41cdf (sta-514 worktree)
VERDICT: FINDINGS

Three changes are worth making before merge:
1. Delete the "old frame" test.
2. Fix or delete the grep guard for the old phone frame.
3. Compute the hard-coded 339px / 154px ink-note position instead of writing it by hand.

Everything else is small.

## Comments
- `showcase/lib/devices/iphone.test.ts:55-56`: history. The test is named "is no taller than the hand-built phone it replaces…", with the comment `// The old frame: 280 wide, a 260-wide 9/19.5 screen plus 10px of bezel each side.` It checks the new phone against the size of a deleted component. Fix: delete the test. If a height limit matters, state it as a limit of the page that holds the phone.
- `showcase/components/features/geolocalisation/GeofencingPage.tsx:99-102`: the comment explains a hand-worked number. It reads "…right above the hero phone (280 px at 0.55, bottom-4 right-4)". It is there to justify `bottom-[339px] w-[154px]`, which someone worked out by hand from IPhone's geometry: 920/450 × 280 × 0.55 + 16 ≈ 331, and 280 × 0.55 = 154. If the bezel, the default width or the hero's scale changes, the note drifts and nothing fails. Fix: work it out from `iphoneLayout(280)` (`height * 0.55 + 24`, `width * 0.55`; this also gives a use to `scale`, which `iphoneLayout` returns but nothing reads). Or anchor the note to the phone's wrapper inside `GeofencingHeroAnimation`. Either way the comment can shrink to one line.
- All the other factual claims I checked are true:
  - The bezel's sha256 matches promo `assets/devices/iphone-17-pro-cosmic-orange.png`.
  - Every `eager` phone (ScanDemo, NotificationPhoneDemo, GeofencingHeroAnimation, the Analytics PhoneScreenshot) is in a hero.
  - The status bars are 1206×186 = 402×62 pt at 3x.
  - `ensureDevice` sets the 9:41 status-bar override (`tools/sim/sim.ts:65`).
  - Web's 14px gap between cards is real (`analytics-view.tsx:41,102`, `gap-[14px]`).
  - The alpha formula in `keyGlyphs` matches its docstring.
- Density (non-blank added lines that are comments; baseline is the touched file on base, or its folder for a new file):
  - Showcase overall: 31/168 = 18.5%, against 8.1% for the touched files on base (75/923). New modules are in line with their folders: `components/ui/IPhone.tsx` 9.8% vs `components/ui` 12.8%; `lib/devices/iphone.ts` 31.1% vs `lib/` 32.7%.
  - `GeofencingPage.tsx`: 3/11 = 27.3% vs 5.0% (5.4x). Flagged; the fix above covers it.
  - `GeofencingHeroAnimation.tsx`: 2/7 = 28.6% vs 7.9% (3.6x). It is a two-line explanation of the `scale-[0.45]` breakpoint, so I'm not asking for a change.
  - Promo overall: 24/136 = 17.6% vs `tools/sim` 18.5% (51/276). `tools/sim/overlay.ts` alone is 27.8%, exactly 1.5x, and every one of those comments documents an exported type or constant, so it isn't flagged.

## File size
None found. The largest touched file is `GeofencingPage.tsx` at 220 -> 222 lines. The new files are `IPhone.tsx` (84), `iphone.ts` (48), `status-bar.ts` (103) and `overlay.ts` (39). Net change in showcase code is -48 lines, because the two PhoneMockup files (208 lines) were deleted.

## Folder tree
None found. `components/ui` stays at 24 files (one added, one deleted). `lib/` holds 100 entries, but the new code went into a new folder, `lib/devices/`, which is correct. Promo `tools/sim` has 8 entries.

## Flag-gated paths
None found.

## Test shape
- Ratio of test lines to code lines:
  - Showcase: 74 / 173 = 0.43.
  - Promo-videos: 30 / 145 = 0.21.
  - Combined: 104 / 318 = 0.33.
- `showcase/lib/devices/iphone.test.ts:55-58`: tests history (see Comments). Fix: delete.
- `showcase/lib/devices/iphone.test.ts:60-73` ("one phone on the site", `/PhoneMockup|Dynamic Island/`): a grep guard for a deleted component name. Source-scan guards are an existing pattern here (`lib/no-currency-glyph.test.ts`). But the `Dynamic Island` half fails on any future comment that mentions the island, such as one saying the bezel draws it. That ties the test to the wording of comments, not to behaviour. Fix: delete the guard, or narrow it to `PhoneMockup` only.
- `promo-videos/tools/sim/overlay.test.ts:14-24`: the "black glyphs on white" and "white glyphs on black" tests have the same three-line body with mirrored inputs. Fix: one `test.each` over `[glyph, row, alphas, colour]`. This is minor.

## Waivers
(filled by the main agent only if the user explicitly waives a finding)


## Resolution (2026-10-27)
- History test deleted; `iphoneLayout` is now tested field by field at 280 px, with iOS's literal 62/34 insets at 450.
- The guard matches `PhoneMockup` or a 9/19.5 screen (how both deleted frames were drawn), not comment wording.
- The geolocation note's hand-worked position: superseded by the geolocation hero redesign (same branch), which replaces that block.
- `overlay.test.ts`: kept the two mirrored tests (readable as they are); added tests on a full 1206×186 strip instead (see gap-report).
