# UX Brief v2: STA-552 (with STA-546's Platform hero and STA-555's phone menu)
MODE: DESIGN   DOMAIN: showcase
VERDICT: READY. Three questions for Harry at the end; each has a default the build can use.

This brief replaces v1 (`ux-brief.md`) for everything it covers. Where it is silent, v1 still holds: routes, registry
mechanics, tests, copy guards and the plan's AC1, AC3 to AC9.

**Pixels read before writing** (git-excluded, under `docs/features/STA-552/shots/design-v2/`):
- `now/`: Platform, the five previews, `/en/features/{analytics,geolocation,card-design}` and the `/us` homepage, at 390x844
  and 1440x900, screen by screen, plus `sheet-*.png` contact sheets. Also `menu-open-390.png` and `menu-product-390.png`
  for today's phone menu.
- `mock/`: CSS injected on Platform in the browser, with no code edits. Each shot is a before and after pair (§1.5).
- Research: `scratchpad/research-v3/report.md`. I read these screenshots: menus-sheet1/2, h-passentry-sheet,
  hm-cashapp-m-motion, hm-applewallet-d-motion and b-gumroad-detail.

---

## 0. What exists, and what this round changes

**Already shipped, and reused:**
- The five previews, their copy modules, the registry entries and the Platform kit: `StepsTable`, `ToggleCard`,
  `HoverRows`, `GlassCard`, `LpCtaPair`, `LpAccentBand` and `RelatedPreviews`. These are restyled, not rebuilt.
- **The site's stamp card already exists.** `app/globals.css:620-642` defines `.card-stamp` (a 1.5px `--near-black` border
  and a straight-down `0 3px 0` ledge) and `.card-stamp-lift` (hover: `translate(4px,-4px)` and `0 8px 0`).
  `.blog-card-3d` (:825) is the same look.
  - On the homepage they appear on `VariantBenefits`, `VariantDifferentiator`, `FeatureGrid`, the pricing cards and the
    desktop `NavDropdown`.
  - On today's feature pages they appear on `BlindSpotCards`, `AnalyticsChartCards` and `GeofencingHeroAnimation`'s map.
