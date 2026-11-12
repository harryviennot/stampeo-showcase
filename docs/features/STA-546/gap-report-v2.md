# Gap Report: STA-546 (v2)
AUDITED: 2026-11-12  DIFF: origin/dev...HEAD (docs excluded)
VERDICT: GAPS FOUND + DRIFT FOUND

Saved by the coordinator from the auditor's final message (read-only tools).

## Criteria without tests
1. (HIGH) AC20/AC10: plan chips are typed by hand; nothing derives them from `lib/plans/plan-facts.ts` (`PLAN_FACTS` / `availability()`); "Up to 5 levels" not read from PLAN_FACTS. Fix: a table test mapping each chipped path to a PLAN_FACTS predicate; levels count from PLAN_FACTS.
2. (HIGH) AC19: the sector slides print fictional customer quotes in italic « » (SectorCarousel.tsx:81), e.g. « Julien comes in every three weeks… »; on a US page this reads as a testimonial. The AC19 test never looks at the slides.
3. (MED) AC15v2: no default-render snapshot for NotificationPhoneDemo, NotificationBanner, QRCodeSkeleton, CardStyleGallery, HeroCardStack, LiveActivityFeed(stillWhenReduced); Segmented default compared with itself; caller lists miss `phoneClassName`, `fullCard`, `stillWhenReduced`.
4. (LOW-MED) AC18: the hidden-class scan reads DashboardDuo only, not LpHero's wrapper.
5. (LOW) AC19 heading text not asserted.
6. (LOW) AC24: default banner wording not pinned to the backend's notification_defaults.py.
7. (LOW) AC5: no test that landing CTAButtons pass no `href`.

## Untested diff behaviour
1. (HIGH) Features analytics uses `phone-habits` ("How often they come", "Reward progress": Growth and Pro) while the line says "More charts come with Growth and Pro" — implies the shown chart is every plan.
2. (MED) Trial guards accept only `[\s-]` between number and "day"; `{trialDays}‑day` (U+2011) slips past.
3. (MED) How-to's simulated live feed has no "Sample data" caption; the caption guard only sees PhoneScreenshot/landingShot.
4. (MED) AC21 follow/open logic only string-pinned; extract pure functions and test truth tables.
5. (MED) The Levels tab (Features) and the Scanner tab (Platform) are never rendered open.
6. (MED-LOW) "You scan" (ScanDemo: Marc D., 5/10) vs "They see it" (Aurevo 5 of 8) disagree; HowTable pairs a 4/8 wallet with the 5/10 scanner.
7. (MED-LOW) The desktop lock screen render is satisfied by the mobile strip alone.
8. (MED-LOW, claim) Head-start visual 0/8 vs 2/8; the study's head-start card was 2 of 10 (both needed 8 more).
9. (LOW-MED) Platform's analytics glass-card CROP fractions depend on today's capture (STA-548 re-shoot will shift them).
10. (LOW) Reduced-motion still modes untested (browser-only hook).
11. (LOW) Sector slide "The scan takes a second" now shows on all four pages.

## Drift
- HeroCardStack `peekFrom` (v1 leftover, unused). Reduced-motion props + `hooks/usePrefersReducedMotion.ts` not in AC15v2's list. `SHARED.dashboardPlans` untested. `lib/levels/looks.ts` not in the file layout. Unused LpSpotlight/WalletPhone props.

## Suspect tests
- copy.test.ts "levels are shown as live" cannot fail; page-visuals "the card beside it" compares sample with banner only; outcomes-page.test.tsx:58 `toBeDefined()` on a string always passes; looks.test.ts pins its own literals; platform blog "newest first" asserts no order; the caption guard is per file, not per capture.

## Missing workflow tests
- Tap Levels on Features; tap Scanner app on Platform; reduced motion; non-US visitor on a US ad (covered by runbook LP-11 and the RegionText pins); desktop scroll through Platform rows.

## Waivers
(filled by the main agent only if the user explicitly waives a gap)

## Main agent's routing (13 Nov 2026)
- Fix stage H1 (structure, behaviour-neutral): the quality report v2, all items except `lp-float` staying in globals.css (site keyframes live there; Tailwind v4 has no clean per-component keyframes), and drift items (revert HeroCardStack, delete unused props).
- Fix stage H2 (claims and coverage): Untested 1-8 and 10; Criteria 1, 3-7; Suspect tests; missing workflow tests (Levels tab, Scanner tab, AC21 truth table).
- Harry's call (existing /us content in `landing-variant/`, which AC16 keeps unedited): Criteria 2 (fictional quotes in « » on the sector slides) and Untested 11 ("The scan takes a second").
- Untested 9: noted on STA-548 (re-shoot must re-check Platform's analytics crop).
