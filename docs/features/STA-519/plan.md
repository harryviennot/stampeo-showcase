# Plan: /features/analytics — a real hero, and no made-up charts

ISSUE: STA-519 (https://linear.app/stampeo/issue/STA-519)
BRANCH: showcase `feat/sta-519-analytics-feature-page` (worktree `.claude/worktrees/sta-519`), stacked on `feat/sta-514-landing-refresh` (c0ea7fd); promo-videos `feat/sta-514-landing-shots` (capture views)
REPOS: showcase, promo-videos
MIGRATION: no
STATUS: APPROVED (2026-10-26, by Harry, with the chart grid kept: see Decisions)

## Problem

Harry (2026-10-26): "we need a better hero for the analytics page". The feature page `/features/analytics` (`components/features/analytics/AnalyticsPageContent.tsx`, 4 locales) is the only feature page with a text-only hero, and its headline, "Know your regulars. Not just by sight.", promises per-customer knowledge; Analytics shows totals by design (STA-482 removed per-customer rhythm and prediction for consent reasons). Below it, two hand-built mocks predate the Analytics page: `DashboardSection` (the "Starter Plan" dashboard-home mock with invented customers) and `ProChartCards`, nine mock charts with "Pro" pills under an "Every plan" badge, several of which do not exist in the product ("Avg time to complete card", "Post-reward return", "Completion rate", "Customer segments … VIP", "At-risk customers"). That is a live false claim. The page's meta description also calls Analytics "real-time"; it refreshes every 10 minutes.

## Decisions

- **The hero gets the real product, in the sibling feature pages' split layout** (text left, phone right from lg; text first, then the phone, on a phone). It shows a **new capture of a different part of the Analytics page: "How often they come" + "Reward progress"**, not the landing's top-of-page shot: at 390 that would be the landing's exact picture, and it opens on red deltas. The habits view is the loyalty question, all totals, with no deltas, money, names or Pro features.
- **Honest headline**: customers as a group (whether they come back, how often, when). No individual, no prediction, no "real time".
- **The chart grid stays (Harry, at the gate)**: its nine illustrative cards keep their place; each card's pill names the plans that have it instead of "Pro". Analytics charts are on Growth and Pro, so the charts that exist (scans per week, peak hours, most active days, customer segments, at-risk customers) say **Growth**; the 30-day return rate, which Starter also shows as a number, says **Every plan**. The three charts that don't exist yet (average time to complete a card, completion rate, post-reward return) also say **Growth**: Harry's explicit choice over "Growth · Soon", made after being told a plain Growth pill reads as available today. `ProChartCards.tsx` is renamed `AnalyticsChartCards.tsx` (it is no longer about Pro); its i18n keys stay.
- **`DashboardSection` becomes a "When they come" row** with a real Busiest times capture.
- **LiveActivityFeed stays, matched to the product**: the dashboard's Activity page really is live; the mock's per-second ticker, "signed up" verb and green dot are not what it shows.
- **One shared `components/ui/PhoneScreenshot`** (PhoneMockup + full-bleed capture + bottom fade, colours tied to one token) for the hero, the busiest row and, if it renders pixel-identical, the landing's phone.
- **`BrowserFrame` stays where STA-514's review put it** (`components/ui/`, one user); this page has no desktop capture.
- **The same false claims outside the page's catalog are fixed too**: `metadata.json` (title "…Who Drifts", description "Real-time dashboard") and `lib/llms-txt.ts` ("top customers"). Copy only. (Default; strike at the gate.)

## UX decisions

Folded in from `ux-brief.md` (ux-designer, MODE: DESIGN, 2026-10-26, VERDICT: READY).

- PLACEMENT: all on `AnalyticsPageContent.tsx`, no new route. Order: Hero (paper) → BlindSpotCards (blog-bg, unchanged code) → "When they come" (paper, replaces `DashboardSection`) → LiveActivityFeed (blog-bg) → the chart grid (blog-bg-alt, kept, pills corrected) → FeatureCTA → RelatedFeatures.
- ENTRY: unchanged (header Product → Analytics, footer, landing FeatureGrid tile, "Discover more" cards, llms.txt, sitemap).
- ADDED: plan line under the hero phone ("a screen from Growth; charts come with Growth and Pro") - prevents a mistake (Starter gets highlights, not charts). AC4.
- CHANGED (Harry): the chart grid keeps its cards; pills from one map (`lib/features/analytics-chart-plans.ts`) on `PLAN_FACTS`. AC10.
- ADDED: "When they come" row with the real Busiest times - answers the problem section's "Which day is quietest". AC11.
- ADDED: LiveActivityFeed matched to the product ("Just now", accent dot, product verbs, title "Activity", never team-member names) - prevents a false claim. AC12.
- REJECTED: a three-card plan section replacing the chart grid (Harry kept the grid); desktop capture in a BrowserFrame; top-of-page phone as hero; KPI + Visits capture in the body; ink note in the hero; eyebrow/badge above the h1; wallet badges; Pro cohorts capture; Starter teaser capture; HowItWorks steps; a privacy block (legal, follow-up); reworking BlindSpotCards; "Compare plans" link, prices in cards; a real Activity capture; lightbox, carousel, animated numbers, hover tilt.
- MOBILE: 390×844, text first: left-aligned h1 (≤3 lines), subtitle (≤5), 52px CTA (bottom ~430–460px, above the cookie banner), then the 280px phone centred and the plan line. Busiest row stacks (text, then lazy phone); the chart grid is unchanged. 768 the same single column. ≥1024: the `GeofencingPage` hero shell (`min-h-[85vh]`, `grid lg:grid-cols-2`), hero phone + plan line in view at 1440×900 and 1024×768; busiest row text left / phone right.
- COPY SLOTS (stampeo-copywriting): h1 ~40 chars EN, one promise about customers as a group; subtitle ≤ ~30 words (what the screen shows, as totals; fills itself from every scan; no plan names); planLine; hero alt; busiest h2 ≤ ~6 words + lead ≤ ~30 words ending with the plan split (Starter: the busiest hour as one sentence; the grid on Growth and Pro) + alt. Banned everywhere: "who"/names/individuals, predictions, money, "real time"/"live" about Analytics, Pro-only things, "every/all charts", export, prices, trial length. Also rephrased: BlindSpotCards "Who stopped coming" (as a count), the activity feed strings, `cta.subtitle` (no longer repeats the plan list).
- CAPTURE SPEC: promo-videos `--view=top|habits|busiest`. habits and busiest: phone only, 402×874 @3x, Aurevo, 90 days, scrolled so the card pair's top sits 16px below the viewport top (`scrollIntoView`), nothing tapped.
- LOADING: hero image `fill`, `sizes="260px"`, `loading="eager"`, `fetchPriority="high"`; no ScrollReveal anywhere in the hero; busiest image lazy; fixed-aspect frame and muted placeholder (no shift).
- REUSES: Container, CTAButton, PhoneMockup (through PhoneScreenshot), ScrollReveal (body only), PLAN_FACTS / PLAN_NAMES, the captures map + test, the landing's copy rules, FeatureCTA, RelatedFeatures, BlindSpotCards, LiveActivityFeed, the capture tool. NEW: `components/ui/PhoneScreenshot.tsx` (three sites in two features, one colour invariant); `BusiestTimesSection` (page section).

## Non-goals

- The dashboard's own Analytics page (web/).
- Other feature pages; the landing beyond adopting `PhoneScreenshot` (pixel-identical or not at all).
- STA-434's geolocation page.
- A privacy block on this page ("totals, no profile, no prediction"): needs legal wording; follow-up.
- Making BlindSpotCards keyboard-accessible (their div `onClick`): separate fix.
- A Starter or Pro screenshot.

## Edge cases considered

- Each locale shows its own captures (same rule as STA-514); /us and /uk use the English ones.
- The busiest capture is found by its localized card title (it has no id): the tool reads the title from `web/messages/<locale>/analytics.json` and fails loudly if it can't find it.
- Starter visitors: the plan line and the Starter card say what Starter gets; no chart is shown as Starter's.
- The h1 also titles the "Discover more" cards on sibling pages (252px): if it runs past two lines there, a shorter `hero.navTitle` is added.
- "Live" stays only on the Activity feed, which is live; never about Analytics.
- Reduced motion: body reveals show at once (existing CSS guard); the hero has none.

## Acceptance criteria

- AC1: Given any locale, when /features/analytics renders, then the hero shows that locale's `phone-habits` capture in a phone frame, and the "Starter Plan" dashboard mock (browser chrome, invented customer rows) is gone.
- AC2: Given 390×844 in all four locales, then the h1 precedes the phone in DOM and screen order, the CTA's bottom is ≤ 600px, the phone frame's top is within 844px, and the page does not scroll sideways.
- AC3: Given 1440×900 and 1024×768 in all four locales, then the h1, CTA, the whole phone frame and the plan line are in the first viewport, text left and phone right.
- AC4: Given the hero's plan line in all four locales, then it names Growth first and names Growth and Pro, NOT Starter.
- AC5: Given the hero image, then it is the page's only `fetchpriority="high"` image, `loading="eager"`, with no ScrollReveal ancestor; at 390 it is requested once at ≤ 828w; the busiest image is `loading="lazy"` (Chrome still fetches it on load at 390, because it sits within the browser's own lazy-load distance; measured 2026-10-26).
- AC6: Given Lighthouse mobile on `next start` for /en/features/analytics and /features/analytiques, then LCP ≤ 2.5s with the hero image or the h1 as the LCP element, and CLS ≤ 0.1 with no shift from the hero.
- AC7: Given the captures map, then for every locale × {desktop top, phone top, phone habits, phone busiest} the file exists at `/images/landing/dashboard/<locale>-<view>.png`-style paths, has its declared pixel size, and belongs to that locale.
- AC8: Given `features.analytiques.{hero,busiest}` and their alt texts in four locales, then no string makes a per-customer claim, a prediction, a money claim, an export claim, names a Pro-only thing, or calls Analytics real-time/live.
- AC9: Given `metadata.json` `features.analytiques` and `llms.txt`, then neither claims "real-time" Analytics, "who drifts", or "top customers".
- AC10: Given the chart grid in any locale, then no card says "Pro"; the 30-day return rate card says the locale's "Every plan" (`proAnalytics.badge`); every other card names the lowest plan with Analytics charts (`PLAN_FACTS`, Growth), including the three cards for charts that don't exist yet (Harry's call); and the pills come from one map, so a plan change moves them together.
- AC11: Given the "When they come" row, then it shows that locale's `phone-busiest` capture and its lead says Starter gets the busiest hour as a sentence and the grid comes with Growth and Pro; stacked below lg, two columns from lg.
- AC12: Given LiveActivityFeed, then no label counts seconds ("{n}s ago"), the verbs are the product's, no team-member name appears, and the live dot uses `--accent`.
- AC13: Given the repo, then `DashboardSection.tsx`, `features.analytiques.custom.dashboard` and `features.analytiques.sections` are gone in four locales (the chart grid's `proAnalytics`/`proCharts` keys stay), catalog parity passes, and no raw `features.analytiques.` key path appears in any locale's rendered HTML.
- AC14: Given `PhoneScreenshot`, then the hero and the busiest row use it; if the landing adopts it, the landing's section renders pixel-identical at 390, 768 and 1440 (otherwise the landing is untouched).
- AC15: Given the capture tool, when run with `--view=habits` or `--view=busiest`, then it writes `<locale>-phone-<view>.png` scrolled to that card pair, and refuses `--view=habits|busiest` with `--sizes=desktop`.

## File layout

- `components/features/analytics/AnalyticsPageContent.tsx`: new hero inline + section order (stays well under 200 lines).
- New `components/features/analytics/BusiestTimesSection.tsx`.
- `components/features/analytics/ProChartCards.tsx` renamed `AnalyticsChartCards.tsx`; each chart takes its pill label instead of a hard-coded "Pro" (the file is already 657 lines: no growth beyond the prop). New `lib/features/analytics-chart-plans.ts` (+ test): chart key → plan.
- New `components/ui/PhoneScreenshot.tsx`.
- Deleted `components/features/analytics/DashboardSection.tsx`.
- `components/features/analytics/LiveActivityFeed.tsx`: time label and dot colour.
- `lib/landing/dashboard-shots.ts` (+ test): a view dimension; new files `public/images/landing/dashboard/<locale>-phone-{habits,busiest}.png`.
- Copy rules shared between the landing and this page move out of `lib/landing/dashboard-copy.test.ts` into `lib/testing/analytics-claims.ts`; new guard `lib/features/analytics-copy.test.ts` (or beside the existing features tests, wherever they live).
- `messages/{fr,en,es,pl}/features.json`, `metadata.json`; `lib/llms-txt.ts`.
- promo-videos: `--view` in `tools/screens/shot-spec.ts` + `landing-shots.ts` (+ test), PLAYBOOK row.

## Touched areas and risks

- Catalog parity and the Polish plural rules (history lines go through ICU).
- `lib/plans/plan-facts` guards on Analytics wording.
- Stacked on STA-514: rebase when it merges.
- LCP: the hero image is above the fold here (unlike the landing).

## Docs impact (preliminary)

Probably none (marketing page). Confirm at Phase 7.
