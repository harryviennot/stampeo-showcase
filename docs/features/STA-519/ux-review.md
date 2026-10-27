# UX Review: STA-519
MODE: POLISH   DOMAIN: showcase
VIEWED: code + screenshots (390x844, 768x1024, 1024x768, 1440x900; all four locales; reduced motion at 390 and 1440)
VERDICT: FIXED WITH FINDINGS

## Fixed
- `AnalyticsChartCards.tsx`: the wider pills ("Growth", "Todos los planes", "Wszystkie plany") sat on top of the card titles at 768 in all locales and at 1024 on two-line titles. One shared `ChartHeader`: the pill floats top-right and the title wraps beside or below it. Pill position and title start unchanged (390/1440 look the same); zero overlaps across 4 locales × 4 widths; file 671 → 639 lines.
- `LiveActivityFeed.tsx`: rows wrapping to two lines (FR/ES/PL at 390, EN at 360) kept a 24px line height and touched the next row. `text-sm leading-snug` on the container: two-line rows 37px, ~11px between rows.
- `BusiestTimesSection.tsx`: h2 → lead 24px → 16px (`mt-4`), like the page's other sections.

## Mobile findings
- Hero at 390, all locales: gaps 24/24/40/20 (h1 → subtitle → CTA → phone → plan line), 64px below; h1 3 lines FR/EN, 2 ES/PL; plan line 2 lines.
- Chart pills: no overlap at 390 (full-width cards); 768 fixed.
- Feed header fits in every locale and width; time labels correct per locale.
- Reduced motion: hero has no reveal; every body reveal renders at full opacity.

## Brief drift
- Plan cards not built: Harry kept the chart grid. Fine.
- Hero subtitle `text-lg lg:text-xl` (not `text-lead`): what every sibling hero uses. Fine.
- Plan line 2 lines at lg (`max-w-xs`, about the phone's width). Fine.
- h1 3 lines at 1024 in all locales: the brief limits 390 (≤3) and 1440 (≤2), both met.
- Hero vertical placement at lg matches the siblings (height set by content, 803px vs 765px for 85vh).
- Busiest capture crop reads as the page continuing into the fade. Fine.
- Thin grey line under the status bar: the dashboard header's border, in the capture. Harmless.

## Copy flagged
- `AnalyticsChartCards.tsx`: "vs semaine dernière" hard-coded French in every locale (pre-existing).
- FR `busiest.lead` ~40 words (budget ~30), 5 lines at 390.

## Left alone
- Chart animations (framer-motion count-ups/line draws) ignore reduced motion (no `MotionConfig reducedMotion="user"`). Pre-existing behaviour.
- Duplicate "72%" under the return-rate ring. Pre-existing.
- `columns-3` from md gives 224px cards at 768 (titles wrap); `md:columns-2 lg:columns-3` would reorder the masonry. Pre-existing.
- 8px column-edge difference between the busiest row and the feed at lg. Invisible.

## Verification
- type-check: pass   lint: pass (3 changed files)
- :3013 rebuilt with the edits; no other port touched.
