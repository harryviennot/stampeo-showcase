# UX Brief: STA-514
MODE: DESIGN   DOMAIN: showcase
VERDICT: READY

## Already shipped
Little of this exists today: only a fake version of the section, the parts to build the real one (a capture tool, two phone frames, browser-chrome markup), and "coming soon" wording for geofencing that the rest of the site already uses.

- **A dependency the plan missed.** `components/features/analytics/DashboardSection.tsx:32` powers the live /features/analytics mock and reads seven keys from `landing.dashboard`: `stats.totalCustomers`, `stats.visitsThisWeek`, `stats.rewardsClaimed`, `recentCustomers`, `progress`, `visitedToday`, `almost`. Deleting them shows raw key paths in prod and nothing catches it (no `onError` in `i18n/request.ts`, the parity test passes when a key is deleted in all four locales, no component tests). Only `badge`, `title`, `subtitle`, `features`, `annotation` belong to the landing section alone.
- **The slot today:** `components/sections/DashboardPreview.tsx`, a hand-built mock; only consumer `components/landing-variant/VariantLanding.tsx:98`.
- **The capture tool:** promo-videos `tools/screens/dash_shot.cjs`. Logs in as camille@aurevo (admin; analytics routes use `require_management_access`, which allows admins). Shoots 402×874 @3x, English only (forces `NEXT_LOCALE` and the profile locale), viewport only. `SidebarInset` is the dashboard's scroll container (`web/src/app/(dashboard)/layout.tsx:301`), so `fullPage` captures no more than the viewport.
- **The data:** Aurevo fixture, `backend/scripts/dev_fixtures/matrix.py:276-343`: Growth, stamp program (8 stamps), 240 customers, 180 days of history; every Analytics section has data. Stamp program → no "Tracked spend" card (`web/src/components/analytics/kpi-row.tsx:89`), no money on screen. No customer names, no merchant-typed strings.
- **What the Growth Analytics view shows** (`web/src/components/analytics/analytics-view.tsx`), top to bottom: page header; period control (7d/30d/90d, crown on 1y); KPI row (Visits from N customers, New customers, 30-day return rate); Visits over time + Busiest times; How often they come + Reward progress; a locked, blurred "Example" of Pro cohorts with an upgrade pitch (`cohorts-section.tsx:115`). Location filter hidden on Growth. At 402px the KPIs wrap 2 + 1 and the pairs stack: a phone shot shows header, period control, KPIs and the top of Visits over time.
- **Frames:** two `PhoneMockup`s: `components/features/notifications-push/PhoneMockup.tsx` (width prop, status bar, side buttons; already imported cross-feature by `geolocalisation/GeofencingHeroAnimation.tsx:7`) and `components/features/scanner-mobile/PhoneMockup.tsx` (simpler, renders differently). No browser-frame component: chrome is hand-built in `DashboardPreview.tsx:63-75` and `DashboardSection.tsx`.
- **Geofencing is already "coming soon" almost everywhere:** `metadata.json` `features.geolocalisation.description` (pinned by `lib/plans/plan-facts.test.ts:134-137`), llms.txt (`lib/llms-txt.test.ts:124`), the pricing table "Soon" pill (`components/pricing/PricingPageContent.tsx:83-88`). Only the landing tile and the /features page body (STA-434) still say it's live.
- **Overlap with Benefits:** Benefits card 2 makes the dashboard argument, in per-customer terms, one section below the new one.

## Placement
- New `components/landing-variant/VariantDashboardShot.tsx` (matches the `landing.dashboard` namespace and the `dashboard_preview` id), mounted right after the hero; wrapper keeps `data-landing-section="dashboard_preview"`. Old slot removed, `DashboardPreview.tsx` deleted.
- Page order: hero → dashboard_preview → trust_strip (not on /us) → benefits → differentiator → how_it_works → … After a screen of customer data, "GDPR · hosted in Europe" answers where that data lives; the strip's borders close the pair. Record the strip's move in docs-decision.md.
- Background: the hero's paper, no colour band (a colour edge across the bottom of the first desktop screen reads as the page ending).
- Hero bottom padding at lg cut from 96px to ~24px (`VariantHero.tsx:60`, `lg:pb-24` → ~`lg:pb-6`); the new section has no top padding; below lg unchanged (`pb-16`). Without it AC10 cannot pass: the hero content ends ~802px at 1440×900.