- **The site's own eyebrow already exists.** It is a pill: `rounded-full bg-[var(--accent)]/10 text-[var(--accent)] px-4
  py-1.5 text-sm font-semibold`, in sentence case. Examples: `VariantTryIt.tsx:23`, `LoyaltyProgramsPage.tsx:27`,
  `ScannerMobilePage.tsx:62`.
  - The landings use the bare uppercase `EYEBROW` in `--accent-hover` instead (`LpSection.tsx:43`, `HeroWords.tsx:10`).
    That is the orange Harry noticed.
- **The "Soon" label already exists in all four locales** (`common.wallet.soon`: Soon, Bientôt, Pronto, Wkrótce). The
  homepage `FeatureGrid` already tags Geolocation with it.
- **The real logo-palette generator exists**: `web/src/lib/theme-variants.ts` `generateThemeVariants()`, over
  `web/src/lib/logo-palette.ts`.
- **All five level looks exist in the backend.** `backend/app/services/programs/levels/skins.py` has bronze, silver,
  gold, platinum and noir. The showcase ports only silver and gold (`lib/levels/looks.ts`).
- **The dashboard's own Starter sentences exist.** They are in web `messages/en/analytics.json` `analytics.teaser.*`,
  for example "Your busiest time: **Thursday, 8 to 9 AM**" and "**22 customers** have a reward waiting". These make the
  analytics blend true on every plan.

**Superseded from v1 and the plan:**
- **AC2, "Platform renders exactly as before", no longer holds for Platform.** Harry asked for a new Platform hero and for
  the hybrid language on Platform. Platform's `default-renders` snapshots change on purpose, and the mock shots are the
  review.
  - AC7 still holds for the live pages: every live caller of a component this round extends must render byte-identically.
- **"Geolocation is out" is reversed.** A sixth preview, `platform/geolocation`, is added, honest and "coming soon"
  throughout.

**Findings I am reporting, not fixing in this brief:**
1. **Today's phone menu loses its CTA.**
   - On `/en/*` with Product open at 390x844, "Get started" ends at y≈838. The panel cannot scroll, because the body is
     locked and the panel is `height:auto` inside a fixed header (`now/` and `en/menu-product-390.png`).
   - On a shorter phone, or under Safari's toolbar, the CTA is unreachable.
   - The feature rows are 40px tall (measured), under the 44px minimum.
   - The phone-menu redesign in §4 fixes all three structurally.
2. **`/en/features/geolocation` sells geofencing as live**, against STAMPEO §8 ("Don't link the geolocation feature
   page as a live feature").
   - Its hero speaks in the present tense, its badge says "Growth and Pro", and its multi-location card says "Growth and
     Pro". Only the final CTA says "coming soon to the Pro plan".
   - Every page's nav links it without a "Soon" label.
   - Fixing the live page needs copy in four locales, so it is a follow-up issue. §4 adds the "Soon" chip to the nav.
3. **`common.nav.featuresItems.*.description` breaks the copy rules** in every locale: "in 5 minutes", an em dash
   (allowlisted in `lib/i18n-catalogs.test.ts:82`) and "Remind them…".
   - No code reads these keys today (grep shows only `.label`), so rewriting them is safe. §6 has the rewrite.

---

## 1. The hybrid design language

### 1.1 The principle

**Ink goes on objects, never on surfaces.** The ink look is the site's: a 1.5px `--near-black` border and a
straight-down `0 3px 0` ledge. Objects are the things a visitor can pick up, press or compare: a CTA, a card they tap,
the one stage a section shows. Surfaces stay clean: section bands, hairlines, tables of text, the header, the footer and
the closing band.

Platform keeps its air, its centred headings and its real renders. What it gains is the homepage's ink, on a few
objects, with the homepage's geometry.

This is the Gumroad and Brilliant lesson from the research, but in **our** geometry. I am not adopting the research's
diagonal `x=y` shadows, 2px borders or lighter display type. A second shadow geometry would make Platform look like a
different site from `/us`, which is the exact complaint (Rejected, §8).

### 1.2 Tokens

All of these already exist except `.keycap` and `EYEBROW_PILL`.

| Role | Value | Where it is defined |
|---|---|---|
| Ink | `--near-black` #191210, a warm off-black | `globals.css:13` |
| Ink frame | 1.5px solid ink, with the `0 3px 0` ink ledge | `.card-stamp` |
| Lift, for clickable cards only | `translate(4px,-4px)` and `0 8px 0` | `.card-stamp-lift` |
| **Keycap, for buttons (new)** | the ink frame and ledge. Hover, with `(hover:hover)` only: `translateY(-1px)`, `0 4px 0`. `:active`: `translateY(3px)`, `0 0 0`, 80ms ease-out. Under reduced motion: no transform, colour only | new `.keycap` in `globals.css`, next to `.card-stamp` |
| Accent | `--accent` #f97316, **the one orange for decoration**: eyebrows, icons, accent words, check marks | `globals.css:25` |
| Readable orange | `--accent-hover` #ea580c, only for **text you must read as a link** (`ARROW_LINK`) | as today |
| Radii | stage 28px (24px below `sm`) · card 20px · tile 12-16px · pill full | |
| Fill | stamped objects are white; bands stay `--blog-bg` or cream | |

### 1.3 Element by element

| Element | Look | Change |
|---|---|---|
| **Section eyebrow** | **The site's pill**: `inline-flex rounded-full bg-[var(--accent)]/10 px-4 py-1.5 text-sm font-semibold text-[var(--accent)]`, sentence case. The copy already is sentence case | New `EYEBROW_PILL` in `LpSection.tsx`, used by `LpHeading`, `HeroWords` (both looks), `StepHeading` and `IconsStrip`. **No eyebrow** on the `related` and `faq` headers: they are utility, and a pill on every section is noise |
| Row and strip labels (HoverRows "REWARD EVERY VISIT", TypeMarquee "BUILT FOR") | Keep `EYEBROW` (12px uppercase) but in `--muted-foreground` | This removes the second orange. They label rows; they are not titles |
| **Primary CTA** (`CTAButton` primary) | **Keycap**: orange fill, ink frame and ledge. The only tactile element in most viewports | New optional `keycap` prop on `CTAButton` (default off, so every other page is unchanged). `LpCtaPair`, `LpAccentBand` and `PreviewHero` pass it |
| Secondary pill (`LpCtaPair` outline) | White fill, **1.5px** ink border (was 2px), **no ledge at rest**. On hover and press it takes the keycap motion | `LpCtaPair.tsx` |
| Floating cards (`GlassCard`) | **Stamped card**: solid white, `card-stamp`, radius 20px, no blur, no soft shadow. Keeps `float` | `GlassCard.tsx`. Used only by `DeliverComposition` and `WalletsComposition` |
| `StepsTable` | One stamped object: white, `card-stamp`, radius 20px. The inside dividers stay `--border` hairlines | `StepsTable.tsx` |
| `ToggleCard` surface | White, `card-stamp`, radius 28px; the soft shadow and the ring go | `ToggleCard.tsx` `SURFACE` |
| `Segmented` | **Unchanged.** It is the site's control everywhere (hero demo, loyalty picker, playground) | none |
| `RelatedPreviews` cards | The homepage's `FeatureGrid` tile: `card-stamp card-stamp-lift`, radius 20px, and an icon tile in the site tone | `RelatedPreviews.tsx`. `IconTile` gains a `brand` tone, `bg-[var(--accent)]/10 text-[var(--accent)]` |
| FAQ (`FAQList` `table`) | The table's outer frame becomes `card-stamp` with radius 20px; rows stay hairlines | The `table` branch of `FAQList.tsx` only, which only `LpFaq` with an `eyebrow` reaches (previews). The default stays byte-identical |
| `PlanChip` | **Unchanged.** It is a quiet grey pill: plans are information, not objects | none |
| Closing band (`LpAccentBand`) | **Stays a clean cream surface with its glow.** Only its button becomes a keycap. A framed band around a framed button is a box in a box (`mock/rejected-390-band-framed.png`) | `LpAccentBand.tsx` passes `keycap` |
| Phones (`IPhone`, `AndroidPhone`), wallet cards, dashboard captures | **Never framed in ink.** Real renders carry their own depth; a frame turns them into illustrations | none |
| `NumberFigures`, `HoverRows`, hairlines, header bar, footer | Clean, unchanged | none |
| Pricing (`PricingSection`) | Already `card-stamp`, the site's own | none |

**Budget.** No more than **three stamped objects in one viewport.** A grid of like tiles counts as one object: the
homepage's `FeatureGrid` sets that precedent with six stamped tiles on a phone.

**At 390:**
- Border and ledge never scale down (1.5px, 3px).
- The stage radius drops to 24px.
- Padding inside stamped objects is 20px, and 32px from `lg`.
- Floating cards stack full width under their phones, as today.
- Keycaps keep their 52px height and add 3px below for the ledge (`mb-[3px]` in the stacked pair), so the pair never
  touches.

**One honest note on the eyebrow colour.**
- Harry asked for the site's own orange, so the pill uses `--accent`.
- On its 10% tint that measures **2.4:1**, which is under WCAG AA (4.5:1) for 14px text.
- Today's `--accent-hover` label is 3.4:1, so it also fails.
- The h2 under it carries the meaning, and the homepage already ships this pill.
- Default: Harry's call stands. The accessible alternative, if he ever wants it, is the same pill with
  `--near-black` text and an orange 6px dot. It would not change the orange.

### 1.4 What changes on Platform: minimal and on-vibe

1. The new hero (§2).
2. Eyebrows become pills (rule above).
3. `DeliverComposition`'s three floating cards become stamped cards.
4. `HowTable`, via `StepsTable`, becomes one stamped table.
5. `PlatformToggleCard`, via `ToggleCard`, becomes a stamped surface.
6. Every trial CTA becomes a keycap; the outline pill becomes 1.5px.
7. ProgramTypeRows and TypeMarquee labels turn grey.

Nothing else changes: not `NumbersBlock`, `ShareTree`, `LpDemo`, `PricingSection`, `LpSectors` or `BlogPostsSection`.
That is seven edits, all in shared kit files the previews also use, so Platform and its previews move together.

### 1.5 Proof: before and after, injected CSS on Platform

The CSS for these shots is the spec for the foundation builder: `scratchpad/sta552-v2-shots/hybrid.css`. Reduced
motion was on for every shot, so each pair compares finished states.

- **`mock/mock1-390-deliver-before-after.png`**: "In their wallet" at 390. The three glass cards become stamped cards,
  and the eyebrow becomes the pill.
  - It reads like the homepage's benefit cards, and the phones and real wallet renders stay clean above them.
  - It shows three stamped objects, which is the budget.
- **`mock/mock2-1440-how-before-after.png`**: the How table at 1440. The washed-out glass table becomes one inked
  object that the phones sink behind. It is the most "us" change for the least ink.
- Also shot:
  - `mock3-1440-platform-before-after.png`: the stamped toggle surface.
  - `mock4-390-numbers-band-before-after.png`: the keycap primary over a quieter outline secondary, and the band kept
    clean.

---

## 2. Platform hero: three concepts

All three keep the H1, the CTA pair and the reassurance exactly as they are. **All three show stamps, points and
levels.** No concept uses the barbershop (a real shop) or Oba. Level cards use brands with preset icons, because cards
with photos or uploaded icons keep a single look (`skins.py`).

### Concept 1: "Wallet stack" (recommended)

**Layout, 390:** H1 → stack → CTAs → reassurance.
- H1 is centred at y≈96-226.
- The stack is 300px wide (the card's own layout width, so no rescaling) and runs y≈246-570:
  - **4 header strips**, 46px apart. Each shows the real pass header: logo and "5/8", "240 pts" or "GOLD".
  - Then the **front card**, with its top 140px showing (the header and the stamp strip). Its lower half fades into the
    cream under a 48px gradient.
- CTAs stack at y≈586-702; the reassurance sits at about y=714.
- Everything fits in Safari's visible ~750px on a 390x844 phone. That is the bar today's fan already meets.

**Layout, 1440:** two columns in `Container`.
- Left, `col-span-6`: `HeroWords look="column"` (H1 left-aligned at `text-hero`), the CTA pair in a row, the
  reassurance.
- Right, `col-span-6`: the stack at 360px.
  - **6 strips**, 50px apart, and the whole front card (360x461).
  - It runs y≈110-871, so the moment plays above the fold. A centred stack would put the front card, and its moment,
    below the fold at 900px.

**Cards: 9.**
- Order: Aurevo (stamps) · Fournée (stamps, croissant photo) · Vanity (points, ring) · Marginalia (points, big number)
  · Lustre (stamps, water drops) · Patoune **Silver** (stamps, preset paw) · Wrenfold **Silver→Gold** (stamps, preset
  t-shirt) · Xenikà (points, photo strip) · Forme **Noir** (points, preset markers).
- Every level card's header prints its level name through `headerLabel`.
- This needs `BRONZE`, `PLATINUM` and `NOIR` ported into `lib/levels/looks.ts` from `skins.py`; `looks-values.test.ts`
  pins them.

**Motion.** A vertical conveyor with a moment.
- **Load:** the strips drop in from 8px above, one by one, 50ms apart; the front card lands last.
- **Cycle:** every 3.2s while ≥30% in view.
  1. The front card plays its moment if it has one (600ms):
     - Aurevo 5/8 → 6/8;
     - Marginalia 240 → 252 pts;
     - Wrenfold Silver → Gold, with its look and its header label.

     Each moment is a 250ms cross-fade from a "before" render to an "after" render, with a 2px press as if stamped.
  2. Then it slides down 24px and fades out (300ms).
  3. Every strip moves down one slot (400ms, `cubic-bezier(.2,.8,.2,1)`), and the card that left fades back in at the
     top.
- The next front card is the strip that was just above. A full cycle through all nine is about 29s.
- **Reduced motion:** a static stack with Aurevo in front at 6/8. No timer and no controls (Rejected, §8).

**Performance.**
- **12 `WalletCard` renders**: 9 cards, plus the 3 "after" states. The fan has 7.
- `WalletCard` is a client component, so each one hydrates, all with `showQR={false}`.
- Only `transform` and `opacity` animate, on 9 absolutely placed wrappers. `will-change` is set only during a step.
- The timer pauses off-screen (IntersectionObserver) and on `visibilitychange`.
- The first moment starts 1.2s after load, so it never competes with the LCP, which is the H1.
- Fournée and Xenikà's strip photos are eager; the rest are small SVG and PNG logos.
- One render tree at both widths; the strips beyond the 4th are `opacity:0` on a phone.

**What it says that the fan doesn't:**
- "This is what it looks like in their Wallet, and it updates." The fan says "many shops".
- The stack says the product's magic moment, and it names the three program types in their own words on the pass
  headers ("5/8", "240 pts", "GOLD") in the first screen.
- It is portrait-native, so it suits the 90% of visitors on a phone. A row of cards is landscape-native and has to be
  cropped there.

### Concept 2: "The shelf" (PassEntry's straight row, with Revolut's podium for levels)

- **1440:** centred H1 and CTAs as today, then a **straight row of 9 cards** at 168px.
  - The cards overlap by 28% (a 121px stride, ≈1136px wide), and each is tilted `rotateY(-16deg) rotateX(4deg)`, like a
    hand of cards held flat.
  - The cards are grouped: three stamps on the left, three points in the middle, then **one brand in Bronze, Silver and
    Gold, each standing 14px higher than the last** (the podium).
  - Under each group is a 12px grey label: "Stamps", "Points", "Levels".
- **390:** a band of 5 cards at 128px, bleeding off both edges. On a phone the order interleaves so that all three
  types sit in view: stamps, points, Silver, stamps, Gold.
- **Motion:**
  - On load the cards deal **straight** in from the right, 50ms apart, with a small overshoot.
  - On scroll the row drifts up 24px and its tilt flattens to 0°, reusing `FanParallax`'s mechanism (one non-inheriting
    custom property).
  - Reduced motion: static.
- **Performance:** 9 `WalletCard` renders and no extra states. It is the cheapest of the three.
- **What it says:** "three kinds of program, and levels climb." The podium is the only concept that shows *climbing*.
  Weaker on a phone, where the podium is lost to the crop.

### Concept 3: "Two-way conveyor" (Gamma, Linktree)

- **1440:** under the CTAs, two straight rows of 8 unique cards each, at about 190px, sharing a `rotateX(10deg)` shelf
  tilt, with cream edge masks.
  - The top row is stamps and moves left; the bottom row is points and levels and moves right, at 22px/s.
  - Hover pauses a row, and the hovered card takes `card-stamp-lift`.
- **390:** cards at 150px, about 2.3 visible per row, at 16px/s.
- **Reduced motion:** the rows stop and become `overflow-x:auto` with scroll-snap.
- **Performance:** a seamless loop duplicates each track, so this is **32 cards**. Live `WalletCard`s are too heavy. It
  needs pre-rendered WebP stills of real `WalletCard` renders (a build script, about 40KB each), lazy after the first 6.
- **What it says:** "every kind of shop", with the most cards of the three.
- **Against it:** Platform's next section, `TypeMarquee`, is already a marquee, so this would stack two conveyors. It is
  also the costliest to build and to keep in sync with the samples.

**Recommendation: Concept 1.** It is the only one that shows the product doing something in the first screen, on a
phone, with all three program types named.

The homepage `/us` and `/en` keeps the fan; it is out of scope. The card design preview gets its own hero (§3A), so no
Platform-family page shows a fan any more.

---

## 3. The six feature pages, rebuilt

**How to read the lists:** [a] reused as is · [b] restyled in the hybrid language · [c] **built from scratch for this
feature**.

**What every page shares, and every page then breaks from:**
- `PreviewHero` (eyebrow pill, H1, sub, keycap CTA pair, reassurance) and the shell.
- The `final_cta` band, which is clean with a keycap.
- `related`: stamped tiles, and no eyebrow.

**Variety rule:** across the six pages, no two (c) sections use the same pattern. Each one is the feature's own object.

### A. Card design, 10 sections

**Job:** prove the card can be *your* shop, and let the owner try it.

**Brands:** each section shows different brands, and no brand repeats on the page. Oba is gone; the barbershop is never
used.

1. **`hero` [c] "One card, many shops"** (replaces the fan).
   - **Sees:** one wallet card in the centre that **re-skins itself** every 2.4s across six shops. The logo, colours,
     stamps and strip change; the card's layout stays put. Under it is a caption pill (`PlanChip` style): "Car wash",
     "Bakery", "Wine bar", "Lash studio", "Bookstore", "Pizza truck".
     - The shops: Lustre, Fournée, Ravin, Lashwell, Marginalia, Rolling Slice. Three are stamps and three are points.
   - **390:** the words, then the card at 260px (`PassFrame`), the caption and 6 dots (8px, decoration), then the
     stacked keycaps. The card spans y≈300-633 and the CTAs fall at about y≈650-770.
   - **1440:** a straight row. The live card is at 320px in the centre; the previous and next shops sit at 220px either
     side, at 45% opacity and slightly behind. Each step slides the row one card to the left (450ms).
   - **Motion:** a 300ms cross-fade between stacked renders, paused off-screen. **Reduced motion:** Lustre, static, with
     its caption.
   - **Performance:** 6 `WalletCard`s on a phone and the same 6 on desktop; the row reuses them.
   - **Data:** `STAMP_SAMPLES` / `POINTS_SAMPLES` / `SECTOR_THEMES`. Copy: H1 and sub unchanged; the six trade
     captions are new (§6).
2. **`icons` [b].** `IconMarquee` as is, but its label becomes a handwritten **98** (`ink-figure`) beside "stamp
   icons" (grey). This folds in v1's numbers block.
3. **`playground` [b].** `CompactPlayground` unchanged inside a stamped stage (white, `card-stamp`, radius 28px). The
   outline trial button under it becomes a keycap. 390: unchanged from v1.
4. **`palettes` [c] "Colors from your logo."**
   - **Sees:** a stamped stage. On the left is Pulp's logo on a white 96px tile, with a grey "Your logo" label. On the
     right is Pulp's wallet card. Under the card is a row of **5 palette swatches**: 44px buttons, each a circle split
     between its card colour and its stamp colour.
   - **Interaction:** tapping a swatch recolours the card (new `design` props, with a 250ms colour transition). The
     selected swatch takes a 1.5px ink ring.
     - Once in view, it plays through the five palettes once, 1.2s each, then stops on the first. It never loops.
   - **390:** the logo tile and the swatch row above the card (260px). All 5 swatches fit in one 44px row
     (5x44 + 4x12 = 268px).
   - **1440:** logo left (`col-span-4`), card and swatches right (`col-span-8`).
   - **Data:** **the real generator.** Run web's `generateThemeVariants(extractLogoPalette('/themes/pulp/logo.svg'))`
     once and commit the 5 variants as static data in `lib/landing-pages/pulp-palettes.ts`, with a comment naming the
     source and the date. Never hand-pick them.
     - Fact: STAMPEO §6, "5 palettes auto-generated from the logo".
5. **`anatomy` [b].**
   - `AnnotatedWalletCard` gains an optional `designs: {stamps, points}` prop; the default keeps the live page
     byte-identical.
   - The preview passes **Saltmoss** (spa: sage, leaf stamps, a flower on the reward) for stamps and **Ode**
     (monochrome big number) for points, replacing the generic "My Parisian Café".
   - The handwritten labels stay.
6. **`stamps` [b].** `HoverRows` with new cards: Library → **Patoune** (preset paw) · Your own icons → **Smash Club**
   (a burger photo as the stamp) · Your layout → **Gelo** (cones piling up). Row labels turn grey.
7. **`wallets` [b].**
   - A stamped `StepsTable`, with both phones showing **Harvest Row** (a grocer on points) in place of Aurevo.
   - `WalletPhone` and `GoogleWalletPhone` gain an optional `sample` prop; the default keeps Aurevo.
8. **`faq` [b].** The stamped FAQ table, with v1's 5 items.
9. **`final_cta` [b].** Keycap.
10. **`related` [b].**

### B. Mobile scanner, 7 sections

**Job:** one scan from any phone, nothing to buy, nothing to learn.

v1's "how" table is dropped: it was Platform's signature, and the counter below now shows the scan itself.

1. **`hero` [b].** `ScannerLoop`, the real app video, cut at 440 on a phone. Eyebrow pill and keycaps.
2. **`counter` [c] "One screen for every kind of visit."** Replaces the HoverRows.
   - **Sees:** a phone running the scanner's own screens (`CounterMinis` / `AppScreen`, the app's own English labels).
     Beside it are **four option buttons**:
     - **Stamps** ("Add 3 stamps", the stepper);
     - **Points** (keypad, "+12 pts" preview);
     - **Reward** ("Rewards to redeem");
     - **Level** (perks at the register, `LevelCards` mini).

     Under the phone, the customer's wallet card (Aurevo, `PassFrame` 160px) shows the result: 5/8 → 8/8, the points
     balance, the reward claimed, "SILVER".
   - **Interaction:** a tap switches the phone screen and the card (a 250ms cross-fade). It auto-advances every 4s until
     the first tap, while in view.
   - **390:** the phone cut at 440, then a 2x2 grid of option buttons (each at least 56px, stamped tiles with no ledge:
     ink frame only), then the card at 160px and one fact line.
   - **1440:** the buttons are a left column of 4 stamped tiles (title plus one grey line); the phone and card are on the
     right.
   - **Reduced motion:** no auto-advance and no cross-fade.
   - **Data:** `scanner-app/src/locales/en/{stamp,points}.json` verbatim (v1's list).
3. **`ways` [b].** The two stamped cells, with icon tiles in the `brand` tone.
4. **`team` [c] "From a code to the counter."** Replaces the toggle card.
   - **Sees:** three frames joined by a `DashedRail`:
     1. a Team page mini (dashboard white) with the code **H7K3MP** and "Copy code";
     2. the staff phone's "Enter your team code", with the 6 boxes (from `TeamMinis`);
     3. the scanner, ready ("Scan Next Customer").
   - **Motion:** when frame 2 enters the view, its boxes fill one character every 120ms. Reduced motion: filled.
   - **390:** a vertical stack of 280px frames with the rail on the left. **1440:** three columns with the rail running
     horizontally.
   - **Below:** three facts. Two carry a `PlanChip`: "Let a scan past a daily limit, under your name" (Growth and Pro),
     "Unlimited team members" (Growth and Pro). The third has none: "Every scan carries the name of who made it".
   - Staff-data guardrails hold: no rankings, pace or idle time.
5. **`demo` [a].** `LpDemo`.
6. **`final_cta` [b].**
7. **`related` [b].**

### C. Push notifications, 7 sections

**Job:** every step of the card lands on their lock screen on its own, on iPhone and Android.

v1's "how" table and the Platform-style moments phone are dropped.

1. **`hero` [b].** `NotificationPhoneDemo`, as v1. Eyebrow pill and keycaps.
2. **`day` [c] "A message for every step of the card."** Replaces `NotificationSequenceDemo`.
   - **Sees:** one customer's card over several visits, as a vertical `DashedRail` with four nodes. Each node has a
     label, the **real default banner** (`LockScreenNotification`, sender "Aurevo") and a small Aurevo card (`PassFrame`
     120px) in that state:
     1. **"5th visit"**: "Stamp collected! You have 5 of 8 stamps." · card 5/8;
     2. **"Card full"**: "You unlocked your reward! Come claim it." · card 8/8;
     3. **"Reward claimed"**: "Reward redeemed. Enjoy!" · card 0/8;
     4. **"Next level"**: "You've reached Silver! Your card has a new look." · the card with the "SILVER" header.

        Aurevo uses custom cup images, so it keeps its own look, and that is true to the product.
   - **Motion:** each node's banner slides 12px in from the right with a fade as it reveals (`ScrollReveal` stagger, no
     JS).
   - **390:** the rail sits 24px from the left; each node is its label (grey), then the banner at full width, then the
     card at 120px. That is about 180px per node.
   - **1440:** the rail is centred, with banners on the left of the rail and cards on the right, in a 960px column.
   - **Data:** the default notification texts from `copy/shared.ts` (`STAMP_BANNER`, `REWARD_BANNER`,
     `LEVEL_UP_BANNER`), plus "Reward redeemed. Enjoy!" (already in the push copy module).
3. **`wallets` [b].** `WalletsComposition`, whose floating cards become stamped cards (via `GlassCard`).
4. **`editor` [c] "Use our wording, or write your own."** Replaces the wording toggle card.
   - **Sees:** a stamped stage holding a dashboard-like message row for **Stamp collected**:
     - a two-way `Segmented`, "Ready-made" | "Your words";
     - a read-only message field;
     - the banner preview under it;
     - a short list of three message switches (Stamp collected, Reward unlocked, Reward redeemed), on by default and
       switchable by tap.
   - **Interaction:** "Your words" types the custom text in at 30ms per character. Variables show as small grey chips,
     for example "{first name}". The preview banner updates to "You got stamped, Sophie! 3 more to go." and a
     **Growth and Pro** chip appears beside the segmented control.
     - The switches are every plan and carry no chip. They only flip locally.
   - **390:** the segmented control at full width, the field, the banner, then the switches (rows at least 48px).
     **1440:** the field and switches on the left, the banner preview on a warm grey tray on the right.
   - **Reduced motion:** the text appears at once.
   - **Data:** the variable names and the switch labels come verbatim from web's notification editor
     (`messages/en/notifications.json`). STAMPEO: Starter uses default wording; Growth and Pro write custom text.
5. **`demo` [a].**
6. **`final_cta` [b].**
7. **`related` [b].** Broadcasts first.

### D. Analytics, 8 sections: production's blind spots, then the answers

**Job:** "you are running loyalty blind today; here is what you will know, and on which plan." This is Harry's
narrative: "Here's what you already know… then the cards… then actually, we don't know."

1. **`hero` [b].** `DashboardDuo`, as v1. Eyebrow pill, one keycap.
2. **`blind_spots` [c] "What a paper card can't tell you."** Production's `BlindSpotCards`, finished.
   - **Sees:** six **stamped question cards** (`card-stamp`, as production), with a `Segmented` (size `lg`) above them:
     **"With a paper card" | "With Stampeo"**.
     - **Paper** (the state on load): each card is a question plus production's punchline, **"???"**, in grey Caveat
       (`ink-figure`).
     - **Stampeo:** every card flips (production's `rotateY(180deg)`, 500ms, 60ms stagger) to its **answer**, using the
       Aurevo fixture. Every answer is true on **every plan**, because each one is a dashboard number or a Starter
       sentence:

| Question | Answer (big figure, then one grey line) | Source |
|---|---|---|
| Is my program working? | **2,770** visits, ▲17% | KPI, every plan |
| Do they come back? | **61%** came back within 30 days | KPI, every plan |
| How many are regulars? | **48%** come at least every 2 weeks | `teaser.frequency.regulars`, (191+125)/660 |
| When is it busiest? | **Thursday**, 8 to 9 AM | `teaser.busiest.slot` |
| Who has a reward waiting? | **22** customers | `teaser.rewards.ready` |
| Who's new? | **460** new customers, ▲11% | KPI, every plan |

   - **Interaction:** the segmented control sets all six. Tapping a card flips just that card (production's behaviour).
     There is no hover-only state.
   - **390:** a 2-column grid of 6 cards, at least 168px tall each (production's own phone layout), with the segmented
     control at full width above. **1440:** a 3x2 grid.
   - **Motion:** when the section is 50% in view, it waits 1.5s on "???" and then flips to "With Stampeo" once, so a
     scroller sees the punchline and the answer. Reduced motion: no auto-flip, and an instant swap on tap.
   - **Copy:** the questions are adapted from today's approved catalog (`analytiques.custom.blindSpotCards`), and the
     answers use the dashboard's own sentences.
3. **`glance` [b].** The every-plan KPI tiles and "Visits over time" on the stamped toggle surface. The facts are as v1.
4. **`ladder` [c] "Every plan answers. Growth and Pro chart it."** Replaces the HoverRows questions and the history
   figures. This is the "what they have and what they don't" half.
   - **Sees:** one stamped stage. Its header is a `Segmented` (`lg`), **"Starter | Growth | Pro"**, beside a handwritten
     history figure that changes with it: **30 days**, **90 days**, **1 year**.
   - Inside are three rows: **Busiest times**, **How often they come**, **Reward progress**.
     - **Starter:** each row is the dashboard's own one-line sentence, with a small lock and a grey line: "The chart is
       on Growth and Pro".
     - **Growth:** each row swaps to its drawn chart (the existing `QuestionMinis`).
     - **Pro:** adds a fourth row, **Monthly cohorts** (a 4x6 mini grid), and "Filter by location".
   - **390:** the segmented control at full width, the figure under it, then the rows stacked (at about 288px, as
     `stackOnPhone`). **1440:** rows side by side in 3 columns.
   - **Motion:** a 200ms cross-fade per row. It opens on **Starter**, so every plan's truth is the first thing seen.
   - **Data:** `PLAN_FACTS.analyticsHistoryDays`, STAMPEO §6 analytics table, and web's `analytics.teaser.*` sentences.
5. **`activity` [b].** The live feed and customers toggle, on the stamped surface.
6. **`recap` [c] "Your numbers come to you."**
   - **Sees:** a stamped email mini: from "Stampeo", subject "Your week at Aurevo". Four figures: stamps given **642**
     ▲12%, new customers **38**, returning **211**, rewards redeemed **19**. Then a nudge line: "**12 customers** are
     close to a reward".
   - **390:** the email at full width (about 360px tall), then two facts: "Weekly when you're busy, monthly otherwise" and
     "Unsubscribe anytime". **1440:** the email on the left (`col-span-7`), the facts on the right.
   - **Motion:** none; `ScrollReveal`.
   - **Data:** STAMPEO §6 performance emails. The figures are the page's fixture, like the KPIs.
7. **`final_cta` [b].**
8. **`related` [b].**

### E. Promotional campaigns, 9 sections

The plan labels stay as today: broadcasts are Growth and Pro, as in v1 §E. STA-549 is still a draft.

1. **`hero` [b].** The lock screen with Aurevo's broadcast, and a "Growth and Pro" chip beside the eyebrow pill.
2. **`composer` [c] "Write it, pick who gets it, send."** Replaces the How table.
   - **Sees:** a stamped "New broadcast" card built from the dashboard's own wizard labels:
     - the message (read-only): "Quiet afternoon? Your second coffee is half price until 5pm.";
     - **"Who will receive this?"**: "All enrolled customers" (selected) · "Filtered audience", which opens to two chips,
       "Joined in the last 30 days" and "Inactive for 30 days" (**Pro**);
     - **Schedule**: "Send now" (selected) · "Schedule" (**Pro**);
     - a **"Send now"** keycap.

     Next to it is the phone lock screen (`NotificationPhoneDemo`, the clock only at first).
   - **Interaction:**
     1. Tapping "Send now" drops the banner onto the phone (the existing banner entrance, 450ms).
     2. A delivery line under the card counts "Delivered 0 → 680 of 716" over 900ms. That is Apple 412 plus Google 268,
        from the delivery fixture.
     3. "Send again" then replays it.
   - **Auto-play:** once, when the phone is 50% in view, so a scroller sees it.
   - **390:** the composer card at full width (about 520px), then the phone cut at 440. On a phone, auto-play triggers on
     the phone's visibility. **1440:** composer `col-span-7`, phone `col-span-5`.
   - **Reduced motion:** the banner is already on screen, the count shows its final value, and there is no auto-play.
   - **Data:** web `messages/en/notifications.json` `broadcasts.wizard.*` and `detail.sendNow` / `sendAgain`, verbatim.
     The audience options follow STAMPEO §6: Growth gets everyone or by join date; Pro gets inactivity, reward ready and
     the rest.
3. **`numbers` [a].** The 88% / 95% handwritten figures with their source line.
4. **`ideas` [c] "Give them a reason to come in today."** Replaces the HoverRows.
   - **Sees:** a row of four chips (44px, pills, the selected one with an ink frame): **Slow afternoon** · **Something
     new** · **Gone quiet** (Pro) · **Almost there** (Pro).
   - Under the chips: a single dark notification (`LockScreenNotification`) with that idea's message, and one grey
     audience line ("Sent to everyone." / "Sent only to customers who haven't been in for 30 days.").
   - **Interaction:** tap to switch, with a 200ms cross-fade.
   - **Not a calendar:** scheduling is Pro, so ideas are presented by moment, never by weekday.
   - **390:** the chips scroll horizontally (scroll-snap, the fourth half-visible as a cue), then the notification at full
     width, which prints its message at about 15px. **1440:** the chips centred, the notification at 420px.
   - **Data:** v1's four messages.
5. **`delivery` [b].** The delivery stats, on the stamped surface.
6. **`plans` [b].** A two-cell stamped `StepsTable` and "Compare plans".
7. **`faq` [b].**
8. **`final_cta` [b].**
9. **`related` [b].**

### F. Geolocation (new): `/us/landing-pages/platform/geolocation`, 7 sections, "coming soon" throughout

**Registry:** slug `platform/geolocation`, variant `lp_platform_geolocation`, noindex.
- `FEATURE_PREVIEWS.geolocalisation = "platform/geolocation"`, so the nav from Platform-family pages opens this page,
  and the live page still opens from everywhere else.
- **Honesty rules** (STAMPEO §8, `backend/app/services/pass_generator.py:33`):
  - every claim about geolocation is in the **future tense**, or carries a **Soon** chip;
  - no date;
  - plan = **Pro** (the live catalog CTA, and `features.py` `locations.geofencing` Pro-only);
  - no "Growth and Pro";
  - no "remind";
  - no live-sounding badge.

1. **`hero` [b].**
   - **Eyebrow:** the pill "Geolocation", then a neutral **"Coming soon · Pro"** chip in `PlanChip` style.
   - **H1:** future tense (§6).
   - **Visual:** `GeofencingHeroAnimation`, the stamped paper map with a customer walking into the ring and the phone
     waking. It gains optional props `sender`, `title`, `body` and `date`; the default keeps the live page
     byte-identical.
     - The preview passes **Aurevo** as the sender (never "Stampeo") and a line the owner would write.
     - On the phone sits one `InkNote` "coming soon", rotated -3°, pointing at the banner (desktop only, as live).
   - **One** keycap: no demo exists for this.
   - **390:** the words first, then the stage (it scales itself at 390; check it doesn't overlap the reassurance).
   - **Reduced motion:** the poster frame (`POSTER_T`), as live.
2. **`status` [c] "Live today, and what's next."**
   - **Sees:** one stamped two-column table.
     - **Today**, with three live facts and a green check each: "Your card in Apple Wallet and Google Wallet" · "A
       notification on every stamp and reward" · "Broadcasts to every card" (**Growth and Pro** chip).
     - **Soon, on Pro**, with three planned facts, a grey clock each and the column headed by the Soon chip: "Your card
       on their lock screen near your shop" · "A short line you write for each location" · "Nothing for your customers
       to set up".
   - **Why:** this answers the only question the page provokes ("so what do I get now?") and keeps the coming-soon
     promise visibly apart from what ships.
   - **390:** the two columns stack, Today first, with the hairline between them becoming a full-width divider.
     **1440:** two columns.
   - **Data:**
     - the Today facts are STAMPEO §6;
     - "a line you write for each location" is the planned design: `pass_generator.py:33-36`, "Re-enable once
       per-location wallet_message UX ships". **Flagged for the coordinator** (§6).
3. **`how` [b] "Your address does the work."**
   - A stamped `StepsTable` with three cells, all in the future tense: **Add your shop** · **Write one line** · **They
     walk by**.
   - The visual is one lock-screen phone, `IPhone statusBar="lock"` with the wallpaper and the Aurevo banner, cut at 440.
4. **`privacy` [c] "Their location stays on their phone."**
   - **Sees:** a stamped stage with a drawn diagram made from Phosphor icons:
     - on the left, a phone inside a dashed geofence ring around a shop pin;
     - on the right, a grey cloud;
     - between them, a dashed line broken by an ink "×".
   - Under the diagram, three facts: "Their phone checks the distance itself" · "We never receive their location" ·
     "They can switch it off in their phone's settings".
   - **390:** the diagram at 300x150, then the facts. **1440:** the diagram on the left, the facts on the right.
   - **Motion:** the dashed line draws in with `.ink-draw` (there is one already), and the × lands last. Reduced motion:
     drawn.
   - **Data:** Apple Wallet's `locations[]` is evaluated on the device (`pass_generator.py:27-31`). The live catalog's
     privacy points say the same.
5. **`faq` [b]** (the stamped table, 3 items):
   - "When does it launch?" → no date; it will be announced on What's new (`/changelog`).
   - "Which plan will have it?" → Pro.
   - "Will my customers need a new card?" → no; the card already in their wallet picks it up with its next update. This
     is true per `pass_generator.py:39-41`.
6. **`final_cta` [b].** "Get your card ready today." (§6), with a keycap.
7. **`related` [b].** Its title is overridden to "Bring them back today." It links to Notifications, Broadcasts and
   Analytics: the live ways to bring people back. `RelatedPreviews` gains an optional `title`.

### Mobile shape: structural rules for all six (mine to own)

- **No sheets or dialogs on these pages.** Every interaction is inline: segmented controls, chips, taps.
- **Nothing is hover-only.**
  - The flip cards flip on tap and through the segmented control.
  - The stamp rows render open on the server, as today.
  - The re-skin, stack and composer all run without a pointer.
- **Tap targets:**
  - keycaps are 52px;
  - chips and swatches are 44px;
  - option tiles are at least 56px;
  - segmented controls use `size="lg"` (44px);
  - related tiles are at least 56px;
  - switch rows are at least 48px.
- **Wide content reflows:**
  - the ladder rows stack;
  - the status table stacks;
  - the ideas chips scroll with scroll-snap;
  - the stack hero crops to 4 strips.
- **Motion:** every auto-play runs **once**, or pauses off-screen, and every one has a finished, still state under
  reduced motion.

---

## 4. The phone menu (STA-555): three directions

Constant across all three:
- the same links, in the same order;
- `featureLink(canonicalSlug, locale, featureLinks)`, called exactly as today;
- the desktop `NavDropdown`, untouched;
- `lockBodyScroll`;
- Escape closes the menu;
- the burger has `aria-expanded` and `aria-controls`.

**What Harry dislikes is the motion, not the contents.** The panel grows its height from 0 to `auto`, the "Product"
accordion grows again inside it, and everything is 14px.

### A. "Index sheet" (recommended)

- **Open:** a full-screen cream sheet under the 64px header bar, which stays put. It is `fixed inset-x-0
  top-[64px] bottom-0`, with `overflow-y-auto overscroll-contain`.
  - It fades in with `translateY(-6px → 0)` over 180ms ease-out, and its groups stagger by 25ms.
  - Close is a 120ms fade.
  - **No height animation anywhere.**
  - The burger cross-fades to an X (150ms). Its hit area grows from 40px to **44px**.
- **Product:** always open, as a **2x3 grid of feature tiles**: the homepage `FeatureGrid` in miniature.
  - Each tile is white, with a **1.5px ink border and no ledge**, radius 16px, padding 12px, at least 88px tall.
  - Inside: a 36px icon tile (`bg-accent/10`, accent icon), the label at 15px/600 (two lines allowed), and a one-liner
    at 12px/1.35 grey (§6).
  - Geolocation carries the **Soon** chip (`common.wallet.soon`, which exists in 4 locales) in the top right.
  - The tile for the current page gets an `--accent` border and an `accent/5` fill.
- **Then:**
  - **Loyalty** and **Pricing** as 20px/600 rows, at least 56px tall, with hairline dividers and a grey chevron;
  - a 12px grey "Resources" label, then Blog, What's new, About and Contact as a 2-column grid of 17px/500 rows, at least
    48px tall;
  - on international pages, the language switcher as **four 44px pills**. `LanguageSwitcher` gains an optional
    `variant="row"`; today it is 34px.
- **Bottom:** a **sticky bar** at the bottom of the sheet: cream, with a top hairline, 12px padding plus
  `env(safe-area-inset-bottom)`.
  - It holds two 48px pills side by side: **Log in** (white, 1.5px ink) and **Get started →** (orange **keycap**).
    Signed in, they become **Sign out** and **Dashboard**.
  - The CTA can no longer fall off the screen; this fixes finding 1.
- **Measured budget at 390x844:**
  - header 64 + label 28 + grid 284 (3x88 + 2x10) + 24 + rows 112 + 24 + label 28 + resources 96 + language 60 ≈ 720;
  - plus the bar (72) ≈ 792, so it fits;
  - the sheet scrolls when it doesn't.
- **Accessibility:**
  - the sheet is `role="dialog" aria-modal="true"`, labelled by a visually hidden "Menu";
  - on open, focus moves to the first tile, and **Tab is trapped** between the X and the sheet;
  - **Escape** closes and returns focus to the burger;
  - `inert` is set on `<main>` and the footer while the sheet is open;
  - under reduced motion it is an opacity fade only, with no stagger.
- **Why it wins:**
  - It **removes a step**: all six features are visible with no accordion.
  - It is the most "us": the homepage's tiles and the site's keycap.
  - It keeps Harry's structure ("I like it like it is").
  - It fixes the cut-off CTA by construction.

### B. "Drill-down" (Stripe, Mercury, Square)

- The first screen is five 24px rows with chevrons.
- Tapping **Product** slides in a second screen (x 100% → 0, 280ms, `cubic-bezier(.2,.8,.2,1)`) with a "← Menu" header.
  It holds one stamped featured tile (a small Aurevo `WalletCard` and "See every feature") and six rows, each a 32px
  icon tile, name and grey line.
- The CTAs are fixed at the bottom.
- It is professional, and it scales if products grow. **It adds a tap** to reach any feature, though, and six items
  don't need a second screen.

### C. "The menu is a stamp card" (Raycast, Family)

- A floating panel, 12px inset under the header, radius 20px, with a 1.5px ink border and a 6px ledge.
- It springs from `scale(.96) translateY(-8px)`, with its origin at the burger. The page behind dims to `cream/60` with
  a 6px blur. Its height is capped at 80vh.
- A pill control switches "Product | Loyalty | Resources" in place.
- It is the most distinctive, but **it is still a dropdown card**, which is the word Harry used for what feels cheap.
  The tab control also hides two thirds of the links.

**Recommendation: A.** Build it as a new `components/sections/MobileMenu.tsx` (the sheet, `FeatureTile` and the bottom
bar). `Header.tsx` is 522 lines today; it keeps only the burger and the state, and drops under 500.

---

## 5. Build split

**Stage F, foundation: one builder, tests first.** It owns every shared file. The parallel builders touch none.

1. **Tokens:** `app/globals.css` gets `.keycap` (rest, hover, active and reduced motion). `LpSection.tsx` gets
   `EYEBROW_PILL`. The pill goes into `LpHeading`, `HeroWords`, `how-it-works/StepHeading` and `card-design/IconsStrip`,
   and grey labels into `HoverRows` and `TypeMarquee`.
   - Note: `LpSection` is shared by the how-it-works, features and outcomes landings too, which is intended: "the site's
     own eyebrow" everywhere.
2. **Kit:**
   - `CTAButton` gains an optional `keycap` prop; `LpCtaPair` gets the keycap and the 1.5px outline;
   - `LpAccentBand` gets the keycap; `GlassCard`, `StepsTable` and `ToggleCard` are stamped;
   - `RelatedPreviews` gets stamped tiles, no eyebrow and an optional `title`;
   - `IconTile` gains the `brand` tone; the `FAQList` `table` frame is stamped.
3. **Data:**
   - `lib/levels/looks.ts` gains `BRONZE`, `PLATINUM` and `NOIR` (and its values test);
   - the registry entry `platform/geolocation`, with new `LandingSectionId`s: `palettes`, `blind_spots`, `ladder`,
     `recap`, `composer`, `day`, `editor`, `status`, `privacy`;
   - `FEATURE_PREVIEWS.geolocalisation`; the empty route; and `copy/previews/geolocation.ts`, registered in
     `lib/testing/landing-copy.ts`.
4. **Copy:** every §6 draft goes through `stampeo-copywriting` before stage P.
5. **Green bar:**
   - Platform's `default-renders` snapshots are re-recorded **on purpose**, and the reviewer compares them with
     `mock/*`;
   - AC7's byte-identity holds for every live caller: `CTAButton` without `keycap`, `FAQList` without `table`,
     `AnnotatedWalletCard` without `designs`, wallet phones without `sample`, and `GeofencingHeroAnimation` without
     props;
   - type-check passes.

**Stage P: four builders in parallel, on disjoint files.**

| Builder | Owns | Pages |
|---|---|---|
| **1. Cards in motion** | `platform/WalletStackHero.tsx` (server) + `platform/WalletStack.tsx` (client controller), `lib/landing-pages/wallet-stack.ts` (+ test), `PlatformHero.tsx`, `app/.../platform/page.tsx`; `feature-previews/card-design/*` (`ReskinHero`, `PalettesSection`), `lib/landing-pages/pulp-palettes.ts`, `features/design-de-carte/AnnotatedWalletCard.tsx` (optional `designs`), `shared/WalletPhone.tsx` + `GoogleWalletPhone.tsx` (optional `sample`), the card-design route | Platform hero, Card design. **They share the stacked-render cross-fade technique** |
| **2. Data stories** | `feature-previews/analytics/*` (`BlindSpotsSection`, `LadderSection`, `RecapSection`), the analytics route; `feature-previews/geolocation/*` (new: `StatusSection`, `PrivacySection`), `features/geolocalisation/GeofencingHeroAnimation.tsx` (optional props), the geolocation route | Analytics, Geolocation |
| **3. Lock screen** | `feature-previews/push-notifications/*` (`DaySection`, `EditorSection`), `feature-previews/promotional-campaigns/*` (`ComposerSection`, `IdeasChips`), `features/notifications-push/NotificationPhoneDemo.tsx` (only if the composer needs a `send` trigger, as an optional prop), both routes | Push, Campaigns |
| **4. Scanner and nav** | `feature-previews/mobile-scanner/*` (`CounterSection`, `TeamStrip`), the scanner route; `components/sections/Header.tsx`, new `components/sections/MobileMenu.tsx`, `components/ui/LanguageSwitcher.tsx` (optional `variant`), `messages/{en,fr,es,pl}/common.json` (the six descriptions) | Scanner, phone menu |

Reused read-only by more than one builder, and edited by none: `DashedRail`, `PassFrame`, `ScaledBox`, `PlanChip`,
`Segmented`, `LockScreenNotification`, `LevelCards`, `QuestionMinis`, `CounterMinis`, `TeamMinis`, `InkNote`,
`ScrollReveal`.

**Stage Q:**
1. Merge.
2. A UX polish pass on pixels: 390x844 then 1440x900, plus a reduced-motion pass. Each page goes next to
   `design-v2/now/sheet-*`. The phone menu is checked on `/en` and `/us` with Product visible and the CTA in view.
3. Coverage and quality reviews.
4. Full `bun test`, type-check and lint; the build runs only once no dev server is running.

---

## 6. Copy needs (drafts for the coordinator and `stampeo-copywriting`)

The drafts follow STAMPEO §6-§8 and the guards:
- no em dash, "remind", "offline", minute counts or digit day counts;
- "broadcast", not "campaign", in body copy;
- never "Stampeo" as a banner sender;
- budgets: H1 ≤46, sub ≤90, eyebrow ≤28, h2 ≤44, lead ≤85, band ≤36.

**Phone menu one-liners** rewrite the unused `common.nav.featuresItems.*.description` in all four locales (EN drafts;
fr/es/pl from `stampeo-copywriting`):
- Push Notifications: "A message on every stamp"
- Promotional Campaigns: "One message to every card"
- Geolocation: "Your card when they're nearby", with the "Soon" chip
- Mobile Scanner: "Stamp from any phone"
- Analytics: "See who comes back"
- Card Design: "Your logo, colors and stamps"

Then remove the em-dash allowlist line in `lib/i18n-catalogs.test.ts:82`; the ratchet allows it.

**Geolocation** (`copy/previews/geolocation.ts`), all new. ⚑ marks a planned-feature claim the coordinator should
confirm.
- meta: "Geolocation for loyalty cards, coming soon | Stampeo" / "Soon on the Pro plan: your loyalty card shows on a
  customer's lock screen near your shop. Start your card today."
- hero:
  - eyebrow "Geolocation", chip "Coming soon · Pro";
  - H1 "Soon, your card shows up when they walk by." (accent "when they walk by."; 43 characters);
  - sub "We're building it for the Pro plan. Make your card now and it's ready the day it launches."
    (88 characters).
- banner, in the hero animation:
  - sender "Aurevo";
  - title "Aurevo is around the corner" ⚑;
  - body "Your 6th coffee is waiting. 2 stamps to a free one."
- status:
  - eyebrow "Where it stands", h2 "Live today, and what's next.";
  - lead "What your card does today, and what geolocation will add on Pro.";
  - Today: "Your card in Apple Wallet and Google Wallet" · "A notification on every stamp and reward" · "Broadcasts to
    every card" (Growth and Pro);
  - Soon: "Your card on their lock screen near your shop" ⚑ · "A short line you write for each location" ⚑ · "Nothing
    for your customers to set up".
- how:
  - eyebrow "How it will work", h2 "Your address does the work.";
  - lead "You add your shop and write one line. Their phone does the rest.";
  - cells: "Add your shop" / "Your address, from your dashboard." · "Write one line" / "What they'll see when they're
    close." ⚑ · "They walk by" / "Their phone shows your card, on its own."
- privacy:
  - eyebrow "Privacy", h2 "Their location stays on their phone.";
  - lead "Their phone checks the distance itself. We never see where anyone is.";
  - facts as in §3F.
- faq (3 items): as in §3F.
- band: "Get your card ready today." (accent "ready today.") / "Start with stamps or points now. Geolocation joins Pro
  when it launches."
- related title: "Bring them back today."

**Analytics:**
- blind_spots:
  - eyebrow "What you know today", h2 "What a paper card can't tell you.";
  - lead "Six questions every owner asks. Flip to see the answers.";
  - toggle "With a paper card" / "With Stampeo";
  - the six questions and answers as in §3D.
- ladder:
  - eyebrow "By plan", h2 "Every plan answers. Growth and Pro chart it.";
  - lead "Starter answers in a sentence. Growth and Pro chart it and look further back.";
  - locked line "The chart is on Growth and Pro".
- recap:
  - eyebrow "In your inbox", h2 "Your numbers come to you.";
  - lead "A weekly digest when you're busy, a monthly recap otherwise.";
  - email subject "Your week at Aurevo".

**Card design:**
- trade captions "Car wash", "Bakery", "Wine bar", "Lash studio", "Bookstore", "Pizza truck";
- palettes: eyebrow "From your logo", h2 "Five color palettes, made from your logo.", lead "Upload your logo and pick the
  one that feels like your shop.", swatch labels "Palette 1" to "Palette 5" (aria);
- the icons strip label "stamp icons" under the handwritten 98.

**Scanner:**
- counter option lines: "Add one, or several at once" · "Type what they spent" · "Now or on their next visit" · "Their
  perks, on screen";
- team: eyebrow "Your team", h2 "From a code to the counter.", lead "Staff join with a 6-character code and only ever
  see the scanner.";
- frame captions "Copy your code" · "They type it in" · "Ready to scan".

**Push:**
- day: eyebrow "On their lock screen", h2 "A message for every step of the card.", lead "From their first stamp to their
  next level, each one sends itself.";
- node labels "5th visit" · "Card full" · "Reward claimed" · "Next level";
- editor: toggle "Ready-made" / "Your words", with the custom example "You got stamped, {first name}! {remaining} more to
  go." The variable names come from web's editor.

**Campaigns:**
- composer labels **verbatim from web** (`broadcasts.wizard.audience.title` "Who will receive this?", `…all` "All
  enrolled customers", `…filtered` "Filtered audience", `detail.sendNow` "Send now", `detail.sendAgain` "Send again",
  `wizard.steps.schedule` "Schedule");
- ideas chips "Slow afternoon" · "Something new" · "Gone quiet" · "Almost there".

**Flagged, carried over:**
- Scanner h2 "Free for your whole team." sits next to Starter's 2 team members (owner plus one). It was approved in v1.
  §3B drops it for "From a code to the counter."

---

## 7. Open questions for Harry (each has a default)

1. **Platform hero.** Default: **Concept 1, the Wallet stack**. Nine passes that rotate through their stamp, points and
   level moments, in two columns on desktop and above the CTAs on a phone. Concept 2 (the straight shelf with a level
   podium) is the cheap alternative.
2. **Geolocation's launch facts.** Default:
   - "coming soon, on **Pro**", with no date;
   - **no wallet named** for the feature itself, since today's backend only builds Apple Wallet `locations[]`;
   - the "will Android get it" question left out of the FAQ until you confirm it;
   - "a line you write for each location" described as the plan (the backend's own TODO).

   Tell me if launch will be iPhone-only, or Growth as well.
3. **Where the new language and menu ship.** Default:
   - the hybrid goes on Platform, the previews and, through the shared `LpSection`, the other three US landings
     (how-it-works, features, outcomes);
   - the new phone menu ships **site-wide**, because `Header` is one component, in all four locales;
   - the homepage and the live `/features/*` pages keep their own look until a winner is promoted.

   Say if you'd rather the menu wait for its own release.

---

## 8. Rejected additions

- **Lighter display type** (research rule 7: 600 weight with tight tracking). The type scale is decided and mandatory
  (`text-hero` 800). The hybrid is about surfaces, not type.
- **Diagonal `x=y` shadows, 2px borders, 6-8px offsets** (research rules 3 and 4). The site's ledge points straight
  down at 3px. A second geometry would make Platform look like another brand next to `/us`.
- **An ink frame on phones, wallet cards or dashboard captures.** Real renders lose their realism inside a cartoon
  frame. The research says the same: "real renders inside the frames".
- **An ink frame on the closing band.** It is a box in a box with the keycap (`mock/rejected-390-band-framed.png`).
- **Ink on `PlanChip` and `Segmented`.** Chips are information, and `Segmented` is the site's control on every page.
  Both stay quiet so the budget goes to objects.
- **A ledge on the secondary pill at rest.** Two keycaps compete; the orange one should be the only tactile object.
- **Hero concept 3 (two-way conveyor).** It would stack two conveyors with `TypeMarquee`, needs 32 pre-rendered stills
  and a build script, and says only "many shops".
- **‹ › controls on the reduced-motion stack.** All nine strips are already visible, so controls answer no question.
- **Wallet badges in the stack hero's left column.** The H1 already says "Apple & Google Wallet".
- **A "notify me" email capture on geolocation.** There is no backend for it, and it implies a date we don't have.
- **A How table on scanner and push** (v1). It is Platform's signature, and their (c) sections now show the flow.
- **A weekly calendar for broadcast ideas.** It implies scheduling, which is Pro-only. The ideas are presented by moment
  instead.
- **Showing the menu one-liners in the desktop dropdown.** Nothing on desktop provokes the need; it stays labels only.
- **Phone menu B and C.** B adds a tap; C is still a dropdown card (§4).
- **Eyebrows on `related` and `faq`.** These are utility sections, and a pill on every header turns the orange into
  noise.
- **Monthly cohorts as their own analytics section.** Pro-only depth; they live in the ladder's Pro state.

## Components to reuse

`card-stamp`, `card-stamp-lift`, `ink-figure`, `ink-draw` (`app/globals.css`) · `LpSection` · `HeroWords` ·
`PreviewHero` · `LpCtaPair` · `LpAccentBand` · `StepsTable` · `ToggleCard` · `HoverRows` · `GlassCard` ·
`RelatedPreviews` · `LpFaq`/`FAQList` · `PlanChip` · `IconTile` · `FactList` · `DashedRail` · `PassFrame` · `ScaledBox`
· `ScaledCardWrapper` · `WalletCard` · `LevelCards` · `LockScreenNotification` · `NotificationPhoneDemo` ·
`DashboardDuo` · `LiveActivityFeed` · `QuestionMinis` · `CounterMinis` · `TeamMinis` · `AppScreen` · `ScannerLoop` ·
`IconMarquee` · `CompactPlayground` · `AnnotatedWalletCard` · `GeofencingHeroAnimation` · `IPhone` · `Segmented` ·
`InkNote` · `ScrollReveal` · `CTAButton` · `MarketLink` · `featureLink` · `lockBodyScroll` · `common.wallet.soon`.

## New components required

- **`.keycap`** (`globals.css`) and **`EYEBROW_PILL`** (`LpSection.tsx`): the hybrid's only new tokens. The ladder
  fails because no button token exists today. `CTAButton`'s soft shadow is not the site's ink.
- **`WalletStack` / `WalletStackHero`** (`components/landing-pages/platform/`): the fan's geometry is an arc and cannot
  stack. Platform is its only caller, so it lives in `platform/`, which has 24 files.
- **`MobileMenu`** (`components/sections/`): extracted from `Header.tsx`, which is over 500 lines.
- **Page-specific (c) sections** live in `feature-previews/<page>/`, like v1's minis. Each is the feature's own object
  and none is generic. If a second page ever needs one, promote it then.
