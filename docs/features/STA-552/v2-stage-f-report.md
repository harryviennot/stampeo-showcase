# STA-552 v2 Stage F: report

Everything is done except one item, which belongs to builder 4 (the menu one-liners; see item 3). Branch `feat/sta-552-feature-previews`, worktree `/Users/harryviennot/LocalDocuments/fidelity/showcase/.claude/worktrees/sta-552`. Tests, type-check and lint are green. Nothing pushed or merged, no Supabase, no co-author trailers.

## (a) Brief vs. what I did

**1. Tokens and kit**
- **`.keycap`** is in `app/globals.css`: ink frame and 3px ledge, hover lift only under `(hover: hover)`, 80ms press, and no movement under reduced motion.
  - I added `.keycap-flat` (no ledge at rest, takes the keycap motion on hover and press). The brief's outline pill needs it, because an unlayered `.keycap` rule beats any Tailwind shadow utility.
- **`EYEBROW_PILL`** is in `LpSection.tsx` and used by `LpHeading`, `HeroWords` (both looks) and `StepHeading`. In `StepHeading` the number stamp now sits beside a pill.
  - `IconsStrip`: not touched. Builder 1 owns it, its label is already grey, and v2 turns it into the handwritten 98.
- **Grey row labels:** `HoverRows` is now `--muted-foreground`. `TypeMarquee` already was; I only added a test that pins it.
- **`CTAButton keycap`** is an optional prop, off by default. The default markup is byte-identical (a snapshot and an SSR compare show it).
- **`LpCtaPair`:** keycap trial button with `mb-[3px] sm:mb-0`; the second action is white with a 1.5px ink border and no ledge at rest.
- **`LpAccentBand`:** the button is a keycap; the band stays a clean cream surface.
- **`GlassCard`, `StepsTable`, `ToggleCard`:** stamped. `ToggleCard` gets a 24px radius, 28px from `sm`.
- **`RelatedPreviews`:** stamped lifting tiles, no eyebrow, optional `title`.
- **`IconTile tone="brand"`** added. **`FAQList` table:** frame is `card-stamp rounded-[20px]`; the default (inked cards) is unchanged.
- **Additions the builders need:**
  - `STAMPED_STAGE` and `STAMPED_CARD` in `platform/classes.ts`. Builders should use these instead of retyping the classes.
  - `Chip` exported from `shared/PlanChip.tsx`. `PlanChip` renders the same markup as before.
  - `PreviewHero eyebrowChip` and `HeroWords eyebrowChip`: a plain chip beside the label, used for "Coming soon · Pro".

**2. Data**
- **Level looks:** `BRONZE_LOOK`, `PLATINUM_LOOK`, `NOIR_LOOK`, and `LEVEL_LOOKS` in the backend's catalog order. Values are pinned in `looks-values.test.ts`, copied from `skins.py`.
- **Registry:** `platform/geolocation` (variant `lp_platform_geolocation`, noindex) is in `PREVIEW_SLUGS`.
  - New section ids: `palettes`, `blind_spots`, `ladder`, `recap`, `composer`, `day`, `editor`, `status`, `privacy`.
  - All six pages use the brief's §3 lists, and `previews/registry.test.ts` now pins them.
- **`FEATURE_PREVIEWS.geolocalisation = "platform/geolocation"`.** Header and footer feature links from Platform-family pages now open it.
- **Route:** `app/[locale]/us/landing-pages/platform/geolocation/page.tsx` renders the hero (with the "Coming soon · Pro" chip, one trial button, no picture yet), a marker, the band, and `RelatedPreviews` with its title "Bring them back today."
- **Staging:** the five existing routes plus geolocation carry `{/* TODO(STA-552 v2 builder): … */}` right after the hero.
  - `STAGED_MARKER` and `isStaged` live in `lib/testing/landing-pages-source.ts`.
  - `previews/registry.test.ts` branches on them. While the marker is present, the full-order test is a `todo` and a lighter test checks the page still opens on its hero, repeats no section, and ends on the band and links. Delete the marker and the full test arms itself.
  - `pages.test.tsx` reads the sections each page actually draws (`drawn()`), so it needs no builder edits and no skips.
  - After all four builders land: delete `STAGED_MARKER` and `isStaged` in `landing-pages-source.ts`, and the staged branch in `registry.test.ts`. The `6 todo` in the run are these six pages.

**3. Copy**
- **Where it is:** `lib/landing-pages/copy/previews/geolocation.ts` is new and registered in `lib/testing/landing-copy.ts`. Additive keys were added to analytics, card-design, mobile-scanner, push-notifications and promotional-campaigns.
  - The v1 keys stay, because the staged pages still read them. Builders delete the ones they orphan.
