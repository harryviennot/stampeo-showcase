# Quality Report: STA-552 (v3 round)
LANE: standard (not stated in the brief; checks are the same in every lane)  REVIEWED: 2026-11-16  DIFF: 2caa7d5..0187c4b (feat/sta-552-feature-previews; docs, snapshots and public assets excluded)
VERDICT: BLOCKERS

Worktree: /Users/harryviennot/LocalDocuments/fidelity/showcase/.claude/worktrees/sta-552 (all paths below are relative to it)

## Comments
- [BLOCK] lib/landing-pages/previews/pages.test.tsx:32: contradiction. The comment says "...and the icons strip (a figure with a label)", but `NOT_HEADED` on line 33 no longer contains `"icons"`: icons is a headed section now. Fix: `/** The registry sections that are not headed sections: the page's frame, the FAQ and the demo (headed on their own). */`
- [BLOCK] components/landing-pages/feature-previews/analytics/ChartsSection.tsx:26-27: contradiction. The comment says "the two heat charts are wide", but the two 6-column cards are `busiest` (a heat grid) and `habits` (bars). The `cohorts` heat chart is a 4-column card. Fix: "busiest times and how often they come are wide".
- [BLOCK] lib/landing-pages/copy/previews/geolocation.ts:28-30: contradiction. The comments say "The handwritten note beside the hero's phone from `lg`" and "The small label under the hero's phone on a phone". HeroLockScreen.tsx:35-37 uses `xl:flex` for the note and `xl:hidden` for the chip, so the chip also shows on tablets and small laptops. Fix: "below `xl`" and "from `xl`".
- [BLOCK] lib/landing-pages/copy/previews/promotional-campaigns.ts:10 (field `chip` at :13): contradiction. The comment says "the chip that names it", but IdeasSection.tsx:18 renders `row.chip` as an `<h3>` card title, and IdeasChips.tsx is deleted. Fix: rename the field `chip` to `name`, and change the comment to "its name, its sample message on the lock screen, and who gets it".
- [BLOCK] components/landing-pages/feature-previews/promotional-campaigns/IdeasSection.tsx:5 and analytics/ChartsSection.tsx:46: contradiction. The comments say "the title of a chart card or a floating card" and "the Platform card title". Both constants use `lg:text-[1.375rem]`, but the floating card's title (platform/GlassCard.tsx:4-5) is `mb-4 ... lg:text-[1.5rem]`. The copies have already drifted. Fix: export one `CARD_TITLE` from components/landing-pages/platform/classes.ts and use it in all three files, or drop the claim that they match.
- [BLOCK] lib/landing-pages/previews/geolocation.test.tsx:25 and lib/landing-pages/previews/mobile-scanner.test.tsx:31: history. "...the ink frame (a stamped card, an ink-coloured border) of the earlier look." Fix: delete it along with the tests (see Test shape), or use `/** The ink frame (card-stamp, an ink border) no section carries. */`
- [BLOCK] lib/landing-pages/previews/look.test.tsx:4: history. "What every other page of the site renders without the new props is pinned in...". Fix: change "the new props" to "the landing-page props".
- [NOTE] lib/nav/mobile-menu-render.test.tsx:3-4: relative-time wording ("when the menu is the new one, and that every other page keeps today's"), rewrapped in this diff. Fix: name the two menus ("the landing pages' menu", "the site's menu").
- [NOTE] lib/landing-pages/copy/previews/promotional-campaigns.ts:4: "the approved Outcomes copy" describes the review history, and the string is copied from copy/outcomes.ts:63 instead of imported. Fix: import the Outcomes banner and delete the comment.
- [NOTE] components/landing-pages/outcomes/SegmentChips.tsx:3: "The five customer groups the dashboard sorts everyone into" disagrees with this diff's analytics preview. lib/landing-pages/previews/analytics-customers.ts:3-22 and copy/previews/analytics.ts:78-85 list seven dashboard segments. Fix: drop "the dashboard sorts everyone into", or align the two pages.
- [NOTE] lib/landing-pages/previews/card-design.test.tsx:28: garbled. "the wallets table two phones" should be "the wallets section's two phones".
- [NOTE] Over-explained: several comments restate the class string in pixels and breakpoints, for example HeroLockScreen.tsx:12-15, TypesSection.tsx:7 and :23-27, ChartsSection.tsx:25-29, IconsSection.tsx:10, ScannerDuo.tsx:5-8, PhoneWalletStack.tsx:10 and VisitsChart.tsx:7. Two of them already disagree with the code within this diff (the ChartsSection and geolocation findings above). Fix: keep the why and drop the restated numbers. Some comments only restate the next line: ChartsSection.tsx:11 "Each chart's picture.", card-design/ReskinCards.tsx:34 "A round, 44px button.", copy/types.ts:67 "A short fact.", shared/Chip.tsx:3. Fix: delete them.
- [NOTE] Density: added 12.4% (296 comment lines out of 2,380 non-blank added code lines) vs baseline 10.6% (921/8,676 in the touched files at 2caa7d5). That is 1.17x, under the 1.5x threshold. Per-file peaks: card-design/AnatomySection.tsx 5/14, previews/reskin.ts 10/35, previews/analytics-sample.ts 20/95.

## File size
None found. No touched file crosses a threshold or grows by more than 300 lines. Largest component: components/features/design-de-carte/AnnotatedWalletCard.tsx, 297 -> 301. Largest module: lib/hero-fan.ts, 330 -> 348. Largest test file: lib/landing-pages/shared-sections.test.ts, 596 -> 529.

## Folder tree
None found. The fullest folder that gains a file is lib/landing-pages/previews (22 entries). The other new files go into folders of 3 to 10 entries. Nothing new lands directly in lib/ (107 entries).

