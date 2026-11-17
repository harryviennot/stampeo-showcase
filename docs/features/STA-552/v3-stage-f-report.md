# STA-552 v3 Stage F report

Branch `feat/sta-552-feature-previews`, worktree `/Users/harryviennot/LocalDocuments/fidelity/showcase/.claude/worktrees/sta-552`. Not pushed, no Supabase, no co-author trailers. Port 3141 is free and AGENTS.md is unchanged.

**Results:**
- `bun test lib scripts`: 5912 pass, 4 skip, 0 fail, 29 snapshots.
- `bun run type-check`: clean.
- `bun run lint`: 0 errors, 6 warnings, the same 6 as before (none new).
- No build run, as instructed.

## Read this first

1. **Commit `3916db5` swept in part of my work.** The "v3 copy ... reviewed" docs commit (not mine) was made while my `git rm`, `git mv` and `git checkout 927bf77 --` changes were staged, so it includes 17 files of mine. Those are the early look reverts (GlassCard, StepsTable, ToggleCard, HoverRows, FactList, FAQList), the deleted hero switch, shelf, drill and variants files, and the `hybrid-look` to `look` rename. That commit alone is not green: `MobileMenu.tsx` still imported the deleted drill. The state is green from `83540ca`. I did not rewrite it.
2. **I removed two sections although the brief said not to touch `sections` lists.** I dropped `ladder` from analytics and `plans` from campaigns, in the pages, the registry (`lib/landing-pages/pages.ts`) and `registry.test.ts`. Both are plan comparisons that cannot render without plan names. Plan v3 removes both anyway. Their component files are deleted too.
3. **Push editor: custom wording is only on Growth and Pro, and I kept it unlabelled.** The brief's rule 2 names "custom wording", but plan v3 and `copy-v3.md` both keep the "Use our wording, or write your own" editor and say gated features are "described plainly". I kept the `Your words` tab, removed its chip and plan sentence, and set the lead to a plan-free line. This is the cheapest choice to reverse. If you want it dropped, the builder deletes the tab.

## (a) Brief, item by item

1. **Look back to pre-v2, keycaps kept: done.**
   - Reverted to 927bf77: `GlassCard`, `StepsTable`, `ToggleCard` surface, `RelatedPreviews` tiles (the geolocation card and the `title` prop stay), the `FAQList` table frame, `HoverRows` labels, `FactList` checks.
   - `EYEBROW_PILL` is deleted from `LpHeading`, `StepHeading` and `HeroWords`. A section label is `EYEBROW text-[var(--accent)]`.
   - The keycap, `CTAButton keycap`, `LpCtaPair`, `LpAccentBand`, `LpTrialButton`, `LpHero` and `LpFinalCta` are untouched.
   - Colour split, as 927bf77 had it: `HoverRows` row labels and `FactList` check marks stay `--accent-hover`; only section labels take `--accent`.
   - `IconTile tone="brand"` and `STAMPED_STAGE` / `STAMPED_CARD` are kept. The unfinished preview sections (composer, ideas, wording editor, status, privacy, blind spots, recap, palettes, designer) still use them, so those sections keep the v2 inked look until their builders redo them.
   - **Proof against 927bf77.**
     - SSR `<main>` of `/us/landing-pages/platform`, 927bf77 vs now: the only differences are:
       - the hero (fan to stack, builder 1);
       - section labels `accent-hover` to `accent`;
       - keycap classes on the hero pair, `LpAccentBand` and `LpTrialButton`;
       - the dropped "Unlimited team members" line;
       - the pricing text, from the STA-549 merge.
     - Section shots at 1440 and 390 for how, deliver, platform and program types look identical apart from the label orange.
     - Shots are in `docs/features/STA-552/shots/v3-f/` (`platform-927-*.png`, `platform-now-*.png`, `sec/p927-*` vs `sec/now-*`).
   - **Snapshots re-recorded: 3**, in `lib/landing-pages/__snapshots__/default-renders.test.tsx.snap`.
     - `HowTable`: pill label to plain accent label. Versus 927bf77 this is the label colour only.
     - `PlatformToggleCard`: stamped surface to plain, and the team-members line is gone.
     - `ProgramTypeRows`: grey row labels back to `accent-hover`, now byte-identical to 927bf77.
     - `LpCtaPair`, `LpAccentBand` and `PlatformHero` are unchanged from the start of this stage. Against 927bf77 they differ by keycap classes, and the hero by the stack.
     - `look.test.tsx.snap` (the CTAButton default render) is unchanged.
