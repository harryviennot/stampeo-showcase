# UX Brief: STA-546
MODE: DESIGN   DOMAIN: showcase
VERDICT: READY

How I looked: I read the code, and checked prod `/us` (stampeo.app) at 390x844 and 1440x900 through accessibility snapshots with element boxes. The dev host `showcase.dev.stampeo.app` returned 404 on every route, and the worktree has no `node_modules`, so I started no dev server and took no screenshots. I measured H1 line counts in the browser with Geist 800 at the `text-hero` sizes. The research forwarded on 12 Nov is folded in.

## Already shipped

**None of the three pages, routes or folders exist yet** (`app/[locale]/us/landing-pages/`, `components/landing-pages/` and `lib/landing-pages/` are all absent). Most of their parts already ship, though. **The plan's Outcomes hero is the current `/us` hero, word for word.**

- **`/us` (`components/landing-variant/VariantLanding.tsx`).**
  - H1 "Turn first‑time customers into regulars." (with the U+2011 hyphen), CTA "Start my free trial", reassurance "{trialDays} days free · Cancel anytime". All from `messages/en/landing.json` → `variant.us.hero`.
  - Measured at 390: 12,852px before the footer (15.2 phone screens). Pricing alone is 2,460px (2.9 screens). The H1 runs 3 lines, the sub 5 lines.
- **Live wallet demo:** `components/sections/HeroDemo.tsx` (wrapped on `/us` by `VariantTryIt`, anchor `#try-it`).
- **Lock screen with banner:** `components/features/notifications-push/NotificationPhoneDemo.tsx` and `NotificationBanner.tsx`.
- **Card-style carousel:** `components/features/design-de-carte/CardStyleGallery.tsx` (15 fictional brands).
- **Card hero visual:** `components/card/HeroCardStack.tsx`, the Aurevo café card with two peeking cards. It is already the hero visual on `/features/card-design` and on every `/us/vs/*` page.
- **Dashboard captures:** `public/images/landing/dashboard/en-phone*.png`, through `lib/landing/dashboard-shots.ts` and `components/ui/PhoneScreenshot.tsx`.
- **Proof numbers:** `variant.metrics` (120+ / 20,000+ / 25+), rendered by `VariantMetricStrip`.
- **Per-page attribution, end to end:**
  - `LandingTracker variant=` → `document.body.dataset.landingVariant` → `AttributionCapture` (`lv`) → `businesses.landing_variant` (backend migrations 172 and 191).
  - Trials per page are countable from the first visit. Nothing needs a backfill, because the pages are new.
- **US FAQ answers** for app, POS, end of trial, contract and data: `variant.us.faq.items`.

Data facts that shape the design:
- **`{starterPrice}` is the Starter *monthly* price** (`lib/pricing.ts:248`). `PricingSection` defaults to yearly, which shows a lower per-month figure. So any "from {starterPrice}/mo" near the pricing block shows two prices for one plan.
- **The demo's iPhone flow often fails.**
  - On iPhone, only about 26-36% of taps on "add" end with the card added (prod `demo_sessions`, 28 Oct audit). The desktop QR flow reaches 65-85%.
  - About two in three iPhone tappers are left on "⏳ add to wallet", with no next step on screen.
- **Levels are behind a per-business rollout switch** (`businesses.settings.levels_enabled`, read in `backend/app/services/programs/levels/admin.py:63`). It is on for two prod businesses since 11 Nov. A new US sign-up cannot turn levels on today.
- **Default stamp notification, on every plan:** "Stamp collected! You have {{stamp_count}} of {{total_stamps}} stamps." (`backend/app/services/programs/notification_defaults.py:25`). Custom wording and milestones are Growth and Pro only.
- **`en-phone.png` is sample data.** It shows the Aurevo fixture's numbers (61% return rate, 90-day range) and "Paris (GMT+1)" at the top.

## Placement

