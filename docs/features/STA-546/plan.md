# Plan: Three new US homepages (how-to, features, outcomes)

ISSUE: STA-546 (https://linear.app/stampeo/issue/STA-546)
BRANCH: `feat/sta-546-landing-variants` (worktree `showcase/.claude/worktrees/sta-546`, off origin/dev 34601c3)
REPOS: showcase only
MIGRATION: no
STATUS: v1 APPROVED (12 Nov 2026, by Harry) · v2 DRAFT (12 Nov 2026, after Harry's first look)

## v2: Harry's first look (12 Nov 2026)

> This section supersedes the page outlines, the 8-section cap and the "no levels" decision below.
> The v1 sections stay for the record; where they conflict, v2 wins.

**Harry's verdict on v1:** "way too simple". Every competitor page goes into some depth about what it
does; ours feel made quickly, with no real design or user experience, and don't show enough of what
Stampeo can do.

**What v2 changes:**
1. **Depth and craft over restraint.** Pages run to about 10 to 12 rich sections, roughly 12 to 15 phone
   screens, like PassEntry. A section can carry tabs, a grid, a live or animated product demo, or
   layered captures, not just one heading and one picture. The site's existing rich components are
   the toolbox (`CardDesignPlayground`, `ScanDemo`, `NotificationSequenceDemo`, `LiveActivityFeed`,
   `BusiestTimesSection`, `CardStyleGallery`, `HeroCardFan`, `HeroDemo`, `ROICalculator`…).
2. **Brought back from the main landing, on every page:**
   - the official **Add to Apple Wallet / Add to Google Wallet** badges, directly above the dashboard;
   - the **desktop dashboard with the phone over it** (as `VariantDashboardShot` on `/us`), so owners
     see they also get a web dashboard on their computer, not only a phone scanner;
   - **"Stampeo adapts to your business"** (the sector carousel).
3. **Levels shown as live** next to stamps and points (Harry, 12 Nov). **Launch prerequisite:** Harry
   switches levels on for every business before ads point at these pages. The copy word is
   "levels" (the product's noun), not "tiers".
4. **A fourth page, PassEntry's homepage rebuilt for Stampeo:** `/us/landing-pages/platform`, variant
   `lp_platform`. Same structure, layout and interactions as passentry.com; our words, visuals and
   brand. Reference and substitutions: `research-passentry.md`. Our pricing block sits before the
   accent CTA band (Harry, 12 Nov). The site header and footer stay the shared ones.
5. **Still true from v1:** one primary CTA "Start my free trial"; the reassurance line; noindex;
   one variant per page; copy in TS modules with the claim guards; only live claims (no geofencing,
   offline, POS, SMS, minutes); sourced figures only; nothing invented (no testimonials, no customer
   logos).

## Problem

US visitors reach the homepage, mostly from Google Ads, but too few start a trial. Today's `/us` is
15 sections and 15 phone screens long (pricing alone is 2.9), has no testimonials, and makes several
arguments at once. We build three new homepages from scratch, each making ONE argument, short and
airy, to find the argument that converts US small businesses:

| Page | URL | Argument | Sections | Phone screens |
|---|---|---|---|---|
| How-to | `/us/landing-pages/how-it-works` | "It's easy, here's exactly how it works." | 6 | ~8.5 |
| Features | `/us/landing-pages/features` | "Your card in their wallet, with everything around it." | 8 | ~9.3 |
| Outcomes | `/us/landing-pages/outcomes` | "First-time customers become regulars." | 8 | ~8.4 |

## What Stampeo's outcome is

**More of your customers come back: first-time customers become regulars.**

Why it happens. These are the only mechanisms the pages may claim, all of them live today:
1. **The card is always on them.** It sits in Apple Wallet or Google Wallet next to their payment
   card, so it is never lost, forgotten at home or left in another jacket.
2. **Every stamp shows up on their lock screen**, and the card shows how close the reward is. A head
   start (welcome stamps, every plan) makes people finish their card far more often (Nunes & Drèze, 2006).
3. **You can bring them back on a slow day** with a broadcast to every card: Growth and Pro, included
   in the plan, no texting fees.
4. **You see it working**: return rate, who your regulars are and who is slipping away (customer
   segments such as At risk and Ghost, every plan), on the dashboard.

Never claimed: anything that "reminds" customers later (no geofencing, no expiry reminders, no
automatic win-back), offline scanning, POS integration, SMS, or a number of minutes to set up.

## What the market does (research, 12 Nov 2026)

18 loyalty homepages read (Square, Toast, Clover, SpotOn, Thanx, Smile.io, Yotpo, LoyaltyLion, Loopy,
Stamp Me, Kangaroo, Boomerangme, PassKit, Passcreator, Marsello, Perkville, Brevo, PassEntry) + Calendly
and Shopify as structure benchmarks.

- **"Regulars" is the market's outcome word.** Square "Turn walk-ins into regulars…", Thanx "Turn every
  guest into a regular", Kangaroo "Turn customers into regulars", Stamp Me's closing line.
- **Wallet specialists name the category in the H1.** Loopy "Digital stamp cards for Apple & Google
  Wallet"; Passcreator "Your Brand in Wallet. No app required."
- **Self-serve players put the trial on the button, a reassurance under it.** "Book a demo" belongs to
  POS and enterprise vendors (Toast, Thanx, Brevo, PassEntry), not a $29 product.
- **Steps are 3 or 4 verbs.** Square "Customize / Enroll / Engage / Reward", PassEntry "Create /
  Distribute / Update", Loopy 3 steps.
- **Credible pages print a source under every stat** (Square, Toast). Most don't, and their numbers are
  self-reported (Loopy "76%", Brevo "4.8x ROI", PassEntry "92%").
- **Nobody lets a visitor try the card.** No rival homepage adds a sample card to your own Wallet. Our
  live demo is the one thing on the page nobody can copy-paste.
- **Pages run long**: 7 to 17 sections (Loopy ~17, repetitive). Short is itself a difference.
- **Open angles**: "fill your slow days" (2 of 18) and "replace the paper punch card" (1 of 18).

### Sourced figures we may use

| Figure | Source | Where |
|---|---|---|
| Regular customers generate 6X more annual revenue than one-time visitors (a regular "visits a business at least four times per year") | Square, 2026 Local Economy Report (Mar 2026; US Square transactions 2019-2025) | Outcomes §2 |
| A 2-stamp head start: 34% finished the card vs 19% without | Nunes & Drèze, "The Endowed Progress Effect", Journal of Consumer Research, 2006 | Outcomes §3 |

Both carry a visible source line on the page and are quoted exactly. Square's figure is about Square
sellers, never presented as a Stampeo result. **Never used:** "5x cheaper to keep a customer" (1980s
line, no study), "repeat customers spend 67% more" (2000 e-commerce study), Clover's "90% more
frequently", any vendor self-reported figure, the unsourced "85%" bars on `/features/notifications-push`.

## Decisions

- **URL `/us/landing-pages/<page>`, not the bare `/landing-pages/<page>`.** The bare path renders in
  French (the unprefixed locale) and skips the US market cookie that pre-fills the signup country.
  Under `/us` the pages get English, dollars, the 14-day trial, ad-click capture and the US header with
  no routing change, and the winner later moves to `/us` with no copy changes.
- **The three pages share everything except the argument**: shell, hero layout, CTA label,
  reassurance, proof line, pricing, FAQ and final CTA block. Only the hero words and visual, the middle
  sections and the final headline differ, so a comparison measures the argument.
- **8 sections at most, counted honestly** (FAQ and final CTA are two). Footer not counted.
- **One primary CTA: "Start my free trial"** → `/onboarding`, with "{trialDays} days free · Cancel
  anytime" under it, as on `/us`. Never "No credit card required" (a card is required in the US).
  No price in the hero: `{starterPrice}` is the monthly price while pricing defaults to yearly, so the
  page would show two prices for one plan.
- **Proof line in every hero**: "Used by 120+ businesses in 25+ countries", read from the approved
  `variant.metrics` numbers so there is one copy to keep fresh.
- **The live demo is on How-to and Features**, with "Try it on your phone ↓" under the hero CTA.
  Outcomes argues results, not how, and a demo would make it 9 sections. Same-visit data (Oct):
  demo users opened signup about twice as often (32% vs 17%, self-selected).
- **A trial CTA inside the demo section, whatever the demo state**: on iPhone about two in three
  "add" taps never reach the stamp step, and today they are left with nothing to do.
- **Copy lives in one TypeScript module per page** (`lib/landing-pages/copy/`), English only, like
  `lib/compare/page/copy.ts`; the shared catalogs would force fr/es/pl copies nobody reads. Prices and
  trial length stay tokens (`{trialDays}`) through `RegionText`. A test applies the catalogs' claim
  guards plus this plan's budgets to these modules.
- **"Punch card" is allowed in these H1s and subs** (Harry, 12 Nov): it is the US search term and what the
  ads say. The copywriting skill's SEO exception list gains `/us/landing-pages/*`. "Stamps" stays the
  word for the marks, and "punch" is never a verb.
- **"Stamps or points", no "levels"** on these pages: levels are behind a per-business switch, so a new
  US sign-up cannot turn them on yet.
- **One sample business, Aurevo (a café), runs through every visual** on all three pages: one shop's
  story, and cafés are the main US segment. Notification banners use the default wording (every plan)
  and the business name, never "Stampeo".
- **Variant names** `lp_howto`, `lp_features`, `lp_outcomes`, set by `LandingTracker`. They already
  reach PostHog (`landing_variant`), GA4 CTA events and `businesses.landing_variant` via the stored
  attribution, so trials per page are countable from our own database with no new tracking code.
- **Not indexed while in development**: `noindex, nofollow`; absent from sitemap, `llms.txt`, nav and
  footer. Reachable by URL on the dev host and on prod, so ads can point at them later.
- **The current `/us` homepage and `components/landing-variant/` are not touched.**

## The three pages

Headlines are the working draft. Body lines are written at implementation with the
stampeo-copywriting skill and reviewed on the rendered pages.

### Shared blocks

- **Hero layout**: H1 (≤46 chars, ≤3 lines at 390), one-line sub (≤90 chars), "Start my free trial"
  (full width on a phone), reassurance, proof line; visual below on a phone, right (5/12) on desktop.
  The CTA sits at y≈370 on a 390×844 phone; the whole visual is above the fold at 1440×900.
- **Pricing**: `PricingSection market="us"`, unchanged.
- **FAQ**: 5 collapsed questions (customers need an app? / new hardware or POS? / how customers join /
  when the free trial ends / is there a contract), answers adapted from `/us` (the join answer is new:
  counter QR, shared link, the dashboard's counter flyer; the contract answer is limited to monthly
  plans, which is what is true), then one contact line.
- **Final CTA**: `text-display` headline (the page's own), CTA, reassurance, `stamp-pattern`.
- **Rhythm**: every section `py-16 lg:py-24`; one h2 (≤44 chars), one lead (≤85 chars), one visual,
  at most one small-print line, lists of 3 at most. At most one tinted band per page.

### A. How-to (`lp_howto`), 6 sections

1. **hero**: "Launch a digital punch card today." / "Customers add it to Apple Wallet or Google
   Wallet. You stamp it from your phone." Visual: real iPhone with the Aurevo card.
2. **steps** (tinted band): ① Make your card (card visual) ② Customers scan, add it to their wallet
   (counter placard: Aurevo logo, a non-scannable QR mark, the wallet badges) ③ Stamp it, they see it
   (the card at 5/8 with the default "Stamp collected!" banner). Ends with one line: "All you need:
   your logo and a phone to scan with."
3. **demo**: "Try it on your own phone." Live wallet demo + outline trial CTA.
4. **pricing** · 5. **faq** · 6. **final_cta** ("Your card can be live today.")

### B. Features (`lp_features`), 8 sections

1. **hero**: "Your punch card, in Apple & Google Wallet." / "Your logo, your rewards, lock-screen
   notifications. Nothing for your customers to download." Visual: card stack + a banner.
2. **demo**: as How-to.
3. **spotlight_messages**: automatic stamp and reward messages (every plan) + broadcasts ("Growth and
   Pro" label, "no texting fees" only on that line). Lock screen with two stacked banners.
4. **spotlight_design**: your logo, colours and stamps. The card-style carousel, its own CTA hidden.
5. **spotlight_analytics**: see who comes back. Real dashboard phone capture, captioned "Sample data".
6. **pricing** · 7. **faq** · 8. **final_cta**

### C. Outcomes (`lp_outcomes`), 8 sections

1. **hero**: "Turn first‑time customers into regulars." (non-breaking hyphen, as `/us`) / "A digital
   punch card in their Apple or Google Wallet that keeps them coming back." Visual: lock screen with
   the default stamp banner at first paint. No demo link.
2. **problem** (tinted band): "6×" in the handwriting figure, one line, source in small print.
3. **outcome_return**: they come back sooner. The card is always on them, progress shows on every
   stamp, and a head start helps (source line). Aurevo card, part-filled.
4. **outcome_slow_days**: fill a slow day with a broadcast ("Growth and Pro"). Lock screen + broadcast.
5. **outcome_regulars**: see your return rate. Dashboard capture ("Sample data"), then one line
   labelled "Example": a few customers × one extra visit a month × an average ticket.
6. **pricing** · 7. **faq** · 8. **final_cta**

## UX decisions

From `ux-brief.md` (ux-designer, MODE: DESIGN, verdict READY).

- PLACEMENT: three routes under `app/[locale]/us/landing-pages/`; no nav, footer, sitemap or llms entry
  (ad destinations only).
- ENTRY: ad final URLs (Google Ads now, Meta and ChatGPT later) and the direct URL.
- ADDED: proof line in every hero (answers "does anyone use this?") → AC6. Trial CTA in the demo
  section (removes the iPhone dead end) → AC7. "All you need" line under the steps (answers "what do I
  scan with?") → AC8. "Sample data" caption under dashboard captures (prevents reading 61% as a
  promise) → AC9.
- REJECTED (22, reasons in the brief): six-tile feature grid, paper-vs-app table, "What you need"
  section, three-figure problem section, demo on Outcomes, scanner spotlight, collapsed pricing on
  phones, price in the hero, "See pricing" hero link, sticky CTA bar, sector carousel, changelog
  teaser, desktop dashboard shot, "Book a demo", video, ROI calculator, the hero card fan, a testimonial
  section (none exist, never invented), header without nav, sticky scrolling steps, the `/us` FAQ's
  dark contact box, a CTA between the Outcomes argument sections.
- MOBILE: one left-aligned column; hero CTA full width at y≈370; devices cropped to their top ~420px in
  spotlights; ≤ ~9.3 screens to the end of the final CTA.
- REUSES: `Container`, `ScrollReveal`, `CTAButton`, `FAQList`, `IPhone`, `PhoneScreenshot` +
  `landingShot`, `Header`/`Footer`, `PricingSection`, `HeroDemo`, `HeroCardStack`, `WalletCard` +
  `STAMP_SAMPLES.aurevo`, `NotificationBanner`, `NumberStamp`, `walletBadges`, `LandingTracker`,
  `RegionPricingProvider`, `RegionText`. Nothing from `landing-variant/` (it is the live `/us`).
- EXTENDED (optional props, current call sites unchanged): `NotificationPhoneDemo` (`notifications[]`,
  `animate`, `eager`, `width`), `NotificationBanner` (`icon`, optional `body`: the sender's own icon on
  these pages), `CardStyleGallery` (`showCta`, `heading`, `sectionClassName`), `HeroCardStack`
  (`peekFrom`), `QRCodeSkeleton` (`animated`). Added during the build and the polish pass.
- ALSO: the language switcher is hidden on `/us/landing-pages/*` (English-only pages, as `/us/vs`).
- NEW (`components/landing-pages/shared/`): `LandingPageShell`, `LpSection`, `LpHero`, `LpSpotlight`,
  `LpDemo`, `LpFaq`, `LpFinalCta`; page-specific `HowSteps`, `FeaturesHeroVisual`, `RegularsFigure`.
  No existing component lays out text + visual on this rhythm; the `/us` ones carry `/us` copy.

## Non-goals

- Replacing `/us` with a winner, and running the ad split test (follow-up issue).
- Any A/B framework: three URLs, traffic split in Google Ads.
- French, Spanish, Polish or UK versions.
- New screenshots (the US re-shoot of the dashboard capture, which shows "Paris", is a follow-up via
  promo-videos' landing-shots tool), video, new product claims.
- Changing onboarding, pricing, trial terms, or the shared header, footer and pricing block.
- Fixing the PostHog connector (signed in to another organisation; Harry reconnects it).

## Edge cases considered

- Non-US visitor on these pages: prices switch to their region after load, like `/us` (STA-330).
- JavaScript off: hero, copy, CTA and pricing are in the server HTML; the demo needs JS (as today).
- iPhone visitor whose wallet add never registers: the outline trial CTA under the demo still shows.
- 390×844 phone: H1, sub and CTA above the fold; the demo shows the direct button, not a QR.
- Bare `/landing-pages/x`: French 404 (deliberately unhandled, nothing links there).
- Bots: noindex, nofollow, no inbound links from indexable pages.
- Ad click on one page, signup from another visit: attribution keeps the first landing's variant
  (existing behaviour, deliberately unchanged).

## Acceptance criteria

Pages and routing
- AC1: Given the three slugs, when each URL is requested, then it renders in English with the US
  header and footer, and its sections appear in the registry's order (`lib/landing-pages/pages.ts`):
  How-to 6, Features 8, Outcomes 8, never more than 8.
- AC2: Every page ends with `pricing`, `faq`, `final_cta`, rendered by the same shared components.
- AC3: Each page's metadata is `noindex, nofollow` with an English title and description, and no
  `/landing-pages/` URL appears in the sitemap or `llms.txt`.
- AC4: Each page mounts `LandingTracker` with its own variant (`lp_howto`, `lp_features`,
  `lp_outcomes`, each ≤ the attribution field cap), and every section carries `data-landing-section`
  with its registry id.

CTAs and tracking
- AC5: Every sign-up link is a `CTAButton` to `/onboarding` with a location in `SIGNUP_CTAS` (`hero`,
  `feature_cta`, `pricing_*`, `final_cta`); the FAQ contact link uses `faq_contact`. The hero demo link
  is a plain `<a href="#demo">` ≥44px tall, and `hero_demo` is used nowhere on these pages.
- AC6: All three heroes show the same proof line, built from `variant.metrics` (no second "120+").
- AC7: On How-to and Features the demo section shows an outline "Start my free trial" in every demo
  state (idle, waiting for the wallet, added, stamped), tracked `feature_cta`.
- AC8: How-to's steps end with the single "all you need" line, and no separate section.

Claims and copy
- AC9: Every dashboard capture on these pages carries a "Sample data" caption.
- AC10: The copy modules pass the claim guards: no "credit card" claim, no worded trial length, no em
  dash, no "reminder", no "offline", no minute count, no "levels", "punch" never a verb, "Stampeo"
  never a banner's sender, every broadcast mention on the line with "Growth and Pro" or on the line
  directly above it (the lead, with the plan line right under it).
- AC11: Copy budgets hold: H1 ≤46 chars, hero sub ≤90, h2 ≤44, lead ≤85, ≤3 list items.
- AC12: Every figure in the copy has a non-empty `source` (type-enforced), and the page renders it.
- AC13: Prices and trial length appear only as tokens (`{trialDays}`), rendered through `RegionText`;
  no digit-day literal, and no `$` except in the outcome page's labelled "Example" line (an
  illustration of a customer's ticket, not a Stampeo price).
- AC14: The step-2 QR mark is not a scannable code; the only real QR on a page is the demo's.

Reuse safety
- AC15: `NotificationPhoneDemo`, `CardStyleGallery` and `QRCodeSkeleton` render exactly as before
  when the new props are omitted (defaults pinned by test, `/features/*` pages checked visually).
- AC16: `/us` and every other existing page render the same as before (no edits under
  `components/landing-variant/`, `messages/`, `lib/seo/sitemap.ts`, `lib/llms-txt.ts`; extended
  components produce the same markup when the new props are omitted).

Visual (verified in the polish pass, 390×844 and 1440×900, PNGs read)
- AC17: H1, sub and CTA above the fold at 390×844; the whole hero visual above the fold at 1440×900;
  no horizontal scroll at 390; tap targets ≥44px on everything new.

## File layout

```
app/[locale]/us/landing-pages/
  how-it-works/page.tsx  features/page.tsx  outcomes/page.tsx
components/landing-pages/
  shared/      LandingPageShell, LpSection, LpHero, LpSpotlight, LpDemo, LpFaq, LpFinalCta,
               AurevoCard, banner (lpBanner), PhoneCrop, PlanLine, SampleCapture
  how-it-works/HowSteps, HowHeroVisual
  features/FeaturesHeroVisual, MessagesSpotlight, DesignSpotlight, AnalyticsSpotlight
  outcomes/OutcomesHeroVisual, RegularsFigure, ReturnSpotlight, SlowDaysSpotlight, RegularsSpotlight
lib/landing-pages/
  pages.ts                 # slug → variant, sections, metadata (the one source)
  accent.ts  proof.ts
  copy/{types,shared,how-it-works,features,outcomes}.ts
  registry.test.ts  shared-sections.test.ts  page-visuals.test.ts  copy.test.ts
lib/testing/
  jsx-source.ts  landing-pages-source.ts  copy-claims.ts   # source-scan helpers, shared claim guards
```

New folders only; no file grows past its limit. The three extended components get optional props.

## Build stages (after approval)

1. **Tests + foundation** (one stage): failing tests for AC1-AC16, then the registry, routes, shell,
   shared components, copy modules (written by me with the copywriting skill), the three optional props.
2. **The three pages**, in parallel (one Sonnet stage each, disjoint files), then merged.
3. **UX polish with pixels**: dev server in the worktree, 390×844 and 1440×900 shots of all three, read
   before anything is called done (AC17).
4. **Audits**: coverage-auditor and code-quality-reviewer (no security review: no auth, billing or
   data path). Fixes, then full checks: `bun test`, type-check, lint, build.
5. **Runbook**: new `docs/qa/landing-pages.md` (prefix `LP-`). **Docs decision**: none (no product change).
6. Harry reviews the rendered pages, then a PR to `dev`.

## Touched areas and risks

- Routing: the pages inherit the `/us` rewrite; `consent-routes.test.ts` (footer on every marketing
  page) and `lib/cta/guard.test.ts` must stay green.
- `RegionPricingProvider` must wrap anything showing a price or trial length, or the hook throws.
- The catalog copy guards don't see TS modules: AC10-AC13 cover them with a dedicated test.
- `showcase/AGENTS.md` is rewritten by `next dev`: restore it, never commit the rewrite.

## Follow-ups (filed after approval)

- Ad split test across the three URLs, then promote the winner to `/us`.
- US re-shoot of the dashboard capture (it shows "Paris (GMT+1)").
- Fix the stampeo-ux-ui reference calling `landing-variant/` "the A/B landing".
- Reconnect PostHog to Stampeo's org, then run the baseline funnel queries (saved in the session notes).

## Known exception

The shared pricing block (`PricingSection`, reused unchanged by decision) lists "Stamps, points or
levels" on every plan, as on `/us` and `/us/pricing`. That is a site-wide claim Harry chose to ship;
it is out of this issue's scope. The landing copy itself never says "levels".

## Harry's calls (12 Nov 2026, at approval)

1. Owner quote: none for now. The pages ship without a testimonial; the slot above the final CTA stays empty.
2. "Punch card" in these H1s and subs: yes. The copywriting skill's US exception gains `/us/landing-pages/*`.
3. Square's 2026 "6×" figure: yes, quoted exactly with its source line.

## Docs impact (preliminary)

None: no product behaviour changes. Help center untouched.
