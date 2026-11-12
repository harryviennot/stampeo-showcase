# STA-546 Stage F: v2 foundation

You implement the v2 foundation in the showcase repo.

- **Worktree:** `/Users/harryviennot/LocalDocuments/fidelity/showcase/.claude/worktrees/sta-546`, branch `feat/sta-546-landing-variants`.
- **Never:** push, merge, or touch Supabase.
- **Commits:** no Co-Authored-By trailer.

After this stage, four page stages run in parallel, one per page and each in its own worktree, on top of your commit. **Everything they share must exist when you finish, so they never have to edit a shared file.**

## Read first, fully

1. `docs/features/STA-546/plan.md`. Start at "v2: Harry's first look", then read "v2 pages" and "v2 acceptance criteria" (AC1v2…AC25). v2 wins over v1 wherever they differ.
2. `docs/features/STA-546/ux-brief-v2.md`. This is the spec, in particular §2 (Shared), §3 (Platform detail), §4 (Components) and §6 (Claims).
3. `docs/features/STA-546/research-passentry.md`. Also look at `shots/passentry/desktop-*.png` and `shots/us-live/desktop-00..01.png`, which show the hero badges above the dashboard.
4. `docs/features/STA-546/stages/stage-a.md` and `stage-bc.md`. Their rules still hold: CTAButton and `trackAs`, the type tokens, RegionPricingProvider, the conventions, verification and AGENTS.md.
5. The v2 copy, already written in `lib/landing-pages/copy/{types,shared,program-types,how-it-works,features,outcomes,platform}.ts`. Don't reword strings. You may add fields for accessibility text, or for non-copy data such as hrefs, and say so in your report. If a string cannot be placed as written, report it.
6. The stampeo-ux-ui skill in `/Users/harryviennot/LocalDocuments/fidelity/.claude/skills/stampeo-ux-ui/` (SKILL.md and `references/showcase.md`). For these pages, Harry's verdict overrides its restraint bar: see plan v2.

The type-check is currently red, on purpose. Three v1 components (`MessagesSpotlight`, `HowSteps`, `ReturnSpotlight`) read copy fields that v2 removed. You rework or delete them.

## What you build

### A. Tests first

Update `lib/landing-pages/{registry,shared-sections,page-visuals,copy}.test.ts` and `lib/testing/landing-pages-source.ts` for v2. Watch each new pin fail before you write the code.

**Registry** (AC1v2, AC2v2, AC3, AC4)
- Four slugs and their exact section lists, from the plan's v2 table:
  - How-to: 12.
  - Features: 12.
  - Outcomes: 11.
  - Platform: 13 ids, counting `marquee`.
- Never more than 13 sections.
- Each page renders its sections once, in order. The pages that are still placeholders after your stage use the `STAGED` / `test.todo` mechanism Stage A used, so the page stages can arm it.
- Variants: `lp_howto`, `lp_features`, `lp_outcomes`, `lp_platform`.
- `hasDemoSection` is true for how-it-works, features and platform.
- Every page has noindex metadata, and none appears in the sitemap or llms.txt.
- Every page renders `PricingSection market="us"`.
- The three argument pages end with pricing · faq · final_cta.
- Platform's tail is pricing · final_cta · sectors · blog.

