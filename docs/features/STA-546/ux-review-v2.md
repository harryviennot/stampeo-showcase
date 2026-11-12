# UX Review v2: STA-546
MODE: POLISH   DOMAIN: showcase
VIEWED: code + screenshots (390x844, 1440x900, 1024x768; reduced motion at 390)
VERDICT: FIXED WITH FINDINGS

How I looked: `next dev` on 3025 in the worktree. I shot every section of the four pages at 390, 1440 and 1024 with headless Chromium (America/New_York, scrolled through first). I compared Platform with `shots/passentry/desktop-*`. I checked that the demos stand still under `reducedMotion: "reduce"` and still move without it. I scanned every heading for a lone last word at the three widths. All shots are in `shots/polish-v2/` (git-excluded): `before-*`, `r1-*`/`r2-*` (rounds), `after-*`, `rm1-*`/`rm0-*` (reduced motion), `z-*` (zooms).

## Fixed

### Item 1: the Messages card was empty below the cups
- `components/features/notifications-push/NotificationSequenceDemo.tsx:50-63,111-112`: new optional prop `fullCard` (default `false`). It turns on the card's fields and QR code.
- `components/landing-pages/shared/AurevoCard.tsx:30-47`: `aurevoDesign()` gives Aurevo's design with the Member / Reward fields. `AurevoCard` draws through it, so there is still one source.
- `components/landing-pages/features/MessagesSpotlight.tsx:44-51`: passes `aurevoDesign()` and `fullCard`. The card is now a whole pass (cups, Sophie / 8th free, QR) at 390 and 1440. Its height is unchanged, so the banner has not moved.

### Item 2: tap targets in the compact designer
`components/features/design-de-carte/CardDesignPlayground.tsx`, all compact-only branches:
- **Theme swatches** (`:283-298`): now 44px, the size of the own-icon tiles. The row gets `py-1` so the selected ring no longer touches the THEME label.
- **Preset icons** (`:353-373`): a 3px invisible `::after` ring gives each one a 44px hit area. They now sit in a 6-column grid, so the twelve icons fall in two even rows. Before, there were 11 + 1 at 1440 and 10 + 2 at 1024.
- **Card** (`:239`): it now shows its QR code, so the card no longer ends in an empty dark third.
- **Grid** (`:218-224`): it drops its own `max-w-6xl`.
- `components/landing-pages/how-it-works/CreateStep.tsx:19,27`: drops the matching `max-w-6xl`. At 1440, Step 1's heading and footer were at x=145 while every other section starts at x=72. Now they line up.

### Item 3: reduced motion
- `hooks/usePrefersReducedMotion.ts` (new): a `useSyncExternalStore` hook. It returns false on the server, so hydration matches the server markup.
- `components/features/scanner-mobile/ScanDemo.tsx:19-37,60,333`: new optional prop `stillWhenReduced`. With reduced motion:
  - the loop stops on the finished scan (the QR in a green frame with a check). That state shows inside every phone crop, while the result card does not;
  - framer's `MotionConfig reducedMotion="user"` drops the remaining movement.
- `components/features/analytics/LiveActivityFeed.tsx:44-56,76-89,98-104,146-147`: new optional prop `stillWhenReduced`. With reduced motion:
  - five rows appear once and no more are added;
  - the "Live" dot stops pulsing (`motion-reduce:animate-none!`);
  - `MotionConfig` is on.
- Passed at every landing-page use:
  - `StampStepVisual.tsx:27`, `SeeItWork.tsx:17`;
  - `ScannerSpotlight.tsx:28`, `AnalyticsSpotlight.tsx:24`;
  - `HowTable.tsx:36`, `PlatformSection.tsx:32`.
- Checked: the same section shot twice, 3 s apart, is identical under `reduce` (6/6) and differs without it. No hydration errors in the console.

### Item 4: PhoneCrop clipped the phone's shadow
`components/landing-pages/shared/PhoneCrop.tsx:3-41`:
- `ROOM` puts 16px of room on each side and 24px above inside the cut, and negative margins give that room back. `CUT` heights include the 24px. The component is `w-[calc(100%+2rem)]` below `lg`.
- Result at 390: the crop now reaches the viewport edges and starts 24px above the phone. The lighter box is gone (`z-before-scanner-crop.png` vs `z-after-…`), and nothing moved (section heights within 1px).
- Every use checked:
  - Features: spotlight, scanner, analytics, messages;
  - How-to: stamp, share;
  - Outcomes: always, slow days, regulars;
  - Platform: deliver.