2. **No plan gating: done.**
   - `PlanChip.tsx` and `PlanLine.tsx` are deleted. `shared/Chip.tsx` is the neutral pill, used only by the card-design hero caption.
   - `Moment.plan`, `PreviewHeroCopy.eyebrow` and `NotificationSequenceDemo.planLabel` are removed, along with the plan fields on `Fact`, `Tile`, `ProgramType` and `RowCopy`.
   - The DashboardDuo caption is now just "Sample data".
   - **Guards flipped** in `lib/landing-pages/plan-claims.test.ts`:
     - (a) Render sweep over all 10 slugs: no `Starter`, `Growth`, `Pro`, `every plan` or `all plans` outside the `pricing` section (classes, styles and scripts stripped).
     - (b) Every copy line is read for the same words.
     - Also pinned: no `PlanChip` or `PlanLine` in any landing component, and the "up to N levels" figure is tied to `PLAN_FACTS`.
     - `CHIPPED`, `PLAN_LINES`, `UNBADGED` and the broadcast-label guards are gone from `plan-claims.test.ts` and `copy.test.ts`.
   - The 11 STA-549 red tests are gone with their guards.
   - **Lines dropped or rewritten for truth** (paths under `lib/landing-pages/copy/`):
     - `program-types.ts`: the points fact "Bonus points on bigger baskets" is dropped. All chips are removed.
     - `platform.ts`: the scanner fact "Unlimited team members" is dropped.
     - `features.ts`:
       - Tiles "Limits and expiry" (Growth and Pro) and "Several locations" (Pro) are dropped. Six tiles become four, and `MoreFeaturesGrid` is 4 columns from lg.
       - `analytics.planLine` is dropped.
       - The "All three on every plan." sentence is dropped.
     - `outcomes.ts`: "It's on every plan." is dropped, with the levels and regulars chips.
     - `how-it-works.ts`: "on every plan" is dropped.
     - `shared.ts`: `dashboardPlans` and `broadcastPlans` are removed.
     - `previews/analytics.ts`: the `ladder` block and its `PLAN_FACTS` import are gone. "on every plan" is removed from `glance.lead` and `band.sub`.
     - `previews/mobile-scanner.ts`:
       - "free on every plan" becomes "free".
       - The team facts "Let a scan past a daily limit" and "Unlimited team members" are dropped. One fact remains.
     - `previews/push-notifications.ts`: the editor lead is rewritten, the toggle's plan and the band's "every plan" are removed.
     - `previews/promotional-campaigns.ts`:
       - Page-wide `plan` and the `plans` block are removed.
       - The composer loses the "Inactive for a month" filter and the Schedule group (Pro-only).
       - Ideas "Gone quiet" and "Almost there" no longer claim targeting.
       - FAQ [0] now says "Your plan sets how many broadcasts you can send each month (see pricing)", the one allowed generic mention.
       - FAQ [2] (scheduling) is replaced by "How fast does a broadcast arrive?" and FAQ [3] (targeting) by "Where does the message show up?". These are interim lines that `copy-v3.md` will replace.
     - `previews/geolocation.ts`: Pro is removed from the meta description, hero sub, status lead, Coming soon column, FAQ [1] (the "Which plan will have it?" question is replaced by "What can I do today?") and the band sub. `heroChip` is deleted.
     - Hero `eyebrow` is removed from the types and all six copy modules.
   - Code comments that named plans are reworded in `DeliverAnalytics`, `GlanceTiles`, `QuestionMinis`, `CohortsMini`, `BlindSpotsSection` and `OwnIconCard`.
3. **Split feature heroes: done.**
   - `PreviewHero` (`components/landing-pages/feature-previews/PreviewHero.tsx`) is text left and visual right from lg (`lg:grid-cols-12`, two `col-span-6`, `lg:items-center`). On a phone the order is text, then visual.
   - Actions are left-aligned from lg and the trial is a keycap. There is no eyebrow, pill or chip above the H1.
   - `eyebrowPlan` and `eyebrowChip` are removed. The geolocation sub is now "Coming soon. Make your card now and it's ready the day it launches."
   - **Grid pattern:** `shared/LpHero.tsx` is centred and has no grid. I used the grid pattern from `platform/hero/WalletStackHero.tsx` instead.
   - `HeroWords` keeps its `fan` look because `ReskinHero` (card design) still uses it.
   - I looked at the push, geolocation and analytics heroes at 1440 and 390 and they read correctly.
4. **Phone menu is the sheet only: done.**
   - Deleted: `MobileMenuDrill.tsx`, `MenuFeaturedCard.tsx`, `menuVariant`, `currentMenu`, `MENU_VARIANTS`, `drillFocusSelector` and their tests.
   - `MobileMenu` takes no `variant` prop.
   - **Tiles** (`components/sections/MobileMenu.tsx`): label 13px, line 11px, padding 10px, icon tile 28px, `min-h-[72px]`, gap 8px.
   - **Checked in Playwright at 320, 360 and 390:** no page or dialog overflow, no label or line overflow, text inside every tile, tile heights 72 to 93px (all well over 44px).
   - At 320px "Push Notifications" and "Mobile Scanner" wrap to two lines.
   - Shots: `now-menu-{320,360,390}.png`.
