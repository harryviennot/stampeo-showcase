# Gap Report: STA-552 (v2)
AUDITED: 2026-11-16  DIFF: v2 round, `scratchpad/sta552/v2-final.diff`. Docs, snapshots and public assets were excluded and no commit range was given.
VERDICT: GAPS FOUND + DRIFT FOUND

## Criteria without tests
- **AC10, keycap on the three other US landings.** No test, and the code doesn't do it.
  - `components/landing-pages/shared/LpHero.tsx:37` (hero) and `LpFinalCta.tsx:19` (closing CTA) render `<CTAButton>` without `keycap` on how-it-works, features and outcomes.
  - `LpTrialButton.tsx:7` has no keycap either. It is used 6 times on those three pages, and by `LpDemo.tsx:36` on the mobile-scanner and push-notifications previews.
  - Closest test: hybrid-look.test.tsx "the trial button is a keycap…", which covers only LpCtaPair, LpAccentBand and PreviewHero.
- **AC10, every other page renders each touched component byte-identically.** A byte compare (default-renders snapshot) exists only for NotificationPhoneDemo, AnnotatedWalletCard and FAQList.
  - CTAButton `keycap`: substring check only (hybrid-look "CTAButton is a keycap only when asked").
  - LanguageSwitcher `variant`: no test.
  - Header `mobileMenu`: source regex only.
  - GeofencingHeroAnimation: its snapshot was created in this diff (see Suspect tests).
- **AC10, the brief's §1.3 objects are stamped.** No test lists the §1.3 objects. Coverage is per component (GlassCard, StepsTable, ToggleCard, FAQList table, RelatedPreviews) plus per-section `card-stamp` counts. Any other listed object could lose its frame and still pass.
- **AC11, ≥ 9 distinct wallet cards, shelf variant.** platform-hero.test "…nine cards in a row" asserts 9 logos, not 9 distinct ones. The shelf shows 7 shops: Wrenfold appears three times, at Bronze, Silver and Gold (wallet-stack.ts `SHELF_CARDS`). The plan wording is ambiguous and no test settles it.
- **AC11, reduced motion gives a static, complete hero.** Only the pure `stackView(…, true)` is tested (wallet-stack.test).
  - Neither WalletStackHero nor WalletShelfHero is rendered under `renderAs({ reducedMotion: true })`.
  - The reduced-motion `@media` rules inside the `KEYFRAMES` strings (WalletStack.tsx:28-34, WalletShelfHero.tsx:27-31) are untested. If one is dropped, the shelf deals in from `opacity:0` for a reduced-motion reader.
- **AC11, `?hero=shelf` shows the shelf.** Tested: pure `heroFromSearch`, and the server render showing the stack. The client path (HeroVariantSwitch.tsx:19-23, reading `window.location.search`) is never rendered.
- **AC12, at least two sections built for each feature.** No test. Closest: registry.test "lists the brief's sections", which checks order only.
- **AC12, analytics answers only with every-plan facts unless labelled.** The blind-spot answers and RecapSection are checked only for the absence of plan words (see Suspect tests). Nothing ties them to PLAN_FACTS the way ladder-view.ts does.
- **AC12, geolocation has no date.** copy.test "it has no launch date, in any form" scans the copy modules only.
  - `feature-previews/geolocation/lock.ts:2` sets `LOCK_DATE = "Tuesday, June 9"`. It renders on the hero and How lock screens of the coming-soon page, and the test's own month regex would reject it.
- **AC13, traps focus / closes on Escape.** Only the pure `trapStop` (modal.test) and source substrings (header-wiring) are tested. The wiring in MobileMenuParts.tsx:80-112 has no test:
  - focus moves to `[data-menu-first]` on open;
  - the Tab stops are the burger plus focusables, excluding `[inert]` drill screens;
  - Escape puts focus back on the burger.
- **AC13, every other page keeps today's menu byte-identically.** `<Header />` with mobileMenu="today" is never rendered or snapshotted, open or closed. header-wiring.test only regex-matches the source.
- **AC13, trial CTA stays in view (drill-down).** "Log in and Get started stay at the bottom, once" counts the buttons but not their position. The sheet's `sticky` is asserted; the drill's `absolute inset-x-0 bottom-0` (MobileMenuDrill.tsx:164) is not.
- **AC14, every new claim traced in claims.md.** No test reads claims.md. Closest: plan-claims.test, which checks plan names against PLAN_FACTS. New claims with no check:
  - analytics recap: weekly digest / monthly recap, "Unsubscribe anytime";
  - geolocation: "ready the day it launches", "will pick it up with its next update", "announce it on our What's new page";
  - scanner team fact: "Every scan carries the name of who made it".
