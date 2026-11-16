# UX Review v2: STA-552 (+ STA-546 Platform hero, STA-555 phone menu)
MODE: POLISH   DOMAIN: showcase
VIEWED: code + screenshots (390x844, 1440x900, reduced motion, hero and menu contact sheets)
VERDICT: FIXED WITH FINDINGS

Shots are in `docs/features/STA-552/shots/v2-polish/{before,after}/` (git-excluded).
- Naming: `<page>-<width>[-rm]-<section>.png`, plus `-fold` and `-full`.
- `sheets/*-cols.png` show each full page cut into columns.
- `states-*` are tapped states; `menu-*` are the phone menus; `*-motion.png` are 8-frame contact sheets.

Method:
- Local `next dev` on 3121 from the worktree, headless Chromium, `America/New_York`.
- Each shot: "load", then 2.5 s, then a scroll-through. The cookie banner is refused before shooting.
- Tests: `bun test lib scripts` gives 5885 pass, the same as before the pass. `bun run type-check` is clean.
- `bun run lint`: 0 errors and 6 warnings. All 6 are in files this pass did not touch (`HeroCardFan`, `VariantDevToggle`,
  `consent-ledger.test`).

## What the pass measured, and found already consistent

Measured in the DOM on all seven pages at both widths (`scratchpad/sta552/measure-before.json`):
- **Section rhythm** is the same everywhere: 64px / 96px padding.
- **Header rhythm** is the same everywhere:
  - pill to h2: 12px;
  - h2 to lead: 16px;
  - header to body: 40px / 56px.
  - `faq` and `related` carry no pill, as the brief says.
- **Every stamped object** is 1.5px with a 3px ledge, at 20px (card) or 24/28px (stage).
- **Budget**: no viewport shows more than three stamped objects. A grid of like tiles counts as one.
- **Live pages are unchanged**: `/us`, `/en` and `/en/features/analytics` keep the fan, the plain "Start Free" pill and
  today's accordion menu (`after/sheets/live-*.png`, `before/menu-us-*`, `menu-en-*`). Every file this pass touched is
  imported only by `/us/landing-pages/*`.

## Fixed

### Cross-page

- **`feature-previews/MiniFrame.tsx:7-8,27`: every analytics chart card rendered with square corners.**
  - Cause: `rounded-[26px]` sat glued to a `${`, so Tailwind never generated it. The computed radius was 0px.
  - The 48px soft shadow was also clipped flat at the card's foot.
  - Now: the classes live in one whole `SURFACE` string. Radius 20px (the card radius of the system). The shadow is
    shorter, and the chart leaves room for it.
  - Shots: `before/states-ladder-growth-1440.png` and `states-ladder-pro-390.png` → `after/` same names.
- **Card radius.** `mobile-scanner/CounterPlayground.tsx:187`: the option tiles were 18px (`rounded-2xl`), the only
  stamped object off the 20/24/28 ladder. They are now 20px.
- **Stage padding on a phone is 20px everywhere.** It was 16px in two places:
  - `analytics/Ladder.tsx:86`: `p-4` → `p-5`;
  - `promotional-campaigns/IdeasChips.tsx:54`: `p-4` → `p-5`.
- **Step markers.** `push-notifications/DaySection.tsx:43-46,114-116`: the day timeline's numbers were ink discs with
  a 2px ledge, a fourth marker style. They are now the site's `NumberStamp`, like scanner `TeamStrip`, how-it-works
  `StepHeading` and the homepage `HowItWorks`. They sit on a cream disc so the rail stops at their edge.
  - Shots: `before/push-notifications-1440-day.png` → `after/`.
- **Motion curve.** `card-design/ReskinCards.tsx:53`: the reskin slide used a plain `ease-out`. Every other card
  motion uses `cubic-bezier(.2,.8,.2,1)`: the stack, the shelf, the stack's land, and the drill menu. The reskin now
  uses it too. The durations (450/300 ms) are unchanged.

### Card design
- **`ReskinCards.tsx:26`: the neighbour cards looked washed out on cream.**
  - Fix: opacity from 45% to 60%. The neighbours read as real cards and are still clearly behind the live one.
  - Shots: `before/card-design-1440-hero.png`, `reskin-1440-motion.png` → `after/` same names.

### Push notifications
- **`DaySection.tsx:43`: the 227px card cut dissolved the stamp row into the page.**
  - Cause: a mask ran over the bottom 20% of the cut.
  - Fix: the mask is gone. The card now ends on a clean 18px-radius edge under its stamps, as a Wallet card does when it
    is cut.
  - Shots: `before/push-notifications-390-day.png` → `after/`.
