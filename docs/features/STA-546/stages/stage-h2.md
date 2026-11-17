# STA-546 Stage H2: claims and coverage fixes

**Where:** worktree `/Users/harryviennot/LocalDocuments/fidelity/showcase/.claude/worktrees/sta-546`, branch `feat/sta-546-landing-variants`. Stage H1 (the structural clean-up), the v2.1 Platform polish (P1a/b/c) and P2 (the Scanner loop video replacing `ScanDemo` on all four pages) are merged on it. Read `plan.md` "v2.1: Platform polish" first: Harry's calls there win. Work only there.

**Rules:**
- Never push or merge, and never touch Supabase.
- Commits carry no Co-Authored-By trailer.
- Write tests first: each new pin must fail against a deliberately broken copy, then pass.

**Read first:**
- `docs/features/STA-546/gap-report-v2.md`. Its "Main agent's routing" section says what H2 covers.
- H1's commits (`git log`).
- The plan's v2 sections and AC list.

## Fixes that change what a visitor sees

1. **Features analytics shows Growth and Pro charts.**
   - The `phone-habits` capture shows "How often they come" and "Reward progress", which are Growth and Pro, under a line saying "More charts come with Growth and Pro".
   - Switch Features' `spotlight_analytics` capture to the every-plan `view="phone"`. It shows visits, new customers, return rate and visits over time, so the lead and the plan line are true.
   - Change the alt text in the copy to exactly: `"The Stampeo Analytics page on a phone: visits, new customers and return rate."`. This is the one copy edit allowed.
   - Add a test that maps each `landingShot` view used on these pages to its plan:
     - `phone`: every-plan charts only;
     - `phone-habits` and `phone-busiest`: Growth and Pro;
     - `desktop`: mixed, so it is always printed with `SHARED.dashboardPlans`.
   - A Growth-and-Pro view may only appear in a section that prints the `SHARED.broadcastPlans` / "Growth and Pro" label next to it.
2. **The head-start toggle must match the study.**
   - The study's head-start card had 10 slots with 2 already stamped, against an empty 8-slot card, so both needed 8 more stamps.
   - Make the "2 stamps on the house" state Aurevo's card with `total_stamps: 10` and 2 stamps. The "Card starts empty" state stays 0 of 8.
   - Pin it: both states need the same number of stamps to finish.
3. **(Dropped)** "You scan" vs "They see it": P2 replaced `ScanDemo` with the Scanner loop video (Sophie 4 to 5 of 8) on every page. Check only that every Aurevo card shown beside the video or a stamp banner is at 5 of 8, and pin that.
4. **How-to's live feed gets a "Sample data" caption.**
   - Caption it in `SeeItWork`.
   - Extend the caption guard to `LiveActivityFeed`, and make it count per capture, not per file.

## Coverage, as tests

5. **Trial guards.** Accept U+2010 and U+2011 between the number and "day":
   - in `WORDED_TRIAL` (`lib/testing/copy-claims.ts`);
   - in the digit-day guard;
   - with "the guard flags it" cases. `i18n-catalogs.test.ts` must stay green.
6. **(Dropped)** AC21: P1c moved the rows to hover, with pure helpers already tested.
7. **Tabs that are never rendered open.**
   - Add an `initial` prop to `ProgramTypeTabs` and `PlatformToggleCard`, as `HeadStartToggle` has.
   - Run a `test.each` over the keys:
     - the Levels panel is visible, with `LevelCards` and its plan chip;
     - the Scanner pane is visible and the Dashboard pane is inert;
     - and the reverse for each.
8. **Desktop lock screen.** Render `NotificationPhoneDemo animate={false} notifications={[x]}` on its own and count the banners. The mobile strip must not satisfy this test.
9. **Reduced motion.** Make "still" a pure selector, for example `isStill(stillWhenReduced, prefersReduced)`, used by `LiveActivityFeed` (and `ScanDemo` if it still has the prop), and test it.
10. **Plan chips against `lib/plans/plan-facts.ts`.**
    - A table maps each chipped Fact/Tile/Moment/ProgramType path in the copy to a `PLAN_FACTS` predicate, and expects `availability(pred)` to equal the chip.
    - The "Up to 5 levels" figures in the copy must equal the `PLAN_FACTS` level count.
    - This test is what will flag STA-549, broadcasts on every plan, if it ships.
    - `PLATFORM.platform.dashboard.facts[2]` (broadcasts) carries no chip on purpose (Harry, 13 Nov). Exempt it, with that reason.
    - The Platform program rows carry no chips (v2.1). The table covers chips where they are printed.
11. **AC15v2 default snapshots.**
    - Take `toMatchSnapshot` renders of the default (no-new-prop) output of `NotificationPhoneDemo`, `NotificationBanner`, `QRCodeSkeleton`, `CardStyleGallery`, `LiveActivityFeed`, `ScanDemo`, `Segmented` (against `px-3 py-1.5 text-sm`) and `CardDesignPlayground` (full).
    - Before committing the snapshots, confirm each matches origin/dev with the `renderToStaticMarkup` comparison against `git show origin/dev:` files. Report the result.
12. **AC18.** Run the "no responsive hidden class" check over `LpHero`'s markup from the badges to `<DashboardDuo`.
13. **Small pins.**
    - **AC19:** the sectors heading reads "Stampeo adapts to your business" (catalog title, tags stripped).
    - **AC5:** no landing `CTAButton` passes `href`.
    - **AC24:** add a comment in `copy/shared.ts` above the three banners naming `backend/app/services/programs/notification_defaults.py` as their source (a comment, not a string change).
    - **`SHARED.dashboardPlans`:** printed by `DashboardDuo`.
14. **Suspect tests.**
    - "levels are shown as live" must check that every levels mention carries the "Every plan" chip.
    - The banner-vs-card test must read the `stamps=` props beside each banner.
    - `outcomes-page.test.tsx`: the `tagWith(...)` `toBeDefined()` on a string always passes; assert a non-empty, visible tag.
    - Blog "newest first": assert the dates descend.
    - `looks.test.ts`: rename it to what it checks. It cannot read the backend.

## Verify and report

- Run `bun test lib scripts`, `bun run type-check` and `bun run lint`. All must be green.
- Run `bunx next dev -p 3027` and shoot each changed section at 390 and 1440:
  - Features analytics;
  - Outcomes head start;
  - How-to's feed.
- Use headless Chromium from `/Users/harryviennot/LocalDocuments/fidelity/promo-videos/node_modules/playwright`, with timezoneId America/New_York. Wait for "load" + 2.5s.
- Save the shots under `docs/features/STA-546/shots/stage-h2/` (git-excluded), and LOOK at them.
- Stop dev, and restore AGENTS.md if `next dev` rewrote it.
- Then build once with the CI placeholder env from `.github/workflows/ci.yml`.

**Report:**
- per item, what you did, or why not;
- the diff stat;
- the test counts;
- the snapshot origin/dev comparison;
- the shots, and what you saw;
- the build result.