- **AC14, passes stampeo-copywriting.** Manual review only; nothing in the tests records it.
- **v2 decision "the menus label it 'Soon'".** Only the v2 phone menus do (MobileMenuParts.tsx:69). On Platform and the previews, the desktop Product dropdown (Header.tsx:303-306) and the footer features column (Footer.tsx:138) now send geolocation to its coming-soon preview. Neither prints Soon, and there is no test.

## Untested diff behavior
- **BroadcastComposer.tsx:116-129, `send` from the "sent" stage.** "Send again" or a tap mid-count should reset to idle and replay after `REPLAY_GAP_MS`; untested, and `REPLAY_GAP_MS` is not pinned. Risk: a double tap, or Send again for a reduced-motion reader, leaves the count at 0 or the banner gone.
- **PaletteStage.tsx:49-53, `pick`.** A tap should clear the pending tour timers; untested. Risk: the tour overwrites the palette the visitor chose.
- **CounterPlayground.tsx.** Only the pure `stepCounter` and `autoplays` are tested. Untested:
  - :81-89, arrow keys move the selection and the focus;
  - :69-74, the autoplay interval and progress bar;
  - :145, the `armed` lazy cards.

  Risk: a keyboard user loses focus, or the hidden cards never render.
- **BlindSpots.tsx:25-63.** Untested: the IntersectionObserver timer resetting when less than half the section is in view, and the `touched` ref being set by the control or a tap. Only the pure `autoFlipDue` is tested.
- **Other client wiring, pure rules only.** Untested:
  - the StaffPhoneFrame typing effect;
  - the WordingEditor typing interval, and switching modes mid-type;
  - the ReskinCards and WalletStack clocks.
- **hooks/useWatching.ts:1-32.** It gates three clocks on "in view and tab visible"; untested. Risk: animations run in a background tab, or never start.
- **MobileMenuDrill.tsx:94-104.** Focus should follow the screen, and Back should return focus to the row that opened it; untested.
- **Header.tsx `dynamic(() => import("./MobileMenu"), { ssr: false })`.** If the burger is tapped before the chunk loads, the bar turns cream and the X shows but no sheet appears; untested.
- **LanguageSwitcher.tsx `LanguageRow` `onPick`.** The call to `router.replace(pathname, { locale })` is untested.
- **MobileMenuParts.tsx `MenuBottomBar`.** Get started (`trackAs="header_mobile"`): only the href is asserted, not the tracking (AC4).
- **DesignerSection.tsx:20, `LpCtaPair location="feature_cta"`.** The tracking location isn't pinned. The deleted DesignFigures and HistorySection tests were the ones that pinned `feature_cta`.

## Drift (in diff, not in plan)
- **Geolocation "Today" column has a broadcast badge.**
  - geolocation.ts:50 and StatusSection list "Broadcasts to every card" with a "Growth and Pro" chip.
  - plan.md says the non-campaigns previews show no broadcast badge, because STA-549 opens broadcasts to every plan right after shipping. This chip becomes false at that point.
  - plan-claims.test was loosened to let it through (see Suspect tests).
  - Either update the plan or escalate.
- **LpFaq.tsx:8-31 drops the `eyebrow` prop.** The plan's polish section and AC7/AC8 still describe it. The centred stamped table now switches on `faq !== undefined`, and extended-components.test lost its "faq given, no eyebrow" case. The plan is stale.
- **preview-nav.ts sends geolocation to `/us/landing-pages/platform/geolocation`.** The plan's "Contextual feature links" section and AC9 still say geolocation opens today's page, and still count "five features". The test was rewritten to assert the opposite. The plan is stale.
- **messages/{es,fr,pl}/common.json:12-38.** The featuresItems descriptions are rewritten in three locales. Their only reader is the v2 phone menu, which renders only on English US landings. Site-wide rollout is STA-555's scope.
- **HoverRows.tsx:127.** Row labels change from accent-hover to grey capitals, on Platform as well as the previews. plan.md only says eyebrows become the accent pill.
- **lib/levels/looks.ts:57-67.** `PLATINUM_LOOK` is added and pinned in looks-values.test, but no component uses it.