Routes and folders stay as in the plan:
- Pages: `app/[locale]/us/landing-pages/{how-it-works,features,outcomes}/page.tsx`
- Components: `components/landing-pages/`
- Copy: `lib/landing-pages/copy/`

The `/us` prefix is right: it gives English, dollars, the 14-day trial, the US header and ad attribution with no extra work. The pages are not on `/us` itself (a non-goal). They get no nav item, no footer link and no sitemap entry: they are ad destinations, and every nav item is a cost every visitor pays.

### What the three pages share (built once)

So that the only variable is the argument:
- **Shell:** US header, tracker, pricing provider, footer.
- **Hero layout:** H1, one-line sub, CTA "Start my free trial", reassurance, proof line. Only the words and the visual change.
- **Pricing:** `PricingSection market="us"`, untouched.
- **FAQ:** the same 5 questions.
- **Final CTA:** the same block. Only its headline may change per page.
- **Section rhythm** (below).

What differs: the hero words and visual, the middle sections, and the final CTA headline. The demo is on How-to and Features only (see "A conflict inside the plan").

### Rhythm: spaced out, but not long

- **Section padding:** every section uses `py-16 lg:py-24`. That is what `PricingSection`, `FeatureGrid` and the `/us` FAQ and final CTA already use, so the reused blocks keep the same beat. That gives 128px between blocks on a phone and 192px on desktop. The air comes from putting less in each section, not from more padding.
- **One idea per section:**
  - One h2, at most 2 lines at 390 (about 44 characters).
  - One lead, at most 2 lines at 390 (about 85 characters), `max-w-xl`.
  - One visual, and at most one small-print line.
  - No list longer than 3 items, no cards inside cards.
- **Spacing inside a section:** heading block to visual `mt-10 lg:mt-14`; h2 to lead `mt-4`.
- **Backgrounds:** at most one tinted band (`--blog-bg-alt`) per page: How-to steps, the Features gallery (which has it built in), and the Outcomes figure. Everything else sits on the page's cream. The final CTA keeps `stamp-pattern`.
- **Type:** `text-display` once per page, for the final CTA headline. `text-hero` for the H1 only.
- **Phone crop:** on phones, a spotlight's device is cropped to its top ~420px, its bottom cut by the section edge. The clock, the banners and the KPIs all sit in the top half of the device.

### Hero (shared layout)

**Phone, 390x844.** The header is 64px tall (measured). Text is left-aligned, one column.

| Element | Ends at y (px) |
|---|---|
| H1 (starts at 96, `pt-24`), 3 lines (2 lines: 182) | 224 |
| Sub, 2 lines of 16px | ~291 |
| CTA, full width (`w-full sm:w-auto`), 52px | ~371 |
| Reassurance | ~403 |
| Secondary link, How-to and Features only (44px tap target) | ~451 |
| Proof line | ~479 |
| Visual starts | ~520 |

What this gives:
- The CTA sits in the middle third of the screen, in thumb reach, and is visible whatever the browser chrome (Safari shows about 660-710px).
- About 320px of the visual shows above the 844 fold.
- US visitors get no cookie banner. A non-US visitor's banner starts at y=583 (measured on `/us`), below the CTA.
- The hero visual is not inside `ScrollReveal`, and it loads `eager`: it is the largest thing painted.

**Desktop, 1440x900.**
- Layout: `lg:grid-cols-12`. Text `lg:col-span-7` (about 720px), left-aligned. Visual `lg:col-span-5`, centred vertically. `pt-36`. CTA and secondary link on one row.
- The text block ends by about y≈570 at worst.
- `IPhone width={320}` is 654px tall and runs from 144 to 798, so the whole visual is above the 900 fold.
- Between `md` and `lg`, the phone layout is used, at `max-w-2xl`.

**H1 line counts.** Measured with Geist 800: 40px in a 358px column at 390, and 64px on desktop.

