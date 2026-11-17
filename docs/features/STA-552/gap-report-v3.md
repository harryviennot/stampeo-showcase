# Gap Report: STA-552 (v3)
LANE: standard (not given by the caller, so assumed)  AUDITED: 2026-11-16  DIFF: v3 round, 8aa6115..final tree (`v3-final.diff`; docs, snapshots and public assets excluded)
VERDICT: BLOCKERS

All paths are relative to `/Users/harryviennot/LocalDocuments/fidelity/showcase/.claude/worktrees/sta-552`.

## Criteria without tests
- [NOTE] Global rule 2, "Claims stay true": the old guard tied claims to `PLAN_FACTS`. After it was removed, only levels is still tied (copy.test, plan-claims, card-design.test). Two campaigns claims have no tie:
  - `promotional-campaigns.ts:125`, "Campaigns come with your Stampeo subscription". It says every plan has campaigns, but nothing ties it to `PLAN_FACTS.*.broadcastsPerMonth`.
  - The "New customers" idea, "joined in the last month". Nothing ties it to the pricing `segmentation` row. The test "so none depends on a plan" only compares copy strings.
  - Both are true today: Starter gets 8 a month, and every plan has date-based segmentation. A pricing change would make them false with no failing test. The first is also true on prod only once STA-549 is live in the backend.
  - Closest existing: plan-claims.test "the number of levels is PLAN_FACTS'".
- [NOTE] AC3 "every claim is live" for levels: tests tie levels only to `PLAN_FACTS.levels`.
  - STA-525 notes say prod levels sit behind a per-business `levels_enabled` flag. On 11 Nov it was on for two businesses, with no admin switch.
  - v3 adds more levels claims: the card design Levels card, the analytics Levels chart, and the push "New level" step.
  - If the flag is still per-business when the previews replace the live pages, these claims are false for a new sign-up. Verify the rollout before publishing.
- [NOTE] Plan Verification asks for "every new claim traced in claims.md; the study's numbers saved with their SQL". This is not done:
  - The v3 claims are traced in `copy-v3.md` ("Claims and their sources"), not in `claims.md`. `claims.md` still describes removed v2 copy (status table, Pro chip, recap, team).
  - `claims-doc.test.ts` reads only `claims.md`, and only 3 geolocation rows. So copy-v3's [CHECK] rows sit outside its FLAGGED guard: a laptop as a web-scanner device, the segment definitions from web `customers.json`, join-date targeting, and edited cards updating in wallets.
  - `retention-study-2026-11-16.md` holds no SQL. It also has no Q-add-rate result, which the plan asks for.
