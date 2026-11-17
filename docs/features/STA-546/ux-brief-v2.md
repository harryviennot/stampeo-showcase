# UX Brief v2: STA-546
MODE: DESIGN   DOMAIN: showcase
VERDICT: READY (open questions at the end; each has a default and none changes the design)

How I looked. I read the plan (v2 section first), `research-passentry.md`, my v1 brief and the v1 review. I looked at
the pixels of PassEntry (`shots/passentry/*`), the live `/us` (`shots/us-live/*`) and our v1 pages (`shots/final/*`). I ran
`next dev` in the worktree, shot the feature pages at 390x844 and 1440x900 (`shots/design-v2/`, git-excluded), measured
the section heights at 390 in the DOM, then stopped dev. `git status` is clean.

For these four pages, Harry's verdict replaces the restraint bar: depth, interaction and showing the product are the
goal. What still applies: readability, phone first (390 designed first), only live claims, the type scale and
tokens, `CTAButton` for tracked links, and one primary CTA: "Start my free trial".

## Already shipped (what v2 builds on)

- **The v1 frame works and stays.** `LandingPageShell`, `LpSection`/`LpHeading`, `LpDemo`, `LpFaq`, `LpFinalCta`,
  `PlanLine`, `SampleCapture`, `PhoneCrop`, `AurevoCard`/`PassFrame`, `lpBanner`, the copy modules and their claim tests.
  This includes the props v1 added to `NotificationPhoneDemo`, `CardStyleGallery`, `HeroCardStack` and `QRCodeSkeleton`.
- **The rich components exist; only some can be dropped in as they are.** Heights measured at 390:

| Component | Height at 390 | State |
|---|---|---|
| `CardDesignPlayground` | 1311 | Its control panel alone is ~580px, so on a phone the card scrolls out of view while you use the controls. |
| `NotificationSequenceDemo` | 1362 | Hard-codes "Stampeo" as the sender, "Mon Café", and custom milestone wording. |
| `ScanDemo` | — | Shows a red "REC" dot and a "0.8s" timer chip. |
| `LiveActivityFeed` | 579 | |
| `CardStyleGallery` | 928 | |
| `AnnotatedWalletCard` | 973 | |
| `AnalyticsChartCards` | 1348 | |
| `HeroDemo` (`LpDemo`) | 1016 | |
| Sector carousel | 1015 | |
| Pricing | 2585 | |
| `LpFaq` | 848 | |
| Footer | 1337 | |

- **On a phone, `/us`'s `VariantDashboardShot` shows no desktop.** The desktop capture is `hidden md:block`, so at 390
  only the phone shows. Harry's point ("there's a web dashboard on their computer") is lost exactly where ad clicks land.
- **Levels: two facts change the design.**
  - **Levels are off for every new business.** `levels_access()` (`backend/app/services/programs/levels/admin.py:63`) reads
    `settings.levels_enabled`, a platform-owned key. When the key is absent, levels are off.
  - **A card with custom stamp icons cannot change look per level** (`skins.py` `forces_same_look`). Aurevo's cups are
    custom icons, so Aurevo cannot be the levels example.
  - The default level looks are: level 1 keeps the business's own card, level 2 is Silver, level 3 is Gold. The card's
    header label becomes the level name over the count.
  - The default banner text is "You've reached {{tier_name}}! Your card has a new look."
    (`backend/app/services/programs/notification_defaults.py:96`).
- **Reusable as they are:**
  - `HeroCardFan` and `FanParallax`: they render no copy (the one translation they read feeds an annotation that is
    commented out).
  - `SectorCarousel` and `SECTOR_THEMES`: they carry no copy. The slides come from `landing.sectorCards` (the shared
    catalog that holds "Stampeo adapts to your business", not `variant.*`).
- **Blog.**
  - `getAllPosts("en")` returns the posts sorted newest first, with `readingMinutes` and `description`. English posts
    have no `coverImage`.
  - `BlogCard` shows a category pill, the title and the date.
  - The 3 latest posts are all about points (Sep 24, Aug 27, Aug 3).
- **Captures.** We only have Analytics captures: `en-desktop`, `en-phone`, `en-phone-habits` and `en-phone-busiest`. The
  desktop capture also shows "Paris (GMT+1)". It moves into the hero in v2, so the US re-shoot follow-up matters more.
- **What we have no asset for:**
  - an Android phone or a Google Wallet card render (`IPhone` is the only device frame);
  - a browser or laptop frame;
  - an eyebrow token that reaches 4.5:1. On cream, `--accent` is 2.7:1 and `--accent-hover` is 3.4:1.

## Rules the four pages share

- **Rhythm.** Every section is `py-16 lg:py-24`. On splits the h2 is ≤44 characters and the lead ≤85, left-aligned;
  over full-width visuals both are centred. The three argument pages may have **two tinted bands**, never adjacent;
  Platform has none, only hairlines, one white card and the accent band.
- **One primary action.** "Start my free trial" is always a `CTAButton`. Repeats inside the page are
  `variant="outline"` with `trackAs="feature_cta"`; the last one is `final_cta`.
- **The demo link is a plain `<a href="#demo">`, at least 44px tall.** Same reasoning as v1: `hero_demo` counts as a
  contact click. On Platform it gets an outline-pill look so it pairs with the primary button (see `LpCtaPair`).
- **Sample brand.** Aurevo (café, custom cups) is the sample in every visual, with one exception: levels use a card with
  preset icons (the barbershop sample, scissors), because Aurevo's card cannot change look per level.
- **"Sample data" is captioned under every dashboard capture.** This includes the small crop inside a Platform glass card.

---

## 1. The four pages

### A. How it works: `/us/landing-pages/how-it-works` (`lp_howto`), 12 sections

**The argument:** "It's easy, and here's exactly how." The page follows the owner's actual path in order: make the card,
share it, stamp it, watch it, then the first day after sign-up. **What keeps it from being the other pages:** it is the
only page organised as a sequence, with numbered steps. It is also the only one with the live card designer, the
counter flyer, the sign-up timeline and the "they scan / you stamp" two-phone moment.