- `phoneCropClass` documents that its element must not set its own width. `DeliverComposition.tsx:89` drops its `w-full`/`lg:w-auto` for that reason.
- The two hand-rolled crops on Platform get the same 24px top room: `HowTable.tsx:31` and `PlatformSection.tsx:30`.

### Item 5: Platform length at 390, from 15.52 to 15.16 screens
| Where | Change | Saved |
|---|---|---|
| `PlatformSection.tsx:10,30-34` | The scanner phone is 190px wide on a phone and cut at 300px, so both panes are the same height. The card no longer has empty space under Dashboard and is 716px tall, from 796. The tab still never moves the page. | 80px |
| `LpAccentBand.tsx:16` | Outer section `py-4` on a phone (the band brings its own padding). | 64px |
| `ProgramTypeRows.tsx:89` | Rows `py-4` on a phone. | 24px |
| `ProgramTypeRows.tsx:97` | Title `text-h2 lg:text-h1`: 34px was heavy beside a 128px card. | – |
| `HowTable.tsx:42` | Cells `p-5` on a phone. | 24px |
| `NumbersBlock.tsx:21` | `gap-6` between the figures. | 32px |
| `ShareTree.tsx:93` | `gap-4` between rows. | 20px |
| `LpBlogPosts.tsx:30-31` | `mt-8`, `gap-4`. | 12px |

Nothing was removed.

### Item 6: craft across the pages
- `components/landing-pages/how-it-works/StampStep.tsx:7,14` and `StepHeading.tsx` (its now-unused `align` prop removed): Step 3 had the eyebrow and a centred heading, the pattern kept for Platform. Its heading is now on the left like Steps 1 and 2, with the two phones under it.
- `components/landing-pages/outcomes/SegmentChips.tsx:4-24`: the "Every plan" chip wrapped into the segment row and read as a sixth group. It now has its own line.
- `components/features/notifications-push/NotificationSequenceDemo.tsx:180`: the moment chips were `text-[11px] py-0.5`, and the `PlanLine` chip under them was `text-xs py-1`. They now match `PlanChip`. They only render when a page passes `moments`.
- `components/landing-pages/platform/ProgramTypeRows.tsx:122`: the closer was the only square box on the site. It is now `rounded-2xl`, like the How table.
- Lone last words in headings:
  - `GlassCard.tsx:23`: "Updates on every / scan" is now "Updates on / every scan";
  - `PlatformToggleCard.tsx:65`: "Everything in one / place" at 1024;
  - `components/blog/BlogCard.tsx:37-43` (rich mode only): "…Should You / Run?" at 1024.
- After these, a scan of every heading at 390, 1024 and 1440 finds only the shared pricing h2 (see Left alone).

### Item 7: what a founder would flag
- `components/landing-pages/{platform,features}/ProgramTypesSection.tsx`: the Marginalia points card had a big empty green half. It now shows its QR code like the stamps card.
- `components/landing-pages/platform/HowTable.tsx:40`: at 1440 the scanner phone was a black slab above the table. The desktop overlap is now `-mt-24`, from `-mt-44`, so the card's QR code and the scanner frame show above the table. The section grows about 80px at 1440.
- `components/landing-pages/platform/DeliverComposition.tsx:85`: the desktop Analytics glass card sat over the Aurevo QR code. It moves to `top-[404px]`, clear of the card, at 1024 and 1440.

## Mobile findings
- Item 4: the shadow clip at 390. Fixed.
- `PlatformSection.tsx:30`: about 120px of empty card at 390. Fixed.
- `CardDesignPlayground.tsx:288,359`: swatches 40px and icons 38px, under 44px. Fixed.
- Re-measured at 390 on all four pages:
  - `scrollWidth` = 390;
  - H1, sub and CTA are above the fold, because the heroes are unchanged;
  - the longest stretch without "Start my free trial" is 3.9 screens, on How-to (3.22 → 7.08) and Platform (5.35 → pricing at 9.14);
  - no tinted bands are adjacent.