- Step markers: see Cross-page.

### Analytics
- **`Ladder.tsx:52-58`: three frames nested at 1440.** The stamped stage held a grey tray, which held a white chart card
  with a shadow.
  - Fix: the trays are gone and the questions sit straight on the stage. On Starter, the sentences now read as three
    columns of one object. On Growth and Pro, the charts stand on white, with gaps of 32px (was 16px).
  - Shots: `before/analytics-1440-ladder.png`, `states-ladder-*` → `after/`.
- **`Ladder.tsx:64`: room for the chart's shadow** under each chart: 28px on a phone and 24px from `lg` (was 16px).
- **`BlindSpotsSection.tsx:14`: the blind spots were the only tinted band on the six previews.** The tint is gone, so
  the section sits on the page like the other five previews' sections.
  - The stamped cards already make it the page's moment.
  - The tint also ran up against the hero's dashboard shadow.
  - Shots: `before/analytics-1440-blind_spots.png` → `after/`.

### Mobile scanner
- Tile radius and padding: see Cross-page.

### Promotional campaigns
- Ideas stage padding: see Cross-page.

### Geolocation
- Nothing changed on the page.
- The phone menu's Soon pill is fixed: see "Phone menu".

### Phone menu (index sheet)
- **`sections/MobileMenu.tsx:23,44`: the Soon pill straddled the Geolocation tile's top border.**
  - At 390 it sat across the 1.5px ink line, one row under the Push tile's foot. It read as a rendering glitch.
  - Fix: it now sits inside the tile, under the one-liner.
  - Shots: `before/sheets/menu-new.png` → `after/menu-us_landing-pages_platform-open.png` and the geolocation page's
    `menu-us_landing-pages_platform_geolocation-open.png`.

### Platform
- No change committed. The two Platform fixes I would make are pinned by snapshots. See "Left alone".

## Mobile findings
- **Platform hero (stack), `platform/WalletStack.tsx:123`: hard edge at 390. Left alone (pinned).**
  - The stack's `overflow-hidden` box ends at the gutter, so the strips' 40px shadow stops in a vertical line 16px from
    the screen edge.
  - `PhoneCrop` solves the same problem with negative margins.
  - The fix is in the patch below; shot: `after/proposed-platform-390-fold.png`.
- Every other mobile checklist item holds on every page:
  - the hero fits the fold;
  - the 16px gutter is respected;
  - nothing decorative overlaps text;
  - the CTA repeats at the bottom;
  - wide content reflows: the ladder, status table and counter stack, and the ideas chips scroll.
  - Tap targets are 44px or more in every new section.
- The sub-44px controls the probe reports are pre-existing and outside STA-552 v2:
  - the 32px `Segmented` in `LpDemo` and Platform's program types;
  - the 38px playground icon buttons (`CompactPlayground touchTargets` only covers the toggles and sliders);
  - the 8px sector dots.

## Brief drift
- **Reskin neighbours: 60%, not 45% (§3A.1).** On purpose: 45% looked washed out on cream, and the coordinator's to-do
  suggested 55%.
- **Analytics ladder (§3D.4): no grey trays at 1440.** The brief's "stamped stage" plus `QuestionMinis` made three
  nested frames; the stage alone is the spec's intent.
- **Analytics blind spots: not tinted.** The brief never asked for a band.
- **Push day (§3C.2): the markers are `NumberStamp`, and the cards are cut clean.** The brief named neither.
- **Platform stack at 1440 (§2): scaled 1.2, so the front card runs to y≈930.** The QR sits on the 900px fold, which
  goes against the brief's own "y≈110-871". The fix is pinned; see "Left alone".
- Everything else matches the brief's section lists and its 390 shapes.

## Copy flagged (for stampeo-copywriting)
- **`lib/landing-pages/copy/previews/push-notifications.ts:52`, editor eyebrow "Your words".** It repeats the segmented
  option "Your words" 300px below it, so the pill reads like a label for one of the two choices.
- **`lib/landing-pages/copy/previews/analytics.ts:121`, recap "642" stamps a week.** It does not match the sample's weekly visits (about 249,
  per builder 2). The coordinator's to-do already has this; it is copy and data, not presentation.
- **`lib/landing-pages/copy/previews/geolocation.ts:58,98`, two unsourced claims** (claims.md): "A short line you write for each location" and
  "the card already in their wallet will pick it up with its next update". Confirm with Harry or soften.

