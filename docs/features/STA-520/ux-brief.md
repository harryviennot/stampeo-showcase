# UX Brief: STA-520
MODE: DESIGN   DOMAIN: showcase
VERDICT: READY

## Already shipped
None of this exists in the showcase. Both phones are hand-built CSS (`components/ui/PhoneMockup.tsx`, `components/features/scanner-mobile/PhoneMockup.tsx`), each drawing a fake Dynamic Island. The real bezel and its geometry exist only in promo-videos (`assets/devices/iphone-17-pro-cosmic-orange.png` 1350×2760, 533 KB; `iphone-17-pro.json`: frame 450×920 pt @3x, screen (24, 23, 402, 874), radius 63). The PNG already contains the Dynamic Island (≈14–51 pt from the screen top), side buttons and the black band; the screen hole is transparent. promo-videos `tools/sim/sim.ts` already sets the status-bar override (9:41, Wi-Fi 3, cellular 4, 100% discharging, no carrier) and screenshots. promo-videos' own `StatusBar.tsx`/`HomeIndicator.tsx` are drawn.

| # | Where | Frame | Screen | Status bar today |
|---|---|---|---|---|
| 1 | Landing `VariantDashboardShot.tsx` | ui/PhoneScreenshot → ui/PhoneMockup | capture, top view; scaled 0.55/0.68/0.78 at md/lg/xl | drawn, full |
| 2 | Analytics hero `AnalyticsPageContent.tsx` (eager) | same | capture, habits | drawn, full |
| 3 | Analytics busiest `BusiestTimesSection.tsx` | same | capture, busiest | drawn, full |
| 4 | Notifications hero `NotificationPhoneDemo.tsx` | ui/PhoneMockup, no bar | HTML lock screen, own 72px clock | none |
| 5 | Notifications sequence `NotificationSequenceDemo.tsx` | ui/PhoneMockup, time-only | HTML #f2f2f7, WalletCard + banner | drawn, time only |
| 6 | Geolocation hero `GeofencingHeroAnimation.tsx` (scale 0.55) | ui/PhoneMockup, no bar | HTML lock screen, own clock | none |
| 7 | Geolocation aside `GeofencingPage.tsx` | same | same, static | none |
| 8 | Scanner hero `ScanDemo.tsx` | scanner PhoneMockup | HTML camera app, auto cycle | none, island only |
| 9 | Scanner band `GetTheAppBand.tsx` | same | HTML viewfinder on the dark CTA card | none, island only |

Old screen 260×563 px (`9/19.5`); #4–#7 content sits in a `pt-12` box; #8–#9 pad `pt-14`. Nothing else on the site draws a device.

## Placement
- One `components/ui/IPhone.tsx` replaces both frames; both `PhoneMockup.tsx` files are deleted.
- Geometry in `lib/devices/iphone.ts` (testable): frame, screen rect, radius, `SAFE_TOP` 62 pt, `SAFE_BOTTOM` 34 pt, the bezel's sha256 (a copy of promo-videos' JSON, separate repos).
- Assets in `public/images/devices/`: the bezel (byte-identical), `status-bar-light.png`, `status-bar-dark.png`, `status-bar-lock.png`.

## Entry points
None new; every phone stays where it is.

## Proposed additions
- `lock` overlay (white glyphs, no time) — prevents a mistake (9:41 twice above a lock screen's own clock).
- `--iphone-safe-top` / `--iphone-safe-bottom` CSS variables on the screen — removes a step (no per-width hard-coding).
- `eager` on the four hero phones (#2, #4, #6, #8) — prevents a mistake (the bezel is the largest image above the fold there).
- Replace QA rows AF-10 and LD-15 (they describe the old frame and the fade) — prevents a mistake.

## Rejected additions
Point-scaled content for the HTML screens (text would shrink to ~8px); re-shooting the captures at 402×820 (same pixels as offsetting and cropping; 12 files); keeping the bottom fade (a real screen has none); a home-indicator PNG (a flat capsule measured from the simulator is pixel-equivalent at ~3px); `statusBar="none"` / `homeIndicator` props (no call site needs them); AVIF site-wide; a default width above 280 (taller phones, landing arrow offsets); `filter: drop-shadow` on the device (re-rasterises on animation frames; a shadow element behind it instead); lock-screen fidelity changes, a real ScanDemo capture (content decisions, own issues); a bezel-colour prop; changing promo-videos' StatusBar (follow-up); a dark-glyph lock variant (no light lock screen exists).

## Mobile shape
At 390 every phone is 280 px wide × 572 px (s = 0.622), centred; screen 250×544 at (15, 14), radius 39; status band 39 px (62 pt), glyphs ~11 px; home indicator ~87×3 px, 5 px above the bottom, over content. No stacking changes, nothing tappable inside, bezel `pointer-events: none`. Notifications/geolocation/scanner heroes: phone first, 11 px shorter. Analytics hero: CTA bottom ~425, phone top ~465 (unchanged), phone bottom ~1037. Desktop: phone stays 280; landing md/lg/xl 154×315 / 190×389 / 218×446 (tops move down, still below the KPI row); Analytics hero at 1440×900 phone + plan line ~632 px.

## Components
- `IPhone({ width = 280, statusBar = "light" | "dark" | "lock", screenBackground?, eager = false, className?, children })`. Children fill the whole screen in CSS px and clear the bars with `var(--iphone-safe-top/bottom)`. Screen box (24, 23, 402, 874)·s, radius 63·s, `overflow: hidden`, `isolation: isolate`. Layers: a static shadow element (old frame's values, radius ≈86 pt) → content → status-bar `<img>` + CSS home-indicator capsule → bezel `<img>` (`pointer-events: none`, `alt=""`). No `"use client"`.
- Overlays: 1206 × `SAFE_TOP`×3 px at screen (0, 0), alpha 0 inside the island box. light (black glyphs) on #1, #2, #3, #5; dark (white) on #8, #9; lock (white, no time) on #4, #6, #7.
- `PhoneScreenshot` keeps its props; internals become `IPhone statusBar="light"`, the capture from `var(--iphone-safe-top)` down, `object-cover object-top`, no fade; `SCREEN` stays the one page colour.
- Capture script for the overlays: promo-videos `tools/sim/status-bar.ts`, reusing `sim.ts`.

## Per call site
- #1: internals only; re-check the ink arrow at md/lg/xl (device body ~4×scale px inside the box).
- #2/#3: visible capture becomes 0–812 pt; a line may be cut at the bottom edge under the home indicator (how a real phone looks); check 12 files at 390; nudge a view's scroll at the next re-shoot rather than bring back a fade.
- #4/#6/#7 (`lock`): wallpaper to the top edge; clock block padded `calc(var(--iphone-safe-top)+…)` to keep its position; lock buttons clear the indicator; banner 10 px narrower.
- #5 (`light`): full real bar; content padded below it; WalletCard rescales.
- #8/#9 (`dark`): header already clears the bar; result card and hint padded `var(--iphone-safe-bottom)`.

## Loading
Bezel via next/image (`1350×2760`, `sizes="280px"`), one shared URL, WebP (~10× smaller). The bezel becomes LCP on the Analytics hero and probably #4/#6/#8 at 390: eager + `fetchPriority="high"` on the hero phone of each page (bezel, overlay, capture); every other phone lazy. Explicit size, no CLS.

## Open questions
- Scope: all 9 (recommended) or only the 3 screenshot phones.
- Bezel colour: Cosmic Orange (in hand, matches ads; may compete with the orange CTA, judged in POLISH) or Silver (from Apple's iOS 27 resources).