| H1 | 390 | 600 / 680 / 740px |
|---|---|---|
| "Your punch card, now in their phone." (plan, How-to) | 2 | 2 / 2 / 2 |
| "The digital punch card for Apple Wallet and Google Wallet." (plan, Features) | **4 (fails)** | 4 / - / - |
| "Digital punch cards for Apple and Google Wallet." | **4 (fails)** | 3 / - / - |
| "Digital punch cards for Apple & Google Wallet." | 3 | 3 / 3 / 2 |
| "Turn first‑time customers into regulars." (plan, Outcomes, same as `/us`) | 3 | 3 / 3 / 3 (2 at 768 on `/us`) |
| "Turn first‑timers into regulars." | 2 | 2 / - / - |

**Rule for copy:** an H1 of at most 46 characters takes at most 3 lines at 390; at most 36 characters takes 2.
- The plan's Features H1 runs to 4 lines (171px) and has to be shortened.
- The Outcomes H1 must keep U+2011 in "first‑time", or the line can break after "first-".

**Hero visuals.** All are live HTML. The only images are the iPhone bezel and status-bar PNGs.
- **How-to:** `IPhone` (statusBar "light", Wallet-grey screen) with the Aurevo `WalletCard` at the top, 4 of 8 stamps. On phones it is 260 wide and cropped; on desktop 320 wide, shown whole.
- **Features:** `HeroCardStack`, with one `NotificationBanner` overlapping the card's top edge. On phones it is one 300px card, 385px tall; the peeking cards appear from `lg`.
- **Outcomes:** `NotificationPhoneDemo` (statusBar "lock"), with the banner shown at first paint (not after 2 seconds) and the default wording.

One sample business, Aurevo (a café), runs through every visual on all three pages, including the dashboard capture, which shows Aurevo's numbers. It reads as one shop's story, and cafés are the main US segment.

### A. How-to `/us/landing-pages/how-it-works` (6 sections)

| # · id | Job | Visual | 390 / desktop |
|---|---|---|---|
| 1 · hero | "This is easy": the card lives in their phone | `IPhone` + Aurevo `WalletCard` | As above. Secondary link "Try it on your phone" → `#demo` |
| 2 · steps | 3 steps, one line each, then the "all you need" line | 1: Aurevo `WalletCard` (4/8).<br>2: counter placard: white tile with the Aurevo logo, a still `QRCodeSkeleton` and the official wallet badges (`walletBadges`).<br>3: the same card at 5/8, with a `NotificationBanner` in default wording | Phone: stacked; `NumberStamp` + h3 + line, then the visual (≤ 260px tall).<br>Desktop: 3 equal columns, visual box on top (~300px).<br>Tinted band |
| 3 · demo | Try it on your own phone | `HeroDemo` | Phone: heading, lead, demo, then the trial CTA.<br>Desktop: 2 columns, text and CTA left, demo right |
| 4 · pricing | How much | `PricingSection market="us"` | As shipped |
| 5 · faq | Objections | `FAQList` | `Container size="narrow"` |
| 6 · final_cta | Ask again | Final CTA block | Centred |

Changes to the plan:
- **"What you need" is no longer a section.** It repeated the hero sub and FAQ question 2. It becomes one line under the steps.
- **Step 3 shows the customer's side (the banner), not the scanner phone.** A second full phone inside a step tile is 572px tall on a phone.

### B. Features `/us/landing-pages/features` (8 sections)

| # · id | Job | Visual | 390 / desktop |
|---|---|---|---|
| 1 · hero | Name the category: a digital punch card in Apple and Google Wallet | `HeroCardStack` + banner | Secondary link → `#demo` |
| 2 · demo | "It lives in their wallet": try it | `HeroDemo` | As How-to §3 |
| 3 · spotlight_messages | Reach them on the lock screen: automatic messages (every plan) and broadcasts (Growth and Pro) | `NotificationPhoneDemo` with two stacked banners: a reward message in default wording, and a broadcast | Phone: heading, lead, cropped phone.<br>Desktop: split, visual right |
| 4 · spotlight_design | Your logo, colours and stamps | `CardStyleGallery`, its own CTA hidden | Full-width carousel; swipe on phones |
| 5 · spotlight_analytics | See who comes back | `PhoneScreenshot` with `en-phone.png`, captioned "Sample data" | Split, visual left; cropped on phones |
| 6 · pricing · 7 · faq · 8 · final_cta | Shared | | |