## Flag-gated paths
None found. The diff deletes the `?menu=drill` and `?hero=` switches (lib/landing-pages/platform/variants.ts, components/sections/MobileMenuDrill.tsx, components/landing-pages/platform/hero/HeroVariantSwitch.tsx, WalletShelfHero.tsx, WalletStackHero.tsx). A grep for `menuVariant`, `MENU_VARIANTS`, `?menu=`, `?hero=`, `MobileMenuDrill` and `WalletShelf` finds nothing left in app/, components/ or lib/.

## Other (findability)
- [NOTE] lib/landing-pages/pages.ts:82-84, 89-90, 93: `"team"`, `"glance"`, `"activity"`, `"recap"`, `"composer"` and `"status"` stay in `LandingSectionId`, but no registry entry or component uses them now that this diff deleted their sections. Fix: remove them, as was done for `playground`, `stamps`, `plans`, `palettes` and `ladder`.
- [NOTE] lib/landing-pages/previews/analytics-sample.ts:1 and feature-previews/analytics/ink.ts:1 import the sample's data (`ANALYTICS`, `INK`) from the component file components/landing-pages/platform/DeliverAnalytics.tsx, so a lib module depends on a component. Fix: move `ANALYTICS` and `INK` into a lib module (for example analytics-sample.ts) and have DeliverAnalytics import them from there.
- [NOTE] The white card surface `rounded-[28px] bg-white shadow-[0_2px_4px_rgba(25,18,16,0.04),0_...] ring-1 ...` is copied into 13 component files. Fix: one `CARD_SURFACE` in components/landing-pages/platform/classes.ts.

## Test shape
- [NOTE] Ratio: 1,384 added test lines / 2,548 added code lines = 0.54. Net change: tests -1,293, code -1,410. No test file is over 800 lines.
- [NOTE] Tests that check removed features are still gone (history pinned as tests):
  - lib/landing-pages/previews/analytics.test.tsx:300-304 ("...are gone")
  - lib/landing-pages/previews/card-design.test.tsx:61-71 (`existsSync` on six deleted components and pulp-palettes.ts)
  - lib/landing-pages/previews/mobile-scanner.test.tsx:195-201 ("what the page no longer has")
  - lib/landing-pages/previews/geolocation.test.tsx:119 ("it has no status table")
  - lib/landing-pages/previews/promotional-campaigns.test.tsx:246-260 (composer, SMS table "comes back")
  - lib/landing-pages/plan-claims.test.ts:63-65 and lib/landing-pages/outcomes-page.test.tsx:163 (source scans for the deleted PlanChip and PlanLine)
  
  Fix: delete them. pages.test.tsx already checks each page's sections against the registry, and plan-claims.test.ts:35-38 already reads the rendered pages.
- [NOTE] Duplicate "no plan named" regexes: about 18 per-section checks, including push-notifications.test.tsx:101,176,257; promotional-campaigns.test.tsx:116,157,199,227,253; mobile-scanner.test.tsx:124,191; card-design.test.tsx:41; geolocation.test.tsx:114; analytics.test.tsx:142; platform-page.test.tsx:338; features-page.test.tsx:143. plan-claims.test.ts:35-38 already renders every landing slug and checks the same thing. Fix: delete the per-section copies.
- [NOTE] Duplicate "no ink frame" className checks: about 15 `not.toContain("card-stamp")` or `INK` assertions across the geolocation, mobile-scanner, promotional-campaigns and push-notifications tests. The `INK` regex itself is copied at geolocation.test.tsx:26 and mobile-scanner.test.tsx:32. Fix: one `test.each(PREVIEW_SLUGS)` page-level check in look.test.tsx; delete the rest.
- [NOTE] className and source-regex checks:
  - lib/landing-pages/platform/platform-hero.test.tsx:80-85 (an exact `<div class="max-lg:hidden"><div[^>]*><div class="mt-8 lg:mt-6">` match), :111-113 (`overflow|mask-image|clip` in the source), :119-127 (hook, transition and `use client` regexes over the source), :134-140 (no `useMediaQuery` or `useState`). The reduced-motion render check at :129 covers what a visitor can observe.
  - lib/landing-pages/previews/look.test.tsx:157, 170, 209, 211 (`mb-[3px]`, `h-[52px]` tokens) and :331-343 (`filesWith` card-stamp over 7 component files).
  - lib/landing-pages/previews/analytics.test.tsx:96-97 (`blog-card-3d` count, grid classes), :133-143 (a hex allowlist), :145-148 (a source px scan).
  - lib/landing-pages/previews/promotional-campaigns.test.tsx:115 (a `rounded-[28px] bg-white` count).
  
  Fix: delete them.
- [NOTE] Copy change-detectors: promotional-campaigns.test.tsx:119-126 compares the copy's own strings with `toEqual`, and its title, "the claims are Harry's", describes who approved them. copy.test.ts:187 (`figure.value` toBe "95%"). Fix: delete.
- [NOTE] Copied setup: `sectionsOf(await renderPreviewPage(slug)).find(({ id }) => id === X)?.html ?? ""` appears 12 times across 6 files (pages.test.tsx x5, analytics x2, geolocation x2, and once each in mobile-scanner, promotional-campaigns and push-notifications). Fix: add a `sectionOf(slug, id)` helper to lib/testing/preview-page.ts.
- [NOTE] Plan acceptance-criteria ids were added to describe titles: platform-page.test.tsx:93 "(AC17)" and shared-sections.test.ts:147 "(AC9)". Fix: drop them; the mapping belongs in docs/features/STA-552/.

## Waivers
(filled by the main agent only if the user explicitly waives a BLOCK)