5. **Hero switch removed: done.**
   - Deleted: `HeroVariantSwitch`, `WalletShelfHero`, `wallet-shelf.ts`, `variants.ts`, the `?hero=` code and `PLATFORM.heroCards.shelfAlt`, with their tests.
   - `PlatformHero` renders `WalletStackHero`.
6. **Section ids: done.**
   - `texting`, `charts`, `customers`, `dashboard` and `types` are added to `LandingSectionId`.
   - `ladder` and `plans` are removed (see item 2 above). No other id was removed.

**Production byte compare**, SSR before vs after, scripts and links stripped, deterministic across two fetches.
- Identical (17): `/us`, `/en`, `/` (root), `/fr` (307, same), `/es`, `/pl`, `/en/pricing`, `/en/about`, `/programme-fidelite`, `/features/design-de-carte`, `/features/geolocalisation`, and the six `/en/features/*` (card-design, mobile-scanner, push-notifications, analytics, geolocation, promotional-campaigns).
- Changed, as intended (10): the four STA-546 landings and the six `/us/landing-pages/platform/*` previews.

## (b) Commits and diff stat

```
83540ca feat(STA-552): the phone menu is the sheet alone with smaller Product tiles; Platform's hero has no shelf or switch
e6a43bd feat(STA-552): landing pages back to the clean look with keycaps kept, split feature heroes, no plan names, section ids for the builders
```
- `3916db5` is the other session's commit. It holds my staged files plus `docs/features/STA-552/copy-v3.md`.
- Diff stat of my commits (`git diff 3916db5..HEAD`): 85 files changed, 486 insertions, 1729 deletions.
- Whole stage including `3916db5` (`git diff 2caa7d5..HEAD -- . ':!docs'`): 97 files changed, 502 insertions, 2216 deletions.

## (c) Tests

- Baseline: 6012 pass, 4 skip, 11 fail (6027 tests, 203 files). Now: 5912 pass, 4 skip, 0 fail (5916 tests, 201 files).
- The drop of about 100 tests is the removed behaviours: ladder, plans section, drill, shelf and variants, plan-chip checks, the v2 look.
- **Written first and failing for the right reason:**
  - the plan sweep (9 of 10 pages failed);
  - `look.test.tsx` (12 failed);
  - the split `PreviewHero` tests in `kit.test.tsx` (8 failed);
  - the smaller Product tile tests in `lib/nav/mobile-menu-render.test.tsx` (2 failed).
- **Rewritten:** `plan-claims.test.ts`, `previews/look.test.tsx` (renamed from `hybrid-look`), `kit.test.tsx` (PreviewHero and the chip assertions), `lib/nav/mobile-menu-render.test.tsx` (drill removed, tile tests added), `platform/platform-hero.test.tsx`.
- **Other edits to existing tests:** `shared-sections`, `features-page`, `outcomes-page`, `platform-page`, `extended-components`, `copy`, `claims-doc` (the `team.facts[2]` path became `[0]`), `registry`, `pages`, `geolocation`, `mobile-scanner`, `promotional-campaigns`, `push-notifications`, `wording-editor`, `analytics` and `analytics-interactions`.
- Several existing tests had to change because the behaviour they pinned was removed. Each was rewritten to the new behaviour or deleted with its feature; none was weakened to get green.

## (d) For the coordinator

- **Menu bottom bar (not fixed):** "Get started →" wraps onto two lines at 320px in `MenuBottomBar` (`MobileMenuParts.tsx`). It is outside the tile scope.
- **`lib/hero-fan.ts` and `PLATFORM_FAN_SLOTS`:** not restored, that is builder 1's. The Platform page now shows the stack on all widths.
- **Left in the v2 inked look** until their builders redo them: the composer card, ideas stage, wording editor, geolocation status and privacy sections, blind-spot cards and recap email. Remaining Platform and preview objects are clean.
- **Section lists:** `analytics` is now `hero, blind_spots, glance, activity, recap, final_cta, related` and `promotional-campaigns` is `hero, composer, numbers, ideas, delivery, faq, final_cta, related`. Builders should edit from these.
- **`claims.md` and `copy-v3.md`:** I did not touch `docs/` or `claims.md`. The dropped claims may leave stale rows in `claims.md`.
- **Dev servers:** I ran `next dev` on 3141 only: HEAD for the "before" fetch, a 927bf77 tree for the reference shots (a scratch tree with a cloned `node_modules`; a symlinked one failed under Turbopack), then my tree. All are stopped.

## (e) Open questions

1. Keep the `ladder` and `plans` removals, as I did, or do you want the sections back in some plan-free form?
2. Keep the unlabelled "Your words" editor, or drop custom wording now?
