# STA-546 Stage P: Platform polish (Harry, 13 Nov 2026)

Harry likes the Platform page (`/us/landing-pages/platform`) best and asked for a polish round. Three stages run in parallel, each in its own worktree branched from the STA-546 branch tip:

- **P1a**: the hero wheel, the numbers, the final band, the share-tree scroll.
- **P1b**: the "In their wallet" section.
- **P1c**: program types, the platform toggle and the captions.

**P2** comes later, once the video exists: the Scanner loop, on every page.

Your prompt's first line says which stage you are and gives your worktree and branch.
- Work only there.
- Never push or merge, and never touch Supabase.
- Commit with no Co-Authored-By trailer.

## Read first

- `docs/features/STA-546/plan.md`: the v2 sections, plus "v2.1: Platform polish", which records Harry's calls below.
- `docs/features/STA-546/research-passentry.md`, and LOOK at `docs/features/STA-546/shots/passentry/desktop-*.png`. Harry wants the Platform page to feel like PassEntry's: the same layout ideas, our words, our visuals.
- The Platform files: `components/landing-pages/platform/*` and `app/[locale]/us/landing-pages/platform/page.tsx`.
- The shared kit in `components/landing-pages/shared/`, including H1's shared `ScaledBox` and `PassFrame`.
- The stampeo-ux-ui skill in `/Users/harryviennot/LocalDocuments/fidelity/.claude/skills/stampeo-ux-ui/`: `SKILL.md` and `references/showcase.md`.

## Rules

- **Harry's direction wins** over earlier plan text, where they conflict.
- **Copy:**
  - Don't reword strings in `lib/landing-pages/copy/*`. The coordinator has made the copy edits these items need. If a string is missing or can't be placed, report it.
  - You may add accessibility text and non-copy data.
- **Mobile first:** 390px designed first, tap targets ≥ 44px, nothing hover-only (hover is an enhancement; touch gets an equivalent), no horizontal scroll.
- **Reduced motion:** every animation has a calm, static state.
- **Shared site components:** additive optional props only. Defaults must render byte-identical (compare against `git show origin/dev:` with `renderToStaticMarkup`), and existing call sites stay unchanged.
- **Test-first** for observable behaviour. Make each new pin fail first, against a deliberately broken copy.
- **Pixels:** shoot your sections at 390x844, 1024x768 and 1440x900 with headless Chromium from `/Users/harryviennot/LocalDocuments/fidelity/promo-videos/node_modules/playwright`.
  - Use timezoneId `America/New_York`.
  - Wait for "load" + 2.5s, and scroll through the page first.
  - Shoot reduced motion too.
  - Put each shot beside the matching PassEntry shot, and LOOK at both.
  - Save the shots under `docs/features/STA-546/shots/stage-p<x>/`.
- **Dev server:** P1a uses port 3031, P1b 3032, P1c 3033. Stop it at the end, and restore AGENTS.md if `next dev` rewrote it.
- **Before you report:** `bun test lib scripts`, `bun run type-check` and `bun run lint` are all green. Don't run `bun run build`.

## P1a: hero, numbers, final band, share tree

1. **The hero wheel.** Replace the current hero fan (`HeroCardFan` / `FanParallax`, imported from `landing-variant/`) on Platform only, with a new **card wheel**.
   - **Cards:** about 14 to 16 of our nicest sample cards, sitting on the rim of a large wheel whose centre is below the hero, and slowly turning, like a Ferris wheel seen from the front. The cards stay upright, or tilt with the rim, whichever reads better in the pixels.
   - **Sources, all fictional:**
     - `lib/loyalty-samples.ts` (`STAMP_SAMPLES`, `POINTS_SAMPLES`);
     - the sector brands in `components/landing-variant/sector-themes.ts`: `rolling-slice` (pizza), `fournee`, `lashwell`, `harvest-row`, `saltmoss`, `smash-club`. See how `lib/landing/sector-slides.ts` builds their wallet designs (`sectorWalletDesign`).
   - **Exclude the "barber" sample:** its brand is real, and STA-550 replaces it.
   - **Cards render as live `WalletCard`s,** each in a fixed-scale wrapper (no hydration jump).
   - **Motion:** a slow continuous rotation (about 60 to 90s per turn), CSS transform-based, paused when off-screen. Under reduced motion it is static.
   - **Layout:** the H1 and the CTA pair stay readable, either above the wheel or with the wheel arching behind the CTA pair as PassEntry's fan does.
   - **Phone:** at 390, fewer cards are visible (the wheel is larger than the viewport), and the CTAs are never covered.
   - **Performance:** keep LCP sane. Visible cards render first; the rest can render lazily or at lower priority.
   - **Don't edit `landing-variant/`.**
2. **Numbers.** Draw the three figures (120+, 20,000+, 25+) in the handwritten font of the original homepage's numbers strip. Look at `components/landing-variant/VariantMetricStrip.tsx` and the `.ink-figure` class in `app/globals.css`. Size them for the Platform layout. The labels stay as they are.
3. **Final band** (`LpAccentBand`, or wherever H1 moved it): no longer a massive orange box. Use a cream card on the page background with orange accents:
   - the dark headline, with its accent word ("today.") in orange;
   - the orange primary "Start my free trial";
   - the reassurance;
   - a faint warm orange glow or gradient at the edges.
   - Keep it inset, rounded and generous, but calm. `trackAs="final_cta"` stays.
4. **Share tree.** The branch lines fill as you scroll, as on PassEntry: the stroke progress follows the section's scroll position (scroll-linked, not a one-off draw). Full lines under reduced motion, and on phones if the vertical tree reads better complete; decide from the pixels.

## P1b: "In their wallet" (`deliver`)