Changes to the plan:
- **The six-tile grid is gone.** Each tile repeated a spotlight further down; repeating everything is exactly what the research criticises in Loopy.
- **The Paper vs app vs Stampeo table is gone.** It restated the hero and the FAQ, and became 15 stacked text cells on a phone.
- **"Stamp from any phone" and "stamps or points" move** to FAQ question 2 and the pricing cards.
- **The section count was really 9.** The plan counted "FAQ + final CTA" as one section.

### C. Outcomes `/us/landing-pages/outcomes` (8 sections)

| # · id | Job | Visual | 390 / desktop |
|---|---|---|---|
| 1 · hero | First-time customers become regulars | Lock screen with the default stamp banner | No secondary link |
| 2 · problem | Why regulars matter, as one sourced figure | "6×" in `ink-figure`, one line, one source line (Square 2026 Local Economy Report, Mar 2026) | Centred, tinted band, about 0.45 screen |
| 3 · outcome_return | They come back sooner: the card is always on them, progress shows, the head start | Aurevo `WalletCard`, part-filled | Split, visual right |
| 4 · outcome_slow_days | Fill a slow day with a broadcast (Growth and Pro) | `NotificationPhoneDemo` with a broadcast banner | Split, visual left; cropped on phones |
| 5 · outcome_regulars | See your return rate | `PhoneScreenshot` with `en-phone.png`, captioned "Sample data"; ends with the worked example, labelled "Example" | Split, visual right |
| 6 · pricing · 7 · faq · 8 · final_cta | Shared | | |

Changes to the plan:
- **The problem section keeps one figure, not three.** The research left exactly one usable sourced figure; two more would be the myths it warns against. Keep this section: without it, Outcomes is the Features page with new headings, and the figure is what makes it an argument about results.
- **The proof strip leaves Outcomes and moves into every hero** (see Proposed additions). Proof on only one page is a second variable in the test.
- **The pricing heading is not overridden** ("Pays for itself…"). The worked example closes §5 instead, so the pricing block stays the same on all three pages.
- **The section count was really 9** here too.

### A conflict inside the plan

The plan asks for three things that don't fit together:
- "The secondary action on every page is the live demo";
- at most 8 sections per page;
- a demo section on How-to only.

As written, the hero link on Features and Outcomes would point at nothing.

**How I resolved it:**
- The demo section and its hero link go on How-to and Features, as the research asks.
- Outcomes has no secondary link: a demo there would make 9 sections, and it argues "how", not "results".

## Entry points

- **Ads:** the final URLs of the ads (Google Ads now, Meta and ChatGPT later). `AttributionCapture` stores the `gclid` and UTMs, with `lp` and `lv` = `lp_howto` | `lp_features` | `lp_outcomes`.
- **Direct URL only:** noindex, and no nav, footer, sitemap or `llms.txt` link.
- **Links within the page:**
  - To `/onboarding`: hero CTA, demo-section CTA (How-to, Features), pricing cards, final CTA.
  - Hero secondary link → `#demo` (How-to, Features).
  - FAQ contact line → `/contact`.
- **Exits that stay** (the shared header and footer are non-goals):
  - Header "Pricing" → `/us/pricing`.
  - The logo → `/en`, not `/us`.
  - The footer links.

## Proposed additions

- **Proof line in every hero.** JUSTIFICATION: answers a question the screen provokes. Someone who arrives from an ad and is about to hand over a card for the trial asks "does anyone actually use this?".
  - AC: all three heroes show the same one-line proof under the reassurance, read from `variant.metrics`, so there is no second copy of "120+" to keep in sync.
  - It replaces the plan's Outcomes-only proof section.
  - If struck: use `VariantMetricStrip` above pricing on all three pages, never on just one.