1. **`hero`**
   - **Job:** make it look easy, and show both halves of the product: the card in their wallet, the dashboard on your
     computer.
   - **Shows:** the shared v2 `LpHero`: H1, sub, CTA, the "Try it on your phone ↓" link, the reassurance, the proof line,
     then the official wallet badges and `DashboardDuo`, captioned "Sample data".
   - **Interaction:** none.
   - **390:** see "Shared hero" below. The CTA ends at about y=371 and the duo starts at about y=560.
   - **Desktop:** centred column, the duo rising into the 900px fold.
   - **Draft:** "Launch a digital punch card today." / "Customers add it to Apple Wallet or Google Wallet. You stamp it
     from your phone."
2. **`steps`** (tinted band 1)
   - **Job:** the map of the page, where each step is a jump link.
   - **Shows:** three items, each a `NumberStamp`, an h3 and one line. The whole item is an `<a href="#step_*">`.
     A `perforation` dashed line connects them.
   - **Interaction:** the anchors jump to their step (`scroll-mt-24`).
   - **390:** three stacked rows, each 72px tall (well over the 44px tap target).
   - **Desktop:** three columns joined by the dashed line.
   - **Draft:** "Three steps, and you're live." / "No app for your customers, no new hardware, no change at your
     register."
3. **`step_create`**
   - **Job:** show how little it takes to make a card, and let them try it.
   - **Shows:**
     - `CardDesignPlayground compact` (new optional prop): stamps or points, theme, icon, stamp count;
     - one small-print line: free design help is an option on every plan;
     - an outline CTA ("you just designed one, now build yours").
   - **Interaction:** the live designer.
   - **390:** step number and h2, the card (240px wide), the compact controls (about 300px, so the card stays in view
     while you tap), the small print, then the CTA. About 1.2 screens.
   - **Desktop:** heading left, then the playground's own two columns (card left, controls right).
   - **Draft:** "Make your card. Try it right here." / "Pick stamps or points, your colors and your icon. The card
     updates as you go."