1. **Floating cards (`GlassCard`).**
   - Make them read like PassEntry's floating cards: bigger titles (around 22 to 28px in the heading font), with the alignment per card that PassEntry uses. "Push notifications" and "Analytics & insights" are left-aligned and large; "Real-time updates" is centred.
   - Use clean, light glass surfaces, consistent radii and soft shadows.
   - Use the copy's labels: `PLATFORM.deliver.analyticsLabel`, `notificationsLabel` and `updatesLabel`.
2. **Notification card.** Clean up the fake notification banner inside the notifications card: a crisp, real-looking iOS notification (sender Aurevo with its icon, via `lpBanner`). No double-nested card look and no clipped edges.
3. **Analytics card.** Drop the cropped screenshot. Build small analytics components of our own, in the spirit of PassEntry's "Analytics & insights" card (donut plus mini chart), but with **our** analytics:
   - Use 2 or 3 of these: a visits tile with a trend, a 30-day return-rate tile, a small "visits over time" bar chart, and a donut of returning vs first visits.
   - Only every-plan analytics: no busiest-times grid.
   - Use the dashboard's visual language (look at `public/images/landing/dashboard/en-desktop.png` for colours, type and the tile style).
   - The numbers are illustrative and consistent with the captures (2,770 visits ▲17%, 61% return rate).
   - **No "Sample data" caption** (Harry: "this is a landing page, we don't need to go into detail").
4. **Phones.**
   - **Left:** keep the iPhone with Apple Wallet (Aurevo).
   - **Right:** replace the second iPhone with an **Android phone** showing **Google Wallet**:
     - Build a generic Android frame component in `components/ui/AndroidPhone.tsx`: a Pixel-like body, a centred punch-hole camera, an Android status bar (time on the left; Wi-Fi, signal and battery on the right), a gesture bar, and the same API shape as `components/ui/IPhone.tsx` (`width`, a screen slot).
     - Don't copy any manufacturer's artwork. Draw it in CSS or SVG.
     - Inside it, a Google Wallet screen showing Aurevo's card as Google Wallet renders a loyalty pass. Port `web/src/components/card/GoogleWalletCard.tsx` (and what it needs) from `/Users/harryviennot/LocalDocuments/fidelity/web` into `showcase/components/card/` (showcase's card components are ports of web's), plus a minimal Google Wallet app chrome around it.
     - The Android phone shows the lock-screen notification or the Wallet card, whichever makes the composition read best next to the iPhone.
5. **Layout.** Re-balance the two phones and the three floating cards against PassEntry's composition at 1440 and 1024. On phones keep a clean stack, with no overlap that hides content. The official Add to Apple Wallet / Add to Google Wallet badges stay under the phones.

## P1c: program types, the platform toggle, captions

1. **Program rows (`ProgramTypeRows`).**
   - **Reveal on hover:** on desktop, hovering a row opens it (eyebrow and body appear) and closes the others. Focus and tap open a row too (keyboard and touch).
   - No scroll-following any more: remove the IntersectionObserver.
   - On phones and under reduced motion every row is open, as now.
   - The server markup has every row open.
   - Update the pure helpers and tests (`rowsFollowScroll`/`isRowOpen` or equivalents) to the hover model.
2. **Remove the "Every plan" chip** from each row (Harry).
3. **Levels row.**
   - Don't use the barbershop ("Les Garçons Barbiers" is a real brand). Create a new fictional brand of another business type, with the barbershop card's colours: a crisp white card with near-black ink.
   - Use a preset stamp icon from the site's preset library that fits that business, so the level looks (Bronze, Silver, Gold) still change.
   - Make its wordmark logo yourself, rendered to an image: for example an HTML page with a Google Font in headless Chromium, with a transparent background. Never borrow a logo.
   - Name: coined and clearly fictional. Add it to `components/landing-pages/shared/samples.ts`.
   - Update `LevelCards` and `LEVELS_BUSINESS` / `LEVEL_UP_BANNER`'s sender **through the coordinator**: report the name and the coordinator will change the copy. Until then, keep the copy's sender in sync by importing the constant.
   - `LevelCards` is shared, so Features and Outcomes change too, as intended.
4. **Points row.** Show the Vanity card (`POINTS_SAMPLES` id "salon"), not Marginalia, on Platform.
5. **Platform toggle card.**
   - Remove the caption under the dashboard ("Sample data · Some charts come with Growth and Pro."). Give `DashboardDuo` a `caption` prop, default as now, and have Platform pass `caption={false}`.
   - The broadcasts fact no longer carries a "Growth and Pro" chip. The coordinator removes `plan` from that fact in the copy; just make sure nothing re-adds it.
6. **Captions elsewhere on Platform.** No "Sample data" anywhere on the Platform page. Adjust the caption guard test to exempt Platform explicitly, with the reason "Harry, 13 Nov: a landing page doesn't need the detail". Other pages keep their captions.

## P2 (later): the Scanner loop on every page

The video arrives at `public/videos/landing/scanner-loop.{webm,mp4}`, with posters `scanner-loop-poster.webp` (the success frame) and `scanner-loop-first.webp`.

Build `components/landing-pages/shared/ScannerLoop.tsx`:
- `IPhone` (statusBar "light") around an autoplaying, muted, looping, `playsInline` `<video>` with both sources and the poster;
- `preload="metadata"`, and playing only when in view (IntersectionObserver);
- under reduced motion, the poster image only, with no video;
- an `aria-label` describing the stamping flow.

Replace every `ScanDemo` on the four landing pages with it: How-to step 3, Features scanner, Platform "how" and the Scanner tab. Remove the pins that require `ScanDemo chrome="minimal"` there, and add pins for `ScannerLoop`.