- **Guards:** the new copy passes the budget and claim guards. `plan-claims.test.ts` gained new chip and `PLAN_LINES` entries.
  - Geolocation is tied to `PLAN_FACTS.pro.geofencing === "coming_soon"`, so a plan change fails the tests.
- **New geolocation tests** in `copy.test.ts`: no date, future tense or "soon" on every claim, a wallet named only in the "Today" column, no waitlist.
- **`claims.md`:** a "v2 additions" table with a source per claim, and a "Coming soon (not live)" section for geolocation.
- **Skipped: the phone-menu one-liners** (`common.nav.featuresItems.*.description` and the em-dash allowlist line in `i18n-catalogs.test.ts:82`). The brief's §5 table gives these to builder 4, and they are catalog work in four locales. I read the English drafts against the skill and have no changes to them.

**4. `lib/landing-pages/variants.ts`:** `heroVariant` and `menuVariant`, each taking anything with a `get` method; unknown or missing falls back to `stack` / `sheet`. Nothing reads them yet.

**5. Menu plumbing**
- `Header` takes `mobileMenu?: "today" | "v2"` (default `"today"`) and renders `data-mobile-menu="v2"` on `<header>` only when `v2`.
- `LandingPageShell` passes `v2`.
- `preview-nav.test.ts` has a source-level test that no other caller passes it.
- Beyond the brief: I chose the `data-mobile-menu` attribute instead of leaving the prop unused, which would add a lint warning. All other pages' `<header>` markup stays byte-identical.

## Snapshots that changed on purpose
Six, all in `default-renders.test.tsx` under "Platform's own pieces". The other 17 snapshots (the live components) are byte-identical.
- `LpCtaPair`: keycap trial button, 1.5px outline.
- `LpAccentBand`: keycap.
- `PlatformHero`: keycap pair.
- `HowTable`: pill label and stamped table.
- `PlatformToggleCard`: stamped surface.
- `ProgramTypeRows`: grey row labels.

## Byte compare of live pages
I fetched the server-rendered HTML of 26 pages before and after (dev server on 3101, scripts and links stripped, deterministic across two fetches).
- **17 identical:**
  - Home and loyalty: `/us`, `/en`, `/` (fr), `/es`, `/pl`, `/programme-fidelite`.
  - The 6 `/en/features/*` pages, plus `/features/design-de-carte` and `/features/geolocalisation`.
  - `/en/pricing` and `/en/about`.
- **9 changed, as intended:**
  - Platform and the 5 previews: pills, keycaps, stamped objects, plus the header attribute.
  - `how-it-works`: Step labels become pills, plus the header attribute.
  - `features` and `outcomes`: the header attribute only.

I looked at Platform shots (`docs/features/STA-552/shots/v2-f/`, git-excluded) next to `design-v2/mock/*-after.png`: 390 deliver and numbers, 1440 how, plus the stamped toggle surface, the keycap and the geolocation hero. They match; the only difference is the extra 3px under the stacked keycap.

## (b) Commits (4)

```
d90fd12 refactor(STA-552): one stamped stage and one stamped card class for the kit and the builders
c5ffd0b feat(STA-552): v2 foundation: the hybrid look, the geolocation preview, the new section lists and their copy
5215233 feat(STA-552): bronze, platinum and noir level looks, from the backend's catalog
c2c9dde feat(STA-552): ?hero= and ?menu= switches as one pure helper
```
`git diff --stat 6893cdd..HEAD`: 51 files changed, 1327 insertions, 178 deletions.

I did not split `c5ffd0b` into kit, data and copy. They depend on each other (`RelatedPreviews` needs the geolocation slug; the geolocation route needs `eyebrowChip`).

## (c) Tests
- **Baseline before:** 5544 pass, 4 skip, 0 fail.
- **Now:** `bun test lib scripts` gives 5678 pass, 4 skip, 6 todo, 0 fail, 23 snapshots.
- **New or changed test files:**
  - `variants.test.ts` and `hybrid-look.test.tsx` (new).
  - `looks-values.test.ts`, `previews/registry.test.ts`, `previews/pages.test.tsx`, `copy.test.ts`, `plan-claims.test.ts`.
  - `preview-nav.test.ts`, `extended-components.test.tsx`, `shared-sections.test.ts` (`CTAButton: keycap` joins the call-site guard).
- **Failing first:** the helper, looks and kit tests were run failing before the code existed.
- `bun run type-check` clean. `bun run lint`: the same 6 warnings as before, none new. No build, as instructed.
- I mutation-checked 6 of the new tests (each broke when its code was changed back) and restored the files.
- Dev server on 3101 killed, port free, `AGENTS.md` unchanged.