**Copy** (AC10, AC11, AC12, AC13, AC20)
- **"levels" is allowed now.** Add "tiers" to the forbidden table (the product's noun is "levels").
- **Budgets:**
  - every `title` field ≤ 44, except final CTA and band titles (≤ 36) and the hero `h1` (≤ 46);
  - every `lead` ≤ 85;
  - every `eyebrow` ≤ 28;
  - every `accent` is a substring of its `h1` or `title`.
- **The broadcast rule.** A string matching /broadcast/i must sit in one of these places:
  - a `Moment`, `Fact` or `Tile` whose `plan` is "Growth and Pro" or "Pro";
  - one of the PlanLine fields, allowlisted exactly: `FEATURES.messages.broadcast` and `OUTCOMES.slowDays.noFees`.
  - The test must fail when a new unlabelled mention appears.
- **Figures:** every % or N× string must be a `SourcedFigure`'s `value` or `text`, or `OUTCOMES.regulars.example.text`. That covers `OUTCOMES.headStart.empty` and `withHeadStart`.
- **`$`:** only in the Example.
- **No digit-day literals.**
- **Every copy string containing `{trialDays}`** must be rendered through `RegionText`. Generalise the v1 pin, which only covered the reassurance and FAQ answers, to every such string. That now includes `HOW_IT_WORKS.firstDay.items`.

**Claims in reused demos** (AC24)
- `ScanDemo chrome="minimal"` renders no "REC" and no timing text.
- Every `NotificationSequenceDemo` and `NotificationPhoneDemo` on these pages is fed by `lpBanner` (sender = the sample business, with its icon).
- The level-up banner's sender is `LEVELS_BUSINESS`.

**AC15v2**
- Every newly extended shared component has its pre-existing call sites passing none of the new props: `WalletCard headerLabel`, `CTAButton variant="inverse"`, `Segmented size`, `NotificationSequenceDemo moments`/`design`, `ScanDemo chrome`, `CardDesignPlayground compact`, `BlogCard detail`.
- Verify that the default markup is identical to origin/dev with `renderToStaticMarkup` against the `git show origin/dev:` files, as Stage E did. Report the result.

**Hero and sectors** (AC18, AC19)
- The three argument pages' hero renders `walletBadges` and `DashboardDuo`.
- `DashboardDuo` shows the desktop capture with no responsive `hidden` class, so it is visible at every width. It renders the `SHARED.dashboardUrl` browser bar and the `SHARED.sampleData` caption.
- All four pages render `LpSectors`.
- No landing file says "testimonial", "story" or "stories" near the sectors.

**Share tree** (AC22)
- Platform's share tree source and copy never say integration, POS or sync.

### B. Registry and routes

- `lib/landing-pages/pages.ts`: add `platform`, the v2 section unions and lists, and `hasDemoSection`.
- Add `app/[locale]/us/landing-pages/platform/page.tsx`, built on the shell like the others. Leave its middle as a placeholder with `TODO(STA-546 stage G4)`: render its hero placeholder (or the real hero, see below), `PricingSection`, the accent band and `LpSectors`, so the route and metadata exist.
- `SINGLE_LANGUAGE_PAGES` already covers `us/landing-pages`. Check that it covers `platform`.

### C. Shared v2 components (`components/landing-pages/shared/`)

Build each one complete, to the brief's spec:
- **`LpHero` v2** (brief §2, "Shared hero"):
  - centred text at every width, with the H1 and its accent;
  - sub, CTA, the demo link (a plain `<a href="#demo">`, only where `hasDemoSection`), reassurance (via `RegionText`), the proof line;
  - then the official `walletBadges("en")` (not links, as on `/us`; check how `VariantHero` renders them), then `DashboardDuo`.
  - The v1 right-hand hero visuals go away. Move `HowHeroVisual` to `shared/WalletPhone.tsx`; the page stages reuse it.
- **`DashboardDuo`:**
  - `landingShot("en","desktop")` in a frame with the browser bar (three dots and the `app.stampeo.app` pill), plus the phone capture (`PhoneScreenshot`, `landingShot("en","phone")`) overlapping its bottom-right edge, at every width;
  - the brief's 390 and desktop geometry;
  - the "Sample data" caption;
  - next/image with correct `sizes`; the desktop capture `priority` in the hero.
- **`LpSectors`:** compose `SectorCarousel`, `SECTOR_THEMES` and the `sector-slides` helpers, under the catalog's "Stampeo adapts to your business" title and subtitle. Look at `VariantSectorCards` for how it reads them, how `<accent>`/`<mbr>`/`<br>` tags render, and how `market="us"` gives $ amounts. Don't edit `landing-variant/`. Add an optional `eyebrow` (Platform passes `SHARED.sectorsEyebrow`).
- **`LpHeading`:** add optional `eyebrow` and `align="center"`. The eyebrow style is in the brief: semibold uppercase `tracking-[0.2em]`, `--accent-hover`. `LpDemo` gets `eyebrow` and `align` too.
- **`LpCtaPair`:** the primary `CTAButton` plus the secondary `#demo` anchor styled as a 52px outline pill. Stacked full-width on a phone; one centred row on desktop.
- **`GlassCard`**, plus **`PlanChip`** and **`FactList`**: render `Fact[]` with their plan chips, the neutral pill style v1's `PlanLine` uses. One component serves every plan label.
- **`LevelCards`:**
  - The barbershop sample (`STAMP_SAMPLES` id "barber") as Bronze (its own look), Silver and Gold, fanned, each with the level name as `headerLabel`.
  - Mirror the Silver and Gold palettes into `lib/levels/looks.ts`, with a comment pointing at `backend/app/services/programs/levels/skins.py` (read it).
  - Reads `LEVEL_UP_BANNER` for an optional banner.
- **`SampleCapture`:** add a `view` prop (`phone`, `phone-habits`, `phone-busiest`; check that the PNGs exist).
- Keep `AurevoCard`, `banner.tsx` (`lpBanner`), `PhoneCrop`, `PlanLine`, `LpSection`, `LpSpotlight`, `LpDemo`, `LpFaq` and `LpFinalCta`, extended if needed.
- **`LpAccentBand`:** used by Platform only, but build it here so the stage-G4 route compiles. Inset `rounded-[28px]`, `bg-[var(--accent)]`, near-black text, `CTAButton variant="inverse"`, reassurance.

### D. Optional props on shared site components

Default markup must stay identical:
- `WalletCard headerLabel?`
- `CTAButton variant "inverse"`
- `Segmented size? "md"|"lg"`: lg is 44px tall.
- `NotificationSequenceDemo`:
  - `moments?` and `design?`;
  - render banners through a prop so the caller can pass `lpBanner(...)` output;
  - read its source first, to see how it draws the card and the banners.
- `ScanDemo chrome? "full"|"minimal"`: minimal hides REC and the timing text.
- `CardDesignPlayground compact?`: the brief lists what it hides.
- `BlogCard detail? "default"|"rich"`: reading time and a 2-line excerpt; check what the post metadata offers.
- Icon aliases in `components/icons/index.tsx`, additive only: Instagram, Facebook, Printer, Storefront, GoogleLogo, ArrowsClockwise, and the business-type icons the marquee needs.

### E. Keep the three argument pages compiling

Give them the v2 hero, then their shared end blocks: pricing, faq, final_cta (sectors comes in the page stages). Mark the middle with `TODO(STA-546 stage G1/G2/G3)`, and use the `STAGED` test mechanism.

Delete the v1 components that v2 drops once nothing imports them, for example `HowSteps`' step tiles, `MessagesSpotlight`, `DesignSpotlight` and `ReturnSpotlight`. Check `ux-brief-v2` §4 for what is kept, moved or exported first. `PlacardVisual` is reused by How-to step 2: move it to `how-it-works/PlacardVisual.tsx`.

## Verify

```bash
bun test lib scripts
bun run type-check
bun run lint
```

All green, except the declared `test.todo`s.

**Visual check:**
- Run `bunx next dev -p 3020` and shoot the heroes of all four pages at 390x844, 1024x768 and 1440x900. Use headless Chromium from `/Users/harryviennot/LocalDocuments/fidelity/promo-videos/node_modules/playwright`, with `timezoneId` America/New_York. Wait for "load" + 2.5s, and scroll the page first so ScrollReveal content renders.
- Also shoot `/en/features/notifications-push`, `/en/features/scanner-mobile`, `/en/features/design-de-carte` and `/en/blog` at 390, to confirm the extended components look as before.
- Save under `docs/features/STA-546/shots/stage-f/` (git-excluded) and LOOK at every shot. At 390 the desktop dashboard must be visible in the hero.
- Stop dev and restore AGENTS.md. Don't run `bun run build`.

## Report

- What you built, against each item above.
- Diff stat.
- Test counts, and the AC15v2 markup comparison result.
- Shots and what you fixed.
- Every new optional prop.
- Anything the page stages need to know.