4. **`step_share`**
   - **Job:** show that customers join with one scan and no app.
   - **Shows:**
     - the counter flyer (v1's `PlacardVisual`, exported from `HowSteps`, with the QR still not scannable) overlapping
       the Apple Wallet phone (v1's `HowHeroVisual`, moved to `shared/WalletPhone`);
     - three channel rows: counter flyer · your link on Instagram or your website · the Scanner app shows your QR.
   - **Interaction:** ScrollReveal stagger.
   - **390:** the flyer, 165px wide, on the left, overlapping a 190px phone cut at 340px with a fade; then the three
     rows (icon, label, one line).
   - **Desktop:** split. Text and rows on the left; on the right, the flyer (240px) in front of the phone (300px).
   - **Draft:** "They scan, and it's in their wallet" / "Your dashboard prints a counter flyer with your QR code. No app,
     no account."
5. **`step_stamp`**
   - **Job:** one scan is the whole job, and the customer feels it.
   - **Shows:** `ScanDemo chrome="minimal"` (no REC, no timer) and the customer's lock screen
     (`NotificationPhoneDemo`, Aurevo's default "Stamp collected! You have 5 of 8 stamps.").
   - **Interaction:** the scan loop, and the banner cycling.
   - **390:** `ScanDemo` in `PhoneCrop` (440), then the banner alone (`NotificationBanner`, full width) with a caption.
     Two whole phones would be 1144px.
   - **Desktop:** two phones side by side, captioned "You scan" and "They see it".
   - **Draft:** "Scan their card. That's the stamp." / "Use the free Scanner app or any phone's browser. Their card
     updates in seconds."
6. **`demo`**
   - **Shows:** `LpDemo`, as v1: the live `HeroDemo` and the outline CTA in every demo state.
   - **Draft:** "Try it on your own phone." / v1 lead.
7. **`see_it_work`**
   - **Job:** close the loop: the scan shows up on your side.
   - **Shows:** `LiveActivityFeed`, which adds rows live.
   - **390:** heading, lead, the feed card (about 300px).
   - **Desktop:** split, feed on the right.
   - **Draft:** "Then watch it work, live" / "Every stamp, reward and new card shows up on your dashboard as it happens."
8. **`sectors`**
   - **Job:** "and for my kind of shop?"
   - **Shows:** `LpSectors`, the carousel under the catalog's "Stampeo adapts to your business".
   - **Interaction:** swipe and arrows, with autoplay.
9. **`first_day`** (tinted band 2)
   - **Job:** answer "what happens after I click?". You test before you pay.
   - **Shows:** a 5-point timeline:
     1. Tell us about your shop.
     2. Build your card.
     3. Add a test card to your own phone and stamp it (before any plan).
     4. Choose a plan; your {trialDays}-day trial starts.
     5. Put the flyer on your counter.

     It ends on "Your card can be live the same day."
   - **390:** a vertical rail of dots and icons, not numbers (numbers belong to the steps). About 0.8 screen.
   - **Desktop:** a horizontal rail with 5 columns.
   - **Draft:** "From sign-up to first stamp, same day" / "You add a test card to your own phone before you choose a
     plan."
10. **`pricing`**, 11. **`faq`**, 12. **`final_cta`** ("Your card can be live today.")

### B. Features: `/us/landing-pages/features` (`lp_features`), 12 sections

**The argument:** "Your card in their wallet, with everything around it." A tour of capabilities, each one shown
working. **What keeps it apart:** it is organised by capability, not sequence (unlike How-to) and not by result (unlike
Outcomes). It is the only page with the style gallery, the Stamps / Points / Levels tabs, the notification-moments demo,
the scanner spotlight and the "everything else" grid.

1. **`hero`**
   - **Shows:** the shared v2 hero.
   - **Draft:** "Your punch card, in Apple & Google Wallet." / "Branded with your logo, updated on every visit. No app for
     your customers to download."
2. **`demo`**: `LpDemo`, right after the hero, as in v1.
3. **`spotlight_design`** (tinted band 1)
   - **Job:** show that the card looks like the shop, not like us.
   - **Shows:** `CardStyleGallery` (v1 props: heading override, `showCta={false}`, `sectionClassName`). Under it, a row of
     3 facts: your logo and colors · your own stamp icons, with the background removed automatically · change it anytime
     and every card updates.
   - **Interaction:** the carousel.
   - **390:** the carousel at full width, then the 3 facts stacked (icon and one line each).
   - **Desktop:** the 3 facts in one row.
   - **Draft:** "Looks like your shop, not like us." / "Your logo, your colors, your stamps. Change them anytime and every
     card updates."
4. **`program_types`**
   - **Job:** choose how you reward, levels included.
   - **Shows:**
     - `Segmented size="lg"` with Stamps | Points | Levels.
     - The panel: the card (Aurevo at 5 of 8, Marginalia at 240, or the `LevelCards` trio with the level-up banner),
       an h3, 2 lines, 2 facts and an "Every plan" chip.
     - The line "Switch between stamps and points later; customers keep their card".
     - An outline CTA: picking a program is a decision point, and you pick it during setup.
   - **Interaction:** tabs.
   - **390:** tabs at full width (44px tall), the card at 260px, then the text. About 1.3 screens.
   - **Desktop:** split. Tabs and text on the left, the card on the right.
   - **Draft:** "Stamps, points or levels" / "Reward visits, reward spending, or let regulars climb. All three on every
     plan."
5. **`spotlight_messages`**
   - **Job:** reach them on the lock screen.
   - **Shows:** `NotificationSequenceDemo`, with new optional props (the `moments` array and the card design). Three
     moments on Aurevo's card, each banner sent by Aurevo with its cup icon:
     - **Stamp collected** (every plan; default wording);
     - **Reward unlocked** (every plan; default wording);
     - **Broadcast**, with a "Growth and Pro" chip. Its banner text is written by the owner.

     The `PlanLine` follows: "[Growth and Pro] Send a broadcast to every card, with no texting fees."
   - **Interaction:** auto-advances every 4s; tapping a moment picks it and pauses for 8s.
   - **390:** heading, lead, the phone cropped at 440 (card and banner sit at the top of the screen), then three moment
     buttons of at least 44px. About 1.3 screens.
   - **Desktop:** the component's own split, list left and phone right.
   - **Draft:** "Reach them on their lock screen" / "Every stamp and every reward sends a notification. No app, no email
     list."
6. **`spotlight_scanner`**
   - **Job:** staff stamp from any phone.
   - **Shows:** `ScanDemo chrome="minimal"` and 3 facts:
     - free app for iPhone and Android, or any phone's browser;
     - staff join with a team code and see only the scanner;
     - perks for each customer's level show up at the till.

     There are no store badges (see Rejected).
   - **390:** `PhoneCrop`, then the facts.
   - **Desktop:** split, phone on the left.
   - **Draft:** "Stamp from any phone at the counter" / "The free Scanner app for iPhone and Android, or any phone's
     browser."
7. **`spotlight_analytics`** (tinted band 2)
   - **Job:** see who comes back.
   - **Shows:** `SampleCapture view="phone-habits"` ("How often they come"), with `LiveActivityFeed` overlapping its
     lower half like a floating card. Caption "Sample data". The plan line reads "More charts come with Growth and Pro."
   - **390:** the capture cropped at 440 with a fade, and the feed card pulled up 96px over the fade.
   - **Desktop:** split, the layered visual on the right.
   - **Draft:** "See who keeps coming back" / "Visits, new customers and your return rate, updated with every scan."
8. **`more_features`**
   - **Job:** answer "what else?" without a spotlight for each thing.
   - **Shows:** 6 tiles, each with an icon, a title, one line and a plan chip:
     - welcome gift (every plan);
     - gift a reward by hand (every plan);
     - a printable counter flyer (every plan);
     - the card in the customer's language, from EN, FR, ES, PL (every plan);
     - earning limits and reward expiry (Growth and Pro);
     - several locations with stats for each (Pro).

     An outline CTA closes the tour.
   - **390:** a list of 6 rows of about 76px.
   - **Desktop:** a 3x2 grid.
   - **Draft:** "And everything around it" / "The details that make a loyalty program easy to run."
9. **`sectors`**: `LpSectors`.
10. **`pricing`**, 11. **`faq`**, 12. **`final_cta`** ("Make your card today.")

### C. Outcomes: `/us/landing-pages/outcomes` (`lp_outcomes`), 11 sections

**The argument:** "First-time customers become regulars." Each section is one mechanism from the plan, with its proof.
**What keeps it apart:**
- Every section is framed as something the customer does, or a number the owner sees.
- It has no designer, no scanner, no gallery and no demo (as in v1).
- It is the only page with sourced figures, the head-start toggle, the quiet-hours pair and the regulars segments.

1. **`hero`**
   - **Shows:** the shared v2 hero, without the demo link.
   - **Draft:** "Turn first‑time customers into regulars." (keep U+2011) / v1 sub.
2. **`problem`** (tinted band 1): v1's "6×", quoted exactly, with its source line. Draft: "Regulars are where the money
   is."
3. **`outcome_always`**
   - **Job:** the card is always on them, and every stamp pings them.
   - **Shows:** `WalletPhone` (Aurevo at 4 of 8 in Apple Wallet) with the default stamp banner dropping over the top of
     the screen.
   - **Interaction:** the banner slides in once when the section reveals.
   - **390:** `PhoneCrop`.
   - **Desktop:** split, visual on the right.
   - **Draft:** "Always on them, updated every visit" / "In Apple Wallet or Google Wallet, so it's never lost. Each stamp
     pings their phone."
4. **`outcome_head_start`**
   - **Job:** a head start makes them finish. This is the sourced finding.
   - **Shows:**
     - `Segmented`: "Card starts empty" | "2 stamps on the house";
     - the Aurevo card, at 0 of 8 or 2 of 8;
     - two bars, 19% and 34% "finished the card", with the active one highlighted;
     - the source line (Nunes & Drèze, Journal of Consumer Research, 2006);
     - the line "Welcome stamps are on every plan";
     - an outline CTA.
   - **Interaction:** the toggle drives both the card and the highlighted bar. The bars fill on reveal; with reduced
     motion they are static.
   - **390:** the card (240px), the toggle, the bars and the source, then the CTA.
   - **Desktop:** split.
   - **Draft:** "A head start gets them to finish" / "Give new customers their first stamps on the house. It's on every
     plan."
5. **`outcome_slow_days`** (tinted band 2)
   - **Job:** find a quiet hour, then fill it.
   - **Shows:**
     - `SampleCapture view="phone-busiest"` (Busiest times, with the quietest open hour);
     - an `InkArrow` pointing to `NotificationPhoneDemo`, which shows an Aurevo broadcast;
     - `PlanLine` "[Growth and Pro] … no texting fees". Both the grid and broadcasts are Growth and Pro, so one label
       covers both.
   - **390:** the capture cropped at 360, with the broadcast banner overlapping its faded bottom.
   - **Desktop:** two phones joined by the arrow.
   - **Draft:** "Fill your quiet hours" / "See when it's slow, then send every card a reason to come in."
6. **`outcome_levels`**
   - **Job:** give regulars something to reach.
   - **Shows:**
     - `LevelCards`: the barbershop card as Bronze (its own white look), Silver and Gold, fanned, each with the level name
       as its header label;
     - the default banner "You've reached Silver! Your card has a new look.";
     - 3 facts: up to 5 levels · each level gets its own look and perks · staff see the perks at the till;
     - an "Every plan" chip.
   - **390:** the trio fanned in about 300px, the banner over it, then the facts.
   - **Desktop:** split, visual on the left.
   - **Draft:** "Give your regulars a level to reach" / "Bronze, Silver, Gold: customers move up as they keep coming
     back."
7. **`outcome_regulars`**
   - **Job:** see it working.
   - **Shows:**
     - `SampleCapture` (`en-phone`), showing the return rate, with "Sample data";
     - the segment chips New · Regular · VIP · At risk · Ghost (every plan);
     - v1's "Example" line;
     - an outline CTA.
   - **390 / desktop:** as v1's `RegularsSpotlight`, plus the chips row and the CTA.
   - **Draft:** "Watch first-timers turn into regulars" / "Your return rate, who your regulars are, and who's slipping
     away."
8. **`sectors`**: `LpSectors`.
9. **`pricing`**, 10. **`faq`**, 11. **`final_cta`** ("Make your next customer a regular.")

### D. Platform: `/us/landing-pages/platform` (`lp_platform`), 12 sections and 1 strip

**The argument:** PassEntry's structure, rebuilt for Stampeo. Details are in section 3 below. **What keeps it apart:** a
centred, eyebrow-led layout; the fan hero; product-wide sections (deliver, the platform toggle, sharing) instead of a
single argument; and the page closes on sectors and the blog. The registry order is:

`hero` · `marquee` · `deliver` · `numbers` · `how` · `demo` · `program_types` · `platform` · `share` · `pricing` ·
`final_cta` (the accent band) · `sectors` · `blog`.

---

## 2. Shared across the four pages

- **Shared hero, How-to / Features / Outcomes (the new `LpHero`).**
  - **Change from v1:** the text is now centred at every width, and the page-specific right-hand visual is gone. The
    official badges (`walletBadges("en")`, `h-10`, not links, as on `/us`) and `DashboardDuo` close the hero instead.
  - **Why:**
    - this is the `/us` hero Harry likes;
    - the badge row and the duo are centred objects, so a left-aligned text above them would make two axes;
    - the three heroes now differ only in their words, which keeps the split test clean.
  - The v1 hero visuals are not thrown away. `HowHeroVisual` becomes `WalletPhone` (How-to step 2, Outcomes §3,
    Platform), and the lock screen moves to the stamp, quiet-hours and deliver sections.
  - **390.** Each element ends at:

    | Element | Ends at y (px) |
    |---|---|
    | H1, 3 lines (starts at 96) | 226 |
    | Sub, 2 lines | 291 |
    | CTA, full width, 52px | 371 |
    | Reassurance | 403 |
    | Demo link, 44px (How-to, Features) | 451 |
    | Proof line | 479 |
    | Badges | 535 |
    | Duo (starts at about 560, about 250px tall) | ~810 |
    | Caption | ~840 |

    The CTA stays in the thumb zone. The fold shows the badges and the top of the duo.
  - **1440.** The text is `max-w-3xl`, the CTA row sits around y=380-430, the badges around y=520, and the duo starts
    around y=600 at `max-w-[1120px]`. About 300px of it shows above the fold, as on `/us`.
- **`DashboardDuo`** (new, `components/landing-pages/shared/`). It composes parts rather than reusing
  `VariantDashboardShot`:
  - **Parts:**
    - `landingShot("en","desktop")` in a frame (`next/image`, a ring, `rounded-xl`, the `/us` shadow), topped by a 22px
      browser bar (three grey dots and an "app.stampeo.app" pill). At 358px the capture can't be read; the browser bar is
      what says "on your computer".
    - The phone is `PhoneScreenshot` with `landingShot("en","phone")`, scaled down, overlapping the frame's bottom-right
      edge. This is the same overlap as `/us`, but kept at every width.
  - **390:** the frame is 300px wide (about 208px tall). The phone is 116px wide (about 237px tall), overlapping the
    frame's right 58px. Total about 358x250. The KPIs stay visible on the left.
  - **Desktop:** the `/us` geometry.
  - **Why not reuse `VariantDashboardShot`:**
    - it hides the desktop capture below `md`, which defeats the point on phones;
    - its h2, caption and plan line are `variant.dashboard` copy;
    - the reference says not to import `landing-variant/` (it is the live `/us` and will be rewritten).
  - **Cost:** two compositions of the same captures. They stay in step because both read `landingShot`, so a re-shoot
    updates both.
- **`LpSectors`** (new, shared). It composes `SectorCarousel`, `SECTOR_THEMES` and the `sector-slides` helpers. It does
  not wrap `VariantSectorCards`.
  - **Where the words come from:** the slides use `landing.sectorCards` (`market="us"`, so the money is in $); the
    heading uses the catalog's own title and subtitle, so the words are the exact `/us` ones Harry wants kept.
  - **Why compose:** Platform needs an eyebrow over the same heading, and composing keeps one code path for all four
    pages.
  - **Cost:**
    - it imports two copy-free files from `landing-variant/`; whoever replaces `/us` moves them to
      `components/landing-pages/shared/`;
    - each slide is a `Link` to a blog guide, which is an exit, as on `/us`. I keep that to leave `landing-variant/`
      unedited (see Open questions).
- **Pricing:** `PricingSection market="us"`, unchanged, on all four pages. On Platform it sits before the accent band, as
  Harry asked. It keeps its own heading, with no eyebrow.
- **FAQ:** `LpFaq` (5 questions) on How-to, Features and Outcomes. Platform has none, because PassEntry has none (see
  Open questions).
- **Final CTA:** `LpFinalCta` on the three argument pages. Platform closes with `LpAccentBand`.
- **Live demo:** `LpDemo` on How-to, Features and Platform (on Platform with the centred eyebrow variant). Not on
  Outcomes.

---

## 3. Platform in detail (PassEntry, section by section)

**The header pattern.** Every section uses `LpHeading` with two new optional props, `eyebrow` and `align="center"`:
- the eyebrow is `text-xs`/`sm:text-[13px]`, semibold, uppercase, `tracking-[0.2em]`, in `--accent-hover` (3.4:1 on
  cream; the H2 directly under it restates its meaning; see Open questions);
- then a centred `text-h2` (≤44 characters);
- then a centred `text-lead`, muted, `max-w-2xl`.

Thin `border-[var(--border)]` hairlines, inside the `Container`, separate deliver/numbers and numbers/how, as on
PassEntry.

**The CTA pair (`LpCtaPair`).** It holds:
- the primary `CTAButton` "Start my free trial";
- the secondary `<a href="#demo">` "Try it on your phone ↓", styled as an outline pill of the same 52px height.

On a phone they stack at full width, primary first. On desktop they sit in one centred row, primary on the left: the
site's convention, where PassEntry puts the outline button first. Nothing about scroll tracking changes.

**The site header and footer stay.** PassEntry's floating card header and dark footer panel are not copied. Shared
chrome is a non-goal, and the US header keeps the language switcher hidden, as in v1.

| # | PassEntry | Ours | 390 | Desktop |
|---|---|---|---|---|
| 1 `hero` | Centred H1 → arched fan of 7 passes → CTA pair | Centred `text-hero` "Digital punch cards for Apple & Google Wallet." (46, 3 lines) → `FanParallax`+`HeroCardFan` (7 live sample cards; 3 on a phone) → `LpCtaPair` → reassurance. No sub and no proof line: PassEntry has neither, and §4 carries the proof | H1 96-226, fan ~240-482. **The CTAs start below the hanging outer cards, with no negative margin**, so nothing overlaps them. Primary ends at about y=552, secondary at about 616, reassurance at about 640. All above the fold | H1 ~112-247, fan 432px tall. The CTA row rises into the arch (as `/us`'s `-mt`) at about y=736-788. Above the fold |
| 2 `marquee` (a strip) | Customer logo marquee | A "Built for" label, then a marquee of **business types** with Phosphor icons in muted ink (coffee shops, bakeries, barbershops, nail salons, restaurants, bookstores, food trucks, spas, lash studios, juice bars, car washes, pet groomers). It uses the existing `marquee-scroll` keyframes; edges fade out with a mask; under reduced motion it is a static wrapped row | One row, 56px | The same |
| 3 `deliver` | Two phones, 3 floating glass cards, the wallet badges, a hairline | Eyebrow "In their wallet" / "Straight to Apple Wallet and Google Wallet" / "No app to download. Their card sits next to their payment cards." **Left phone:** `WalletPhone`. **Right phone:** `NotificationPhoneDemo`. **Three `GlassCard`s** (`bg-white/70 backdrop-blur ring-1 ring-black/5 rounded-2xl`): (a) "Analytics", a crop of `en-desktop.png` (KPI row and visits chart) with "Sample data". This is where the badges and the desktop dashboard meet on this page. (b) "Lock-screen notifications", Aurevo's default stamp banner. (c) "Updates on every scan", `ArrowsClockwiseIcon` and "5/8 → 6/8". Official badges sit under the phones | Analytics card at full width on top. One phone (`WalletPhone`, 220px) cut at 400. The Updates card overlaps its right edge and the Notifications card overlaps its bottom. The second phone is hidden below `lg`. Badges. About 1.45 screens | Two 300px phones, the right one offset 40px down. Analytics card overlapping the top-left, Updates card on the right in the middle, Notifications card at the bottom right. The cards float gently (CSS; off with reduced motion) |
| 4 `numbers` | "By the numbers": 3 accent figures → CTA pair → hairline | Eyebrow "By the numbers" / "Where Stampeo stands today" (no sub, as PassEntry). 120+ active businesses / 20,000+ stamps issued / 25+ countries, read from `variant.metrics.items` (one source). Figures in heading-font `text-h1`, `--accent-hover` (3.4:1, passes for large text). `LpCtaPair` (`feature_cta`) | 3 stacked figures (about 110px each), the pair, a hairline. About 0.85 screen | 3 columns, the pair centred |
| 5 `how` | Two phones whose lower half sinks behind a 3-column bordered table (Create / Distribute / Update), then "See the full process →" | Eyebrow "How it works" / "Create it, share it, stamp it" / "Build your card, put it on your counter, and stamp it from any phone." **Phones:** the Aurevo card in Wallet (`WalletPhone`) and `ScanDemo chrome="minimal"`. **Table:** `HowTable`, three cells (h3 at 28px in the heading font, plus one line): **Create** · **Share** (no SMS) · **Stamp** (no geofencing). The cells are `bg-white/80 backdrop-blur`, with the phones blurred behind them. **Link:** "Try the stamp step yourself →" goes to `#demo` (the next section) instead of an exit | Phones side by side at 160px, cut at 260. The table becomes one bordered box with 3 stacked rows and dividers | Phones at 280px; the table overlaps their lower 40% |
| 6 `demo` | (none) | `LpDemo eyebrow="Live demo" align="center"`: "Try it on your own phone" and the v1 lead, `HeroDemo` centred, the outline CTA under it. **This is our addition**: the secondary CTA needs a target, and there is no sales demo | As v1 | Centred, one column |
| 7 `program_types` | Stacked rows (Ticketing / Transit / Loyalty / Membership). The active row follows scroll and expands (eyebrow and description); collapsed rows show the title and the pass. A bordered "SEE MORE PASS TYPES" button closes the list | Eyebrow "Program types" / "Stamps, points or levels" / "Reward visits, reward spending, or let your regulars climb." **`ProgramTypeRows`:** **Stamps** (Aurevo at 5/8; eyebrow "Reward every visit") · **Points** (Marginalia at 240; "Reward what they spend") · **Levels** (the `LevelCards` trio; "Reward your regulars more"). Each row: an `--accent-hover` eyebrow, a `text-h1` title, a 2-line body including "every plan", and the card on the right. **Scroll-driven:** an IntersectionObserver (`rootMargin -45% 0px -45% 0px`) marks the row nearest the centre active, and only that row opens its eyebrow and body (`grid-rows-[0fr→1fr]`, 300ms). A tap also activates a row. SSR renders every row open, so the hydration collapse is out of view; with reduced motion every row stays open. **Closer:** a full-width bordered button, "How to choose between stamps and points" → `/loyalty-programs` | **Every row open, no scroll behaviour** (as PassEntry's phone). Each row: the card on the left at 128px, the eyebrow, title and body on the right. About 1.1 screens | Collapsed rows about 260px, the open row about 360px, the card 200px on the right |
| 8 `platform` | "Build your way": a segmented Dashboard UI \| API toggle, then a big white card (layered captures on the left; H3, paragraph and link on the right) | Eyebrow "The Stampeo platform" / "Run it from your computer or your phone" / "A dashboard for you, and a free Scanner app for your team." `Segmented size="lg"`: **Dashboard \| Scanner app**. **`PlatformToggleCard`** (white, `rounded-[32px]`, ring). **Dashboard tab:** `DashboardDuo` and "Sample data"; H3 "Everything in one place"; design your card, see every customer, send broadcasts (Growth and Pro), check your numbers; link "See the analytics →". **Scanner tab:** `ScanDemo chrome="minimal"`; H3 "Free for your whole team"; iPhone, Android or any browser; staff join with a code; unlimited team on Growth and Pro; link "See the scanner →". Cross-fade between tabs | **Keeps the toggle** (PassEntry's phone stacks both panes, which would double the length). Tabs at full width (44px). The visual on top (the duo at 326px, or the scanner cut at 380), then the text. About 1.35 screens | Card in 2 columns: the visual in 7/12 on the left, the text in 5/12 on the right |
| 9 `share` | "Works with the tools you already use": a tree from their logo to 6 integration logos, with accent-coloured animated lines | Eyebrow "Share it everywhere" / "Put your card where customers already are" / "One QR code and one link: on your counter, and everywhere online." **`ShareTree`:** the Stampeo asterisk (`components/logo.tsx`) at the top, branching to 6 channels: **Counter flyer** · **The Scanner app's QR** · **Instagram** · **Facebook** · **Your website** · **Google Business Profile**. Phosphor icons in **ink, not brand colours** (they are places you paste a link, not integrations). The SVG curves are `--accent` for the first 30% and `--border` after. The lines draw in with `stroke-dashoffset` once the section reveals, and stay still with reduced motion. No link (PassEntry's points at integrations we don't have) | **A vertical tree**: a trunk on the left, 6 branches to rows (icon, label, one short line). A fan of 6 nodes at 60px each would drop the labels. About 0.95 screen | PassEntry's fan, labels under the icons |
| 10 `pricing` | (none) | `PricingSection market="us"` (Harry: before the band) | As shipped | As shipped |
| 11 `final_cta` | Inset full-bleed accent band, H2 and sub, one white button | **`LpAccentBand`:** inset `rounded-[28px]` `bg-[var(--accent)]`. `text-display` "Launch your loyalty card today." (the page's one display line) / "Design it, test it on your own phone, then choose a plan." Text in **`--near-black`** (6.6:1; white would be 2.8:1). `CTAButton variant="inverse"` (new: white pill, near-black text), `trackAs="final_cta"`. Reassurance under it. The band sits inside the `Container` | Centred, the button at full width. About 0.6 screen | Centred, about 360px tall |
| 12 `sectors` | Testimonials (3 photo cards with quotes) | Eyebrow "For every kind of shop" (**never "Testimonials" or "Stories"**: the slides are fictional brands) / the catalog title "Stampeo adapts to your business" and its subtitle / `LpSectors` | As `/us` | As `/us` |
| 13 `blog` | "Blog / Keep up to date", "View all", 3 post cards (image, reading-time chip, title, excerpt, tags) | Eyebrow "Blog" / "Guides for shop owners" / "Practical reads on running a loyalty card that brings people back." "View all" → `/blog`. **`LpBlogPosts`:** `getAllPosts("en").slice(0, 3)` → `BlogCard detail="rich"` (new optional prop: a reading-time chip and a 2-line excerpt; English posts have no images, so these are text cards). The header is left-aligned, as PassEntry's blog block is | 3 stacked cards of about 180px each. About 1.05 screens | 3 columns |

---

## 4. Components

**Reused as they are:**
- **Layout and actions:** `Container`, `ScrollReveal`, `CTAButton`, `FAQList`, `PricingSection`.
- **Devices and captures:** `IPhone`, `PhoneScreenshot`, `landingShot`.
- **Cards:** `ScaledCardWrapper`, `STAMP_SAMPLES`/`POINTS_SAMPLES`.
- **Feature-page demos:** `HeroDemo` (via `LpDemo`), `LiveActivityFeed`, `NotificationBanner`, `NotificationPhoneDemo`
  and `CardStyleGallery` (with the v1 props).
- **From `landing-variant/` (no copy in them, not edited):** `HeroCardFan`, `FanParallax`, `SectorCarousel` and
  `SECTOR_THEMES`, with the `sector-slides` helpers from `lib/landing/`.
- **Small parts:** `NumberStamp`, `QRCodeSkeleton animated={false}`, `walletBadges`, `InkArrow`, `getAllPosts`.
- **CSS classes and keyframes:** `marquee-scroll`, `perforation`, `stamp-pattern`.
- **Tracking and pricing:** `LandingTracker`, `RegionPricingProvider`, `RegionText`.
- **All of v1's `landing-pages/shared/*`.**

**Extended with an optional prop (defaults render today's markup; tests pin the defaults; `/features/*` checked
visually):**

| Component | New prop | Why |
|---|---|---|
| `components/card/WalletCard.tsx` | `headerLabel?: string` | A level card shows the level name over the count, as the real pass does |
| `components/ui/CTAButton.tsx` | `variant: "inverse"` (a new union member) | A white pill with near-black text for the accent band |
| `components/ui/Segmented.tsx` | `size?: "md" \| "lg"` | `lg` makes the tabs 44px tall. Today they are 32px |
| `features/notifications-push/NotificationSequenceDemo.tsx` | `moments?: {key, title, description, planLabel?, stamps, banner}[]`, `design?: Partial<CardDesign>` | The defaults say "Stampeo" and use Growth-and-Pro wording |
| `features/scanner-mobile/ScanDemo.tsx` | `chrome?: "full" \| "minimal"` | "REC" suggests recording staff, and "0.8s" is an unsourced timing |
| `features/design-de-carte/CardDesignPlayground.tsx` | `compact?: boolean` | Hides first name, rewards, "Surprise me" and the own-icons mode, so the card stays in view on a phone |
| `components/blog/BlogCard.tsx` | `detail?: "default" \| "rich"` | Adds the reading-time chip and an excerpt |
| `landing-pages/shared/LpSection.tsx` (`LpHeading`), `LpDemo.tsx` | `eyebrow?`, `align?: "left" \| "center"` | Private files; this is the cheap kind of extension |
| `landing-pages/shared/SampleCapture.tsx` | `view?: ShotView` | `phone-habits`, `phone-busiest` |
| `components/icons/index.tsx` | New aliases: Instagram, Facebook, Printer, Storefront, GoogleLogo, ArrowsClockwise, and business-type icons | Additive re-exports |

`LpHero` and v1's `HowHeroVisual`/`HowSteps` change shape, but they are this feature's own components. `HowHeroVisual`
moves to `shared/WalletPhone`, and `PlacardVisual` is exported.

**New.** All are private to this feature, because the four pages are one feature. Promote one to `components/ui/` only
when a second feature needs it.
- `shared/`: `DashboardDuo`, `LpSectors`, `LpCtaPair`, `LevelCards`, `GlassCard`.
  - `LevelCards` draws the barbershop sample with the Bronze (its own look), Silver and Gold palettes and
    `headerLabel`. The palettes are mirrored into `lib/levels/looks.ts`, with a comment pointing at
    `backend/app/services/programs/levels/skins.py`.
  - The program-types words live in one `lib/landing-pages/copy/program-types.ts`, shared by the Features tabs and the
    Platform rows.
- `how-it-works/`: `StepsOverview`, `StepHeading` (number stamp and h2), `ShareStepVisual`, `StampStepVisual`,
  `FirstDayTimeline`.
- `features/`: `ProgramTypeTabs`, `MomentsSpotlight`, `ScannerSpotlight`, a reworked `AnalyticsSpotlight`,
  `MoreFeaturesGrid`.
- `outcomes/`: `AlwaysThereVisual`, `HeadStartToggle`, `QuietHoursVisual`, `LevelsSpotlight`, an extended
  `RegularsSpotlight`.
- `platform/`: `TypeMarquee`, `DeliverComposition`, `NumbersBlock`, `HowTable`, `ProgramTypeRows` (client, IO),
  `PlatformToggleCard` (client), `ShareTree`, `LpAccentBand`, `LpBlogPosts`.
- **Routes and registry:**
  - A new route, `app/[locale]/us/landing-pages/platform/page.tsx`.
  - `LANDING_SLUGS` gains `platform`, and the `LandingSectionId` union grows.
  - The registry tests' "never more than 8" becomes ≤13 ids.
  - AC16 changes from "no edits under `landing-variant/`" to "no edits and no rendered change". It still holds: nothing
    there is edited.

**Why the ladder runs out:**
- nothing on the site lays out the eyebrow pattern, the glass cards, a scroll-driven row list, a tree or a duo that is
  visible on a phone;
- the `/us` and feature-page versions of the sections carry their own catalog copy.

---

## 5. Phone length (390x844 screens, to the end of the last section; the footer adds 1.6)

| | How-to | Features | Outcomes | Platform |
|---|---|---|---|---|
| Hero | 1.1 | 1.1 | 1.1 | 0.85, plus 0.1 for the marquee strip |
| Middle | steps 0.5, create 1.2, share 1.1, stamp 1.15, demo 1.2, feed 0.7, sectors 1.2, first day 0.8 | demo 1.2, design 1.35, types 1.3, messages 1.3, scanner 1.0, analytics 1.1, more 0.9, sectors 1.2 | problem 0.55, always 1.0, head start 1.15, slow days 1.1, levels 1.0, regulars 1.15, sectors 1.2 | deliver 1.45, numbers 0.85, how 1.3, demo 1.25, types 1.1, platform 1.35, share 0.95 |
| Pricing | 3.06 | 3.06 | 3.06 | 3.06 |
| Close | FAQ 1.0, final 0.4 | FAQ 1.0, final 0.4 | FAQ 1.0, final 0.45 | band 0.6, sectors 1.2, blog 1.05 |
| **Total** | **~13.4** | **~15.0** | **~12.8** | **~15.1** |

**Where "Start my free trial" appears**, in screens from the top:
- **How-to:** 0.4 (hero) · 2.9 (create) · 5.9 (demo) · 9-11.5 (pricing) · 13.3 (final).
- **Features:** 0.4 · 2.0 (demo) · 4.9 (types) · 9.2 (more) · 10.5-13.5 (pricing) · 14.9.
- **Outcomes:** 0.4 · 3.7 (head start) · 7.0 (regulars) · 8.3-11.3 (pricing) · 12.7.
- **Platform:** 0.7 (hero pair) · 3.2 (numbers pair) · 5.8 (demo) · 9.2-12.3 (pricing) · 12.6 (band).
  - Then sectors and the blog run 2.25 screens with no CTA, as on PassEntry, and the band is the last ask.

The longest stretch without a CTA is 4.3 screens (Features, types to more).

**Structural mobile items I own:**
- **Sheets vs dialogs:** there are none. The demo stays inline, not in a sheet.
- **Tap targets of 44px or more** on everything new: tabs `size="lg"`, the demo anchors `h-11`/52px, the moment buttons,
  the step anchors, the timeline. Reused and left alone: the sector dots and the pricing interval tabs.
- **Nothing hover-only:** program rows activate on scroll or tap, the fan and floating cards are decoration, and the
  gallery and carousel swipe.
- **Wide content reflows:**

  | Desktop | 390 |
  |---|---|
  | Tree | vertical tree |
  | How table | stacked rows |
  | Two-phone pairs | one phone and a banner |
  | Feature grid | list |
  | Program rows | thumbnail on the left |
  | Toggle card | stacked |

- **No overlap on the fan:** on a phone, the fan's hanging outer cards never sit over the CTAs.

---

## 6. Claims check (every new claim, against STAMPEO.md §2-§9 and the code)

| Claim | Live? | Plan / note |
|---|---|---|
| Card in Apple Wallet and Google Wallet, no customer app | Yes | Every plan |
| Web dashboard on a computer, and on a phone | Yes | Every plan. Captures say "Sample data" |
| Card updates "in seconds" after a scan | Yes (§5 "within seconds") | Never a number of seconds; drop `ScanDemo`'s "0.8s" |
| Free Scanner app for iPhone and Android, or any browser | Yes (§5) | Never "offline", never "works anywhere" |
| Staff join with a team code and see only the scanner | Yes (§5) | Starter has 2 people; unlimited on Growth and Pro |
| The Scanner app shows the shop's QR | Yes (§2) | |
| Printable counter flyer from the dashboard | Yes (§4, §7) | Every plan |
| Share the link on Instagram, Facebook, website, Google Business Profile | Yes (§4) | They are channels, **not integrations**; no POS |
| Free design help for the first card | Yes (§6) | Optional, every plan. "You design it" stays the default |
| You test your own card and stamp before choosing a plan | Yes (§9) | |
| "Live the same day" | Yes (§9) | No minutes, anywhere |
| Stamps, points, switching later and keeping the card | Yes (§6) | Every plan |
| Points never expire, reward menu, 4 balance styles | Yes (§6) | Every plan |
| **Levels**, up to 5, a look per level, perks shown to staff, the default banner | Yes (§6, backend) | **Every plan, but only where `settings.levels_enabled` is on, and it is off for every new business** (see Open questions 1). Levels can't be set up during onboarding; never imply it. Our level visual uses preset icons (custom-icon cards keep one look) |
| Welcome stamps / head start | Yes | Every plan, with Nunes & Drèze 34% vs 19% quoted exactly with its source |
| Gift a reward by hand, customer languages, customer export | Yes | Every plan (export: owner only) |
| Earning limits, reward expiry | Yes | **Growth and Pro** |
| Several locations | Yes | **Pro** |
| Busiest-times grid | Yes | **Growth and Pro** (Starter gets one line) |
| Broadcasts, "no texting fees" | Yes | **Growth and Pro**, on the same line |
| Segments New / Regular / VIP / At risk / Ghost, return rate, live feed | Yes (§6) | Every plan |
| 6× (Square), 120+ / 20,000+ / 25+ (`variant.metrics`) | Approved | As v1. Square's figure is never presented as a Stampeo result |
| Fan cards, marquee types, sector brands | Fictional or generic | Never labelled customers, testimonials or stories |
| Notification banners | | Sender is the sample business with its own icon, never "Stampeo"; default wording, except broadcasts (owner's text) |

---

## 7. Open questions for Harry (each has a default; none blocks the design)

1. **"Switch levels on for every business" has to include new sign-ups.** The switch is platform-owned and absent means
   off, so a US owner who signs up from these pages finds no levels today. That needs a backend default (absent = on) or
   an onboarding hook. *Default:* the pages ship with levels; ads wait until the default is on.
2. **No FAQ on Platform** (PassEntry has none). *Default:* none. If you want objections answered there, `LpFaq` goes
   between pricing and the band (+1.0 screen).
3. **No Android phone on Platform.** The site has no Android frame and no Google Wallet card render. *Default:* two
   iPhones (Wallet and lock screen), with the official Google Wallet badge carrying the claim. Porting web's Google
   preview is new work.
4. **Accent band text.** *Default:* near-black on orange (6.6:1) with a white button. PassEntry's white text would be
   2.8:1.
5. **Eyebrow colour.** *Default:* `--accent-hover` (3.4:1), since the H2 restates it. The alternative is a new darker
   terracotta token that reaches 4.5:1, which is a design-system change.
6. **New dashboard captures.** Customers list, card editor and broadcast composer would deepen Features and the Platform
   toggle; the work goes through promo-videos `landing-shots`. Re-shooting the US time zone ("Paris") matters more now
   that the desktop capture is in every hero. *Default:* today's Analytics captures plus live components.
7. **Exits.** These links leave the page:
   - Platform's "See the analytics →" and "See the scanner →";
   - "How to choose…";
   - the blog cards;
   - the sector slides.

   PassEntry has the equivalents. *Default:* keep them all, with no edits to `landing-variant/`. Strike any you don't
   want.
8. **Blog cards.** The latest 3 are all about points. *Default:* the latest 3; the other option is 3 picked by hand.

## Rejected (considered for v2, and why not)

- **`ROICalculator`:** its "about 6% more visits" is attributed to vague "industry studies", and "Pays for itself ×12" is
  a promise.
- **`ChannelComparisonBars`:** unsourced 85%.
- **`AnalyticsChartCards`:** 1348px at 390. The feed plus one capture tell the same story.
- **`BlindSpotCards`:** six question-mark tiles that say nothing on a phone.
- **`AnnotatedWalletCard` on Features:** the gallery and the How-to designer already cover it; at 390 it becomes a
  legend of 6 chips.
- **`EnginePicker` quiz:** a three-question detour on a page whose action is the trial. The tabs answer faster.
- **App Store / Google Play badges (`StoreBadges`, `GetTheAppBand`):** a prospect can't create a business in the app, so
  the badges lead to a dead end.
- **`VariantDashboardShot` as it is:** it has no desktop below `md`. `VariantSectorCards` as it is: no eyebrow slot.
- **A level-up moment inside the Features moments demo:** Aurevo's card can't change look, so "Your card has a new look"
  would be false over it.
- **Wallet badges as links to `#demo`:** Outcomes has no demo, so the same badge would behave differently between pages.
- **A demo on Outcomes,** a sticky CTA bar, sticky-scroll steps on How-to, video: the v1 reasons still hold.
- **PassEntry items we have no honest version of:** testimonials, customer logos, integrations, "Book a demo", the API
  tab, a "leading platform" H1.
- **A proof line and sub in the Platform hero:** the numbers come at §4, and PassEntry's hero has neither.
- **Both panes stacked on a phone in the Platform toggle:** it would add about 1.3 screens. We keep the toggle at 44px.