## (d) Things you should know

**Copy lines changed from the §6 drafts**
- **Geolocation H1:** "Soon, your card will appear when they walk by." The draft said "shows up", which is present tense. This is 46 characters, exactly the budget.
- **Geolocation future tense:** the meta description, `how` title, lead and cell 3, privacy title and lead and all three facts, and the band sub are now future tense (the draft had present tense).
- **Privacy lead:** replaced. The draft duplicated fact 1. It now reads "The card will carry your shop's address, never their whereabouts."
- **"Soon, on Pro" column:** now a "Coming soon" heading with a `Pro` chip. The chip is tied to `PLAN_FACTS`.
- **Campaign filter chips:** "Joined in the last month" and "Inactive for a month", not "30 days". The copy guard forbids digit-day counts. The second chip carries the Pro label and the first inherits the page's Growth and Pro, which is my reading of the brief's single "Pro" next to two chips.
- **Blind-spot answers:** the grey lines carry no digit days and no percentages ("visits in the last three months", "came back within a month", "come at least every two weeks"). The numbers are the builder's fixtures.
- **Card design:**
  - The own-icons row eyebrow is now "Your burger, your logo" and its alt describes a burger bar, to match Smash Club.
  - The `faq.eyebrow` "FAQ" is gone.
- **Related cards:** the "Keep exploring" label is gone.
- **Push level-up banner:** Aurevo as sender, with the shared level-up text.

**Lines I could not source (`claims.md` flags them)**
- "A short line you write for each location": the planned design only. `pass_generator.py:33-36` says to re-enable once per-location wallet_message UX ships; no screen exists. The hero banner's title and body are an invented example of that line.
- "The card already in their wallet will pick it up with its next update": inferred from `pass_generator.py:39-41`, not confirmed for the launch design.
- No wallet is named for geolocation itself, per your open-question default.

**Traps and adjacent notes (not fixed, or decisions you may veto)**
1. **`LpFaq`:** brief §1.3 says no eyebrow on the FAQ header, so a page that passes its own `faq` now gets Platform's centred header and stamped table, with no label. The old keying on `faq.eyebrow` is gone, and plan AC8's wording ("header centred with the eyebrow") is superseded. The default `<LpFaq />` is unchanged (snapshot).
2. **Geolocation is in no sibling's `related` row.** It is reached from the Platform-family menus.
   - The "walk the previews" tests model that with a `FROM_THE_MENU` list.
   - **Question for you:** should one preview's `related` row include it?
3. **`FactList` check marks** still use `--accent-hover`. Brief §1.2 lists check marks under `--accent`, but §1.4's seven edits don't include `FactList`, so I left it. A one-line change if you want it.
4. **Section ids kept for now:** `moments`, `wording` and `questions` stay in `LandingSectionId` until the builders delete the v1 components that render them. Remove them at the merge.
5. **`how-it-works`** also changes through `StepHeading`; `features` and `outcomes` change only by the header attribute.
6. **Header.tsx** is 527 lines. Builder 4's `MobileMenu` extraction is what brings it down.

## Contracts for the Stage P builders

**All builders**
- **Style tokens to use:** `STAMPED_STAGE`, `STAMPED_CARD`, `EYEBROW_PILL`, `.keycap` (plus `.keycap-flat` for the quiet variant), `Chip`, `PlanChip`, and `LpSection title eyebrow`, which renders the pill.
- **Marker:** delete the `TODO(STA-552 v2 builder)` comment in your route once it renders the whole registry list, in order.
- **Header rule:** every section header is an eyebrow, a centred title and a lead (`pages.test.tsx` checks this from `drawn()`). Copy for a section is found by the camel-cased id (`blind_spots` is `blindSpots`).
- **Lists to keep in step:** when you delete v1 copy keys, delete the matching `CHIPPED` and `PLAN_LINES` entries in `plan-claims.test.ts`, and the matching `LEVELS_WITHOUT_CHIP` entries in `copy.test.ts`.
- **Plan labels:** any new chip you print goes into `CHIPPED` with its `PLAN_FACTS` gate. Any new sentence naming a plan goes into `PLAN_LINES`.

**Builder 1: Platform hero and card design**
- You can use `heroVariant(searchParams)` from `lib/landing-pages/variants.ts` and the level looks (`LEVEL_LOOKS` keys `bronze` to `noir`).
- **Card design copy:**
  - `CARD_DESIGN_PREVIEW.reskin.captions`: six strings in card order.
  - `palettes`: `{eyebrow, title, lead, logoLabel, swatches[5]}`.
  - `icons.figure`: `{value: "98", label: "stamp icons"}`, next to the existing `icons.label` and `icons.alt`.
  - `stamps.rows` and `stamps.cardAlts` now describe Patoune, Smash Club and Gelo.