- [NOTE] AC6 (today's feature pages unchanged): the SSR byte compare in `v3-stage-f-report.md:95` was run before the builders edited three live components: `BlindSpotCards`, `GeofencingHeroAnimation` and `NotificationPhoneDemo`.
  - `BlindSpotCards`: its only pin is a snapshot created in this diff (`blind-spot-cards.test.tsx:12`), which records the edited output.
  - `GeofencingHeroAnimation`: its byte snapshot and caller check were deleted from `geolocation.test.tsx`, and nothing replaced them.
  - By reading, both changes look render-preserving. The plan's SSR compare of `/en/features/*` needs a re-run on the final tree.

## Untested diff behavior
- [BLOCK] `components/landing-pages/feature-previews/card-design/ReskinCards.tsx:95-99,138`: the caption is inside an `aria-live="polite"` region, and autoplay changes it every 4.8 s while the card is in view. A screen reader therefore announces "Bakery", "Wine bar", "Lash studio"… until the visitor clicks. No test. Risk: a screen-reader visitor on the card design preview is interrupted every few seconds while reading the hero.
- [NOTE] `components/landing-variant/HeroCardFan.tsx:24`: the homepage's live fan gets a new `slots` prop. No test checks that live callers pass none; the "other callers pass none of the new props" table in `shared-sections.test.ts` has no HeroCardFan row. Risk is low, because the default is `FAN_SLOTS`.
- [NOTE] `analytics/BlindSpotsSection.tsx`: the borrowed production cards flip on hover or on a click on a plain `div`.
  - Keyboard users can't flip them.
  - The "???" back face is in the DOM, so assistive tech reads it.
  - The flip still animates under reduced motion (AC5).
  - This matches production, as the plan asks, and no test covers it. Track it as a follow-up for both pages.
- [NOTE] Some visitor-facing words live in components, not in the copy modules, so the copy-module guards never read them. Only the rendered-page checks (plan words, em dash, token, city) apply to them:
  - `promotional-campaigns/page.tsx:35` "See how it works"
  - in `HabitCharts`/`GroupCharts`/`NumberCharts`: "Not back for 30+ days", "Moves up per month", "average ticket", the legends

## Drift (in diff, not in plan)
- [BLOCK] `mobile-scanner/WaysSection.tsx:37-39` and the new `AppStoreLinks.tsx`: App Store and Google Play badges were added to the scanner preview.
  - Plan v3 doesn't mention them.
  - `ux-brief.md:623-624` records that STA-546 rejected them: "a business can't be created in the app".
  - `mobile-scanner.test.tsx:163-185` turns the v2 test that pinned that decision into one that requires the badges.
  - Risk: a shop owner taps the badge, installs the Scanner and finds no way to create a business there.
  - Either Harry accepts the badges again and plan.md says so, or the badges come out.
- [NOTE] `promotional-campaigns.ts` ideas: "Gone quiet" and "Almost there" (Pro targeting) were replaced by "Tonight only" and "New customers". The plan says "Ideas kept". This follows from rule 2; record it in plan.md.
- [NOTE] Features were removed outright rather than shown without their chip:
  - `copy/features.ts`: the tiles "Limits and expiry" and "Several locations"
  - `program-types.ts`: "Bonus points on bigger baskets"
  - `platform.ts`: "Unlimited team members"
  - Rule 2 removes plan labels, not features. Platform now differs from 927bf77 in one more place than the four the plan allows.
- [NOTE] Geolocation hero: "coming soon" is in the H1, plus a chip or a handwritten note. The plan's geolocation bullet puts it in the sub, while the global rule 3 example puts it in the H1. The two plan lines conflict; pick one.
- [NOTE] The plan says "the figures move to Platform's stats". Only the 95% retention figure moved. The 88% add rate was dropped, and the study wasn't re-run for it.

## Suspect tests
- [NOTE] `blind-spot-cards.test.tsx:12`: the snapshot was created in this diff, so it pins the edited component. It cannot show that the live analytics page is unchanged.
- [NOTE] `promotional-campaigns.test.tsx:119` "the claims are Harry's": it compares the copy module to literal strings. It fails only on a copy edit and checks no claim against a source (it pins exact copy).
- [NOTE] `card-design.test.tsx:92`: the regex was loosened to `/<LpCtaPair\s+location="hero"|<PreviewHero/`, which passes for any use of PreviewHero. The check that the hero's trial is tracked now rests on kit.test's PreviewHero source check.
- [NOTE] `copy.test.ts:183` "Platform's measured figure": the source pattern `^Stampeo data: .*businesses.*2026$` accepts any count. The figures 95%, 2,786 and 73 are not tied to `retention-study-2026-11-16.md`.
- [NOTE] `analytics.test.tsx:270` says "no real name" but checks only `@|\.com`.
- [NOTE] These tests pin internal detail (class names, or regexes over source):
  - `look.test.tsx`: surface and label class lists
  - `kit.test.tsx`: PreviewHero grid classes
  - `mobile-menu-render.test.tsx`: tile px, padding and icon caps
  - `platform-hero.test.tsx:111,119,135`: source regexes for overflow, animation and useState
  - `card-design.test.tsx`: `existsSync` checks that files were deleted
  - analytics "one colour family": hex allowlist
  - campaigns, push and texting: `rounded-[28px] bg-white` counts
  - campaigns hero: `#4b2e2b` and `h-10`

## Unrealistic or missing workflow tests
- [NOTE] Missing: a keyboard-only visitor flipping the analytics blind-spot cards. The cards can't take focus; this matches production.
- [NOTE] Missing: the wiring inside `ReskinCards`. The click/swipe/clock rules are tested as pure functions (`reskin.test.ts`). Two things are not:
  - a click mid-timer cancels the pending tick;
  - a swipe that starts on the card and ends off it.

## Waivers
(filled by the main agent only if the user explicitly waives a BLOCK)