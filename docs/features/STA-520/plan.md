# Plan: One real iPhone for every phone on the site

ISSUE: STA-520 (https://linear.app/stampeo/issue/STA-520)
BRANCH: showcase `feat/sta-519-analytics-feature-page` (same branch as STA-519, Harry 2026-10-26; worktree `.claude/worktrees/sta-519`); promo-videos `feat/sta-519-capture-views` (overlay capture script)
REPOS: showcase, promo-videos
MIGRATION: no
STATUS: APPROVED (2026-10-26, by Harry: all 9 phones, Cosmic Orange)

## Problem

Harry (2026-10-26): "everywhere we use a device to show a mobile screenshot, replace our component with a real phone PNG … so we don't have our fake status bar, and we can just implement our screenshots in it." The site's 9 phones come from two hand-built CSS frames that draw their own Dynamic Island, side buttons and a "9:41" status bar.

## Decisions

- **Apple's iPhone 17 Pro bezel** (Cosmic Orange, Apple's iOS 27 design library via the Figma ad kit; already in promo-videos with its geometry). Scaled only, never altered (Apple's terms). Its screen is 402×874 pt, the size our captures are taken at.
- **A real iOS status bar**: three transparent overlays captured once from the "Stampeo Promo iPhone 17 Pro" simulator with the 9:41 override: `light` (black glyphs), `dark` (white), `lock` (white, no time). The bezel draws the island; the overlays never do. Spiked on 2026-10-26: clean at 3×.
- **The home indicator is a CSS capsule measured from the same simulator screenshot** (a flat pill; no glyph to get wrong).
- **One `components/ui/IPhone`** for all 9 phones (default; Harry to confirm scope); both `PhoneMockup.tsx` files deleted.
- **Screenshots sit below the status bar** like a home-screen web app; no re-shoot (offsetting gives the same pixels); no bottom fade.

## UX decisions

Folded in from `ux-brief.md` (ux-designer, MODE: DESIGN, 2026-10-26, VERDICT: READY).

- PLACEMENT: `components/ui/IPhone.tsx`; geometry in `lib/devices/iphone.ts`; assets in `public/images/devices/`. No new page.
- ENTRY: none new; every phone stays where it is.
- ADDED: the `lock` overlay (no 9:41 twice on lock screens) — AC4. Safe-area CSS variables — AC3. `eager` on the four hero phones — AC9. Replaced QA rows AF-10, LD-15 — AC12.
- REJECTED: point-scaled HTML screens, re-shooting captures, keeping the fade, a home-indicator PNG, extra props, site-wide AVIF, a wider default, drop-shadow filters, lock-screen content changes, a bezel-colour prop, changing promo-videos' StatusBar.
- MOBILE: 280 px wide (×572) at every width as today's default; screen 250×544 at 390; status band 39 px; every phone ≤ its old height; Analytics hero fold numbers unchanged.
- REUSES: `PhoneScreenshot` (same props), next/image, `ScaledCardWrapper`, `NotificationBanner`, promo-videos' layering pattern and `sim.ts`. NEW: `IPhone` (replaces both frames; extending `PhoneMockup` would keep props for the bar being removed).
- LOADING: one shared bezel URL (WebP), eager + high priority on one hero phone per page, the rest lazy; explicit size, no CLS.

## Non-goals

- promo-videos' own drawn `StatusBar` / `HomeIndicator` (follow-up once the PNGs exist).
- Lock-screen content fidelity (date position, real wallpaper) and a real scanner capture.
- Other bezel colours (Silver would come from Apple's resources).

## Edge cases considered

- Lock screens (#4, #6, #7) have their own big clock → `lock` overlay without the time.
- The landing's overlapping phone at md/lg/xl scales → its top must stay below the KPI row; the ink arrow meets the device's left edge.
- A capture line cut by the screen's bottom edge under the home indicator → accepted (real phones); a bad cut is fixed by the view's scroll at the next re-shoot.
- At 0.55 scale (geolocation hero) the status glyphs are ~6 px: decoration.
- Safari's radius-plus-transform clipping → `isolation: isolate` on the screen.

## Acceptance criteria

- AC1: Given the repo, then both `PhoneMockup.tsx` files are gone, no import remains, no drawn Dynamic Island or `9/19.5` frame remains under `components/`, and all 9 phones render `IPhone`.
- AC2: Given `public/images/devices/iphone-17-pro-cosmic-orange.png`, then its sha256 equals promo-videos' file (recorded in `lib/devices/iphone.ts`), it is 1350×2760, and it renders at 450:920 with no filter, recolour, crop or object-fit.
- AC3: Given width W, then the screen box is (24, 23, 402, 874)·W/450 with radius 63·W/450, and `--iphone-safe-top` / `--iphone-safe-bottom` equal 62·W/450 and 34·W/450 px; no seam shows outside the bezel's hole at 390 or 1440.
- AC4: Given the three overlays, then each is 1206 × 186 px, from the simulator with the 9:41 override, transparent inside the island box; `lock` has no time; light on #1, #2, #3, #5; dark on #8, #9; lock on #4, #6, #7.
- AC5: Given a screenshot phone, then the capture's top edge is at the safe-area top, full width, with no fade, and the band above it is the capture's page colour.
- AC6: Given any phone, then a home-indicator capsule (measured size and offset) shows, black on light, white on dark/lock, and it covers no result card, hint or lock-screen button.
- AC7: Given the default width 280, then no phone is taller than before (572 vs 583 px times its scale).
- AC8: Given the Analytics hero at 390×844, then the phone's top is within ±4 px of ~465; at 1440×900 the plan line ends under 900 px; on the landing at md/lg/xl the phone stays below the KPI row and the ink arrow meets the device.
- AC9: Given any page, then every bezel uses one `/_next/image` URL at the same width (WebP); the four hero phones are eager with high priority and the rest lazy; LCP on /features/analytiques is no more than 100 ms worse than STA-519's.
- AC10: Given the lock screens at 390 in four locales, then the wallpaper reaches the top edge, the clock and date start below the status bar, and nothing overlaps.
- AC11: Given the chrome, then bezel, overlays and home indicator are `alt=""` / `aria-hidden`; screenshot alt texts are unchanged.
- AC12: Given the runbooks, then AF-10 and LD-15 describe the real frame (status bar, no fade, home indicator).
- AC13: Given the promo-videos overlay script, when run, then it boots the promo simulator, applies the override, captures light/dark/lock, keys them to transparent overlays with the island cleared, and writes them where the showcase reads them.

## File layout

- New `components/ui/IPhone.tsx`; `components/ui/PhoneScreenshot.tsx` rewired; deleted `components/ui/PhoneMockup.tsx` and `components/features/scanner-mobile/PhoneMockup.tsx`; call sites: `VariantDashboardShot`, `AnalyticsPageContent`, `BusiestTimesSection`, `NotificationPhoneDemo`, `NotificationSequenceDemo`, `GeofencingHeroAnimation`, `GeofencingPage`, `ScanDemo`, `GetTheAppBand`.
- New `lib/devices/iphone.ts` (+ test: geometry, sha256, asset sizes).
- New `public/images/devices/` (bezel + 3 overlays).
- promo-videos: `tools/sim/status-bar.ts` (+ a pure keying function with a test), PLAYBOOK row.
- Skill reference `stampeo-ux-ui/references/showcase.md`: `ui/IPhone`.

## Touched areas and risks

- LCP on four pages (the bezel is the largest image in their heroes).
- The landing's scaled overlap (STA-514 measurements) and the Analytics fold (STA-519 measurements).
- Lock-screen and scanner layouts that assumed the old 48 px band.
- Same branch as STA-519 (stacked on STA-514).

## Docs impact (preliminary)

None (marketing site visuals).