- **v1 `numbers`:** copy for `DesignFigures` is still there. When you delete the component, also delete `numbers`, and in `copy.test.ts` point the "98 stamp icons" test at `icons.figure` (it already also checks that).
- **Platform page:** its section list is unchanged, so it has no marker.
- **Hero tests are yours to update:**
  - the fan-hero and seven-card tests in `pages.test.tsx` and `platform-page.test.tsx`;
  - "PlatformHero: the fan hero a preview can reuse" in `kit.test.tsx`;
  - the Platform hero snapshot, if the hero changes by default.

**Builder 2: analytics and geolocation**
- **Analytics copy:**
  - `ANALYTICS_PREVIEW.blindSpots`: `{eyebrow, title, lead, toggle{label, paper, stampeo}, unknown "???", cards[6]{key, question, figure?, line}}`.
  - `ladder`: `{eyebrow, title, lead, toggleLabel, plans[3]{label, history{value, unit}}, rows[3], proRows[2], locked}`. `plans` run in `TIERS` order and the history is read from `PLAN_FACTS`.
  - `recap`: `{eyebrow, title, lead, email{from, subject, figures[4], nudge}, facts[2]}`.
  - Numbers are fixtures, not copy: `ANALYTICS` from `DeliverAnalytics` for visits, return rate and new customers, plus your own constants for the rest. A component that prints percentages must join `DRAWN_SAMPLE_DASHBOARDS` in `copy.test.ts`.
- **Geolocation copy:** `GEOLOCATION_PREVIEW` has `meta`, `hero`, `heroChip`, `banner{sender, title, body}`, `status{today, soon}`, `how`, `privacy` (with `alt`), `faq`, `band` and `related.title`.
  - Use `<LpFaq faq={GEOLOCATION_PREVIEW.faq}/>`.
  - The route already passes `eyebrowChip` and the related `title`.
  - Fill the hero `visual`. `GeofencingHeroAnimation` still needs your optional props (`sender`, `title`, `body`, `date`).
  - The page-wide tests in `pages.test.tsx` cover the page automatically once the marker is gone.

**Builder 3: push and campaigns**
- **Push copy:**
  - `PUSH_NOTIFICATIONS_PREVIEW.day`: `{eyebrow, title, lead, nodes[4]{key, label, banner}}`.
  - `editor`: `{eyebrow, title, lead, toggle{label, ready, own, plan}, messageLabel, previewLabel, ready{text}, own{text, preview}, switches[3]}`.
  - `own.text` uses `{first name}` and `{stamps left}` as chips. They map to the editor's "Customer first name" and "Stamps remaining".
- **Campaigns copy:**
  - `PROMOTIONAL_CAMPAIGNS_PREVIEW.composer`: `{eyebrow, title, lead, card{title, message, audience{title, all, filtered, filters[2]}, schedule{title, now, later, plan}, send, sendAgain, delivered}}`.
  - Each `ideas.rows[i].chip`: happy-hour "Slow afternoon", new "Something new", we-miss-you "Gone quiet", close "Almost there". Order them that way. Use the row's `body` as the grey audience line.
  - The `faq` has no eyebrow.
- Delete the v1 keys you orphan: push `how`, `moments`, `wording`, and campaigns `how`.

**Builder 4: scanner and nav**
- **Scanner copy:** `MOBILE_SCANNER_PREVIEW.counter.options[4]{key, title, line}`. `teamStrip` is `{eyebrow, title, lead, frames[3], facts[3]}`, and the first two facts carry Growth and Pro chips.
  - When `TeamStrip` replaces `TeamSection`, either rename `teamStrip` to `team` or the header check silently skips it.
- **Header:**
  - The `mobileMenu` prop and the `data-mobile-menu="v2"` attribute already exist.
  - Branch the v2 menu on `mobileMenu === "v2"` and read `?menu=` with `menuVariant(useSearchParams())`.
  - `preview-nav.test.ts` pins `mobileMenu = "today"` and the `data-mobile-menu` line. Keep them, or update the test.
- **Yours:** the `common.json` descriptions in four locales and the em-dash allowlist line in `i18n-catalogs.test.ts`.
- `FEATURE_PREVIEWS` already has geolocation, so the Soon label and chip can read it.

## (e) Open questions
1. Should geolocation appear in one sibling's `related` row, or stay menu-only (current choice)?
2. `FactList` check marks to `--accent` (brief §1.2) or leave (current choice)?
3. Does the `LpFaq` change (own questions give Platform's look, no eyebrow) match what you meant by "no eyebrow on faq"?