# Quality Report: STA-552 (v2 round)
REVIEWED: 2026-11-16  DIFF: 927bf77..61d25b3 (showcase, feat/sta-552-feature-previews; docs, snapshots and public assets excluded; 163 files, +8127/-1663)
VERDICT: FINDINGS

## Comments
- components/sections/Header.tsx:24, :244-247: history. "The redesigned phone menu…", "every other page keeps today's menu". The prop values `"today" | "v2"` (:251-252) also describe time, not behaviour, so they will be wrong once STA-555 ships. Fix: name the values after what they draw (`"accordion" | "sheet"`). Replace :24 with `/** The sheet menu, a separate chunk loaded only by headers that ask for it. */`.
- lib/landing-pages/variants.test.ts:2: history. "The two switches Harry compares the Platform hero and the phone menu with". Fix: `The ?hero= and ?menu= switches: anything that is not a variant gets the default.`
- lib/landing-pages/pulp-palettes.ts:4-5: history. "run once in a browser on 16 Nov 2026 and copied here". Fix: keep the generator call and drop the date.
- components/landing-pages/feature-previews/analytics/BlindSpotsSection.tsx:6: history. "production's blind-spot cards, finished." Fix: delete the clause.
- lib/landing-pages/previews/registry.test.ts:8-13, lib/testing/landing-pages-source.ts:25-30, lib/landing-pages/previews/pages.test.tsx:6-8 and :45: history (build-process narrative). "until its builder renders them…", "A page whose builder has not landed…". The STA id also sits in code: `STAGED_MARKER = "TODO(STA-552 v2 builder)"`. Fix: delete these together with the scaffolding (see Flag-gated paths).
- lib/landing-pages/previews/kit.test.tsx:2: contradiction. "The kit the five previews are built from". There are six; the diff edited lines 3-4 of this block and missed it. Fix: "six".
- lib/testing/landing-pages-source.ts:52: contradiction. "the four pages and the five previews". The same diff changed :16 and :21 of this file to "six". Fix: "six".
- lib/landing-pages/shared-sections.test.ts:50: contradiction. "so do the five previews in its style". Fix: "six".
- components/landing-pages/feature-previews/push-notifications/WordingEditor.tsx:74: contradiction. "Three message switches flip on their own." No timer exists; they change only through `onToggle` on tap (:139). Fix: "Three message switches, each toggled independently."
- components/landing-pages/feature-previews/mobile-scanner/TeamFrames.tsx:15: contradiction. "cut at `CUT` px". `CUT` is a class string (`max-h-[390px]`), not a number. Fix: "cut at 390px by `CUT`".
- 18 section components: over-explained. Each docstring quotes the section's title from the copy module, which will drift when the copy changes (BlindSpotsSection.tsx:6, LadderSection.tsx:6 "All plans answer. Growth and Pro chart it", PalettesSection.tsx:6, IdeasSection.tsx:5, ComposerSection.tsx:5, EditorSection.tsx:5, and 12 more). In BlindSpotsSection that is 5 comment lines in an 18-line file. Fix: drop the quoted title and keep at most one line on what the section holds.
- CounterPlayground.tsx:37-43, WalletStack.tsx:90-97, WalletShelfHero.tsx:39-44, ReskinCards.tsx:70-76, PaletteStage.tsx:17-23: over-explained. Docstrings of 6-8 lines retell layout, breakpoints and motion that the JSX already shows. Fix: 1-2 lines each, keeping only the non-obvious invariant (e.g. "all panes stay mounted so a swap is a cross-fade").
- Density (comment lines / non-blank added lines; baseline is the same folder at 927bf77):
  - components/sections: added 11.2% (65/580) vs baseline 5.4%, 2.1x. Flag.
  - lib/landing-pages/copy: added 16.0% (46/287) vs baseline 6.9%, 2.3x. Flag.
  - lib/landing-pages/*.ts helpers: added 21.7% (123/566) vs baseline 14.0%, 1.55x. Flag.
  - lib/dom/modal.ts: added 41.2% (14/34) vs body-scroll-lock.ts 25.0%, 1.65x. Flag.
  - All added non-test code: 13.3% (614/4600), in line with feature-previews (12.9%) and platform (14.2%).

## File size
- components/sections/Header.tsx: 522 -> 552 lines. It is a React component already over ~500, and the diff adds the menu-variant branching inside it. The v2-stage-f-report (:128) expected this file to shrink. Split: move today's burger (:423-440), the accordion panel (:443-528) and `MobileFeaturesAccordion` (:186-240) into `components/sections/MobileMenuAccordion.tsx`. That brings Header to about 400 lines, and the same move fixes the flag interleaving below.
- app/globals.css: 1040 -> 1075 lines (+35 keycap rules). Already oversized, and it is the only stylesheet. Optional: `@import "./styles/keycap.css"` instead of growing it.
- No new file is over 300 lines (largest: BroadcastComposer.tsx 236, CounterScreens.tsx 230, MobileMenuParts.tsx 228). No file grew by more than 300.

## Folder tree
- lib/landing-pages went from 20 files at base to 37 (17 new): broadcast-composer(.test).ts, card-design-samples.ts, platform-hero.test.tsx, pulp-palettes(.test).ts, reskin(.test).ts, scanner-counter.ts, scanner-interactions.test.ts, team-code.ts, variants(.test).ts, wallet-stack(.test).ts, wording-editor(.test).ts. Move to:
  - The preview helpers and their tests go to `lib/landing-pages/previews/`, which already holds the preview tests (11 -> 25).
  - wallet-stack, variants and platform-hero.test go to `lib/landing-pages/platform/`.
- These helpers have no single home. Analytics' pure helpers (flip.ts, ladder-view.ts, sample.ts) sit in `components/landing-pages/feature-previews/analytics/`, but are tested from `lib/landing-pages/previews/analytics-interactions.test.ts`. The scanner, campaigns, notifications and card-design helpers sit in `lib/landing-pages/`. Pick one place.
- components/landing-pages/platform (28 files, 24 at base; advisory, close to 30): the new HeroVariantSwitch, WalletStack, WalletStackHero and WalletShelfHero files, plus PlatformHero and HeroWords. Move to: `platform/hero/`.

## Flag-gated paths
- components/sections/Header.tsx:360, 366, 421-440, 445, 530-544: `mobileMenu === "v2"` is read in 5 places in `Header`'s body. Old and new burger, panel and bar background are interleaved. Fix: read it once and pick a whole menu, e.g. `const PhoneMenu = mobileMenu === "sheet" ? MobileMenu : MobileMenuAccordion`, with each one owning its own burger and bar class. `?menu=drill` is already handled correctly: it is dispatched once in MobileMenu.tsx:136-139.
  - Cleanup issue: partial. plan.md:99 says STA-555 ships the winner site-wide. Nothing lists deleting the accordion path, the losing sheet/drill component, `MENU_VARIANTS` and lib/nav/header-wiring.test.ts.
- `?hero=shelf`: dispatched once in HeroVariantSwitch.tsx:18-25, which is good. But the shelf's data lives in the stack's module: wallet-stack.ts:88-102 (`SHELF_CARDS`, `SHELF_ON_PHONE`, the `BRONZE_LOOK` import), copy/platform.ts:14-18 (`shelfAlt`), wallet-stack.test.ts:203-232. Fix: move the shelf data next to WalletShelfHero (e.g. `lib/landing-pages/platform/wallet-shelf.ts`), so dropping the losing variant means deleting files.
  - Cleanup issue: missing. plan.md:97 says "for Harry to pick", and no item says to delete the losing hero.
- Rollout scaffolding left after every builder landed:
  - `STAGED_MARKER`/`isStaged` (landing-pages-source.ts:25-32) is still exported. No page carries the marker anymore.
  - The staged branch in registry.test.ts:137-162 is still there.
  - `drawn`/`WITH_SECTIONS` in pages.test.tsx:45-48 is still there.
  - `LandingSectionId` still lists `"moments"`, `"wording"` and `"questions"` (pages.ts:85-88), and no page renders them.
  - Cleanup item: exists (v2-stage-f-report.md:35 and :126, ux-review-v2.md:155) but is not done. Fix: delete them all before merge.

## Test shape
- Ratio: 2993 added test lines (2976 in test files without snapshots, plus 17 in lib/testing) / 5082 added code lines = 0.59. Fine.
- lib/landing-pages/previews/registry.test.ts:137-162: dead and vacuous. The `isStaged` branch is never taken, and "the marker is the only thing that stages a page" loops over an empty list, so it always passes. Fix: delete it and keep only the strict order test.
- lib/nav/header-wiring.test.ts:15-50 and lib/landing-pages/preview-nav.test.ts (new tests at :78-94): implementation detail. They regex-match Header.tsx's source text: `{mobileMenu === "v2" ? (\s*<MenuBurger`, the exact className ternary (:37), the exact `useSyncExternalStore(...)` call shape (:49), and `mobileMenu = "today"`. They lock in the interleaved branching, so the dispatch fix above breaks them without any change in behaviour. Fix: render `<Header mobileMenu=…>` against the default and assert on the output (`data-mobile-menu`, the burger's `aria-controls`, no accordion). Also, header-wiring.test.ts:5-6 redeclares `ROOT`/`source` instead of importing `ROOT`/`read` from lib/testing/jsx-source.
- Tests that assert a constant equals its own literal (implementation detail): broadcast-composer.test.ts:30 (`COUNT_MS` 900), scanner-interactions.test.ts:27 and :58, analytics-interactions.test.ts:74 and :106-107, reskin.test.ts:63, wording-editor.test.ts:66. scanner-interactions.test.ts:59-60 tests `typesIn`, a one-line `!reducedMotion` wrapper (team-code.ts:21). Fix: delete these assertions and keep the behaviour checks that use the constants.
- hybrid-look.test.tsx:56-85 (CSS rule bodies: `80ms`, `translateY(-1px)`) and :153-171 (`mb-[3px]`, `h-[52px]`): pixel and timing literals, with no behaviour checked. The suite already asserts classes 35 times at base, so this is low priority. Fix: keep the `keycap`/`keycap-flat` class presence and drop the literals.
- push-notifications.test.tsx:207-214, promotional-campaigns.test.tsx:342-349, hybrid-look.test.tsx:131-135: history-shaped tests ("the v1 first-draft sections are gone", "the old orange capitals again"). They assert that deleted copy is absent, which the registry order test already pins. Fix: delete them.
- lib/nav/mobile-menu-render.test.tsx:129-133 and :190-192: duplicate. The "44px or taller" test is copied for the sheet and the drill-down. Fix: one `test.each(MENU_VARIANTS)`.
- wallet-stack.test.ts:31-38 and platform-hero.test.tsx:51-57: duplicate. Both pin "nine different shops, no oba/barber". Fix: keep the pure check in wallet-stack.test.ts.
- Copied helpers:
  - `logos` regex: identical at platform-hero.test.tsx:24 and previews/card-design.test.tsx:36. Move it to `lib/testing/render-en.ts`.
  - `sectionsOf`: copied into previews/card-design.test.tsx:39 from pages.test.tsx:30. Move it to `lib/testing/preview-page.ts`.
  - The slug-to-copy `COPY` map is kept twice (registry.test.ts:32 and pages.test.tsx:36), and geolocation was added to both. Move it to `lib/testing/landing-copy.ts`.
- No test file is over 800 lines (largest new or grown: analytics.test.tsx 352, promotional-campaigns.test.tsx 350, hybrid-look.test.tsx 317).

## Waivers
(filled by the main agent only if the user explicitly waives a finding)