# UX Review: STA-552 v3 (+ STA-546 Platform hero, STA-555 phone menu)
MODE: POLISH   DOMAIN: showcase
VIEWED: code + screenshots (390x844, 360x780, 1440x900, reduced motion at 390 and 1440, phone menu at 390/360/320)
VERDICT: FIXED WITH FINDINGS

Branch `feat/sta-552-feature-previews` at 764318d, `next dev` on 3161, headless Chromium, `America/New_York`,
load + scroll through + 2.5 s, Next's dev overlay and (for section shots) the fixed header hidden. No cookie banner
appeared on the US pages, so there was nothing to refuse. Shots (git-excluded):
`docs/features/STA-552/shots/v3-polish/{before,after}/<page>-<viewport>-{fold,full,sec-NN-<section>}.png`, where page
is `platform | push | campaigns | analytics | scanner | carddesign | geo` and viewport is `390 | 360 | 1440 | 390rm |
1440rm`. The menu is `menu-{390,360,320}.png`. The `audit-*.json` files hold the overflow and tap-target sweep.

**Sweep, all 7 pages at 390, 360 and 1440, before and after: no horizontal scroll** (`scrollWidth == clientWidth`, and
no unclipped element past the viewport). No page errors.

## Platform (`/us/landing-pages/platform`), checked against 927bf77

The 927bf77 reference is the foundation's (`shots/v3-f/platform-927-*`, `v3-f/sec/p927-*`). Note that it was shot
with reduced motion: its "Built for" chips are the wrapped reduced-motion grid. `TypeMarquee` has not changed since
927bf77, and `platform-390rm-sec-01-marquee.png` matches it.

- **Matches 927bf77** for deliver, how, the platform toggle card, program types, share, pricing and the final band,
  at 1440 and 390. The only differences are the keycaps, the orange labels, the 95% stat and the phone hero.
- **Hero:** at 1440 the fan is identical to 927bf77. On phones the still stack shows the front card whole. Reduced
  motion gives the same picture. The CTA stays above the fold at 390x844 (y 707 to 757) and at 360x780.
- **Fixed: the four figures were much smaller than 927bf77's.**
  - Where: `components/landing-pages/platform/NumberFigures.tsx:31`.
  - Before, from `lg`: `clamp(3rem,1rem+3.5vw,4.5rem)`, 66px at 1440, against 93px in 927bf77's three-across row.
    Now `clamp(3rem,5.6vw,5.5rem)`: 57px at 1024, 81px at 1440, 88px max.
  - "20,000+" still fits its column at every width: 166/222px at 1024, 234/306 at 1440, 255/306 at 1920.
  - The three-figure default is untouched (snapshot unchanged). Phone and tablet sizes are unchanged.
  - Shots: `platform-1440-sec-03-numbers.png`.

## Push notifications

- **No change.** Split hero, the timeline (card left, notification right at 1440, stacked at 390), the clean
  floating cards and the editor all read cleanly at every width.
- Its notifications already use `ShopIcon`; it is the reference for the icon tile below.

## Promotional campaigns

- **Fixed: the idea cards' names were grey pills.**
  - Where: `components/landing-pages/feature-previews/promotional-campaigns/IdeasSection.tsx:5-6, 18`.
  - The name ("Slow afternoon"…) is now an `h3` card title, in the same style as the analytics chart cards, the push
    page's floating cards and `GlassCard`. Same text, same order.
  - This removes the last pill label from the previews' content. That kind of pill read as the rejected v2 look.
  - Shots: `campaigns-{390,360,1440}-sec-03-ideas.png`.
- **Fixed: the delivery card was the only full-width card on the page.**
  - Where: `components/landing-pages/feature-previews/promotional-campaigns/DeliverySection.tsx:18-23`.
  - At 1440 it spanned 72 to 1368px, under ideas cards at 200 to 1240, with its stats panel floating in an empty
    left half. It is now wrapped in `mx-auto max-w-[1040px]`, so its edges line up with how, ideas and the steps
    table, and the panel fills its column. Phones are unchanged.
  - Shots: `campaigns-1440-sec-04-delivery.png`.
- **Fixed: the "Your message" card had a 24px radius beside 28px lock-screen tiles.**
  - Where: `components/landing-pages/feature-previews/promotional-campaigns/MessageToLockScreens.tsx:22`.
  - It is now 28px. Shots: `campaigns-390-sec-01-how.png`.

## Analytics

- **Fixed: the chart cards were 24px on phones and 28px from `sm`.**
  - Where: `components/landing-pages/feature-previews/analytics/ChartsSection.tsx:50`.
  - Every other preview card is 28px at every width; the chart cards now are too.
  - Shots: `analytics-{390,360}-sec-02-charts.png`.
