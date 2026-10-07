# UX Brief: STA-375
MODE: DESIGN   DOMAIN: showcase
VERDICT: READY

(Written by the ux-designer subagent; saved here by the coordinator because DESIGN mode has no write access.)

## Already shipped
None of the nine brands exist in the showcase yet; assets live only in the session scratchpad and must be copied into `public/themes/<brand>/`.

The showcase card can already draw per-reward icons for points: `WalletCard.tsx:644` passes `design.points_reward_icons` to `PointsStrip.tsx:329-332`, which falls back to `gift` only when unset (`HeroDemo.tsx:24-27,453` uses it). `basket`, `percent`, `gift` exist as presets. The only gap is that `SectorTheme` has no field for them.

Existing patterns this reuses:
- `CardStyleGallery.tsx:150-158` already runs 15 slides and 15 dots on the same `CenterCarousel`.
- `CardStyleGallery.tsx:61-81` uses a `DISPLAY_ORDER` index map to show slides in a different order from the catalog, alternating light and dark.
- Tests already guard the catalog: `i18n-catalogs.test.ts:137-153` (array entries per locale), `internal-links.test.ts` (every `link` resolves), `no-currency-glyph.test.ts:47-51` (`landing.sectorCards.*` may contain currency).

## Placement
`components/landing-variant/VariantSectorCards.tsx`, no new page or section: it is the only landing section arguing "this fits your kind of shop", and it renders on `/`, `/fr`, `/es`, `/pl`, `/us`, `/uk`.

Recommendation: add 6 of the 9 brands, for 11 slides.

| Slot | Sector | Brand | Engine | Frame tone |
|---|---|---|---|---|
| 0 | Barbershop | Les Garçons Barbiers | stamps | dark charcoal (existing) |
| 1 | Café | Aurevo | stamps | light oat (existing) |
| 2 | Restaurant | Xeniká | points | dark Aegean (existing) |
| 3 | Beauty salon | Vanity | points | dark berry (existing) |
| 4 | Bakery | Fournée | stamps | warm caramel mid-tone |
| 5 | Lash studio | Lashwell | stamps | dark cool cocoa/mauve |
| 6 | Grocer | Harvest Row | points | light cream, carrot accent |
| 7 | Food truck | Rolling Slice | stamps | near-black |
| 8 | Spa | Saltmoss | stamps | dark moss |
| 9 | Burger joint | Smash Club | stamps | light mustard-cream |
| 10 | Bookstore | Marginalia | points | dark pine (moves from 4 to the end) |

Why: slots 0-3 match the subtitle and the first slides most visitors see; bakery is the most common new sector and has a fr guide; the three greens (Harvest Row, Saltmoss, Marginalia) never touch; food, beauty and points slides are spread out; never more than two dark frames in a row, including the loop wrap.

Implementation: append the six entries at catalog indices 5-10 so 0-4 keep their pairing, and add a `DISPLAY_ORDER` map. `VariantSectorCards.tsx:158-161` uses `flatMap`, which silently drops a slide when `themes` and `sectors` lengths differ: a pure length test should close that.

## Entry points
Homepage scroll in every locale and on `/us`, `/uk`; swipe on phones, arrows and dots from tablet up, autoplay every 6s. Each slide links to a guide; every new slide needs a real target in every locale.

## Proposed additions
- Fournée (bakery, stamps, croissant photo stamps), slot 4: answers "does it fit my shop?" for a top sector; fr guide exists.
- Lashwell (lash studio, stamps), slot 5: the beauty case for stamps (fixed-price refill every 2-3 weeks).
- Harvest Row (grocer, points, progress_icons with basket/percent/gift), slot 6: variable baskets show the points rule; the only strip style the section doesn't show yet.
- Rolling Slice (food truck, stamps, pizza photo stamps), slot 7: no fixed counter, no POS.
- Saltmoss (spa, stamps), slot 8: a wellness sector not covered by nails or lashes.
- Smash Club (burger joint, stamps, cheeseburger photo stamps), slot 9: quick-service on stamps next to sit-down dining on points.
- Optional `pointsRewardIcons` on `SectorTheme`, passed through as `points_reward_icons`: prevents Harvest Row's milestones all showing gifts.
- Fill states match the ad renders: Fournée 9/10, Rolling Slice 5/8, Smash Club 7/10, Lashwell 4/6, Saltmoss 3/6, Harvest Row 165 pts on 100/200/400.

## Rejected additions
- **Ondine (hair salon):** same scissors icon and the exact gold `#C9A15B` of the Barbershop frame, near-identical black; reads as the same slide twice. A hair salon on stamps also contradicts the subtitle.
- **Glossé (nail studio):** Vanity is already the nail story, on points; Glossé would be the same business on the other engine, and the fifth beauty slide.
- **Nonna Lu (trattoria):** same sector, engine and strip style as Xeniká; duplicate "Restaurant" name collides as the React key (`SectorCarousel.tsx:217`); adds a large photo to the paid landing page. Swap for Xeniká instead if preferred.
- Faster autoplay; 44px dots (11 × 44 = 484px won't fit at 390); arrows on phones; category chips; two carousels; per-market order or `?sector=` deep links; widening the WalletCard logo slot (it mirrors Apple's 160×50pt limit); redrawing compact logos.

## Mobile shape
390px: header unchanged; one 350px slide, card 240px tilted -3°, then engine label, h3, reward pill, quote (≤4 lines), guide link; advantage hidden below md. All slides stretch to the tallest in the locale, so new quotes must not exceed the current longest. Dots row 188px at 11 slides (236px at 14): fits. Swipe is the control; dots show position only. Desktop unchanged; `clones=2` still enough.

## Components to reuse
`VariantSectorCards.tsx` (six themes + `DISPLAY_ORDER`; Aurevo's custom-stamp config at lines 52-68 for the photo brands, with grey copies), `SectorCarousel.tsx` (add optional `pointsRewardIcons`), `CardStyleGallery.tsx:61-81` (order pattern), `CenterCarousel`, `WalletCard`, `PointsStrip`, `StampIconPicker` presets, `messages/*/landing.json` (append-only), `public/themes/<brand>/` (trimmed logos ≤ ~30KB, photo stamps resized to ~3× display, ~20-30KB each).

## New components required
None.

## Open questions for the user
- Stamps outnumber points 7 to 4; Nonna Lu only evens it by duplicating Xeniká.
- `/us` renders en sector copy with euros; scoping decision before Harvest Row's reward is written.
- Subtitle still true for slots 0-3; new beauty slides on stamps sit beside "salon … with points".
- Copy caps: quote ≤ current longest per locale (en 144, fr 165, es 168, pl 163 chars); reward pill ≤ ~38 chars; names unique per locale; link labels must not promise guides that don't exist (only fr has bakery and beauty guides).