- **A CTA inside the demo section.** JUSTIFICATION: removes a step and a dead end, since about two in three iPhone tappers never reach "Add stamp".
  - AC: the demo section shows "Start my free trial" whatever the demo state, as `CTAButton variant="outline"`, so the demo's own orange "Add to your Wallet" stays the section's main button.
  - AC: it sits directly under the demo widget on phones, and under the lead on desktop.
  - AC: `trackAs="feature_cta"` (an existing sign-up location, so no taxonomy change).
- **One "all you need" line under the How-to steps.** JUSTIFICATION: answers the question step 3 provokes ("what do I scan with?").
  - AC: one centred line under the steps, and no separate section.
- **A "Sample data" caption under each dashboard capture.** JUSTIFICATION: prevents a mistake. Next to "turn first-time customers into regulars", a 61% return rate reads as a promise.
  - AC: every `PhoneScreenshot` on these pages has a small "Sample data" caption.

## Rejected additions

- Six-tile feature grid (plan Features §2): every tile repeats a spotlight below it.
- Paper vs app vs Stampeo table (plan Features §6): restates the hero sub and FAQ, and becomes 15 stacked text cells on a phone.
- "What you need" as its own section (plan How-to §4): folded into one line.
- Three-figure problem section (plan Outcomes §2): only one sourced figure exists; one is kept.
- "Pays for itself" heading on the Outcomes pricing block: the shared block would differ between pages. The example moves to §5.
- Live demo on Outcomes: argues "how", not "results", and would make 9 sections.
- Scanner spotlight (`ScanDemo`) on Features: a 572px phone for what FAQ question 2 answers in one line.
- Collapsing the pricing feature lists on phones (would save about 1.3 screens):
  - Reason: the pages already fit in 10 screens without it, and these pricing blocks would then differ from `/us` and `/us/pricing`.
  - Revisit if `landing_section_viewed` shows visitors stopping inside pricing.