## Left alone
- **Platform: two fixes pinned by `default-renders` snapshots.** I may not touch tests, so I built, shot, reverted and
  saved them as `docs/features/STA-552/shots/v2-polish/pinned-platform.patch`.
  - With the patch, exactly two snapshots fail (`PlatformHero`, `PlatformToggleCard`) and nothing else. Re-record them
    on purpose (`bun test lib/landing-pages/default-renders.test.tsx --update-snapshots`) if you take it.
  1. **`WalletStack.tsx:123,130,133`.**
     - At 1440: scale 1.2 → 1.1, so the whole front card and its QR end at y≈838 (`proposed-platform-1440-fold.png`).
     - At 390: the stage bleeds to the screen edge, so the strips' shadow is not cut off (`proposed-platform-390-fold.png`).
     - Owner: coordinator, with a snapshot re-record.
  2. **`shared/FactList.tsx:11`: the check marks use `--accent-hover`.** Brief §1.2 says decoration is `--accent`. It
     is a one-word change, but `PlatformToggleCard`'s snapshot pins it.
     - It also reaches the other three US landings (features, outcomes).
     - Next to it, `TeamStrip` and `ActivitySection` already draw `--accent` checks, so two oranges sit side by side
       today.
     - Owner: coordinator.
- **Coordinator to-do items that are logic, types or tests, not presentation:**
  - delete `STAGED_MARKER`/`isStaged` and the staged branch in `registry.test.ts`;
  - prune unused `LandingSectionId`s (`moments`, `wording`, `questions`, analytics `numbers`);
  - drop `IdeaCopy`'s unused `eyebrow`/`title`;
  - decide on `NotificationSequenceDemo stillWhenReduced`.
  - Owner: coordinator.
- **The shelf's scroll drift (§2, concept 2) is not built.** Build it only if Harry picks the shelf.
- **The language row cannot show on the US landings**, because they hide the switcher. That is expected; check it again
  when STA-555 ships site-wide.

## Verification
- type-check: pass   lint: pass (0 errors; 6 pre-existing warnings, none in changed files)
- tests: `bun test lib scripts` 5885 pass, 0 fail (unchanged)
- screenshots: `docs/features/STA-552/shots/v2-polish/before/` and `after/` (git-excluded)

---

## Harry's comparison guide

Open these on your phone first, then on a laptop. Dismiss the cookie banner first.

**1. Platform hero: stack or shelf?**
- `/us/landing-pages/platform`: the **stack**. It looks like a phone's Wallet; the front card plays a stamp, points or
  level moment, then slides away.
- `/us/landing-pages/platform?hero=shelf`: the **shelf**. A straight row of nine cards: three stamps, three points, then
  one shop at Bronze, Silver and Gold.
- Compare on the phone, in the first screen:
  - Do you see stamps, points *and* a level before scrolling?
  - Does it feel alive (stack) or like a catalogue (shelf)?
  - The shelf is cheaper and shows "levels climb"; the stack shows "your card updates".
- **Choice 1: stack or shelf.** If you pick the stack, say yes to the patch in "Left alone": it shrinks the desktop
  stack so the whole card sits above the fold.

**2. Phone menu: sheet or drill-down?** (only on the US landing pages for now)
- On any of the URLs above, tap the burger:
  - the default is the **index sheet**: all six features as tiles, the trial button pinned at the bottom;
  - add `?menu=drill` (for example `/us/landing-pages/platform?menu=drill`) for the **drill-down**: five big rows, and
    "Product" slides in a second screen.
- Compare:
  - How many taps to reach a feature: one on the sheet, two on the drill-down.
  - Which one feels like Stampeo and not a template.
  - Both keep "Get started" in view.
- **Choice 2: sheet or drill-down.** The winner then ships site-wide (STA-555).

**3. Then walk the six feature pages**, to check that each feels built for its feature:
- `/us/landing-pages/platform/card-design`
- `/us/landing-pages/platform/mobile-scanner`
- `/us/landing-pages/platform/push-notifications`
- `/us/landing-pages/platform/analytics`
- `/us/landing-pages/platform/promotional-campaigns`
- `/us/landing-pages/platform/geolocation`

Tap the controls:
- the analytics "With Stampeo" toggle and Starter/Growth/Pro;
- the scanner's four options;
- the campaigns "Send now" and the idea chips;
- the push "Your words";
- the card-design palettes.