- No other change.
  - The key-numbers hero, the blind-spot cards (production's look, kept), the bento grid at 1440 and the customer
    list read well.
  - The chart grid (1200px) and the customer list are a little wider than the 1040px used on other pages. They are
    consistent with each other, so I left them.

## Mobile scanner

- **No change.** The split hero, the counter (tiles 2x2 on phones), and the app-or-browser cards are clean. The
  device chips are neutral tags with no ink border.

## Card design

- **Fixed: the three type titles did not line up at 1440.**
  - Where: `components/landing-pages/feature-previews/card-design/TypesSection.tsx:39`.
  - The levels fan is shorter than a card, so "Levels" sat 13px above "Stamp card" and "Points card".
  - From `lg` each picture now sits in a card-tall (308px) box, centred, so the three titles share a line. Phones
    are unchanged.
  - Shots: `carddesign-1440-sec-02-types.png`.

## Geolocation

- **Fixed: the notification icon tile.**
  - Where: `components/landing-pages/feature-previews/geolocation/LockScreenPhone.tsx:8, 31`.
  - Push and campaigns use `ShopIcon` (40px, with a sheen). The geolocation hero used `lpBanner`'s smaller plain
    tile. It now uses `shopBanner`, so every preview notification carries the same tile. Sender, title and body are
    unchanged.
  - The only other notifications on these pages are Platform's (`lpBanner`, 927bf77's look), which stay as they
    are. Scanner, analytics and card design show no notification.
  - Shots: `geo-{390,360,1440}-sec-00-hero.png` and `-fold.png`.

## Phone menu (STA-555)

- **No change.** At 390, 360 and 320: no overflow in the dialog, every link and button is at least 44px tall, and
  the tiles keep the nav's look. At 320, "Mobile Scanner" wraps to two lines. Shots: `menu-{390,360,320}.png`.

## Mobile findings

- `components/features/design-de-carte/AnnotatedWalletCard.tsx` (phone pins): at 360 and 390, pin 2 overlaps the
  last digit of "3 / 6" and pin 4 touches "Elena". Pin 6 floats at the card's right edge, far from the QR code.
  - This is production's component and production's pin layout. **Left alone.**
- `components/landing-pages/feature-previews/card-design/ReskinCards.tsx:154`: the six dots are 24x44.
  - That passes WCAG 2.5.8 (24px), but they are under the 44px rule. The 44px previous and next buttons sit either
    side.
  - Widening them to 36px overflows a 320px screen. **Left alone.**
- `components/landing-pages/shared/LpFaq.tsx:36` and `promotional-campaigns/CampaignsFaq.tsx:44`: the contact link is
  `inline-flex min-h-11`.
  - On a phone the paragraph wraps, and the second line ("24 hours.") drops about 20px below the first.
  - A fix that keeps the 44px target: an `after:` hit area, as the "see pricing" link already uses.
  - `LpFaq` is shared with the STA-546 landing pages, so changing it changes their output. **Left alone.**
- The push, campaigns and geolocation heroes at 360x780: the notification is cut by the fold (its top shows at about
  y 705). Readable on the first swipe. **Left alone.**
- `analytics` "Every chart" is about 3,850px tall at 390: ten stacked cards.
  - Each card reads well. The length is the plan's ("every chart"), not a layout bug.
  - If Harry finds it long, the presentation option is a horizontal swipe row on phones. **Left alone**, a product
    call.

## Brief drift

- None against plan v3. The look, split heroes, plan-free pages and the sections listed per page are all as planned.
- Platform differs from 927bf77 only where v3 allows it.

## Copy flagged (for stampeo-copywriting)

- `lib/landing-pages/copy/previews/promotional-campaigns.ts:47`: `phones: ["On iPhone", "On Android", "On iPhone"]`.
  "On iPhone" appears twice in a row of three lock screens and reads like a slip.
- `lib/landing-pages/copy/previews/geolocation.ts:29, 31` (`heroChip`, `heroNote`): "Coming soon" appears three
  times in the hero: the H1's accent, a chip under the phone below `xl`, and the handwritten note from `xl`.
  - The chip is also a pill under the hero.
  - `lib/landing-pages/previews/geolocation.test.tsx:60, 62` pins both, so removing them needs a test change.
- `components/landing-pages/feature-previews/analytics/HabitCharts.tsx:111` (Reward progress): the fifth bar
  ("Reward ready") has an empty axis label, and the axis has no unit ("0-1, 2-3…" stamps). It needs a short label
  string.

## Left alone

- `components/landing-pages/platform/classes.ts:6, 9`: `STAMPED_STAGE` and `STAMPED_CARD` are no longer used
  anywhere. Dead code to delete, for whoever owns cleanup (not presentation).
- The card-design hero caption `Chip` ("Car wash") is a neutral pill caption under the carousel, not a label.
  Kept. Harry can veto it with one line in `ReskinCards.tsx:139`.
- The dev server printed a Next.js security-advisory nudge (`next upgrade --agent=security`). I did not run it.
  Harry's call, outside this pass.

## Verification

- `bun test lib scripts`: 5859 pass, 4 skip, 0 fail, 29 snapshots (none re-recorded).
- `bun run type-check`: pass.
- `bun run lint`: 0 errors, 6 warnings, the same 6 as before (none in the files I changed).
- Screenshots: `docs/features/STA-552/shots/v3-polish/before/` and `after/`, every page at 390, 360, 1440,
  390rm and 1440rm, plus the menu.