- Price in the hero ("from {starterPrice}/mo", research #10): the token is the monthly price and the block defaults to yearly, so the page would show two prices for one plan.
- "See pricing" link in the hero: a third element in the hero for a question the pricing block answers. The header already has Pricing.
- Sticky bottom CTA bar: permanently takes about 72px of the scarcest space, fights Safari's bottom bar and the demo's own buttons. The CTA repeats at decision points instead.
- Sector carousel / `VariantSectorCards` (research #6): 11 fictional brands in about 670px, mostly hidden in a horizontal carousel, and it supports none of the three arguments.
- Changelog teaser: answers no question a visitor has.
- Desktop dashboard capture (`VariantDashboardShot`): the phone capture says the same thing in less height.
- "Book a demo": the opposite of self-serve (already rejected in the plan).
- Video: there is no asset and it is out of scope. The live demo is our video.
- ROI calculator (`components/pricing/ROICalculator.tsx`, research #11): form inputs on a phone. One labelled example line does the job.
- `HeroCardFan`: puts 240-280px above the H1 on a phone, and would make the new pages look like the page they are trying to beat.
- Testimonial section: none exist, and we never invent one. If Harry sends a real one, it goes in the same slot on all three pages, above the final CTA headline.
- Header without the nav: it would cut exits, but the shared header is a non-goal.
- Sticky-phone scrolling steps: costs motion and accessibility, and has no phone equivalent.
- The `/us` FAQ's dark "A question that isn't here?" box (264px): one contact line does the same job.
- A CTA between the Outcomes argument sections: the pricing block, with its 3 buttons, comes straight after.

## Claims check (STAMPEO.md §6-§8): acceptance criteria for the copy pass

- **"Lock-screen reminders" (Features sub) and "their phone reminds them" (Decisions).** Stampeo notifies on stamps, rewards, milestones and broadcasts. Nothing reminds anyone later: no geofencing, no reward-expiry reminder, no automatic win-back.
  - AC: no "reminder" wording.
- **"A broadcast reaches every card for free".** Broadcasts are included in Growth (8 a month, sent immediately) and Pro (unlimited, scheduled). They are not free, and Starter has none.
  - AC: every mention of broadcasts carries "Growth and Pro" (the rule from STA-519).
  - AC: "no texting fees" appears only on the same line as that qualifier.
- **"We miss you" to lapsed customers.** Targeting inactive customers is Pro only. Growth can send to everyone, or by join date.
- **"Stamps, points or levels" (tile and pricing).** Levels are behind the rollout switch.
  - AC: drop "levels" from these pages unless the switch defaults to on at launch. The pricing card's line already ships; that is outside this change.
- **The banner "2 more stamps until your free latte" and the hard-coded `appName="Stampeo"`.** Custom wording and milestones are Growth and Pro, and the card carries no Stampeo mark.
  - AC: banners use the default wording, and name the sample business (Aurevo), never "Stampeo".
- **"Nothing to download".**
  - AC: always "for your customers". Staff use the free app or a browser, and stamping needs a connection: never "works anywhere" or "offline".
- **The head-start effect.**
  - AC: if it is stated as a finding, a source line on the page (Nunes & Drèze, 2006).
- **The 6× figure.**
  - AC: quoted exactly, with its source line on the page.
  - It is Square's data about Square sellers: never present it as a Stampeo result.
  - The quote and source come from the research agent: check them before shipping.
  - Never use "5x cheaper" or "67% more".
- **The hero demo link.**
  - AC: a plain `<a href="#demo">`, at least 44px tall, like `/us`'s `#try-it` link. Not `CTAButton` and not `trackAs="hero_demo"`.
  - Why: `hero_demo` is in `CONTACT_CTAS` (`lib/cta/taxonomy.ts`), so GA4 and Meta would count an in-page scroll as a contact click. `landing_section_viewed` already measures the jump.
- **The step-2 QR.**
  - AC: it cannot be scanned (still `QRCodeSkeleton`), so the only scannable code on the page is the live demo's.
- **One action, three labels:** "Start my free trial" (hero), "Get started" (pricing, shared block, accepted), "Start Free" (gallery).
  - AC: the gallery's CTA is hidden on these pages.
- **"Live the same day" is the line.**
  - AC: no number of minutes anywhere.

## Mobile shape

**How-to at 390.**
- **Hero:** H1, sub, the full-width CTA, the reassurance, a 44px-tall "Try it on your phone ↓" link and the proof line. The Wallet screen with the Aurevo card rises from the hero's bottom edge, cropped at about 320px.
- **Steps (tinted band):** three stacked steps, each a number stamp, a title, one line, then a visual at most 260px tall. One "all you need" line ends the band.
- **Demo:** heading, lead, the Stamps/Points toggle, the card, the demo's "Add to your Wallet" button, then the outline trial CTA.
- **Pricing:** as shipped, 3 stacked cards.
- **FAQ:** 5 collapsed rows (each tap target 44px or more), then one contact line.
- **Final CTA:** display headline (at most 2 lines), full-width CTA, reassurance.

**Features at 390.**
- **Hero:** the same text stack, then one 300px Aurevo card with a banner dropping onto its top edge (the peeking cards are hidden).
- **Demo:** as on How-to.
- **Messages:** heading and lead, with a "Growth and Pro" label on the broadcast line, then the lock screen cropped to its top 420px with two stacked banners.
- **Design:** the gallery, full width, one card centred, swipe or arrows, no CTA.
- **Analytics:** heading and lead, the cropped capture, "Sample data".

**Outcomes at 390.**
- **Hero:** the text stack, then the lock screen rising from the bottom with the stamp banner.
- **Figure:** one big number, one line, a source in small print.
- **Return:** heading, lead, then the Aurevo card at 280px.
- **Slow days:** heading, lead with "Growth and Pro", then the cropped lock screen with a broadcast.
- **Regulars:** heading, lead, the cropped capture, "Sample data", then the "Example" line.

**Desktop.**
- Hero: 7/5 split.
- How-to steps: 3 columns.
- Spotlights and the demo: 2 columns. Spotlights alternate sides: Outcomes right, left, right; Features right for messages, left for analytics.
- The gallery runs full width; the FAQ uses the narrow column; the final CTA is centred.

**Length**, in 390x844 screens to the end of the final CTA (estimates; the footer adds about 1.6):

| | How-to | Features | Outcomes |
|---|---|---|---|
| Hero | 1.0 | 1.05 | 1.0 |
| Middle | steps 1.8, demo 1.25 | demo 1.25, messages 0.85, design 0.9, analytics 0.85 | figure 0.45, return 0.75, slow days 0.85, regulars 0.95 |
| Pricing (as shipped) | 2.9 | 2.9 | 2.9 |
| FAQ + final CTA | 1.5 | 1.5 | 1.5 |
| **Total** | **~8.5** | **~9.3** | **~8.4** |

**Thumb reach and where the CTA repeats.**
- The primary CTA sits at y≈320-370 (the middle third), full width.
- It repeats in the demo section (screen ~3 on How-to, ~2 on Features), in pricing (3 buttons, around screens 4-7) and in the final CTA (the last screen).
- The longest stretch without a CTA is Outcomes screens 2-5, the argument itself, which pricing follows directly. I accept that.

**Structural mobile items I own:**
- **Sheets vs dialogs:** there are none. The FAQ uses native `<details>`.
- **Tap targets of 44px or more:** the CTA is 52px, the hero link `h-11` (`/us`'s is 20px tall), FAQ rows 44px. Three reused blocks are below 44px and I leave them alone: the `HeroDemo` toggle (32px), the pricing interval tabs (36px) and the footer links (20px).
- **No hover-only content:** the `interactive3D` tilt is decoration only, and the gallery has swipe and arrows.
- **Wide content:** there are no tables. Pricing and steps stack; the gallery swipes.
- **No jump on first paint:** `ScaledCardWrapper` draws at scale 1 on the server, so hero card wrappers use their final width (280px, or `HeroCardStack`'s 300px box) on phones.

## Components to reuse

Used as they are:
- `components/ui/Container.tsx`: every section. Use `size="narrow"` for the FAQ.
- `components/ui/ScrollReveal.tsx`: section entrances (not the hero visual).
- `components/ui/CTAButton.tsx`: `trackAs="hero"` and `trackAs="final_cta"`, with `w-full sm:w-auto` on phones. The demo-section CTA uses `variant="outline"` and `trackAs="feature_cta"`.
- `components/ui/FAQList.tsx`: the FAQ.
- `components/ui/IPhone.tsx`: the How-to hero (`statusBar="light"`, `width`, `eager`).
- `components/ui/PhoneScreenshot.tsx` + `lib/landing/dashboard-shots.ts` `landingShot("en","phone")`: the analytics spotlights.
- `components/sections/Header.tsx` and `Footer.tsx`: both with `market="us"`.
- `components/sections/PricingSection.tsx`: `market="us"`, unchanged, inside a `data-landing-section="pricing"` wrapper.
- `components/sections/HeroDemo.tsx`: the demo, `dynamic` import as `VariantTryIt` does it.
- `components/card/HeroCardStack.tsx`: the Features hero.
- `components/card/WalletCard.tsx` + `ScaledCardWrapper.tsx` + `lib/loyalty-samples.ts` (`STAMP_SAMPLES` "aurevo"): the cards.
- `components/features/notifications-push/NotificationBanner.tsx`: imported across features, as `GeofencingPage` already does.
- `components/stamps/StampIcons.tsx` `NumberStamp`: step numbers.
- `lib/store-badges.ts` `walletBadges`: official badge art on the step-2 placard.
- `components/analytics/LandingTracker.tsx`, `components/market/RegionPricingProvider.tsx`, `components/market/RegionText.tsx`: tracking and the trial and price tokens.
- CSS classes `paper-grain`, `stamp-pattern`, `ink-figure`.

**Can we reuse anything from `landing-variant/`?** First, the stampeo-ux-ui reference is wrong to call it "the A/B landing": it is the live `/us` homepage. Importing from it is allowed, but it would tie the new pages to a folder that gets rewritten or deleted when a winner replaces `/us`. Component by component:

| Component | Reuse? | Why |
|---|---|---|
| `VariantHowItWorks` | No | Its copy is fixed to `variant.howItWorks`, it uses ink doodles rather than real step visuals, and it has no prop for a visual. |
| `VariantMetricStrip` | Only if the hero proof line is struck | Then import it as it is, without moving it. |
| `VariantFAQ` | No | Its `px-6` breaks the 16px Container gutter, it carries the 264px contact box, and its title comes from `variant.faq`. |
| `VariantFinalCTA` | No | "Book a demo" is built into it, and its copy is fixed to `variant.*`. |
| `HeroCardFan` | No | See Rejected additions. |
| `VariantTryIt` | No | Its "Scan the code" lead is wrong on a phone, and it adds the ink note and the `#try-it` id. |

## New components required

**Extended with optional props (rung 3).** Existing call sites keep rendering exactly what they render now:
- `components/features/notifications-push/NotificationPhoneDemo.tsx`. New props: `notifications?: NotificationBannerProps[]` (stacked), `animate?` (default true), `eager?` (default true), `width?` (default 280).
  - Why the ladder needs it: the hero needs the banner at first paint and the sample business's name; the spotlights need two banners and lazy loading.
- `components/features/design-de-carte/CardStyleGallery.tsx`. New prop: `showCta?` (default true).
  - Why: one CTA label per page.
- `components/ui/QRCodeSkeleton.tsx`. New prop: `animated?` (default true).
  - Why: a still QR mark for step 2.

**New, in `components/landing-pages/shared/`.** These are private to this feature: the three pages are one feature. Promote one to `components/ui/` only if another feature needs it.
- `LandingPageShell`: the frame (header, tracker, pricing provider, footer).
- `LpSection`: section + `Container` + optional h2 and lead + `data-landing-section` + `scroll-mt`. It holds the rhythm.
- `LpHero`: the hero layout above, with a slot for the visual.
- `LpSpotlight`: text and visual side by side, with `side`, `cropOnPhone` and an optional "Growth and Pro" label.
- `LpDemo`: `LpSection` + `HeroDemo` + the outline CTA.
- `LpFaq`: `Container` narrow + `FAQList` + one contact line (`trackAs="faq_contact"`).
- `LpFinalCta`: `CTAButton` + `RegionText` + `stamp-pattern`, with no demo link.

Why nothing existing covers these:
- No component lays out a text-and-visual section on this rhythm. `compare/PageSection` is prose only, and each feature page hand-rolls its own.
- The `/us` versions carry `/us` copy and `/us` decisions.

**Page-specific:**
- `how-it-works/HowSteps`: the steps and their three visuals, including the placard.
- `features/FeaturesHeroVisual`: `HeroCardStack` + the banner.
- `outcomes/RegularsFigure`: the figure, its line and its source.

## Open questions for the user

None of these block the design; each default is stated.
1. **Levels at launch:** is `levels_enabled` on by default by then? Default: say "stamps or points" on these pages.
2. **A real owner quote** (name, business, city)? Default: none. If one arrives, it goes in the same slot on all three pages.
3. **Citing Square's report** on our page: are you comfortable with that? Default: yes, with its source line.
4. **"Punch card" in the H1:** the copywriting rule only allows "punch card" on the `/us` SEO pages. Should that list include `/us/landing-pages/*`? It matches what US owners search and what the ads say. This is for stampeo-copywriting.
5. **Proof placement:** a line in every hero (default), or the numbers strip above pricing on all three pages.
6. **US re-shoot of `en-phone.png`:** it shows "Paris (GMT+1)". This is a follow-up through promo-videos' landing-shots tool, never by hand.
