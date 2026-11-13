# UX Review: STA-552
MODE: POLISH   DOMAIN: showcase
VIEWED: code + screenshots (390x844, 1440x900, plus a prefers-reduced-motion pass), local dev on :3081
VERDICT: FIXED WITH FINDINGS

Reference: `/us/landing-pages/platform`. Platform renders exactly as before: none of its components import a file
changed here, and every shared default was rendered before and after the edits and compared byte for byte
(FAQList, LpFaq default and no-eyebrow, LiveActivityFeed default / cardOnly / cardOnly+stillWhenReduced,
NotificationPhoneDemo): all identical. The snapshots in `default-renders.test.tsx` stay green. Today's
`/en/features/*` pages use only the default paths.

Shots live in `docs/features/STA-552/shots/polish/` (git-excluded):
- `before/before-<page>-<390|1440>-<section>.png`: every section of the six pages, before the edits, plus `-full.png`.
- `after/after-<page>-<390|1440>-<section>.png`: the four changed pages after the edits, the same way.
- `after/after-<page>-<390|1440>-rm-<section>.png`: the five previews with reduced motion on.
- `after/after-<state>-<390|1440>.png`: an opened FAQ row, the "Your customers" tab, the "Your own words" tab.

Measured on all six pages at both widths: no horizontal overflow, and only the site's own fonts (Geist, Caveat). Every
"small" tap target that remains has a 44px+ hit area through `::after`: the playground icons (38px drawn, -3px inset)
and the row titles in `HoverRows` (the whole row).

## Fixed

Per page, what changed and the shots to compare:

**Card design** (`before|after-card-design-{390,1440}-faq.png`, `after-card-design-faq-open-{390,1440}.png`)
- `components/ui/FAQList.tsx:10-41`: the FAQ rows had a 1.5px near-black border and a 3px black offset shadow
  (`blog-card-3d`, the blog's look). This was the one block that looked like a different site. Added an optional
  `table` prop: one white table with hairline rows, like the How and Plans tables. Each row is at least 56px, the
  question is 18px semibold, and the chevron is the one in the CTA pair ("Try the designer ⌄"). With `table` left
  out, the default output is byte-identical.
- `components/landing-pages/shared/LpFaq.tsx:10-34`: a page's `eyebrow` already switched it to Platform's centred
  header. It now also picks the table and centres the contact line under it. LpFaq without an eyebrow (the
  how-it-works, features and outcomes pages) is unchanged.

**Promotional campaigns** (`before|after-promotional-campaigns-{390,1440}-ideas.png`, `-faq.png`,
`after-campaigns-faq-open-{390,1440}.png`)
- The FAQ: same fix as on card design.
- `feature-previews/push-notifications/LockScreenSlice.tsx` (thumb size): each idea sat on a deep-blue
  (#1a1a2e→#0f3460) lock-screen slab. Platform uses no navy anywhere, and its v2.1 test pins "no wallpaper, no
  gradient" for its notification. The thumbnail is now the dark iOS notification alone, sitting straight on the
  page as on Platform.
- `feature-previews/promotional-campaigns/IdeasSection.tsx:10-15`: the thumbnails were drawn 240px wide and shrunk
  to 128px, so the message (the row's whole point) printed at about 7px on a phone. They are now drawn 200px wide
  and 124px tall (measured to fit the longest message, 118px), and print at about 9px. At 1440 they are 200px wide,
  the width of Platform's card thumbnails.

**Push notifications** (`before|after-push-notifications-{390,1440}-wording.png`, `after-push-wording-words-{390,1440}.png`)
- `LockScreenSlice.tsx` (pane size): the navy slab in the white toggle card is now on the page's warm grey tray
  (`--background-subtle`, 28px radius, the glance tray's shape). The clock is in ink at weight 200, under the same
  dark notification. It now reads as Platform's dark notification on a light surface, and the lock-screen cue is
  kept. The text-shadow is gone, since the clock no longer sits on a dark wallpaper.

**Analytics** (`before|after-analytics-{390,1440}-activity.png`, `after-analytics-activity-customers-{390,1440}.png`)
- `components/features/analytics/LiveActivityFeed.tsx:48,54-55,97-103`: the feed card had the same inked 3D border.
  Added an optional `soft` prop that swaps it for a light ring. With `soft` left out, the default output is
  byte-identical, including the `cardOnly` paths used by Features and How-it-works.
- `feature-previews/analytics/CustomersMini.tsx:23`: the same 1.5px black border and 3px black shadow, swapped for
  the light ring. It is full width inside its tray.
- `feature-previews/analytics/ActivitySection.tsx:6,26-40` and `GlanceTiles.tsx:3-5,17`: both panes now sit on the
  glance pane's tray (now `TRAY`, exported from GlanceTiles, so the two share one definition). This puts white
  dashboard tiles on the dashboard's grey, the same as two sections above, so the page's two toggle cards look alike.
- `feature-previews/analytics/QuestionMinis.tsx:149,162`: raw `#f97316` swapped for `var(--accent)` (same pixels).

**Mobile scanner**: nothing changed. It already reads as Platform at both widths
(`before-mobile-scanner-*`).

## Mobile findings
- Card design FAQ at 390 (`FAQList`/`LpFaq`): rows were 100–110px tall cards with 20px gaps. They are now 58–82px
  rows, so the section is about 220px shorter (904 to 686px). Fixed.
- Campaigns ideas at 390 (`IdeasSection.tsx:15`): the message text was about 7px, now about 9px. Fixed.
- Analytics questions at 390 (`feature-previews/analytics/TileFrame.tsx:19`, `QuestionMinis.tsx`): the minis are
  drawn at 232px and shrunk to 128px (0.55x). The big figures (61%) and the chart shapes read, but the row labels
  and counts print at about 5–6px. The scanner counter minis (`mobile-scanner/AppScreen.tsx:27`) are the same, at
  about 7px. Left alone: see below.
- Analytics "Live activity" pane at 390: `ToggleCard` stacks both panes in one grid cell so the card never changes
  height, so the shorter pane leaves about 100px of white under its facts. Platform's toggle card does the same.
  Left alone.
- Push moments at 390: `NotificationSequenceDemo` puts the phone (cut at 520) before the moment list. You tap below
  and the phone above changes. Left alone (see Brief drift).
- Checked and fine: the card design wallet phones cut at about 286px behind the three-row table read well. The
  44px toggles from c022658 hold (Program type, anatomy Stamps/Points, both sliders). Reduced motion keeps the
  moments demo on its first moment, the feed still, and every row open (`after-*-rm-*`).

## Brief drift
- Ideas rows: the brief had a `LockScreenSlice` per row. The notification now stands alone with no wallpaper,
  which is Platform's v2.1 rule. Fine.
- Wording panes: the brief had a `LockScreenSlice` with the product demo's navy. It is now the warm tray. Fine, and
  it matches the glance and activity trays.
- Activity panes: the brief had `LiveActivityFeed cardOnly` bare. The feed and the customers card are now on the
  glance tray with a light frame. Fine.
- Moments at 390: the brief says "the moment list, then the phone". The live component shows the phone first.
  Acceptable. Changing the order needs an optional prop on a live component, so it is Harry's call.
- FAQ: still a narrow column, collapsed, eyebrow and centred title as briefed. The rows are now a table.

## Copy flagged
- `lib/landing-pages/copy/previews/card-design.ts` FAQ "Can you create the card for me?": "Most cards are ready
  within 48 hours". The claim comes from today's approved catalog FAQ, not from STAMPEO.md. For Harry and
  stampeo-copywriting to confirm.
- `feature-previews/mobile-scanner/CounterMinis.tsx` points mini: "12.50 $". This matches the Scanner app's
  `AmountDisplay` (symbol after the amount for every currency), but a US owner expects "$12.50". This is a
  scanner-app follow-up, not a preview string.
- Analytics hero `DashboardDuo`: the captures print "Paris (GMT+1)" (STA-548).

## Left alone
- **Three notification looks on the push and campaigns pages.** The heroes and the How phone
  (`NotificationPhoneDemo`) show light iOS banners on the product demo's navy lock screen. The moments phone
  shows white banners on the wallet. Wallets, wording and ideas now show Platform's dark notification. A phone in
  a bezel needs a wallpaper, and `NotificationPhoneDemo` is the live demo also used on the how-it-works and
  outcomes landings, so this is a direction call rather than polish. Option: an optional `dark` prop on
  `NotificationPhoneDemo` that draws `LockScreenNotification` (default stays byte-identical, snapshot-pinned).
  For Harry.
- **Readable minis at 390** (analytics questions, scanner counter). `HoverRows` fixes the phone thumbnail column
  at 128px for Platform too. Widening it needs an optional `HoverRows` prop and a call on how much the words
  column (now 210px, with 28px titles) can give up. Another option is a stacked phone layout for data rows. For
  Harry, then a builder.
- **`LiveActivityFeed` clips its fifth row.** The body is 5×48+16px tall with 32px of padding, so the last row
  touches the card's bottom edge. This happens on every page that shows the feed, the live analytics page
  included. It is a layout fix in a live component's default, so the call is Harry's, outside this pass.
- **Demo Stamps/Points segmented is 32px tall** (`LpDemo` → shared HeroDemo). It is the live demo, and Platform
  shows it too.
- **Glance "Visits over time" keeps its fixed 72px chart** at desktop (`platform/DeliverAnalytics.tsx`, Platform's
  component). It reads. A taller chart would need an optional height prop. Not needed.
- **Scanner minis' raw hex** (`mobile-scanner/AppScreen.tsx:10-24`, `TeamMinis.tsx:69`, `CounterMinis.tsx:15`):
  these are documented as the Scanner app's own palette, a different product, so they stay as hex.

## Verification
- `bun test lib scripts`: 5454 pass, 4 skip, 0 fail, 19 snapshots
- type-check: pass   lint: pass (0 errors; 6 warnings in files this pass did not touch)
- Byte-identity check of every shared default touched: identical (rendered before and after, compared)
- screenshots: `docs/features/STA-552/shots/polish/before/` (123), `docs/features/STA-552/shots/polish/after/` (180)

## Addendum (coordinator, after Stage Q1, 33f5512)
- "Readable data minis at 390": handled. `HoverRows` gained an optional `stackOnPhone` (default byte-identical); analytics questions and scanner counter stack at 288px (smallest label ≥ 11px), campaigns ideas at 216px (message ~15px). Sections are longer on phones (about 2.9 / 2.6 / 1.9 screens); judged worth it from the 390 shots.
- "LiveActivityFeed hides part of its fifth row": fixed under the previews' `soft` frame only. The live pages (analytics, features, how-it-works) keep the bug: follow-up.
- "Three notification looks": kept. The phone lock screens show iOS's light banners on a wallpaper, the floating cards show Platform's dark notification; each matches its context. Harry may veto.