- Lengths: How-to 14.43, Features 15.35, Outcomes 12.51, Platform 15.16 screens.

## Brief drift
| Section | The brief said | Now | Fine because |
|---|---|---|---|
| Platform toggle, scanner at 390 | Cut at 380 | 190px wide, cut at 300 | It keeps the card at one height. |
| Platform How, desktop | The table covers the phones' lower 40% | About 22% | Otherwise the scanner showed nothing. |
| How-to Step 3 | Centred heading | Left | The steps read as one sequence, and eyebrow + centre is Platform's. |
| Platform program rows at 390 | `text-h1` title | `text-h2` | Matches PassEntry's phone rows, which drop to a smaller title. |
| Points cards, compact designer card | No QR | QR code | Every other sample card on these pages has one. |
| Accent band at 390 | `py-12` around the band | `py-4` | The gap to the sections either side is still 80px. |

## Copy flagged
- `lib/landing-pages/copy/program-types.ts:26`: "Reward your regulars more" wraps to two lines in the 210px column at 390 (`after-platform-390-program_types.png`). The other two eyebrows fit on one line. For stampeo-copywriting.
- `lib/landing-pages/copy/outcomes.ts:30-31`: "6×" and "6X" are still both on screen (flagged in v1).

## Left alone
- **The Platform hero fan.** `components/landing-variant/HeroCardFan` cards (Xenika, Vanity, Marginalia) show empty lower halves at 1440 and 1024. AC16 forbids edits under `landing-variant/`. Owner: Harry. Either allow a QR-on edit there, or fix it when `/us` is replaced.
- **`LevelCards`' `showQR={false}`** is pinned (`shared-sections.test.ts:137`). The Bronze card's white lower half is mostly hidden by the banner; it is visible in the Platform levels row. Owner: you, if the pin should go.
- **The Features page is 15.35 screens at 390.** Its tallest section, `spotlight_messages` at 1.48, can only shrink by cutting the phone at 440. That would break the `phoneCropClass(520|560)` pin in `features-page.test.tsx:168`. Owner: you.
- **`ScanDemo`'s result card** slides up from the phone's bottom, which every phone-width crop cuts off. For about 2.6 s of each 5.8 s loop the visible frame is empty. Changing the loop changes `/features/scanner-mobile`. Owner: a follow-up (for example an optional prop that keeps the result card higher).
- **`PricingSection`'s "Simple, transparent pricing"** ends on "pricing" alone at 390. It is a shared `/us` component, outside this diff.
- **Mixed card styles.** `blog-card-3d` (black border, hard shadow) on the blog cards and the live feed sits beside the pages' soft ringed cards. These are the components' own site-wide style. Owner: Harry's call.
- **Share tree, desktop.** The accent part of each branch stops on a hard colour change at 30%, as specified in the brief. A gradient stroke would be smoother. Owner: design follow-up.
- **`components/ui/LanguagePicker.tsx:58`** keeps its file-local `usePrefersReducedMotion`. It could use the new hook. Owner: a later cleanup.
- **For you (test pins):**
  - `shared-sections.test.ts` AC15v2 lists `["moments","design"]` for `NotificationSequenceDemo` and `["chrome"]` for `ScanDemo`. Consider adding `fullCard` and `stillWhenReduced`.
  - `LiveActivityFeed` (with `cardOnly`, `stillWhenReduced`) is not in that list at all.
  - I checked by hand that the default markup is byte-identical to HEAD for all five extended components. That was 8 `renderToStaticMarkup` cases: `NotificationSequenceDemo` ×2, `CardDesignPlayground`, `ScanDemo` ×2, `LiveActivityFeed` ×2, `BlogCard`.

## Verification
- type-check: pass. lint: pass (0 errors; the 6 warnings are in untouched `landing-variant/*` and `consent-ledger.test.ts`). `bunx eslint` on the changed files: clean.
- tests: `bun test lib scripts`: 4973 pass, 0 fail.
- screenshots: `docs/features/STA-546/shots/polish-v2/`.
  - `after-{page}-{390,1440,1024}-{section}.png` and `-fold`;
  - `after-platform-{390,1440}-platform-scanner.png`;
  - `rm1-*`/`rm0-*`;
  - `z-before-/z-after-scanner-crop.png`.
