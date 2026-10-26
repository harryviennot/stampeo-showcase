# Gap Report: STA-520
AUDITED: 2026-10-26  DIFF: showcase 3434294..HEAD (worktree sta-519) · promo-videos 7fdee31..HEAD (worktree sta-514)
VERDICT: DRIFT FOUND (gaps found too)

Some ACs can only be checked in a browser, because the showcase has no component test harness: AC1 (the "all 9 phones" clause), AC2 (the render half), AC3 (the CSS variables and the seam), AC4 (which overlay goes on which phone), AC5, AC6, AC8, AC9, AC10, AC11, AC12 and AC14. A runbook row fully covers AC5, AC6, AC14 and AC1's nine-phone clause (AF-10 and AF-14). Every other AC is only partly covered, or not covered, as listed below.

## Criteria without tests
- AC1 (partial): `lib/devices/iphone.test.ts` "no hand-built phone frame remains" only searches for the words `PhoneMockup|Dynamic Island`. Nothing checks the `9/19.5` frame clause, and a drawn island with no "Dynamic Island" comment would pass. The "all 9 render IPhone" clause is covered by AF-10 step 1 only.
- AC2 (partial): no test reads promo-videos' bezel. "is Apple's file, untouched" compares the showcase PNG to the hash recorded next to it (`lib/devices/iphone.ts:12`). promo-videos records no hash (`assets/devices/iphone-17-pro.json`). So no test ties the recorded hash to promo-videos' file. I could not hash either file with read-only tools. "Renders at 450:920 with no filter, recolour, crop or object-fit" has no test and no runbook row: AF-10 only checks "orange iPhone 17 Pro … Dynamic Island and side buttons".
- AC3 (partial): nothing checks screen width, height or top at any width other than 450 (see Suspect tests). Nothing checks `--iphone-safe-bottom` = 34·W/450 against the literal 34. Nothing tests the CSS variables themselves (`components/ui/IPhone.tsx:55-56`). "No seam outside the bezel's hole at 390/1440" has no runbook row.
- AC4 (partial): the overlay sizes are tested. Nothing checks "transparent inside the island box" or "`lock` has no time" on the committed PNGs: no test reads their alpha. The box coordinates (`tools/sim/overlay.ts:17,19`) and which overlay gets which box (`tools/sim/status-bar.ts:97-99`) are untested. AF-10 covers lock-without-time by eye. You cannot see island transparency in a render because the bezel's island sits on top, so that part is effectively unverified. Which overlay goes on which phone: covered by AF-10, but its wording is inverted (see Suspect tests).
- AC7 (partial): the test passes `280` explicitly. Nothing pins IPhone's default `width = 280` (`components/ui/IPhone.tsx:13`), and `GeofencingPage.tsx`'s `bottom-[339px]` relies on that default.
- AC8 (partial): "top within ±4 px of ~465 at 390×844" — AF-02 only requires top ≤ 844. It records 428–465 as a measurement, not as a limit. The 1440×900 plan line is covered by AF-03. "Below the KPI row" is covered by LD-06. "Ink arrow meets the device": LD-07 only checks that the arrow points at the phone, and the UX review measured its tip 21–26 px short of the body.
- AC9: mostly uncovered. No row checks one shared bezel `/_next/image` URL per page (same width, WebP). No row checks eager + high priority on the push-notifications, geolocation and scanner heroes, or lazy loading on phones #1, #3, #5, #7 and #9. No row compares /features/analytiques LCP with STA-519's: AF-08 only has an absolute limit of ≤ 2.5 s. AF-08 also contradicts the diff (see Suspect tests).
- AC10: AF-10 and LD-15 only open the lock screens in /en. No row covers the four locales, and no row states "wallpaper reaches the top edge".
- AC11: no row checks `alt=""` / `aria-hidden` on the bezel and overlays (`IPhone.tsx:61-81`). Screenshot alt texts are covered by AF-04 and LD-05.
- AC12 (partial): LD-15 (`docs/qa/landing.md:204-213`) mentions only the status bar; it says nothing about the fade or the home indicator. AF-10 covers all three. The plan contradicts itself here: AC12 still lists "home indicator" as something the rows describe, while AC6 says none is drawn. Edge-case line 44 ("under the home indicator") is also stale.
- AC13: no automated test and no runbook row runs `bun tools/sim/status-bar.ts`. Only `keyGlyphs` is tested. These are all unverified: boot plus override, the light/dark/lock captures, and the output path. Closest existing: `tools/sim/overlay.test.ts` and the PLAYBOOK row.

