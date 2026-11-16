# Plan: Feature pages in the Platform style (previews)

ISSUE: STA-552 (https://linear.app/stampeo/issue/STA-552)
BRANCH: `feat/sta-552-feature-previews` (worktree `showcase/.claude/worktrees/sta-552`, off STA-546)
REPOS: showcase only
MIGRATION: no
STATUS: APPROVED (12 Nov 2026, by Harry's request: "send out a few agents to refresh our other feature pages
so they feel more in sync with this … add them after the platform URL so I can compare")

## Problem

Harry loves the STA-546 Platform landing page and wants the feature pages to feel in sync with it. He wants
refreshed versions he can compare side by side with today's pages before anything replaces them.

## Scope

Five previews, English, US market, noindex, absent from sitemap/llms/menus. Today's pages stay untouched.

| Feature | Today | Preview | Variant |
|---|---|---|---|
| Card design | `/en/features/card-design` | `/us/landing-pages/platform/card-design` | `lp_platform_card_design` |
| Mobile scanner | `/en/features/mobile-scanner` | `/us/landing-pages/platform/mobile-scanner` | `lp_platform_mobile_scanner` |
| Push notifications | `/en/features/push-notifications` | `/us/landing-pages/platform/push-notifications` | `lp_platform_push_notifications` |
| Analytics | `/en/features/analytics` | `/us/landing-pages/platform/analytics` | `lp_platform_analytics` |
| Promotional campaigns | `/en/features/promotional-campaigns` | `/us/landing-pages/platform/promotional-campaigns` | `lp_platform_promotional_campaigns` |

Geolocation is out (not live).

## Design

`ux-brief.md` (ux-designer, MODE: DESIGN, verdict READY) is the spec: section lists (7-10 per page), the
Platform patterns each section uses, reuse of `components/features/<slug>/*` and the Platform pieces, draft
copy, 390 and desktop layouts, the build split.

## Decisions (defaults from the brief's open questions, Harry may veto)

- Platform's language: eyebrow + centred h2 + lead; CTA pair; glass cards; iPhone + Android with Apple and
  Google Wallet; hover rows; toggle cards; handwritten figures; the Scanner loop video; the cream final card.
- No pricing, sectors or blog on these previews; each closes with the cream card and links to the sibling
  previews (not the live feature pages).
- No "Every plan" chips, no "Sample data" captions (Harry's v2.1 call for Platform-style pages).
- Broadcast plan labels: the campaigns preview states Growth and Pro as today's page does; the other four show
  no badge (STA-549 opens broadcasts to every plan right after shipping).
- The campaigns figures 88% (wallet add rate) and 95% (still installed at 90 days) are kept with their source
  line "Stampeo data, 86 businesses, February to October 2026" (today's approved catalog).
- Dropped from today's pages: unsourced figures (the 20/30/45/85% channel bars), the SMS/email/wallet table, the
  security grid not backed by STAMPEO.md, "5 minutes", "coming soon" AI, the 15-card style carousel on card design.
- Generalised from Platform (Platform must render exactly as now): `HowTable` → `StepsTable`, `ProgramTypeRows`
  → `HoverRows`, `PlatformToggleCard` → `ToggleCard`.
- Preview-only code in `components/landing-pages/feature-previews/` (shared/ is at 29 files); copy in
  `lib/landing-pages/copy/previews/`, covered by the existing claim tests.
- Promoting a winner to the live feature pages in all four locales is a separate issue.

## Acceptance criteria

- AC1: each of the five URLs renders in English with the US header and footer, its registry sections in order,
  noindex, absent from sitemap and llms.txt, tracked with its own variant.
- AC2: the Platform page renders exactly as before (its pins stay green; generalised components keep its output).
- AC3: every claim is live (STAMPEO.md §6-§8); every % figure carries a source; no "Every plan" chip, no
  "Sample data"; broadcast mentions follow the label decision above; the copy guards pass on the new modules.
- AC4: every "Start my free trial" is a tracked `CTAButton` to onboarding; the demo link is the plain `#demo`
  anchor where a demo section exists.
- AC5: no horizontal scroll at 390; tap targets ≥ 44px; reduced motion gives calm static states.
- AC6: today's five feature pages are unchanged (no edits under their routes or `messages/` beyond STA-546's).

## Polish additions (Stages Q0, polish, Q1; accepted by the coordinator, Harry may veto)

Each is an optional prop whose default keeps today's markup byte-identical.

- `LpFaq` takes an `eyebrow` on its `faq`; with it, a centred Platform header and `ui/FAQList`'s `table` look (one white table, hairline rows ≥ 56px). Used by the card design and campaigns FAQs.
- `NotificationSequenceDemo stillWhenReduced`: no auto-advance under reduced motion (push-notifications moments).
- 44px toggles on the card design preview: `AnnotatedWalletCard toggleSize`, `CompactPlayground touchTargets` (playground toggles and sliders, Program and Points panels).
- `HoverRows stackOnPhone`: below `lg`, the row's picture sits full width under its words so its smallest label prints ≥ 11px (analytics questions, scanner counter, campaigns ideas).
- `LiveActivityFeed soft`: the previews' frame (no heavy border) with room under the fifth row. The live pages keep their frame and the fifth-row clip (follow-up).

- AC7: with each prop above left out, its component renders exactly as before (snapshot or byte compare), and every live caller passes none of them.
- AC8: with each prop given, the visitor-visible effect holds: FAQ header centred with the eyebrow and rows ≥ 56px; no auto-advance when still; toggles ≥ 44px including after switching the playground to Points; stacked pictures print their smallest label ≥ 11px; the soft feed's fifth row has padding under it.

## Contextual feature links (Harry, 16 Nov)

- On Platform and its previews, the header's Product menu (desktop and phone) and the footer's features column lead to the previews; a feature without a preview (geolocation) opens today's page. Every other page keeps today's feature pages. `LandingPageShell` chooses per page (`featureLinksFor`); `Header`/`Footer` default to today's pages.
- AC9: from Platform or a preview, each of the five features opens `/us/landing-pages/platform/<feature>`; from any other page, every feature link opens `/<locale>/features/<feature>`.

## v2: bespoke pages in a Stampeo-Platform hybrid (Harry, 16 Nov 2026)

Harry: the previews "all look the same" (they reuse Platform's kit); some sections should be built from scratch for
what they show; the pages should "feel like us" (our heavy-black-border stamp-card look) while staying clean and
premium; the Platform hero should try "something new"; geolocation needs a preview; the phone menu "feels extremely
cheap" (STA-555). Spec: `ux-brief-v2.md` (ux-designer, DESIGN, READY), from the research in
`scratchpad/research-v3/report.md`.

Decisions (coordinator, on the brief's defaults; Harry may veto at review):
- Hybrid look (brief §1): the site's orange pill eyebrows (`--accent`), keycap primary CTA, stamped floating cards,
  steps tables, toggle surfaces, related tiles and FAQ frame; phones and wallet cards never framed. Applies to Platform,
  the previews and the three other US landings (shared `LpSection`). Platform's default-render snapshots change on
  purpose; every live page stays byte-identical.
- Platform hero: two variants, Wallet stack by default and the straight "shelf" via `?hero=shelf`, for Harry to pick.
- Phone menu: the "index sheet" by default and the drill-down via `?menu=drill`, shown only on the US landing pages
  (`LandingPageShell`) until Harry picks; production keeps today's menu (STA-555 ships the winner site-wide).
- Geolocation preview: "coming soon" throughout, Pro, no date; the menus label it "Soon". The live page's false claim is
  STA-556.
- Card design: no "oba", no sample brand repeated across sections.

Acceptance criteria (v2):
- AC10: on Platform, the previews and the three other US landings, eyebrows are the `--accent` pill, the primary CTA is
  the keycap, and the brief's §1.3 objects are stamped; on every other page each touched component renders byte-identically.
- AC11: Platform's hero shows stamps, points and levels in the first screen at 390, with ≥ 9 distinct real wallet
  cards across the variant; `?hero=shelf` shows the shelf; reduced motion gives a static, complete hero.
- AC12: each of the six previews has the brief's section list with at least two sections built for that feature;
  analytics opens with production's blind-spot narrative and answers only with every-plan facts unless labelled;
  geolocation is future tense, "coming soon", Pro, no date.
- AC13: on US landing pages at 390, the menu shows every Product item without an accordion, keeps the trial CTA in view,
  traps focus, closes on Escape, locks the page scroll and has rows ≥ 44px; `?menu=drill` gives the drill-down; every
  other page keeps today's menu byte-identically.
- AC14: every new product claim is traced in `claims.md`; new copy passes the copy guards and `stampeo-copywriting`.

### v2 decisions after the reviews (coordinator, 16 Nov; supersede older lines where they differ)

- `LpFaq`: a page's own questions get Platform's centred header with no eyebrow and the stamped table (`ux-brief-v2.md` §1.3); the default `<LpFaq />` is unchanged. This replaces the eyebrow wording in AC7/AC8.
- Contextual links (AC9): from Platform and its previews, all six features open their preview, geolocation included (its coming-soon page). Every Platform-family menu labels geolocation "Soon": the desktop Product dropdown, the phone menu and the footer column.
- Row and strip labels (`HoverRows`, `TypeMarquee`) are grey capitals on Platform and the previews (brief §1.3).
- The phone menu's one-liners exist in all four locales (catalog parity); only the v2 menu reads them until STA-555 ships the menu site-wide.
- The geolocation preview's "Today" column names broadcasts without a plan chip, like the other non-campaigns previews (STA-549).
- The keycap trial button applies to the three other US landings too (their hero, closing CTA and `LpTrialButton`), per AC10.
- Cleanup once Harry picks: delete the losing hero variant (and `?hero=`), the losing phone menu (and `?menu=`), and, when STA-555 ships site-wide, today's accordion menu. Tracked on STA-546 (hero) and STA-555 (menu).

## v3: Platform back to v1 (keycaps kept), feature pages in plain words (Harry, 16 Nov 2026)

Supersedes the v2 design decisions where they differ (approved plan, `~/.claude/plans/hey-claude-i-would-magical-minsky.md`). Study result: `retention-study-2026-11-16.md` (95.5% at 90 days).

ISSUES: STA-552 (feature previews), STA-546 (Platform hero), STA-555 (phone menu)
BRANCH: `feat/sta-552-feature-previews` (showcase worktree `.claude/worktrees/sta-552`, HEAD 8aa6115)
REPOS: showcase only · MIGRATION: no · prod DB: one read-only study query (below)

### Context

Harry reviewed the v2 round and found it worse:
- Platform's new styling (ink borders, pills, the cycling hero) made the page feel different and less clean.
- The feature pages are confusing:
  - plan badges everywhere ("Why are we feature gating on the landing website?");
  - sections that sell nothing (plan ladder, recap email, palettes, designer, team, form-like composer);
  - centred heroes;
  - wording that is "mysterious" instead of plain.

He wants the pages to say plainly what the product is, readable at a glance and SEO-ready, while keeping the bespoke sections that work.

**His answers (16 Nov):**
- Keep only the new CTA style (keycaps). Everything else on Platform goes back to how it was.
- Hero: the fan on desktop (as before); on phones, a still Wallet stack with the front card fully visible.
- Card design: a full product tour.
- Analytics: a key-numbers card at the top.

### Global rules (every landing page and preview)

1. **Look:** back to the pre-v2 style (Platform as of 927bf77).
   - **Kept:** the keycap trial buttons (`CTAButton keycap`, `LpCtaPair`, `LpAccentBand`, `LpTrialButton`).
   - **Reverted** to the clean surfaces they had:
     - `GlassCard`, `StepsTable`, `ToggleCard`;
     - `RelatedPreviews` tiles;
     - the `FAQList` table frame;
     - `HoverRows` row labels;
     - `FactList` check marks.
   - **Section labels:** plain uppercase text again (no pill), in the site orange `--accent`, the colour Harry asked for earlier. Note: it is under the WCAG contrast minimum, as it is on the homepage.
2. **No plan gating on landing pages.**
   - No `PlanChip`, no "Growth and Pro" / "Pro" / "Starter" labels, no plan comparison sections. Plans live on the pricing section and page only.
   - Claims stay true: never "on every plan" or "free" for something gated. Plain facts only.
   - The test guards flip:
     - `plan-claims.test.ts` and `copy.test.ts` now assert that landing pages print no plan names outside the pricing section;
     - the `CHIPPED` / `PLAN_LINES` machinery is deleted for the previews.
3. **Plain words + SEO ("premier degré").**
   - Each hero H1 and sub says what the feature is, with the page's main keyword, for example:
     - "Push notifications for your loyalty card";
     - "Send a promotion to every customer's phone";
     - "Loyalty program analytics";
     - "A loyalty card scanner app for your staff";
     - "Design your digital loyalty card";
     - "Geolocation notifications (coming soon)".
   - H2s describe their section literally; no riddles.
   - Meta title and description carry the keywords.
   - The previews stay `noindex` until they replace today's pages.
   - Copy goes through the `stampeo-copywriting` skill (English) and STAMPEO.md for claims.
4. **Feature-page heroes are split:** text left, visual right on desktop (text then visual on a phone), like the landing pages' `LpHero`. No pill or eyebrow above the H1. Keycap CTA.
5. **Phone menu = the sheet** (Harry's pick).
   - Delete the drill-down and `?menu=`.
   - Make the Product tiles smaller (label and line size, padding, icon tile) so they don't squash at 320 to 360px.
   - Production keeps today's menu until STA-555 ships the sheet site-wide.
6. **Delete the shelf hero** and `?hero=`.

### Platform (`/us/landing-pages/platform`)

- **Hero:**
  - **Desktop:** restore the fan exactly as before (`HeroCardFan` + `PLATFORM_FAN_SLOTS`, which builder 1 deleted from `lib/hero-fan.ts`).
  - **Phones:** a still Wallet stack. The front card is fully (or almost fully) visible, so the card design reads at a glance; the tops of the other cards sit behind it. No cycling, and reduced motion gives the same picture.
  - Keycap CTAs.
- **Back to v1 (clean, no borders):** "Straight to Apple Wallet and Google Wallet" (floating cards), "Create it, share it, stamp it" (table), "Run it from your computer or your phone" (toggle card).
- **Stats:** re-run the STA-358 study (`docs/features/STA-358/benchmark-sources.md`, Q8 wallet retention at 90 days, plus Q-add-rate) on prod.
  - Read-only SELECT through the Supabase MCP, same method and businesses filter, date range up to today.
  - Add "N% of cards still in the wallet after 90 days" to "By the numbers", with its source line.
  - The figure lives in Platform's copy module only; the shared homepage metrics catalog (`variant.metrics`) is not touched.
- Everything else stays as it was in v1.

### Feature pages

**Push notifications:**
- Split hero (lock-screen phone).
- Timeline: card on the left, notification on the right (the card changes first, then the notification arrives).
- iPhone and Android section: clean floating cards (no ink borders), as on Platform.
- "Use our wording or write your own": kept, plan labels removed.
- Live demo kept. Plain copy.

**Promotional campaigns:**
- Split hero, with nicer notification icons on the phone (the shop's real icon tile, as in `LockScreenNotification`).
- Core message, plainly: "One message to every customer's card, shown as a notification on their lock screen in Apple Wallet and Google Wallet. No texting fees."
- Replace the composer form with an explanation: one message written once, then the same notification landing on several customers' lock screens.
- **Removed:** "Your customers keep the card" (the figures move to Platform's stats) and the plans section.
- **New "Instead of texting" section:**
  - a text costs money per message;
  - a Stampeo campaign reaches every card, with no cost per message and no cap on how many customers it reaches.
- **The nuance** (campaign count vs reach) goes in the FAQ: "No limit on how many customers a campaign reaches. Your plan sets how many campaigns you can send each month (see pricing)."
- Ideas kept ("Come in today" stays). The delivery title is rewritten plainly, e.g. "See how many customers got it".

**Geolocation (coming soon):**
- Split hero. The visual is a still lock screen with the "nearby" notification banner. "Coming soon" goes in the sub, with no plan.
- "Today / What's next" section removed.
- How-it-works titles that read on their own: "Add your shop's address", "A customer walks nearby", "Their card appears on their lock screen".
- Privacy section kept.

**Mobile scanner:**
- Split hero that explains the choice plainly: "The free Stampeo Scanner app for iPhone and Android, or the web scanner in any browser, on a phone, tablet or laptop."
- **Removed:** the team section and the live demo.
- Kept: the interactive counter and the app-or-browser section.

**Analytics:**
- Split hero with a key-numbers card: visits, return rate, new customers, visits over time.
- Production's "What you don't know today" cards (`components/features/analytics/BlindSpotCards.tsx`, as production shows them) replace the v2 card grid.
- Every chart shown as a product showcase (busiest times, how often they come, reward progress, cohorts, by location…).
  - One colour family: the orange "reward ready" bar goes.
  - No plan ladder, no plan labels.
- A cleaner customer list that looks like the dashboard's own.
- The dashboard on laptop and phone moves below.
- Recap email removed.

**Card design (full product tour):**
- Hero re-skin: clickable (dots and previous/next, swipeable) and slower.
- "Every part of the card is yours": the anatomy, fixing the wrong label (business name shown where the stamp count is).
- Stamps, points or levels: three real cards.
- Your own stamp icons and logo: real cards from different shops; "98 icons" becomes a plain fact.
- On iPhone and Android, then the FAQ.
- **Removed:** the designer playground, the 98-icons strip and the 5 palettes.

### How we build it (feature-workflow)

1. **Coordinator:**
   - merge `origin/dev` (it has STA-549: broadcasts on every plan, Starter 8 a month);
   - run the study query (read-only);
   - update `docs/features/STA-552/plan.md` with this v3 section.
2. **Copy stage (Opus, `stampeo-copywriting`):**
   - new copy modules for all six previews plus Platform's stat line, written for keywords and plain meaning;
   - the coordinator reviews the copy before any build.
3. **Foundation (Sonnet), tests first:**
   - global rules 1, 2, 4, 5, 6 (style revert, no-plan guard, split `PreviewHero`, sheet only with smaller tiles, shelf/drill deleted);
   - production pages stay byte-identical.
4. **Four builders in parallel** (Sonnet, disjoint files):
   - Platform hero + card design;
   - analytics;
   - push + campaigns;
   - scanner + geolocation.
5. **UX polish pass on pixels (Opus):** 390, 360 and 1440, plus reduced motion.
6. **Coverage + quality reviews, fixes, ONE build,** then shots for Harry.

There is no new design pass. Harry's review gives section-level direction; the polish pass checks the pixels.

### Critical files

- **Look:** `components/landing-pages/platform/{GlassCard,StepsTable,ToggleCard,HoverRows,LpCtaPair}.tsx`, `components/landing-pages/shared/{LpSection,FactList,LpFaq}.tsx`, `components/ui/FAQList.tsx`, `components/landing-pages/feature-previews/RelatedPreviews.tsx`.
- **Hero:**
  - `components/landing-pages/platform/hero/*` (stack stays for phones; the shelf and switch are deleted);
  - `components/landing-variant/HeroCardFan.tsx`;
  - `lib/hero-fan.ts` (restore the Platform slots from 927bf77);
  - `components/landing-pages/feature-previews/PreviewHero.tsx` (split layout, reusing `shared/LpHero.tsx`'s grid).
- **Menu:** `components/sections/{SheetMenu,MobileMenu,MobileMenuParts,MobileMenuDrill}.tsx` (drill deleted), `lib/landing-pages/platform/variants.ts`.
- **Copy:** `lib/landing-pages/copy/previews/*.ts`, `lib/landing-pages/copy/platform.ts`.
- **Guards:** `lib/landing-pages/{plan-claims,copy}.test.ts`, `lib/landing-pages/previews/*.test.tsx`.
- **Pages:** `components/landing-pages/feature-previews/<slug>/*`, `app/[locale]/us/landing-pages/platform/**/page.tsx`, the registry in `lib/landing-pages/pages.ts`.

### Verification

- `bun test lib scripts`, `bun run type-check`, `bun run lint`, then one `bun run build`.
- SSR byte compare: `/us`, `/en`, `/`, `/es`, `/pl`, pricing and the six `/en/features/*` stay identical.
- Platform compared against 927bf77: only the keycap CTAs, the phone hero, the stat and the label colour differ.
- Shots at 390, 360 and 1440 (Playwright headless, cookie banner refused), and a reduced-motion pass. Harry reviews on his checkout.
- Every new claim traced in `docs/features/STA-552/claims.md`; the study's numbers saved with their SQL.

### v3 decisions after the reviews (coordinator, 16 Nov)

- Scanner preview keeps the App Store and Google Play badges in its "app or browser" section, as today's live scanner page has them and as Harry asked ("download the app, or use the web scanner"); this supersedes STA-546's "no store badges" for this page.
- Campaign ideas: "Gone quiet" and "Almost there" needed Pro targeting, so they became "Tonight only" and "New customers" (rule 2: no idea depends on a plan).
- Rule 2 removed five plan-only lines outright rather than leaving them unlabelled ("Unlimited team members", "Bonus points on bigger baskets", "Limits and expiry", "Several locations", the analytics plan line): a feature only some plans have cannot be stated plainly as everyone's.
- Geolocation says "coming soon" in its H1 only (no chip, no handwritten note), not three times.
- Only the 95% retention figure moved to Platform's stats; the 88% add rate went with the campaigns figures section (not re-run). The study's SQL: `retention-study-2026-11-16.sql`.
- Before the previews replace the live pages: confirm loyalty levels are open to new sign-ups (STA-525's per-business `levels_enabled`), since the pages show levels as live.

## Build stages

1. Foundation: tests, registry entries, routes, copy modules (from the brief's draft copy, reviewed by the
   coordinator), the three generalised components, every new optional prop.
2. Three builders in parallel (disjoint files): card design; notifications + campaigns; scanner + analytics.
3. Merge, UX polish on pixels, coverage + quality reviews, fixes, runbook section, shots for Harry.

## Docs impact

None (previews, no product change).
