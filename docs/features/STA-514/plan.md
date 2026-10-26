# Plan: Landing refresh — real Analytics screenshot under the hero, fresh numbers, honest location copy

ISSUE: STA-514 (https://linear.app/stampeo/issue/STA-514)
BRANCH: showcase `feat/sta-514-landing-refresh` (worktree `.claude/worktrees/sta-514`, off origin/dev 8beea36) · promo-videos `main` (capture tool only)
REPOS: showcase, promo-videos
MIGRATION: no
STATUS: APPROVED (2026-10-26, by Harry)

## Problem

The landing's only picture of the business side is a hand-built mock (`components/sections/DashboardPreview.tsx`): invented figures ("1,234"), US number format on the French page, three stat tiles whose labels crush at 390px, and an ink note, "Sophie's coming back tomorrow", that predicts one customer's return, which is exactly the per-customer prediction STA-482 removed from Analytics for consent reasons. It sits about four screens down on a phone (3,381px). The Analytics page is live in prod since 2026-10-23, so we can show the real thing.

Alongside it: the numbers strip is two months stale (12,500+ stamps vs 20,452 today), two location-notification claims are still live on the landing although pass locations are off (`WALLET_LOCATIONS_ENABLED = False`, backend `app/services/pass_generator.py`; tracked as STA-434), and the hero still shows the Halloween card set, which only changes on a deploy.

## Decisions

- **The screenshot goes right under the hero, as the second section** (Harry, 2026-10-26): the hero's card fan shows the customer's half of the product, the next section shows the business's half. Not inside the hero: the fan is the product's differentiator and stays.
- **The old mid-page slot goes**: the dashboard appears once on the page. The `landing.dashboard.*` copy is rewritten for the new section (caption + up to three points), not kept beside it.
- **Real pixels from a dev fixture, never prod data**: Aurevo (café, Growth). Growth shows charts but not Pro's cohorts or per-location stats, so the picture never promises more than the plan most people buy. Aurevo is already a brand on the landing (sector carousel, hero fan).
- **One image set per locale** (fr, en, es, pl), desktop + phone: the French page shows the French dashboard.
- **Captured by extending promo-videos `tools/screens/dash_shot.cjs`** (it already logs in as a fixture, forces the profile locale and shoots the dev dashboard), not by adding Playwright to the showcase. Re-shooting is one command, documented in promo-videos `PLAYBOOK.md`.
- **Numbers strip, from prod on 2026-10-26 (read-only)**: stamps issued 20,663 − 211 voided = 20,452 → **20,000+**; countries with an active/trial/past_due business 29 → **25+** (round down; this figure fell 24 → 22 once); active businesses 121 → **120+** unchanged. No fourth figure. The strip keeps counting stamps, not scan events (commit ae59586: one scan can add several stamps).
- **Barbershop card line takes STA-399's wording verbatim** in all four locales ("Card added in one scan, no app to download" + its fr/es/pl), so whichever branch merges second sees an identical hunk instead of a conflict.
- **Hero fan back to `default`**: one commit of its own (`HERO_FAN_SEASON` in `lib/hero-fan.ts`). If the release goes out before 1 Nov, that commit is held back and shipped on its own.
- **`data-landing-section="dashboard_preview"` keeps its name** at the new position so PostHog section-view history stays one series; the move date (release day) is recorded in docs-decision.md for anyone reading the funnel.

## UX decisions

Folded in from `ux-brief.md` (ux-designer, MODE: DESIGN, 2026-10-26, VERDICT: READY).

- PLACEMENT: new `components/landing-variant/VariantDashboardShot.tsx`, mounted right after the hero in `VariantLanding.tsx`; wrapper keeps `data-landing-section="dashboard_preview"`. `DashboardPreview.tsx` deleted. Page order: hero → dashboard → trust strip (not on /us) → benefits → … Same paper background as the hero (no colour band). Hero bottom padding at lg 96 → ~24px (`VariantHero.tsx:60`) so the frame peeks above the fold; below lg unchanged.
- ENTRY: scrolling only, second section on `/`, `/en`, `/es`, `/pl`, `/uk`, `/us`. No link or CTA inside the section.
- ADDED: a plan line saying the screens show the Growth plan - prevents a mistake (Starter gets highlights, not charts). AC12.
- ADDED: one ink note at ≥768, pointing at the phone frame: same dashboard on the phone as on the computer - answers a question the screen provokes (is the phone a separate app?). AC13.
- ADDED: trust strip moved to right after the section - answers "where does this customer data live?". AC14.
- ADDED: "Soon" pill on the Geolocation tile (icon row, top-right, pricing-table pill classes, label from an optional `badge` key), description rewritten neutral/future, link kept, tile not dimmed - prevents a mistake (signing up for a feature that is off). AC8, AC15.
- ADDED: the image-map test also checks each PNG's real pixel size against the declared width/height - prevents a mistake (a re-shoot at another size stretches or shifts layout, invisible in review). AC16.
- REJECTED: eyebrow; CTA or "See analytics" link in the section; ink arrow at a chart inside the screenshot; ink note at 390; the desktop shot at 390; lightbox, carousel, animated numbers, hover tilt; coloured band; swapping/dropping/dimming the Geolocation tile; a shared BrowserFrame component now; keeping the "most loyal customers" and "export" bullets.
- MOBILE: heading → caption → the phone capture in `PhoneMockup` (280px, centered) → plan line → three points (left-aligned check list in a centered `max-w-sm`). Browser frame and desktop image hidden and never fetched below 768. ~1,090px, nothing tappable. 768: heading first, browser frame ~650px with the phone overlapping bottom-right and the ink note under the frame. ≥1024: picture first (CSS order only; DOM stays heading → picture → points), then heading + caption left, points right; phone over the lower-right cards, never over the KPI row.
- REUSES: `Container`, `ScrollReveal` (not on the browser frame: it would stay invisible at a 3% peek), `InkNote`/`InkArrow`, `PhoneMockup` (moved from `components/features/notifications-push/` to `components/ui/`, pure move, 3 imports updated), browser chrome lifted from `DashboardPreview.tsx:63-75` into a private function with neutral dots, the pricing "Soon" pill classes, `.card-stamp`, `CheckIcon`. NEW: none (the section is a page section).
- COPY SLOTS (written later with the stampeo-copywriting skill): heading ≤ ~6 words that switches from the customer's card to the owner's view; caption ≤ ~30 words (fills itself from every scan, same dashboard on phone and computer); three points naming sections visible in the captures, in totals. Banned in every slot: names or anything about one customer, any prediction ("will come back"), money, Pro-only things (cohorts, per-location, 1-year history, location filter), export.
- CAPTURE SPEC: desktop 1280×800 @2x, phone 402×874 @3x (top of page), both on the **90-day** period (changed at implementation from 30 days: the Aurevo fixture was seeded ~20 Oct, so the 30-day view had an empty last week and led with a red ▼25% on Visits; the 90-day view leads with ▲39% and matches the "90 days of history" point, but still shows ▼37% new customers and ▼5 pts return rate; a fixture reseed + re-shoot would allow 30 days again), nothing in frame but the product (no trial banner, "What's new" modal, toast, dev badge; the locked Pro cohorts preview out of frame).
- LOADING: next/image, real width/height, `sizes` per rendered width, lazy (no `priority`): hidden lazy images are never fetched, so phones skip the desktop file. Lighthouse on `next start` at 390×844, 1440×900, 1920×1080: LCP stays in the hero, no CLS from this section; a `<picture>` with an eager ≥768 source only if 1920 measures the screenshot as LCP.

### Calls on the brief's open questions (defaults, strike any)
- Hero padding cut at lg: yes (padding only, the card fan is untouched).
- The seven `landing.dashboard` keys that `/features/analytics` (`components/features/analytics/DashboardSection.tsx`) reads stay exactly where they are. The new section's copy lives in `variant.dashboard.*` beside the other landing-variant sections; only the five landing-only keys (`badge`, `title`, `subtitle`, `features`, `annotation`) are deleted. AC17 pins it.
- STA-434 ships separately; until it lands the "Soon" tile links to a page that still describes the feature as live. Recommend doing STA-434 next.
- Benefits card 2 joins the open Benefits/Differentiator merge discussion.
- Follow-up ticket (filed on approval): reuse these captures on `/features/analytics`, move its keys out of `landing.dashboard`, and promote the browser chrome to `components/ui` then.
- Geofencing plan mismatch (pricing table Growth+Pro vs PLAN_FACTS Pro): belongs to STA-434 (not yet noted there); the pill names no plan.
- `stampeo-ux-ui` `references/showcase.md` lists `DashboardPreview`: updated in this change.

## Non-goals

- Merging "Three reasons to go digital" with "Why businesses choose Stampeo", and shortening the landing pricing block (both open with Harry).
- The STA-376 promo video. If it ships later it moves next to "how it works"; this issue does not touch its branch.
- The `/features/geolocation` page and the French blog posts that make the same location claim (STA-434's remaining scope).
- `/features/analytics` visuals.
- Any dynamic or auto-fetched figure (house rule: social-proof numbers stay hand-maintained).
- Re-taking the images automatically in CI.

## Edge cases considered

- **A locale missing an image** → the build must not ship a broken `<img>`: a test pins that every locale has both files.
- **Spanish/Polish hero titles wrapping to three lines at 1440** push the frame below the fold: measured per locale (AC10), reported if missed.
- **The phone frame's grey band under the status bar** may read as a stripe over the screenshot: checked in POLISH; if so, an optional screen-background prop, default unchanged.
- **/us and /uk** render the English set (same locale, different market). Correct: the dashboard is not market-specific.
- **Currency in the screenshot**: Aurevo is a euro business; the English set shown on /us would show €. Considered: the Analytics charts in the Growth view are visits, hours, frequency and rewards — check at capture time that no money figure is in frame; if one is, crop it out rather than add a dollar fixture.
- **Dark mode**: the showcase has no dark landing; the screenshot is light only. Deliberately unhandled.
- **Fixture data drifts** (reseeds change the numbers) → harmless; the image is a snapshot, re-shot by command.
- **Layout shift**: images carry intrinsic width/height so the section does not jump when they load (the hero is LCP; the screenshot must not become it on desktop — it loads eagerly only if it is above the fold, otherwise lazily).
- **Reduced motion**: any entrance animation follows the existing ScrollReveal guards.
- **Polish plural**: 25 takes "krajów" (many form), not "kraje".

## Acceptance criteria

- AC1: Given any of fr/en/es/pl, when the landing renders, then the section directly after the hero is the dashboard section, and the page contains exactly one dashboard section (no second one further down).
- AC2: Given locale L, when the dashboard section renders, then its images are L's desktop and phone captures from `public/`, each with explicit width/height and a localized alt text, and NOT another locale's files.
- AC3: Given the repo, then for every locale both capture files exist at the paths the section references (test fails if one is missing or renamed).
- AC4: Given the new section's copy in all four locales, then it names only things visible in the Growth Analytics page (visits, busiest hours, how often customers come, reward progress) and makes no per-customer prediction; the "Sophie" annotation and the mock's figures are gone.
- AC5: Given the numbers strip, then en/fr/es/pl show 120+, 20,000+ and 25+ in each locale's own number format, and all four locales carry the same three numbers (test normalizes digits and compares).
- AC6: Given `messages/*/landing.json`, then no string claims a location-triggered notification ("walks past", "walk by", "passe devant", "pasa por delante", "przechodzi obok" and the like): extended claims guard in `lib/i18n-catalogs.test.ts`, with the shipped phrasings as positive cases and a neutral sentence as a negative case.
- AC7: Given the barbershop sector card, then its advantage line is STA-399's wording in each locale.
- AC8: Given the Geolocation tile in the feature grid, then its description presents location notifications as coming, not available, in all four locales (covered by the AC6 guard), and the tile still links to its feature page.
- AC9: Given the deployed build after 31 Oct, then the hero fan shows the year-round set.
- AC10: Given a 390px viewport, then the dashboard section has no horizontal overflow; given 1440×900 on `/`, `/en`, `/es`, `/pl`, then the browser bar and the top of the screenshot are visible without scrolling (on `/us`, whose hero has an extra trial line, at least the browser bar); a miss is reported, not fixed by shrinking the hero further. LCP stays in the hero and the section adds no layout shift (Lighthouse on `next start`).
- AC11: Given the promo-videos capture tool, when run with `--locale <l> --size desktop|phone` (or equivalent), then it writes the file the showcase expects for that locale and size, logging in as the fixture with no prod access.
- AC12: Given the dashboard section in any locale, then a visible line says the screens show the Growth plan, and it names every plan where Analytics charts are on (Growth, Pro) and NOT Starter (guard modelled on `lib/plans/plan-facts.test.ts:139-145`).
- AC13: Given a viewport ≥768px, then exactly one ink note sits in the section and points at the phone frame; given 390px, then the section has no ink note.
- AC14: Given `/`, `/en`, `/es`, `/pl`, `/uk`, then the order is hero → dashboard → trust strip → benefits; given `/us`, then hero → dashboard → benefits (no trust strip).
- AC15: Given the feature grid at 390px and at 1440px, then the Geolocation tile shows a "Soon" pill whose label is the locale's `pricingPage.comparison.soon` wording, and no other tile shows one.
- AC16: Given each capture file, then its real pixel width/height (read from the PNG header) equals what `lib/landing-shots.ts` declares.
- AC17: Given the keys `components/features/analytics/DashboardSection.tsx` reads from `landing.dashboard`, then each still exists in all four locales (so /features/analytics renders no raw key paths).
- AC18: Given a phone viewport (<768px), then the desktop capture is not downloaded (lazy and hidden), checked in the network panel at Phase 3.

## File layout

- New `components/landing-variant/VariantDashboardShot.tsx`: the section (with a private browser-chrome function). `components/sections/DashboardPreview.tsx` is deleted (its only consumer is `VariantLanding`).
- `components/features/notifications-push/PhoneMockup.tsx` moves to `components/ui/PhoneMockup.tsx` (pure move; imports in `NotificationSequenceDemo.tsx`, `NotificationPhoneDemo.tsx`, `GeofencingHeroAnimation.tsx`).
- `components/sections/FeatureGrid.tsx`: optional `badge` in the icon row.
- `components/landing-variant/VariantHero.tsx`: lg bottom padding only.
- Images: `public/images/landing/dashboard/{locale}-{desktop|phone}.png` (desktop 2560×1600, phone 1206×2622; next/image serves WebP).
- A small pure helper `lib/landing-shots.ts` maps locale → image paths and dimensions, so AC2/AC3 are testable with `bun test` (showcase has no component harness: `lib/*.test.ts` only). Test: `lib/landing-shots.test.ts`.
- Metrics parity test: `lib/landing-metrics.test.ts`.
- Location-claim guard: inside `lib/i18n-catalogs.test.ts` beside the trial-length guard (file is long; if it passes ~800 lines, the claim guards move to `lib/product-claims.test.ts`).
- promo-videos: extend `tools/screens/dash_shot.cjs` (locale + desktop size + output naming); PLAYBOOK row updated.
- Copy: `messages/{en,fr,es,pl}/landing.json` → new `variant.dashboard.*`; five landing-only keys deleted from `landing.dashboard` (the seven /features/analytics reads stay); `variant.metrics.items`; `landing.featureGrid.features[2]` (+ `badge`); the barbershop `advantage`.

## Touched areas and risks

- `lib/i18n-catalogs.test.ts` parity: every new key in all four locales.
- STA-399 (unmerged, 39 commits) edits the same barbershop line (identical wording chosen) and also rewrites the landing FAQ answer back to a pre-STA-482 version — a regression for STA-399 to fix, not this branch; flagged to Harry.
- LCP and CLS on the landing: the new section sits near the fold. Measure with `next start`, not dev.
- PostHog `landing_section_viewed`: `dashboard_preview` keeps its id at a new position, and `trust_strip` moves down one; both dated in docs-decision.md.
- Copy goes through the stampeo-copywriting skill (FR vocab locks, PL plurals).

## Docs impact (preliminary)

Probably none for the help center: marketing page only, no product behaviour, setting or pricing change. Confirm at Phase 7.