## Untested diff behavior
- `components/ui/IPhone.tsx:32-44`, `lib/devices/iphone.ts:18,44`: the shadow element is sized from the device body (8, 7, 434, 906, r80)·W/450. No test checks `body.*` at any width, and no row checks it. Risk: a shadow box shows outside the rim if the numbers drift.
- `components/ui/IPhone.tsx:28,69,80`: `eager` sets eager + `fetchPriority="high"` on the overlay and the bezel as well as the capture, so each hero has 3 high-priority images. No row checks this, and AF-08 says the opposite. Risk: the hero capture's fetch competes with the bezel and the overlay for bandwidth.
- `components/features/geolocalisation/GeofencingHeroAnimation.tsx:91`: `scale-[0.45]` below sm. AF-14 starts at 390, so the 320–375 widths this branch exists for have no row. Risk: the map crops the bezel (Apple's terms: never altered) or the phone covers the pin.
- `components/features/geolocalisation/GeofencingPage.tsx:99-105`: the ink note moved to `right-4 bottom-[339px] w-[154px] whitespace-nowrap`, with arrow `down`. AF-14 checks the note at 1440 only, in en/fr. Nothing checks 1024–1366, where the old note was cut off and where, per the UX review, French at 1024 ends 1 px from the map edge. Risk: the note is clipped or overlaps in fr/es/pl at lg.
- `tools/sim/status-bar.ts:24-25`: the default output folder is the sibling showcase, and the script refuses when that folder's parent is missing (a run from a worktree). Untested. `--out <dir>` written with a space is ignored by `arg()` (`tools/lib/args.ts:4`), so the script writes into the default showcase folder. Untested. Risk: a typo silently overwrites the committed overlays. landing-shots has tested refusals for the same case (`tools/screens/shot-spec.test.ts:53-54,69-72`).
- `tools/screens/landing-shots.ts:117`: the scroll offset changed from 16 to 12 px. Untested: shot-spec does not cover `scrollTo`, and AF-12 does not check the capture's top edge. Risk: the previous card's edge comes back under the status bar without anyone noticing.

## Drift (in diff, not in plan)
- promo-videos `tools/screens/landing-shots.ts:89-90,117`, plus the 8 re-shot showcase files `public/images/landing/dashboard/{fr,en,es,pl}-phone-{habits,busiest}.png`: the captures were re-shot with the scroll changed from 16 to 12 px. plan.md Decisions say "no re-shoot", UX REJECTED lists "re-shooting captures", and the change is not recorded in Decisions. These are STA-519's captures, so AF-01, AF-05 and AF-12 need re-running. Either the plan is out of date (update it and add tests) or this is scope creep (escalate).
- `components/features/geolocalisation/GeofencingHeroAnimation.tsx:89-91`: scale 0.45 below sm. The plan only has 0.55 (edge case "At 0.55 scale"). Not in plan.md.
- `components/features/geolocalisation/GeofencingPage.tsx:99-105`: the ink note moved from outside the map (`-top-4 -right-28`) onto the map above the phone, the arrow changed from `downLeft` to `down`, and `whitespace-nowrap` was added. The map-fix decision covers only the wrapper width (`:97`). Not in plan.md.

## Suspect tests
- `iphone.test.ts` "scales every measure with the width, never the proportions": at 280 it checks height, screen aspect ratio, `screen.left`, `radius` and `safeTop`. If screen width and height were left unscaled (402×874 at W=280), the ratio would still match and the test would pass. Nothing checks `screen.top`, `safeBottom` or any `body.*` at a scaled width. The name claims more than the test checks.
- `iphone.test.ts` "is the bezel's own geometry at its natural width": `safeTop` and `safeBottom` are compared to `IPHONE.safeTop` and `IPHONE.safeBottom` × 1, i.e. to the same constants. A wrong inset value cannot fail it, and no test asserts the literal 34.
- `iphone.test.ts` "is drawn at its own proportions, 3 pixels to the point": it compares two pairs of constants in `iphone.ts` and checks nothing about how the bezel is drawn.
- `iphone.test.ts` "is Apple's file, untouched": it ties the copy to a hash recorded next to it, not to promo-videos' file (AC2).
- `iphone.test.ts` "no hand-built phone frame remains": it matches two words, not a frame (AC1).
- `lib/landing/dashboard-shots.test.ts` for the 8 re-shot captures: it checks only that the file exists and its pixel size. A capture of the wrong card, or one with the hairline, passes, so it cannot fail on what the re-shoot changed.
- `docs/qa/feature-pages.md` AF-08 was not updated: "the only one with it" (eager/fetchpriority) is now false, because the bezel and status-bar `<img>` carry the same flags. "LCP element being the hero image or the headline" is also out of date: the UX review measured the bezel as LCP. A tester either fails AF-08 or ignores the clause.
- `docs/qa/feature-pages.md` AF-10: the row says "a dark status bar" for the dashboard and sequence phones and "a white one" for the scanner. In code those are `light` and `dark` (`lib/devices/iphone.ts:25-31`, `status-bar-dark.png` on the scanner), so the names are inverted for anyone checking against the file names.
- I found no weakened assertions in the code tests (only new test files). I could not compare the AF-01 and LD-03 EXPECT edits with their previous text, because docs were excluded from the diff.

## Unrealistic or missing workflow tests
- `iphone.test.ts` "is the bezel's own geometry at its natural width": it starts from W=450 (scale 1), a width no phone renders at, where every unscaled field still passes. Use: W=280, the width every call site renders at.
- `tools/sim/overlay.test.ts` (all 3 tests): they start from 1-pixel-tall rows, so the row index (`overlay.ts:33`) never changes. The real input is a 1206×186 strip with boxes at y 28–168 and 36–160. Use: a multi-row strip with a box that covers only some rows.
- Missing: the scaled phones rendered in iOS Safari/WebKit (landing md/lg/xl, geolocation 0.45/0.55), which is the plan's `isolation: isolate` edge case. Every runbook row uses Chrome DevTools.
- Missing: the geolocation hero on a 320–375 px phone. No row.
- Missing: the geolocation ink note at 1024 and 1280 in fr/es/pl. No row.
- Missing: lock screens in fr/es/pl (AC10). No row.
- Missing: a slow-network first load of the push-notifications, geolocation and scanner heroes, where the bezel is now the largest hero image. AF-10 step 2 covers Analytics only.
- Missing: re-running `status-bar.ts` from a promo-videos worktree, or with `--out <dir>` written with a space. No row; landing-shots has the equivalent in LD-14 step 4 and AF-12 step 4.
- Missing: checking that the re-shot habits/busiest captures have a clean top edge under the status bar, which is why they were re-shot. No row.

## Waivers
(filled by the main agent only if the user explicitly waives a gap)

## Resolution (2026-10-27)
- Suspect tests: `iphoneLayout` now checks every field (screen, body, safe insets) at 280 px against literal values, and the literal 62/34 insets at 450; the "proportions" and "old frame" tests are gone; the guard matches the old frames' 9/19.5 screen, not two words.
- `overlay.test.ts` keys a full 1206×186 strip and checks the island box (cleared inside, kept above, below and beside) and the lock screen's time box.
- `status-bar.ts` refuses any argument but `--out=<dir>`, so `--out <dir>` no longer writes into the showcase.
- AF-08 now expects the hero phone's three eager images (bezel, status bar, capture) and allows the bezel as LCP; AF-10 names the status bars by their files (light = black glyphs).
- The re-shot captures (drift): the landing captures were re-shot again on 27 Oct with a café's numbers (`promo-videos/tools/screens/showcase-analytics.ts`), covered by its tests and LD-14.
- Geolocation hero rows (320–375 px, the note at 1024–1366): the hero is being redesigned on this branch; its rows are written with it.
- Not done: alpha checks on the committed overlay PNGs, a WebKit pass on the scaled phones, fr/es/pl lock-screen rows.