## Suspect tests
- **geolocation.test.tsx:48** "the animation with none of the preview's props is the live page's, to the byte". The snapshot was first written in this diff, so it records the post-change output and can't show "as before".
- **pulp-palettes.test.ts:43-48** "come from the designer's own generator…". It asserts the source contains `generateThemeVariants` and the logo path. Both appear only in the file's header comment; the palettes are hand-copied hex values, so the test can't fail if they were hand-picked.
- **analytics.test.tsx** "every answer is true on every plan…" and "…no fact carries a plan: the digest is on every plan". Both only assert that plan words are absent. Neither can fail if an answer, or the digest, were Growth-only.
- **platform-hero.test.tsx:56** "shows stamps, points and a level in the first screen". It searches the whole render, where all nine cards are in the DOM, hidden ones included. It can't fail if the level moved out of the first four strips. The real check is wallet-stack.test "the first screen of the stack on a phone".
- **platform-hero.test.tsx:64** "keeps the trial as the hero's tracked keycap…". It never asserts `keycap`.
- **header-wiring.test.ts:34** "the menu keeps today's page-scroll lock and Escape". Both substrings were in Header.tsx before this diff, so the test doesn't show the v2 branch reaches them.
- **plan-claims.test.ts** "on the other previews a broadcast is named without a label only in the link…". It was a strict `toEqual(PREVIEW_NO_CHIP)`. It now filters to unlabelled mentions and whitelists the geolocation chip: weakened to admit the drift above.
- **copy.test.ts `LEVELS_WITHOUT_CHIP`.** Three entries were added (`PLATFORM.heroCards.stackAlt`, `PUSH_NOTIFICATIONS_PREVIEW.day.lead`, `day.nodes[3].label`), so new level claims are exempted rather than checked.
- **copy.test.ts** "…speaks of what will be, not what is". It checks an allow-list of 19 paths. Present-tense lines outside the list pass, for example:
  - geolocation.ts:83, `privacy.alt`: "no location leaves the phone";
  - geolocation.ts:69, `how.cells[1].title`: "It goes on the card".

  Any new line is unchecked by default.
- **registry.test.ts staging branch, plus landing-pages-source.ts:30-32 `STAGED_MARKER`.** Adding the comment "TODO(STA-552 v2 builder)" to a page turns its section-order test (AC1/AC12) into `test.todo`. No page carries it today, but the escape hatch stays.
- **pages.test.tsx is weakened in four ways:**
  - the per-page header minimum fell from ≥4 on every page to ≥3, and only on pages that draw more than 3 sections (at least 5 such pages);
  - the header, hairline and FAQ checks now read `drawn()` (the page source) instead of the registry;
  - the picture-name check runs only over `WITH_SECTIONS`;
  - the "brings no sign-up button" check gained an `existsSync` guard.
- **Excluded snapshots.** The audited diff leaves out snapshots, so I can't tell whether this round regenerated the AC7/AC15 site-component snapshots in `__snapshots__/default-renders.test.tsx.snap` (NotificationPhoneDemo, AnnotatedWalletCard, FAQList and others). The plan allows only Platform's to change.

## Unrealistic or missing workflow tests
- **analytics-interactions.test.ts:97 "it has not waited yet".** It starts from `waitedMs < AUTO_FLIP.waitMs`, a state the component never produces: BlindSpots.tsx:35 always passes `AUTO_FLIP.waitMs`, and the real wait is the setTimeout. The test pins a dead parameter.
- **Tests that pin the shape of the source, not what renders:**
  - all of header-wiring.test.ts;
  - preview-nav.test "the landing shell asks the header…";
  - platform-hero.test "Platform's hero is the switch…" (`/useSyncExternalStore/`).

  They break on a refactor with no visible change, and pass if the rendered result breaks.
- Missing: with the phone menu open, Tab past the last tile wraps to the X, and Shift+Tab from the X goes to the last tile. The hidden drill screens' links must not be Tab stops.
- Missing: Escape with the menu open closes it, puts focus on the burger, and makes `main` and `footer` reachable again.
- Missing: rotating or resizing past `lg` with the menu open.
  - The dialog and the burger are `lg:hidden`, but `mobileMenuOpen` stays true.
  - The body scroll stays locked and `main`/`footer` stay inert, with no visible way to close the menu.
  - Header has no resize handling.
- Missing: tapping the burger right after load, before the dynamic MobileMenu chunk has arrived.
- Missing: tapping Send now during the automatic send's count, double-tapping Send now, and a reduced-motion reader tapping Send again.
- Missing: tapping a palette swatch during the automatic tour.
- Missing: landing on Platform with `?hero=shelf`, or a preview with `?menu=drill`, and getting that variant after hydration.
- Missing: the Platform hero, the card design hero and the palette stage rendered for a reduced-motion reader, checking the static, complete state at render level.
- Missing: sending the tab to the background pauses the stack, reskin and palette clocks, and they resume on return.

## Waivers
(filled by the main agent only if the user explicitly waives a gap)