### Copy slots
No eyebrow.
- **Heading** (`text-h2`): the switch from the customer's card to the owner's view. ≤ ~6 words (one line at lg half-width, ≤2 lines at 390). Must not promise knowledge of individual customers ("know your regulars", "who", "your best customers").
- **Caption** (`text-lead`, muted): 1–2 sentences, ≤ ~30 words (3 lines at 390). Jobs: it fills itself from every scan, no data entry; same dashboard on the phone and the computer.
- **Three points** (check list), each one section visible in the captures, in totals, ~8 words: (1) visits, new customers and how many first-timers came back (KPI row); (2) busiest times by day and hour; (3) how often customers come back, or where customers are on their card — whichever the desktop capture shows.
- **Alt text:** one localized alt per image, same rules.
- **Banned in every slot:** names or anything about one customer; any prediction ("will come back"; only "came back"); money/spend; Pro-only things (cohorts, per-location, 1-year, location filter); export.

### Ink annotation
One InkNote + `InkArrow variant="right"`, at ≥768 only, in the strip under the browser frame, left of the phone, pointing at the phone frame: the phone shows the same dashboard as the computer, not a separate app (the employee scanner app exists, so a visitor could guess wrong). It points at a page element, so it stays right across re-shoots and locales. None below 768. The "Sophie" note and its key go.

### Geolocation tile
Keep the tile, add a "Soon" pill, rewrite the description, keep the link.
- Pill in the icon row, top-right (`flex items-start justify-between`): descriptions are hidden at 390 (`FeatureGrid.tsx:59`) and the title line is full.
- Classes copied from `PricingPageContent.tsx:85`; label from an optional `badge` on `featureGrid.features[2]`, same words as `pricingPage.comparison.soon`; FeatureGrid shows it when present.
- No plan in the pill (`pricing-features.ts:60` says Growth+Pro, PLAN_FACTS says Pro only).
- Description (≥768): neutral or future tense; the claims guard bans the "walk by / passe devant" phrases in any tense.
- Don't dim the tile (still a working link). Not swapped: all six /features pages already have a tile; header, footer and metadata already say "coming".

## Entry points
- Second section on `/`, `/en`, `/es`, `/pl`, `/uk`, `/us`. At 1440×900 the top of the browser frame shows without scrolling; at 390 the heading starts at the bottom of the first screen.
- No nav item, no link inside the section (header Product → Analytics and the FeatureGrid tile already reach /features/analytics).

## Proposed additions
- **A plan line under the image saying the screens show the Growth plan** — prevents a mistake: Starter gets highlights, not charts (PLAN_FACTS `analyticsCharts` false on Starter). Guarded like `plan-facts.test.ts:139-145`. Folded into the caption if it still fits three lines at 390.
- **The ink note pointing at the phone** (≥768) — answers a question the screen provokes.
- **Trust strip right after the section** — answers "where does this data live?".
- **"Soon" pill on the Geolocation tile** — prevents a mistake (signing up for a feature that is off); visible at 390.
- **`lib/landing-shots.test.ts` checks image dimensions** against the PNG header — prevents a mistake (a re-shoot at a new size stretches the image or brings back layout shift, invisible in a binary diff).

## Rejected additions
- Eyebrow (the screenshot shows "Analytics"; costs height at 390 and pushes the frame below the fold at 1440).
- A CTA in the section; a "See analytics →" link (sends visitors off the page at section two).
- An ink arrow at a chart inside the screenshot (moves per locale and re-shoot).
- An ink note at 390.
- The desktop shot shrunk to 390 (~0.28 scale, unreadable, ~200KB for nothing).
- Tap-to-zoom/lightbox; a carousel; animated numbers; hover tilt.
- Keeping "Identify your most loyal customers" (per-customer) and "Export data anytime" (not in either image).
- A coloured background band.
- Swapping/dropping/dimming the Geolocation tile; driving the pill from PLAN_FACTS.
- A shared `components/ui/BrowserFrame.tsx` now (one user until /features/analytics is redone).

## Mobile shape
**390×844 — heading first, the phone is the only picture.** No top padding (the gap is the hero's own 64px). Centered heading (≤2 lines), centered caption (≤3 lines). `PhoneMockup` at its default 280px, centered, ~580px tall, showing the phone capture (402×874 @3x, top of page) with `object-cover object-top`. Browser frame and desktop image hidden below 768 and lazy, so phones never download them. Plan line centered under the phone. Points as a left-aligned check list in a centered `max-w-sm` block. Bottom padding 64px, then the trust strip. ~1,090px total (vs 1,132 removed). No ink note, no CTA, nothing tappable, nothing hover-only, no horizontal overflow (side buttons stay inside the column). Screenshot at ~0.65 scale: big numbers ~18px read; labels ~8px don't need to.

**768 — still heading first.** Overlap layout: browser frame (desktop capture) ~650px wide, left-aligned; phone pinned bottom-right, ~200px via a CSS transform on its wrapper, ~48px below and ~70px past the frame's right edge but inside the Container (don't rely on `overflow-x: clip`). Figure bottom padding = the overhang. Ink note in the strip under the frame, left of the phone. Plan line under the figure; points stacked, centered block.

