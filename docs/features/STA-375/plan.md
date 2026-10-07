# Plan: New niche brand cards in the landing sector carousel

ISSUE: STA-375 (https://linear.app/stampeo/issue/STA-375)
BRANCH: feat/sta-375-sector-carousel-niche-cards (from `dev`)
REPOS: showcase
MIGRATION: no
STATUS: APPROVED (2026-10-05, Harry: 6 brands)

## Problem

The landing section "Stampeo adapts to your business" shows five sample businesses. For the US ad kit we designed nine more fictional brands and rendered them as real Apple Wallet passes. Harry wants them on the landing page too, so a visitor coming from a niche ad sees the same breadth of businesses, and the same cards, as the ads.

## Decisions

- Recommended: add 6 of the 9 brands (Fournée, Lashwell, Harvest Row, Rolling Slice, Saltmoss, Smash Club), for 11 slides. Ondine, Glossé and Nonna Lu duplicate slides already there (see UX decisions). Harry chose 6 at the gate (2026-10-05).
- Cards are drawn by the showcase's own `WalletCard` (like the five existing slides), using the same logos, colors, icons and photos as the Wallet renders. No screenshots on the page.
- Fill states match the ad renders: Fournée 9/10, Lashwell 4/6, Rolling Slice 5/8, Saltmoss 3/6, Smash Club 7/10, Harvest Row 165 pts on a 100/200/400 ladder.
- Currency-free copy for the new entries: Harvest Row's next reward is "10% off" at 200 points (the percent milestone on its track), not "$5 off". The en catalog serves Europe, `/us` and `/uk`, so a currency-free reward is true everywhere.
- Food photos are public domain or CC0 (Wikimedia Commons): croissant "Croissant-newspaper-and-tea.jpg" (CC0), pepperoni "Slice Shack by Mary's - June 2025" (CC0), cheeseburger "Cheeseburger.jpg" (PD). No attribution required; recorded here for provenance.
- Copy is written natively in en, fr, es, pl under the stampeo-copywriting skill (no em dashes; tú; Polish gender-neutral with full plural forms where a count appears).
- Out-of-scope accuracy problems found while scoping were raised at the gate and left as-is by Harry (see Non-goals).

## UX decisions

From `ux-brief.md` (ux-designer, MODE: DESIGN).

- PLACEMENT: `components/landing-variant/VariantSectorCards.tsx`, the existing section. No new page: it is the only landing section that argues "this fits your kind of shop".
- ENTRY: homepage scroll on `/`, `/fr`, `/es`, `/pl`, `/us`, `/uk`; swipe on phones, arrows and dots from md up, autoplay 6s.
- ADDED: six slides in this display order (catalog indices 5-10 appended; 0-4 untouched):
  0 Barbershop · 1 Café · 2 Restaurant · 3 Beauty salon · 4 Bakery (Fournée) · 5 Lash studio (Lashwell) · 6 Grocer (Harvest Row) · 7 Food truck (Rolling Slice) · 8 Spa (Saltmoss) · 9 Burger joint (Smash Club) · 10 Bookstore (Marginalia, moved from 4) - answers "does it fit my shop?" for six more sectors; keeps the subtitle's four examples first; no two greens adjacent; never more than two dark frames in a row (loop wrap included).
- ADDED: optional `pointsRewardIcons` on `SectorTheme`, passed through as `points_reward_icons` - prevents Harvest Row's three milestones all showing a gift.
- REJECTED: Ondine (reads as a copy of the Barbershop slide: same scissors, the frame's exact gold), Glossé (Vanity is already the nail story, on points), Nonna Lu (same sector, engine and photo strip as Xeniká; duplicate "Restaurant" name collides as the React key). Also rejected: faster autoplay, bigger dots, arrows on phones, category chips, two carousels, `?sector=` deep links, widening the card's logo slot.
- MOBILE: unchanged shape. One 350px slide, card 240px, story stacked below; all slides take the height of the tallest, so new quotes stay within each locale's current longest. Dots row 188px wide at 11 slides: fits 390px.
- REUSES: `SectorCarousel`, `CenterCarousel`, `WalletCard`, `PointsStrip`, preset icons, the `DISPLAY_ORDER` pattern from `CardStyleGallery.tsx:61-81`. NEW: none.

## Non-goals

- Ondine, Glossé, Nonna Lu (Harry chose 6 brands).
- The Barber slide's advantage line "A notification when he walks past the shop" claims geofencing, which is not live (`WALLET_LOCATIONS_ENABLED = False`). Raised at the gate; Harry chose to leave it (2026-10-05).
- `/us` shows the en sector copy with euro amounts. Raised at the gate; Harry chose to leave it (2026-10-05).
- Section title and subtitle copy: unchanged (still true for slots 0-3).
- Carousel behavior (autoplay, dots, arrows), `WalletCard` logo slot, per-market slide order.

## Edge cases considered

- Catalog and theme counts drift apart: `flatMap` would silently drop slides. Now caught by a test (AC1).
- A locale missing one new entry: caught by the existing i18n catalog test.
- Duplicate sector names within a locale (React key): caught by AC4.
- Missing asset file (typo in a theme URL): caught by AC5.
- Polish has no blog: new pl links point at `/program-lojalnosciowy` (existing test enforces no `/blog` links in pl).
- en, es and pl have no bakery or beauty guides: those slides link to the generic guide that exists, and the link label says what it is, never "Read the bakery guide".
- Wide wordmarks (Lashwell, Saltmoss) render about 21px tall in the 102px logo slot, as they would in a real Wallet pass: accepted, padding trimmed.
- Reduced motion, autoplay pause, loop clones: unchanged component behavior, considered and not touched.

## Acceptance criteria

- AC1: Given each locale's `landing.sectorCards.sectors`, then its length equals the number of sector themes, and every display slot maps to exactly one catalog index (a permutation: none dropped, none repeated).
- AC2: Given the display order, then slots 0-3 are Barbershop, Café, Restaurant, Beauty salon (catalog 0-3) and the last slot is Bookstore (catalog 4).
- AC3: Given the display order as a loop, then no three consecutive slides have dark frames (frame luminance below 0.5), including across the wrap.
- AC4: Given any locale, then every sector name is unique.
- AC5: Given every theme, then each asset URL it references (logo, custom stamp processed and greyscale images, strip image) exists under `public/`, and each new asset file is at most 60KB.
- AC6: Given the Harvest Row theme, when its wallet design is built, then `points_reward_icons` maps its three rewards to basket, percent and gift; and given the five existing themes, then their built designs are unchanged (no `points_reward_icons` key).
- AC7: Given each locale, then every new entry's quote is no longer than that locale's longest existing quote, and its reward pill is at most 38 characters.
- AC8: Given every locale, then every new entry's `link` resolves to a real route (existing internal-links test), and pl links are not `/blog` (existing test).
- AC9: Given the landing page at 390px in en, fr, es and pl, when each new slide is centered, then the card, logo and photo stamps render (images loaded), the story text does not overflow the slide, and NOT any horizontal page scroll.

## File layout

- `components/landing-variant/sector-themes.ts` (new): the theme data and `SECTOR_DISPLAY_ORDER`, moved out of `VariantSectorCards.tsx` so the component stays small and the data is testable.
- `lib/landing/sector-slides.ts` (new, in a domain subfolder: `lib/` already has 80+ files): pure helpers `orderSectorSlides(sectors, themes, order)` and `sectorWalletDesign(theme, fields)` (the design object currently built inline in `SectorCarousel.tsx`).
- `lib/landing/sector-slides.test.ts` (new): AC1-AC7.
- `components/landing-variant/SectorCarousel.tsx`: `SectorTheme` gains `pointsRewardIcons?`; `SlideCard` calls `sectorWalletDesign`.
- `components/landing-variant/VariantSectorCards.tsx`: imports themes and order, uses `orderSectorSlides`.
- `messages/{en,fr,es,pl}/landing.json`: six entries appended to `landing.sectorCards.sectors`.
- `public/themes/{fournee,lashwell,harvest-row,rolling-slice,saltmoss,smash-club}/`: logo plus photo stamps with grey copies (food brands only).
- No file near 800 lines; `components/landing-variant/` stays under 30 files.

## Touched areas and risks

- i18n: four catalogs, array parity and link tests; native copy in each locale.
- Paid landing page weight: six logos plus three photo-stamp pairs, budgeted at ≤60KB per file.
- Card look: `WalletCard` is a hand copy of web's; unchanged here.
- The landing hero and gallery do not read these themes; no other page is affected.

## Docs impact (preliminary)

Probably none: marketing page content, no product behavior, setting, error copy or pricing change.

## Draft copy (en; fr, es, pl written natively at implementation)

| Slot | Name | Reward pill | Quote | Advantage | Card fields |
|---|---|---|---|---|---|
| 4 | Bakery | 10 croissants = 1 free | Ava stops by for a croissant on her way to work. Nine visits in, she can see her tenth is on the house. | Your own product photos as stamps | Cardholder Ava · Reward Free croissant |
| 5 | Lash studio | 6 fills = 1 free | Maya comes back every three weeks for a fill. Her sixth is free, and her phone shows her how close she is. | Your logo, your colors, your stamp icon | Client Maya · Reward Free lash fill |
| 6 | Grocer | 10% off at 200 points | Rosa shops with you every week: a full cart one week, just bread the next. Points follow what she spends, so big weeks count more. | Big baskets earn faster | Cardholder Rosa · Next reward 10% off |
| 7 | Food truck | 8 slices = 1 free | Leo finds the truck wherever it parks. His card lives in his phone, so every slice counts, on every street corner. | No counter, no paper, no hardware | Cardholder Leo · Reward Free slice |
| 8 | Spa | 6 facials = 1 free | Elena books a facial every month. Her sixth one is on you, and every stamp shows up on her lock screen. | A notification with every stamp | Client Elena · Reward Free facial |
| 9 | Burger joint | 10 burgers = 1 free | Jordan grabs a burger every Friday after work. Ten in, the next one is on the house, and he can watch it get closer. | One scan at the till, no line | Cardholder Jordan · Reward Free burger |

Links (en): bakery, lash studio, food truck, spa, burger → `/blog/digital-stamp-card` ("Read the stamp card guide"); grocer → `/loyalty-programs` ("Compare stamps and points"). fr bakery → `/blog/carte-fidelite-boulangerie`; fr lash studio and spa → `/blog/fidelite-institut-beaute`. pl → `/program-lojalnosciowy`.