**≥1024 — picture first.** Grid reorders at lg only (DOM stays heading → picture → points; nothing focusable). Row 1: the picture, centered, capped ~1,120px (frame ≤1,040 + ~80 phone overhang). Row 2: heading + caption left, points right. Reorder only at lg because a frame reading "app.stampeo.app" can't be mistaken for the customer's phone; the phone alone below lg could be. At 1440×900 with the hero padding cut, the frame starts ~826px: bar + 30–40px of screenshot above the fold. Phone ~240px at lg, 280px at xl, bottom-right over the second pair of cards, hanging below the frame, never over the KPI row or the top half of the first pair (also the corner the cookie banner doesn't cover). Frame: `card-stamp`, `rounded-2xl overflow-hidden`, chrome from `DashboardPreview.tsx:63-75` with neutral `--border` dots instead of red/yellow/green, URL pill "app.stampeo.app". Nothing tinted to match the screenshot, nothing orange drawn over it. AC10 per page: /us has an extra trial line (+~32px, may show only the bar); es/pl titles may wrap to 3 lines at 1440. Measure all four locales + /us; report a miss rather than shrinking the hero further.

**Capture spec (dash_shot extension).** Desktop 1280×800 @2x (2560×1600) — shown ~1,040 wide the text is ~12% larger than a 1440 capture, and the cards are still side by side at 1280 (breakpoint 1080). Phone 402×874 @3x (1206×2622), top of page. Both at the default 30-day period. Nothing in frame that isn't the product: no trial/over-limit/suspended banner, no "What's new" modal, no achievement toast, no Next dev badge; the locked Pro cohorts preview stays out of frame. The crown on 1y is accurate and stays.

### Loading
- next/image for both, real width/height (from `lib/landing-shots.ts`), `sizes`: phone `260px`; desktop ~`(min-width:1024px) 1040px, (min-width:768px) 650px, 100vw`.
- No `priority`, preload or `fetchPriority="high"`: lazy by default (Chrome starts lazy images within ~1,250px of the viewport; a hidden lazy image is never fetched, so phones skip the desktop file).
- Don't wrap the browser frame in `ScrollReveal` (it fires at 10% visible, ignoring the bottom 50px; a ~750px figure with ~70px showing is ~3%, so the peek would be an empty gap — `HeroCardFan.tsx` skips it for the same reason). ScrollReveal on the phone wrapper, copy and points only.
- Flat neutral background behind both images.
- No layout shift: fixed browser-bar height, intrinsic image sizes, fixed phone aspect.
- Lighthouse on `next start` at 390×844, 1440×900, 1920×1080: LCP stays in the hero, no CLS from this section. If at 1920×1080 the screenshot becomes LCP, use `<picture>` with a ≥768 source via `getImageProps` so desktop can load it eagerly without phones fetching it — only if measured.

## Components to reuse
- `components/ui/Container.tsx`, `components/ui/ScrollReveal.tsx` (not on the frame), `components/ui/InkAnnotation.tsx`.
- `components/features/notifications-push/PhoneMockup.tsx` → moved to `components/ui/PhoneMockup.tsx` (pure move; update imports in `NotificationSequenceDemo.tsx`, `NotificationPhoneDemo.tsx`, `GeofencingHeroAnimation.tsx`). Leave `scanner-mobile/PhoneMockup.tsx` alone. POLISH: its 48px `#f2f2f7` band under the status bar may read as a stripe; if so, add an optional screen-background prop, default unchanged.
- `DashboardPreview.tsx:63-75` chrome → a private function in `VariantDashboardShot.tsx`, neutral dots.
- `PricingPageContent.tsx:83-88` pill classes; `FeatureGrid.tsx` (optional badge); `components/icons` `CheckIcon`; `.card-stamp` (`app/globals.css:596`); `plan-facts.test.ts:139-145` guard pattern; promo-videos `dash_shot.cjs`.

## New components required
None. `VariantDashboardShot.tsx` is a page section; the browser chrome stays private until a second user; `PhoneMockup` is a move.

## Open questions for the user
1. Hero bottom padding at lg 96 → ~24px (or a negative top margin on the new section).
2. The seven `landing.dashboard` keys /features/analytics reads: keep or move.
3. Ship order with STA-434 (the "Soon" tile links to a page that still says live).
4. Benefits card 2 duplicates the argument in per-customer terms → the open Benefits/Differentiator merge discussion.
5. /features/analytics keeps the same fake mock → follow-up ticket to reuse these captures there.
6. Geofencing plan mismatch (pricing-features Growth+Pro vs PLAN_FACTS Pro) → STA-434.
7. stampeo-ux-ui `references/showcase.md` lists `DashboardPreview` → update when deleted.
