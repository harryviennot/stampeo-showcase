# UX Brief: STA-552
MODE: DESIGN   DOMAIN: showcase
VERDICT: READY

Five Platform-style previews of today's feature pages, for Harry to compare side by side. The design does not
depend on any open question: every question below has a default the build can use.

Pixels read before writing this: `docs/features/STA-552/shots/today/` (git-excluded), 390x844 and 1440x900, every
screen of the five feature pages and of Platform, with contact sheets `sheet-<page>-<viewport>-<n>.png`.

## Already shipped

**None of the five previews exists yet. Almost every building block does.** The job is composition plus three
generalisations of Platform pieces, not new design.

- **Nothing** is under `app/[locale]/us/landing-pages/platform/` except Platform's own `page.tsx`.
- **The Platform kit** in `components/landing-pages/platform/` already does most of the work:
  - `GlassCard`, `Hairline`, `LpCtaPair`, `LpAccentBand` (the cream card), `NumberFigures`, which is already
    exported from `NumbersBlock.tsx` and draws the handwritten figures;
  - `LockScreenNotification` and `LockScreenSlice`;
  - `classes.ts` (`ARROW_LINK`, `CELL_TITLE`), `ScrollFill`;
  - `DeliverAnalytics` (drawn dashboard minis; its `Kpi` is private);
  - `HowTable`, `ProgramTypeRows` and `PlatformToggleCard`. These three are hard-wired to `PLATFORM` copy, so they
    have to be generalised before another page can use them.
- **The Scanner loop is in `components/landing-pages/shared/ScannerLoop.tsx`**, with its data in `scanner-loop.ts`.
  It is not in `components/ui/`. It exports `ScannerLoop` (width/narrowWidth) and `ScannerLoopPhone` (`still`).
- **The Features ad landing already makes four of these five points in Platform-adjacent form**, in
  `components/landing-pages/features/`:
  - `DesignSpotlight` (CardStyleGallery with a heading override);
  - `MessagesSpotlight`, whose `messageMoments()` puts Aurevo's banners on `NotificationSequenceDemo`;
  - `ScannerSpotlight` (ScannerLoop + FactList);
  - `AnalyticsSpotlight` (phone capture + LiveActivityFeed).

  Reuse their wiring and don't rebuild it.
- **The STA-546 extensions are live and reusable:**
  - `NotificationSequenceDemo` (`moments`, `design`, `fullCard`, `phoneClassName`);
  - `NotificationPhoneDemo` (`notifications`, `animate`, `eager`, `width`);
  - `CardStyleGallery` (`showCta`, `heading`, `sectionClassName`);
  - `HeroCardFan` (`slots`), `LiveActivityFeed` (`cardOnly`, `stillWhenReduced`);
  - `CompactPlayground`, already tuned for phones: 44px swatches, and the card stays in view.
- **The wallet phones exist:** `shared/WalletPhone` (Apple Wallet, Aurevo) and `shared/GoogleWalletPhone`
  (`ui/AndroidPhone` + `card/GoogleWalletCard`).
- **The guardrails exist:**
  - copy-claim tests: `lib/landing-pages/copy.test.ts`, `plan-claims.test.ts`, and `lib/testing/landing-copy.ts`
    MODULES/PAGES;
  - registry tests: `registry.test.ts`, `lib/testing/landing-pages-source.ts`;
  - default-render snapshots: `default-renders.test.tsx` + `__snapshots__`.

  The previews plug into these. They need no new test framework.

## Placement

**Routes.** Five nested routes beside Platform's:
- `app/[locale]/us/landing-pages/platform/card-design/page.tsx`
- `…/platform/mobile-scanner/page.tsx`
- `…/platform/push-notifications/page.tsx`
- `…/platform/analytics/page.tsx`
- `…/platform/promotional-campaigns/page.tsx`

Why this nesting works:
- **Next 16 nests these cleanly.** A folder is a URL segment, and a segment is public once it has a `page.tsx`
  (`node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md` "Nested routes"/"Colocation",
  `03-layouts-and-pages.md` "Creating a nested route"). Only layouts wrap children, so `platform/page.tsx` and
  `platform/card-design/page.tsx` render independently.
- **Do NOT add a `layout.tsx` in `platform/`.** It would wrap the Platform page too.
- **Each page copies Platform's head:**
  - `generateStaticParams() → [{ locale: "en" }]`;
  - `setRequestLocale("en")`;
  - `generateMetadata() → landingPageMetadata("platform/<slug>")`;
  - `<LandingPageShell slug="platform/<slug>">`.
- **`proxy.ts` already covers these paths.** `isPilotPath` rewrites anything under `/us/` to `/en/us/…` and sets
  the US market cookie, so the new pages get English, dollars and the 14-day trial with no routing change.
- **The language switcher is already hidden.** The regex in `lib/routing/language-switcher.ts` hides it on every
  `/us/landing-pages/.+`.

**Why under `/us/landing-pages/platform/` and not `/features/*`.**
- They are comparison previews of `/en/features/*`: noindex, English-only, and in Platform's family.
- Replacing the live pages means four locales of catalog copy. That is a separate decision (open question 7).

**Registry (`lib/landing-pages/pages.ts`).**
- Add five slugs with a slash: `"platform/card-design"`, `"platform/mobile-scanner"`,
  `"platform/push-notifications"`, `"platform/analytics"`, `"platform/promotional-campaigns"`.
  `pageFile(slug)` joins the path, so the registry tests resolve them unchanged.
- Variants:
  - `lp_platform_card_design`
  - `lp_platform_mobile_scanner`
  - `lp_platform_push_notifications`
  - `lp_platform_analytics`
  - `lp_platform_promotional_campaigns`

  All are under `MAX_FIELD` 128. They reach PostHog, GA4 and `businesses.landing_variant` with no new code if an
  ad ever points there.
- New `LandingSectionId`s: `icons`, `playground`, `anatomy`, `stamps`, `wallets`, `counter`, `ways`, `team`,
  `moments`, `wording`, `glance`, `questions`, `activity`, `ideas`, `delivery`, `plans`, `related`.
- Every section gets `data-landing-section` through `LpSection`, as today.

**Kept out of the index and the site.**
- **Noindex** comes from `landingPageMetadata` (`NOINDEX`).
- **Sitemap and llms.txt** are built from explicit lists, so the new paths stay out. The registry test's
  `not.toContain("landing-pages")` already guards both.
- **No nav, footer or Platform link points at them.** They are reachable by URL only; see entry points.

**Folders (keep each under ~30 files).**
- **Today's counts:** `components/landing-pages/shared/` has 29 files, so add nothing there; extend in place only.
  `platform/` has 19.
- **The three generic extractions go in `platform/`** (Platform is their first caller): `StepsTable`, `HoverRows`,
  `ToggleCard`. That makes 22.
- **Preview-only code goes in a new `components/landing-pages/feature-previews/`:**
  - `PreviewHero.tsx` and `RelatedPreviews.tsx`;
  - one subfolder per page: `card-design/`, `mobile-scanner/`, `push-notifications/`, `analytics/`,
    `promotional-campaigns/`.
- **Copy** goes in `lib/landing-pages/copy/previews/`: `shared.ts` (related cards) plus one file per page.
  English TS, like Platform. Register it in `lib/testing/landing-copy.ts` (MODULES and PAGES) so every claim guard
  and budget applies.

**Data each page shows, and where it comes from** (nothing new is fetched):
- **Plan claims** read `lib/plans/plan-facts.ts` (`PLAN_FACTS`). Tie every chip in `plan-claims.test.ts` CHIPPED.
- **Banners** use `backend/app/services/programs/notification_defaults.py` English defaults.
  - "Stamp collected! You have 5 of 8 stamps." and "You unlocked your reward! Come claim it." are already in
    `copy/shared.ts`.
  - "Reward redeemed. Enjoy!" is the default to add.
- **Scanner minis** take their labels verbatim from `scanner-app/src/locales/en/{stamp,points}.json`: "Add 3 stamps",
  "+3 stamps", "Stamp Added!", "Rewards to redeem", "Daily limit reached", "Add anyway".
- **Analytics minis** use the Aurevo fixture figures the captures already show:
  - 2,770 visits ▲17%, return rate 61% ▲2 pts;
  - visit habits: 191 / 125 / 106 / 33 / 205 (sample rows);
  - busiest Thursday 8–9 AM, quietest Saturday 7–8 AM;
  - 877 cards / 22 rewards ready.

  Note: the captures say "Paris (GMT+1)": `en-desktop.png` in its date bar and its Busiest times card, and
  `en-phone-busiest.png` too (STA-548). The rows draw their charts instead of cropping captures. The hero's
  `DashboardDuo` still shows the desktop capture, as Platform does (open question 8).
- **"98 stamp icons"** matches web's `STAMP_ICONS` (98, checked) and showcase's `stampIcons` (the same ids).
- **The broadcast figures 88% / 95%** are a Stampeo snapshot ("86 businesses, Feb–Oct 2026", today's approved
  catalog). They are static and go stale (open question 3).

## Entry points

- **Direct URL only**, on the dev host and on prod. These are previews Harry opens next to `/en/features/<slug>`.
- **Between previews:** each closes with a `related` row linking to three sibling previews, so the set can be
  walked without typing URLs.
- **Not linked from Platform.** `PlatformToggleCard`'s "See the analytics" and "See the scanner" keep pointing at
  the live `/features/*` pages (Platform stays byte-identical).
- **Ad final URLs later**, if Harry wants. The variants are already tracked.

## The five pages

The shared frame of all five, top to bottom:
- **`LandingPageShell`:** US header and footer, the tracker, the cream paper.
- **Hero:** eyebrow, centred H1 with accent words, one-line sub, CTA pair, reassurance.
- **Sections:** each one is an eyebrow, a centred `text-h2` and a lead (`LpSection` with `align="center"`).
  Hairlines go around the numbers block, as on Platform.
- **Close:** the cream card (`LpAccentBand` with page copy), then `related`.

There is no pricing block, sectors carousel or blog on any preview (see Rejected). Plan chips appear only on gated
features, never "Every plan" (Platform v2.1). There is no "Sample data" anywhere.

### A. Card design: `/us/landing-pages/platform/card-design` (`lp_platform_card_design`), 10 sections

**Job:** prove the card can look like *your* shop, and let the owner try the designer before signing up.

**What Harry will notice against `/en/features/card-design`:**
- The hero is Platform's: a centred headline over a fan of seven very different cards, replacing today's
  left-aligned text and card stack.
- The designer moves from 8th place to 3rd, and the hero's second button jumps to it.
- The anatomy keeps its handwritten labels under a Platform heading.
- "Both wallets" becomes two phones sinking behind a three-cell table.
- Stamp options become hover rows, and handwritten 98 / 5 / 4 figures appear.
- Gone: the Canva "problem" paragraph, the 15-card carousel, the "A card that knows your customers" section, the
  dark CTA and its "ready in 5 minutes".

**Sections:**

1. **`hero`.** Job: the promise, and both next steps.
   - Pattern: Platform fan hero (H1, then the fan, then the CTA pair), plus an eyebrow and a sub.
   - Reuse: `PlatformHero` extended (see New components) with `HeroCardFan slots={CARD_DESIGN_FAN_SLOTS}`.
   - Proposed deck, light and dark alternating, never the barber: `restaurant`, `oba`, `salon`, **`lustre`**
     (apex), `pulp`, `marginalia`, `gelo`. That mixes every strip style: photo strip, ring, big number and custom
     icons.
   - `LpCtaPair secondary={{ label: "Try the designer", href: "#playground" }}`.
   - 390: eyebrow at about y=100, a 3-line H1, a 2-line sub, the fan's 3 cards, full-width stacked CTAs, and the
     reassurance at about y=720, above the fold.
   - Desktop: exactly Platform's hero.
   - Copy:
     - eyebrow "Card design"
     - H1 "A loyalty card that looks like your shop." (accent "your shop.")
     - sub "Your logo, your colors and your own stamps, in Apple Wallet and Google Wallet."
2. **`icons`.** Job: breadth at a glance ("is there one for my trade?").
   - Pattern: Platform's "Built for" strip, as two counter-scrolling rows of icon tiles.
   - Reuse: `IconLibrarySection`'s `MarqueeRow`, exported as `IconMarquee`. Fades are drawn in `--cream` here,
     not `--blog-bg`.
   - 390: label, then two rows of 48px tiles, edge to edge. Desktop: the same, 56px tiles.
   - Copy: label "An icon for every trade" (Platform's `EYEBROW` class, centred, no h2).
3. **`playground`** (`anchor`, so `id="playground"`). Job: try it.
   - Reuse: `CompactPlayground` under the section heading, then `LpTrialButton`.
   - 390: card at 240px, then the full-width control panel (program segmented, 44px swatches and icons, stamp
     slider), then a full-width outline trial button. Desktop: card left, panel right, button under the heading
     column.
   - Copy:
     - eyebrow "Try the designer"
     - h2 "Design it your way."
     - lead "Stamps or points, colors and icons: change them and watch the card update."
4. **`anatomy`.** Job: show what the owner controls.
   - Reuse: `AnnotatedWalletCard`, extended with optional `heading` and `sectionClassName` like
     `CardStyleGallery`. It keeps its handwritten labels and its own Stamps/Points segmented control.
   - 390: its existing numbered-dot card plus the 2-column label chips. Desktop: card with ink labels left and
     right.
   - Copy:
     - eyebrow "Every detail"
     - h2 "Every part of the card is yours."
     - lead "Logo, stamps, fields and reward, laid out to read at a glance in any wallet."
5. **`numbers`** (Hairlines above and below). Job: concrete breadth, then a CTA.
   - Reuse: `NumberFigures`, then `LpCtaPair` (secondary to `#playground`).
   - Figures: **98** "stamp icons" · **5** "color palettes from your logo" · **4** "languages, set by their phone".
   - 390: three stacked figures, then stacked CTAs. Desktop: a row of three.
   - Copy: eyebrow "In the designer", h2 "Everything you need to make it yours." (no lead).
6. **`stamps`.** Job: the three ways stamps can look.
   - Pattern: hover rows. Reuse: `HoverRows`, with card thumbnails in `ScaledBox` + `PassFrame` + `WalletCard`.
   - Rows (eyebrow / title / body / card):
     - "Ready in a click" / **Icon library** / "Ready-made stamp icons for every trade, searchable by name in the
       designer." Card: `patoune` (preset paw).
     - "Your croissant, your logo" / **Your own icons** / "Upload any image. We remove the background and it becomes
       a stamp." Card: `oba`.
     - "Down to the last stamp" / **Your layout** / "In a row, staggered or overlapping, with a special stamp for
       the reward." Card: `gelo`.
   - 390: all rows open, a 128px card beside the words. Desktop: rows open on hover, focus or tap.
   - Copy:
     - eyebrow "Stamp styles"
     - h2 "Stamps that look like what you sell."
     - lead "Pick from the library, upload your own, and lay them out your way."
7. **`wallets`.** Job: "does it work on Android, and if I change it later?"
   - Pattern: Platform's How table. Reuse: `StepsTable` with `WalletPhone` + `GoogleWalletPhone` (280 / 160).
   - Cells:
     - **One QR code**: "Customers scan it and get the right card for their phone."
     - **Live preview**: "The designer shows both wallets while you work."
     - **Always up to date**: "Change your style and every card already in a wallet updates."
   - 390: two phones cut at about 286px, then a 3-row table. Desktop: phones sinking behind a 3-column table.
   - Copy:
     - eyebrow "Both wallets"
     - h2 "One card, ready for every phone."
     - lead "The same card in Apple Wallet and Google Wallet, from one QR code."
8. **`faq`.** Job: the five questions today's page answers.
   - Reuse: `LpFaq` with a new optional `faq` prop.
   - Items: the catalog's five (own icons; no logo; iPhone and Android; change it later; "Can you create the card
     for me?" with its 48-hour answer). Narrow column, collapsed.
   - Copy: h2 "Card styles, answered".
9. **`final_cta`.** Reuse: `LpAccentBand` with a new `copy` prop.
   - Copy: title "Make a card that looks like you." (accent "looks like you."), sub "Design it yourself, or send
     us your logo and we'll make it for you, free."
10. **`related`.** Reuse: `RelatedPreviews`, linking Scanner app, Notifications and Analytics.

About 11.5 phone screens to the footer; today is 13.4. Trial CTAs fall at screens about 0.8, 3, 5.5 and 10.

### B. Mobile scanner: `/us/landing-pages/platform/mobile-scanner` (`lp_platform_mobile_scanner`), 8 sections

**Job:** show that staff stamp a card in one scan from phones you already own: free app or any browser, nothing
to buy, nothing to learn.

**What Harry will notice against `/en/features/mobile-scanner`:**
- At 390 the H1 is now the first thing on screen. Today the phone comes first and the H1 starts at about y=800.
- The real Scanner video replaces the old mock with "REC".
- The store badges no longer lead the hero.
- A scan is explained in a Platform table, and the counter's four actions are hover rows with drawn app minis.
- Team access is a toggle card.
- Today's security grid is gone ("anti-fraud alerts", "end-to-end encryption", "0.8s" are not claims STAMPEO.md
  supports), and so is the dark "Get the app" band.

**Sections:**

1. **`hero`.** Pattern: `PreviewHero` (text, CTA pair, then the visual below).
   - Visual: `ScannerLoop` (280 desktop / 250 phone), cut with `PhoneCrop height={440}` on a phone.
   - Secondary: the default "Try it on your phone" (`#demo`).
   - 390: eyebrow, 2-line H1, 3-line sub, stacked CTAs, reassurance at about y=480, the phone from y≈520 with the
     loop playing. Desktop: the whole phone centred under the CTAs.
   - Copy:
     - eyebrow "Scanner app"
     - H1 "One scan, one stamp, from any phone." (accent "from any phone.")
     - sub "A free app for iPhone and Android, or any phone's browser. No new hardware."
2. **`how`.** Pattern: `StepsTable`.
   - Phones: `WalletPhone` (the customer's card, 5/8) + `ScannerLoop still` (the success frame; the hero already
     plays the video).
   - Cells:
     - **Scan**: "Point the Scanner at the QR code on their card, in either wallet."
     - **Check**: "Their name, stamps and any rewards waiting show up first."
     - **Confirm**: "Tap once. Their card updates in seconds and lands on their lock screen."
   - Arrow link "Try the stamp step yourself" → `#demo`. 390 and desktop as Platform's How table.
   - Copy:
     - eyebrow "How it works"
     - h2 "Scan, check, confirm."
     - lead "Point the camera at their card. Their progress shows before anything counts."
3. **`counter`.** Pattern: `HoverRows`. Visual per row: a drawn app mini (new, page-specific) using the app's own
   English labels.
   - Rows:
     - "Several at once" / **Stamps** / "Add one, or use the stepper to add several in a single scan." Mini:
       stepper "− 3 +" and "Add 3 stamps".
     - "Type what they spent" / **Points** / "Enter the amount and see the points, bonus included, before you
       confirm." Mini: keypad total and the points preview.
     - "Now or next time" / **Rewards** / "Redeem a reward on the spot, or save it for their next visit." Mini:
       the "Rewards to redeem" list.
     - "Perks at the register" / **Levels** / "Their level and its perks show on screen, and it tells you when they
       move up." Visual: `LevelCards` at row size.
   - 390: all open, mini at 128px. Desktop: hover rows.
   - Copy:
     - eyebrow "At the counter"
     - h2 "One screen for every kind of visit."
     - lead "Several stamps, a spend amount or a reward: the same scan handles it."
4. **`ways`.** Pattern: `StepsTable` with no visual: two bordered cells with icon tiles, then `LpCtaPair`.
   - Cells:
     - **Scanner app**: "On the App Store and Google Play. Sign in with Google or Apple in one tap."
     - **Web scanner**: "Open scan.stampeo.app in any phone or tablet browser. Nothing to install."
   - 390: two stacked cells, then stacked CTAs. Desktop: two columns.
   - Copy:
     - eyebrow "Two ways to scan"
     - h2 "An app, or just a browser."
     - lead "Both are free on every plan. Use whatever phone or tablet is at the counter."
5. **`team`.** Pattern: `ToggleCard` with tabs "Staff" and "Owners and admins". Visuals are drawn minis.
   - **Staff** pane. Mini: "Join my team" with 6 code boxes. Title "A code, then the scanner". Facts:
     - "A 6-character code from your Team page"
     - "No dashboard, customer list or settings"
     - "Told up front that their scans carry their name"
   - **Owners and admins** pane. Mini: "Daily limit reached · Add anyway". Title "Scan, and step in when needed".
     Facts:
     - "The same scanner, on your own phone"
     - "Let a scan past a daily limit, under your name" (chip Growth and Pro)
     - "Unlimited team members" (chip Growth and Pro)
   - Staff-data guardrails hold: no rankings, pace or idle time; only "who made each scan".
   - Copy:
     - eyebrow "Your team"
     - h2 "Free for your whole team."
     - lead "Staff join with a code and only ever see the scanner."
6. **`demo`.** Reuse: `LpDemo eyebrow="Live demo" align="center"`, as on Platform.
7. **`final_cta`.** Copy: title "Stamp your first card today." (accent "today."), sub "Set up your card, then scan
   your first customer from any phone."
8. **`related`.** Card design, Notifications, Analytics.

About 9.5 phone screens; today is 9.9.

### C. Push notifications: `/us/landing-pages/platform/push-notifications` (`lp_platform_push_notifications`), 8 sections

**Job:** show that every stamp and reward lands on the customer's lock screen on its own, on iPhone and Android,
with no app, no phone number and no email.

**What Harry will notice against `/en/features/push-notifications`:**
- The hero phone shows Aurevo's banners from the first paint. Today it is empty for 2 seconds and the sender is
  "Stampeo".
- The unsourced 20/30/45/85% channel bars are gone, and so are the APNs jargon steps.
- "Three moments" is rebuilt on Aurevo with the real default wording.
- A new both-wallets composition with glass cards.
- "Go further" becomes a "ready-made or your own words" toggle that states plans plainly.
- The live demo lets him get a real notification.
- The GDPR box and the dark CTA are gone.

**Sections:**

1. **`hero`.** Pattern: `PreviewHero`.
   - Visual: `NotificationPhoneDemo animate={false} eager notifications={[lpBanner(STAMP_BANNER), lpBanner(REWARD_BANNER)]}`,
     cut at 440 on a phone. Secondary "Try it on your phone" (`#demo`).
   - Copy:
     - eyebrow "Notifications"
     - H1 "Every stamp lands on their lock screen." (accent "their lock screen.")
     - sub "Automatic notifications in Apple Wallet and Google Wallet. No app, no phone number."
2. **`how`.** Job: kill the idea that the owner has to send these.
   - Pattern: `StepsTable` with `ScannerLoop still` + a lock-screen phone (`NotificationPhoneDemo`, one banner).
   - Cells:
     - **You scan**: "Add a stamp from the Scanner app, as you always do."
     - **Their card updates**: "The card in their wallet changes in seconds, no app to open."
     - **They get the message**: "A notification from your shop lands on their lock screen."
   - Copy:
     - eyebrow "How it works"
     - h2 "You scan. Their phone lights up."
     - lead "Notifications go out on their own. There's nothing to send or schedule."
3. **`moments`.** Reuse: `NotificationSequenceDemo` with Aurevo moments (like `messageMoments()`), `fullCard`,
   `phoneClassName={phoneCropClass(520)}`.
   - Three moments, all every plan, so no chips:
     - "Stamp collected": "Sent on every scan, in your customer's language."
     - "Reward unlocked": "Sent the moment their card is full."
     - "Reward redeemed": "Sent when they claim it." Banner "Reward redeemed. Enjoy!"
   - 390: the moment list, then the phone cut at 520. Desktop: list left, phone right.
   - Copy:
     - eyebrow "Automatic messages"
     - h2 "The right message at every step."
     - lead "A stamp, a full card, a reward claimed: each one sends its own message."
4. **`wallets`.** Pattern: Platform's deliver composition (two phones, three floating glass cards, wallet badges).
   Page-specific `WalletsComposition` built from `WalletPhone`, `GoogleWalletPhone`, `GlassCard`,
   `LockScreenNotification`, `WalletBadges`.
   - Glass cards:
     - "On iPhone": the stamp banner;
     - "On Android": the reward banner;
     - "Your own icon": three icon tiles. Fact: every plan can upload an icon or pick one made from its logo.
   - 390: phones side by side, badges, then the three glass cards stacked (as Platform). Desktop: a 960px stage.
   - Copy:
     - eyebrow "iPhone and Android"
     - h2 "Apple Wallet and Google Wallet, both."
     - lead "Customers get the notification whichever phone they carry."
5. **`wording`.** Pattern: `ToggleCard` with tabs "Ready-made" and "Your own words". Visuals are `LockScreenSlice`
   with one banner each.
   - **Ready-made** pane. Title "On from your first stamp". Facts:
     - "Stamps, rewards and level-ups covered"
     - "Switch each message on or off"
     - "Customers can turn them off in their wallet"
   - **Your own words** pane. Banner "You got stamped! 3 more to go, Sophie." Title "Say it like you would". Facts,
     each with chip Growth and Pro:
     - "Rewrite any message, with their first name"
     - "Milestones like \"Halfway there!\""
     - "Translated for each language"
   - Copy:
     - eyebrow "Your words"
     - h2 "Use our wording, or write your own."
     - lead "Ready-made messages on every plan. Growth and Pro let you rewrite them."
6. **`demo`.** `LpDemo eyebrow="Live demo" align="center"`. This is the strongest proof on this page.
7. **`final_cta`.** Copy: title "Keep every customer in the loop." (accent "in the loop."), sub "Notifications
   start with your first stamp, on every plan."
8. **`related`.** Broadcasts first, then Scanner app, then Analytics.

About 10 phone screens; today is 10.5.

### D. Analytics: `/us/landing-pages/platform/analytics` (`lp_platform_analytics`), 7 sections

**Job:** show the owner they will see whether the card works (visits, return rate, who is coming back, when it is
busy), filled in by every scan with nothing to type.

**What Harry will notice against `/en/features/analytics`:**
- The hero shows the dashboard on a computer and a phone (`DashboardDuo`).
- Our own every-plan minis appear in a white card, as Platform's deliver section does.
- The "What you don't know today ???" tiles become questions that open onto their answers (hover rows).
- The live feed and the customer segments share one toggle card.
- History per plan is drawn in handwritten figures.
- Gone: the grid of made-up chart cards ("Post-reward return 78%", an "Occasional" segment the product doesn't
  have), "More charts come with Growth and Pro" under a capture, and the dark CTA.

**Sections:**

1. **`hero`.** `PreviewHero` with `secondary={null}`: there is no demo section, so a single trial CTA.
   - Visual: `DashboardDuo caption={false} priority`, visible at every width (container queries).
   - Copy:
     - eyebrow "Analytics"
     - H1 "See how often your customers come back." (accent "come back.")
     - sub "Visits, return rate and your busiest hours. Every scan fills it in."
2. **`glance`.** Job: the every-plan numbers.
   - Pattern: the `ToggleCard` white surface with one tab, so no segmented control.
   - Visual: `DeliverAnalytics`' KPI tiles + "Visits over time", drawn larger.
   - Facts:
     - "Visits and new customers, with the trend"
     - "Your 30-day return rate"
     - "Visits over time, week by week"
     - "A recap in your inbox, weekly or monthly"
   - 390: visual, then the facts. Desktop: 7/5 columns as Platform's toggle card.
   - Copy:
     - eyebrow "At a glance"
     - h2 "Your numbers, updated with every scan."
     - lead "Visits, new customers and your 30-day return rate, on every plan."
3. **`questions`.** Pattern: `HoverRows`. Visuals are drawn minis (new, page-specific) with the fixture figures.
   - Rows:
     - "Are they coming back?" / **Return rate** / "The share of customers who came back within 30 days, and its
       trend." Mini: KPI 61%.
     - "How often do they come?" / **Visit habits** / "Every week, every two weeks, once a month: see how your
       customers split." Chip Growth and Pro.
     - "When is it quiet?" / **Busiest times** / "Visits by day and hour, with your busiest slot and quietest open
       hour." Chip Growth and Pro.
     - "Who's close to a reward?" / **Reward progress** / "Where customers are on their card, and how many rewards
       are waiting." Chip Growth and Pro.
   - One line under the rows: "Starter shows these in a sentence; Growth and Pro chart them."
   - Copy:
     - eyebrow "Answers"
     - h2 "What a paper card can't tell you."
     - lead "Each question has its own chart, filled in by every scan."
4. **`activity`.** Pattern: `ToggleCard` with tabs "Live activity" and "Your customers".
   - **Live activity** pane. Visual: `LiveActivityFeed cardOnly stillWhenReduced`. Title "Every visit, as it
     happens". Facts:
     - "Stamps, rewards and new cards, with no refresh"
     - "On your phone or your computer"
   - **Your customers** pane. Visual: segment chips plus a 3-row list mini. Title "Regulars, VIPs and who's
     slipping". Facts:
     - "New, Regular, VIP, At risk and Ghost, sorted for you"
     - "Who has a reward ready or is close to one"
     - "Download your customer list anytime"
   - Copy:
     - eyebrow "Your customers"
     - h2 "Know who's in, and who's slipping away."
     - lead "Watch visits as they happen, and see which customers to win back."
5. **`numbers`** (Hairlines). Reuse: `NumberFigures`, then a trial-only `LpCtaPair`.
   - Figures: **30** "days of history on Starter" · **90** "days on Growth" · **365** "days on Pro, with monthly
     cohorts". Values from `PLAN_FACTS.analyticsHistoryDays`.
   - Copy: eyebrow "History", h2 "Look back as far as your plan goes."
6. **`final_cta`.** Copy: title "Stop guessing. Start knowing." (accent "Start knowing."), sub "Your numbers start
   with your first stamp, on every plan."
7. **`related`.** Broadcasts (to fill the quiet hours), Notifications, Card design.

About 8 phone screens; today is 8.4. Seven sections is deliberate: today's page has seven, and each section here
answers a separate question.

### E. Promotional campaigns: `/us/landing-pages/platform/promotional-campaigns` (`lp_platform_promotional_campaigns`), 9 sections

**Job:** show the owner they can bring customers back on a slow day with one message to every card's lock screen.
No texting fees, and no contact list to build.

**What Harry will notice against `/en/features/promotional-campaigns`:**
- The hero has a product visual: a lock screen receiving Aurevo's broadcast. Today the hero is text and pills.
- The 88% / 95% figures are written by hand, each with its source line.
- The SMS/email/wallet table is gone ("iOS 26 Unknown sender", "double opt-in": unsourced, and the table squeezes
  at 390).
- "Real campaigns, real businesses… our partners" is replaced by ideas with no invented results.
- Delivery stats sit in a white card.
- Plans are stated in one clear table.
- The FAQ drops from 8 questions to 5.
- No link to Geolocation.

**Plans.** This page states plan availability as today does, flagged for Harry because STA-549 will change it.
- One top-level `plan: "Growth and Pro"` on the page's copy object, so every broadcast mention inherits it and the
  guard passes.
- A `PlanChip` "Growth and Pro" sits beside the hero eyebrow.
- Pro-only clauses carry "Pro".

**Sections:**

1. **`hero`.** `PreviewHero` with `secondary={null}`.
   - Visual: `NotificationPhoneDemo animate={false}` with Aurevo's broadcast "Quiet afternoon? Your second coffee is
     half price until 5pm." (approved Outcomes copy) over the stamp banner. Cut at 440 on a phone.
   - Copy:
     - eyebrow "Broadcasts" + chip
     - H1 "Bring customers back with one message." (accent "one message.")
     - sub "A message to every card in Apple Wallet and Google Wallet. No texting fees."
2. **`numbers`** (Hairlines). Reuse: `NumberFigures` with a new optional `source` line, then a trial CTA.
   - Figures as `SourcedFigure`s:
     - **88%** "of customers who join save the card to their wallet"
     - **95%** "of those cards are still there after 90 days"
     - **0** "fees per message"
   - Source line: "Stampeo data, 86 businesses, February to October 2026."
   - Copy:
     - eyebrow "Your audience"
     - h2 "Your customers keep the card."
     - lead "A broadcast reaches every card still in a wallet. Here's what we see."
3. **`how`.** Pattern: `StepsTable` with `WalletPhone` + `GoogleWalletPhone` ("it lands in both wallets").
   - Cells:
     - **Write**: "A short message: a deal, something new, a reason to drop by today."
     - **Pick who**: "Everyone, or by when they joined. Pro adds stamps, rewards and inactivity."
     - **Send**: "Right away, or on Pro, at any date and time you choose."
   - Copy:
     - eyebrow "How it works"
     - h2 "Write it, pick who gets it, send."
     - lead "Write it in your dashboard. It lands on their lock screen in seconds."
4. **`ideas`.** Pattern: `HoverRows`. Visual per row: `LockScreenSlice` + `LockScreenNotification` from Aurevo.
   - Rows:
     - "Fill a quiet hour" / **Happy hour** / the half-price banner, "Sent to everyone."
     - "Bring back a regular" / **We miss you** / "Sent only to customers who haven't been in for 30 days." Chip Pro.
     - "Almost there" / **Close to a reward** / "A nudge to customers a stamp or two from their reward." Chip Pro.
     - "Something new" / **New on the menu** / "Pumpkin bread is back today." "Sent to every card."
   - Copy:
     - eyebrow "Ideas to send"
     - h2 "Give them a reason to come in today."
     - lead "A few messages that work for a café. Write your own the same way."
5. **`delivery`.** Pattern: one-tab `ToggleCard` surface.
   - Visual: a delivery-stats mini from the catalog's sample (716 recipients: Apple delivered 412, Google delivered
     268, Google throttled 14, wallet uninstalled 22).
   - Facts:
     - "Split by Apple and Google"
     - "Cards removed from a wallet are counted, not hidden"
     - "Send it again anytime"
   - Copy:
     - eyebrow "After you send"
     - h2 "See where every message landed."
     - lead "Each broadcast shows how many reached Apple Wallet and Google Wallet."
6. **`plans`.** Pattern: two-cell `StepsTable`, no visual.
   - **Growth**: "{growthBroadcasts} a month, sent right away, to everyone or by when they joined."
   - **Pro**: "Unlimited, scheduled for any date and time, with full targeting."
   - Numbers are built from `PLAN_FACTS`, never typed. Arrow link "Compare plans" → `/us/pricing`.
   - Copy:
     - eyebrow "Plans"
     - h2 "What each plan can send."
     - lead "Broadcasts come with Growth and Pro, with no texting fees on either."
7. **`faq`.** `LpFaq` with five catalog questions, made US-appropriate:
   - cost ("no per-message fee, unlike texting");
   - app needed;
   - scheduling;
   - targeting;
   - both wallets.

   Dropped: GDPR (US page), "compare to SMS" (the iOS 26 claim), and "Growth monthly cap" (STA-549 rewrites it).
   Copy: h2 "Questions we hear a lot".
8. **`final_cta`.** Copy: title "Fill your next slow day." (accent "slow day."), sub "Start your free trial, then
   send your first broadcast this week."
9. **`related`.** Notifications, Analytics, Card design.

About 11 phone screens; today is 14.7.

### Copy checks applied to every draft above

- **Budgets:** H1 ≤46, sub ≤90, eyebrow ≤28, h2 ≤44, lead ≤85, closing title ≤36. All are counted and pass.
- **Banned:** no em dash, "remind", "offline", minute counts, "tiers", digit day counts, "$" amounts, or "Stampeo"
  as a banner sender.
- **Locked vocabulary:** "broadcast" (never "campaign" in copy), "card style" for the noun (design only as a verb),
  "stamps".
- **Figures:** every % figure carries a `source`.
- **Before shipping:** the strings go through `stampeo-copywriting` in the foundation stage.

## Proposed additions

- **Card design hero's second button, "Try the designer", jumps to the playground.** JUSTIFICATION: removes a step.
  The designer is the page's proof, and today it sits 8 screens down.
- **A trial button under the playground.** JUSTIFICATION: removes a step. It catches the moment the owner has made
  a card they like.
- **Scanner `team` toggle states the earning-limit override and that every scan carries its author's name.**
  JUSTIFICATION: answers a question. "Can staff hand out stamps to friends?" is the owner's worry this page
  provokes. It stays within the staff-data guardrails.
- **Analytics line "Starter shows these in a sentence; Growth and Pro chart them."** JUSTIFICATION: answers a
  question. The chips beg "what do I get on Starter?"
- **Analytics glance fact "A recap in your inbox, weekly or monthly."** JUSTIFICATION: answers a question: "do I
  have to log in to see it?"
- **Campaigns `plans` table with "Compare plans" → `/us/pricing`.** JUSTIFICATION: answers a question and removes a
  step. The chips raise "which plan?", and the answer is one tap away.
- **Source line under the campaigns figures.** JUSTIFICATION: prevents a mistake: reading Stampeo's measured
  average as a promise for one shop.
- **`related` row of sibling previews on every page.** JUSTIFICATION: removes a step. Harry walks the five
  previews, and a visitor reaches the next feature, without typing URLs.

## Rejected additions

- **`PricingSection` on the previews.** It is 2.9 phone screens, and a feature page's job is the feature. The
  header links Pricing, and campaigns has its own plans table.
- **`LpSectors` and `BlogPostsSection`.** Platform's exits. A feature page exits to the next feature (`related`).
- **The hero proof line ("Used by 120+ businesses…").** Platform's hero has none; the numbers are Platform's own
  section.
- **App Store / Google Play badges on the scanner page.** STA-546 rejected them: a business can't be created in
  the app. "On the App Store and Google Play" is said in words.
- **Today's scanner security grid.** "Automatic alerts for suspicious activity" and "end-to-end encryption" are
  not supported by STAMPEO.md. "Nothing can be counted twice" is true but answers no question here.
- **Today's "problem" blocks:**
  - the Canva / "47 options" paragraph;
  - "Stamping should be invisible";
  - "A stamp without a confirmation";
  - the "???" tiles.

  Each hero states the problem by stating the answer.
- **`ChannelComparisonBars` (85% wallet) and the SMS/email/wallet table.** Unsourced figures and legal claims, and
  the table does not reflow at 390.
- **"Real campaigns, real businesses… our partners" with outcomes ("A third walk in").** Invented results, and
  fictional shops passed off as customers.
- **GDPR boxes on notifications and campaigns.** A US audience. The one useful fact ("customers can turn them
  off") is kept as a fact.
- **"Ready in 5 minutes" / "in under a minute".** Minute counts are banned.
- **"AI-assisted creation" (Coming soon).** Not live.
- **`CardStyleGallery` carousel on card design.** The fan plus the rows already show 10 finished styles. A third
  "look at styles" block costs 1.3 screens.
- **"A card that knows your customers" section.** Personalisation shows on every card visual (Member Sophie,
  rewards ready) and isn't the question this page raises.
- **Card styles from Stampeo (seasonal themes).** Time-boxed windows, and not provoked by this page.
- **Live demo on analytics and campaigns.** The demo shows stamp notifications, not charts or broadcasts. "Try it
  on your phone" would overpromise there.
- **A "how" table on analytics.** The hero sub already says every scan fills it in.
- **Broadcast teaser card on notifications.** `related` leads with Broadcasts.
- **Google's 3-a-day notification limit note.** Not provoked, and it reads as a gap STAMPEO.md tells us not to
  suggest.
- **Monthly cohorts as a fifth analytics row.** Pro-only depth. It is named in the 365-days label instead.
- **A numbers block on scanner and notifications.** No honest figure would earn the space.
- **Glass cards around the hero phones (scanner, notifications, campaigns).** On a phone they stack under the
  device and push the first section down a screen. Composition is kept for the `wallets` section.
- **Sticky CTA bar, extra video, "Book a demo".** STA-546's standing rejections.

## Mobile shape

**Structural rules for all five (mine to own):**
- **No dialogs or sheets anywhere.** The playground, toggles and rows are inline.
- **`HoverRows` render every row open on the server, on phones and under reduced motion** (`allRowsOpen`). Hover
  on desktop is an enhancement, and focus and tap open a row too. Nothing is hover-only.
- **Tables reflow.** `StepsTable` is a stack of bordered rows below `lg` (Platform's How table at 390). There is
  no comparison grid.
- **Tap targets:**
  - CTA pills are 52px, and the secondary pill is as tall as the primary;
  - arrow links use `ARROW_LINK` (`min-h-11`);
  - `Segmented size="lg"`;
  - playground swatches and icons use `touch` (44px);
  - `related` cards and FAQ rows are at least 56px.
- **Tall devices are cut and faded** (`PhoneCrop` 440/520) so a phone never costs a full screen.
- **Trial CTAs repeat** at about every 4 screens and in the cream card.

**Per page at 390, then the desktop adaptation:**
- **Card design.**
  - 390: eyebrow, 3-line H1, sub, the 3-card fan, stacked CTAs, all inside 844. Then the icon marquee (two
    48px rows) and the playground (card 240px, then the full-width panel, then a full-width outline trial button).
    Then the anatomy (numbered dots and 2-column chips), handwritten figures stacked with stacked CTAs, three open
    stamp rows (128px card beside the words), two 160px phones cut at about 286px behind a 3-row table, the FAQ,
    the cream card and three related rows.
  - Desktop: Platform's hero; the playground in two columns; the rows open on hover; the table in three columns
    over the phones.
- **Scanner.**
  - 390: text-first hero, then the Scanner video phone (cut at 440) from y≈520. Then the How table (two 160px
    phones, three rows), four open counter rows with 128px minis, two stacked "ways" cells with stacked CTAs, the
    team toggle (full-width segmented, visual above the facts), the demo, the cream card and related.
  - Desktop: phone centred under the hero text; tables in columns; the toggle in 7/5 columns.
- **Notifications.**
  - 390: text-first hero with the lock-screen phone cut at 440. Then the How table, the moments list over a phone
    cut at 520, two side-by-side phones with badges and three stacked glass cards, the wording toggle, the demo,
    the cream card and related.
  - Desktop: the 960px glass stage; the moments list left with the phone right.
- **Analytics.**
  - 390: text-first hero with `DashboardDuo` (the desktop capture with the phone overhanging, sized by container
    query). Then the glance card (minis, then facts), four open question rows with 128px minis and the Starter
    line, the activity toggle (feed or chips above facts), the history figures stacked with a trial button, the
    cream card and related.
  - Desktop: the duo at 1120px; cards in 7/5 columns.
- **Campaigns.**
  - 390: text-first hero (eyebrow plus chip) with the lock-screen phone cut at 440. Then the figures stacked with
    their source and a trial button, the How table, four open idea rows (a banner slice beside the words), the
    delivery card, two stacked plan cells with the "Compare plans" link, the FAQ, the cream card and related.
  - Desktop: tables in columns; rows on hover.

## Components to reuse

**Section frame and kit:**
- `components/landing-pages/shared/LandingPageShell.tsx`: frame, tracker, US header and footer, `RegionPricingProvider`.
- `components/landing-pages/shared/LpSection.tsx` (`LpSection`, `LpHeading`, `EYEBROW`): every section header.
- `components/landing-pages/platform/LpCtaPair.tsx`: the CTA pair (extended with an optional `secondary`).
- `components/landing-pages/platform/LpAccentBand.tsx`: the cream card (extended with an optional `copy`).
- `components/landing-pages/platform/NumbersBlock.tsx` → `NumberFigures`: handwritten figures (extended with an
  optional `source`).
- `components/landing-pages/platform/PlatformHero.tsx`: the card design hero (extended).
- `components/landing-pages/platform/GlassCard.tsx`, `LockScreenNotification.tsx` (`LockScreenNotification`,
  `LockScreenSlice`), `Hairline.tsx`, `classes.ts`.
- `components/landing-pages/platform/DeliverAnalytics.tsx`: the every-plan minis (export `Kpi` and the chart).
- `components/landing-pages/shared/LpDemo.tsx`, `LpTrialButton.tsx`, `LpFaq.tsx` (extended with an optional `faq`).
- `components/landing-pages/shared/FactList.tsx`, `PlanChip.tsx`.

**Phones, cards and samples:**
- `components/landing-pages/shared/ScannerLoop.tsx` (`ScannerLoop`, `ScannerLoopPhone`; extended with an optional
  `still`), `scanner-loop.ts`.
- `components/landing-pages/shared/WalletPhone.tsx`, `GoogleWalletPhone.tsx`, `WalletBadges.tsx`, `PhoneCrop.tsx`
  (`PhoneCrop`, `phoneCropClass`).
- `components/landing-pages/shared/ScaledBox.tsx`, `PassFrame.tsx`, `AurevoCard.tsx`, `LevelCards.tsx`,
  `samples.ts`, `banner.tsx` (`lpBanner`).
- `components/landing-pages/shared/DashboardDuo.tsx` (`caption={false}`): the analytics hero.
- `components/landing-pages/features/MessagesSpotlight.tsx` → `messageMoments()` pattern, the Aurevo moments.
- `components/landing-pages/outcomes/SegmentChips.tsx`: the segment chips, if its labels match; otherwise copy
  its markup into the analytics mini.

**Feature components and site primitives:**
- `components/landing-variant/HeroCardFan.tsx` + `FanParallax.tsx` (`slots`).
- `components/features/design-de-carte/CompactPlayground.tsx`; `AnnotatedWalletCard.tsx` (extended with
  `heading` / `sectionClassName`); `IconLibrarySection.tsx` (export `MarqueeRow` as `IconMarquee`).
- `components/features/notifications-push/NotificationSequenceDemo.tsx`, `NotificationPhoneDemo.tsx`,
  `NotificationBanner.tsx`.
- `components/features/analytics/LiveActivityFeed.tsx` (`cardOnly`, `stillWhenReduced`).
- `components/card/WalletCard.tsx`, `GoogleWalletCard.tsx`; `components/ui/AndroidPhone.tsx`, `IPhone.tsx`,
  `PhoneScreenshot.tsx`, `Segmented.tsx`, `FAQList.tsx`, `CTAButton.tsx`, `Container.tsx`, `ScrollReveal.tsx`;
  `components/icons`.
- `lib/landing/dashboard-shots.ts` (`landingShot`), `lib/plans/plan-facts.ts` (`PLAN_FACTS`),
  `lib/landing-pages/AccentText.tsx`, `lib/landing-pages/copy/shared.ts` (`SHARED`, banners, `SAMPLE_BUSINESS`).

## New components required

**Generic, in `components/landing-pages/platform/`.** Platform is their first caller, and each Platform original
becomes a thin wrapper that renders byte-identically (pinned by `default-renders.test.tsx` snapshots).

- **`StepsTable`** (`section`, `eyebrow`, `title`, `lead`, `cells: Tile[]`, `visual?`, `link?`).
  - Why: `HowTable` is hard-wired to `PLATFORM.how` and its two phones.
  - Used by scanner (twice), notifications, campaigns (twice) and card design. `HowTable` calls it.
- **`HoverRows`** (`items: {key, eyebrow, title, body, plan?}[]`, `visuals`, `closer?`). It carries
  `allRowsOpen`, `hoverIntent` and `HOVER_INTENT_MS`.
  - Why: `ProgramTypeRows` reads `PROGRAM_TYPES` and `PLATFORM.programTypes.closer` directly.
  - Used by card design, scanner, analytics and campaigns. `ProgramTypeRows` re-exports the helpers its tests
    import.
- **`ToggleCard`** (`tabs: {key, label, title, facts, link?, visual}[]`, `ariaLabel`). One tab means no segmented
  control: just the white surface.
  - Why: `PlatformToggleCard` is typed to `PLATFORM.platform`'s two tabs and its feature links.
  - Used by scanner, notifications, analytics (twice) and campaigns.

**Preview-only, in `components/landing-pages/feature-previews/`:**

- **`PreviewHero`** (`slug`, `visual`, `secondary?`).
  - Layout: eyebrow, AccentText H1, sub, `LpCtaPair`, reassurance, then the visual below.
  - Why not extend `LpHero`: it always prints the proof line, wallet badges and `DashboardDuo`. Switching those
    off would need four props, which makes it a different component.
- **`RelatedPreviews`** (`slugs`).
  - Layout: eyebrow, h2, then three white rounded link cards with an icon tile, a title, one line and an arrow
    (at least 56px, full card tappable).
  - Why not reuse `RelatedFeatures`: it takes titles from the catalog (one has an em dash, "Promotional Campaigns
    — Wallet push…") and links to the live `/features/*`.

**Page-specific, in `feature-previews/<slug>/` (drawn minis, like `DeliverAnalytics`):**
- `mobile-scanner/CounterMinis.tsx`: stepper, keypad, rewards list, code entry, limit. Labels come from
  `scanner-app/src/locales/en`.
- `analytics/QuestionMinis.tsx`: return-rate KPI, habits bars, busiest grid, reward progress, segments list.
  Labels come from web's analytics catalog.
- `push-notifications/WalletsComposition.tsx`: the glass stage.
- `promotional-campaigns/DeliveryCard.tsx`.
- Each page's section files.

**Data:**
- `CARD_DESIGN_FAN_SLOTS` in `lib/hero-fan.ts`, next to `PLATFORM_FAN_SLOTS`. It keeps the file's deck rules and
  is covered by `hero-fan.test.ts`.

**Additive props on existing components.** Each one leaves current call sites rendering the same; pin that in
`default-renders.test.tsx`.
- `LpCtaPair.secondary`
- `LpAccentBand.copy`
- `NumberFigures.source`
- `PlatformHero.{slug, slots, secondary}`, with optional `eyebrow`/`sub` read from the registry
- `LpFaq.faq`
- `ScannerLoop.still`
- `AnnotatedWalletCard.{heading, sectionClassName}`
- the `IconMarquee` export
- the `Kpi` / visits-chart exports from `DeliverAnalytics`

## Build split

**Stage F: foundation, one builder, tests first.** It owns every shared file.

1. **Failing tests:**
   - registry entries for the five slugs: sections in order, variant, noindex, `landingPageMetadata("platform/<slug>")`,
     rendered sections equal the registry;
   - previews end `final_cta` then `related`, with `faq` before them on card design and campaigns;
   - default renders of every extended component are unchanged;
   - copy guards cover the new modules (budgets, claims, `source` on figures);
   - each new chip is tied to `PLAN_FACTS` in `plan-claims.test.ts` CHIPPED;
   - the non-campaign broadcast mentions are listed in `UNBADGED`, with Harry's STA-549 reason;
   - the `hasDemoSection` expectation is updated (no demo on analytics, campaigns or card design);
   - pricing/sectors expectations are scoped to the four original pages.
2. **Shared files:** `lib/landing-pages/pages.ts`, `lib/landing-pages/copy/previews/*.ts` (copy finalised with
   `stampeo-copywriting`), `lib/testing/landing-copy.ts`, `lib/hero-fan.ts` (`CARD_DESIGN_FAN_SLOTS`).
3. **The kit:** `platform/StepsTable`, `HoverRows`, `ToggleCard`, with `HowTable`, `ProgramTypeRows` and
   `PlatformToggleCard` as wrappers; plus every additive prop above.
4. **The preview frame:** `feature-previews/PreviewHero.tsx`, `RelatedPreviews.tsx`.
5. **Green bar:** the existing suite and snapshots stay green, and type-check passes. The five page tests stay
   red until stage P.

**Stage P: three builders in parallel, on disjoint files.** None touches `lib/`, `shared/`, `platform/` or another
page's folder; anything they need there gets reported back.
- **Builder 1, card design:** `app/[locale]/us/landing-pages/platform/card-design/page.tsx` +
  `components/landing-pages/feature-previews/card-design/*`. The heaviest page: fan hero, marquee, playground,
  anatomy, rows, numbers, table, FAQ.
- **Builder 2, notifications + campaigns:** both routes + `feature-previews/push-notifications/*` +
  `feature-previews/promotional-campaigns/*`. Both are lock-screen and banner work: glass stage, sequence, ideas
  rows, delivery card, plans table.
- **Builder 3, scanner + analytics:** both routes + `feature-previews/mobile-scanner/*` +
  `feature-previews/analytics/*`. Both are drawn-mini work: scanner-app minis and dashboard minis; plus toggles and
  rows.

**Stage Q: polish and review.**
- Merge, then a UX polish pass on pixels: 390x844 and 1440x900, each preview next to its
  `shots/today/sheet-*.png`.
- Coverage and quality review, then the full `bun test`, type-check, lint and build (not while dev runs).
- LP- runbook cases in `docs/qa/landing-pages.md`, then final shots for Harry.

## Open questions for the user

1. **Broadcast plan labels.** Default: campaigns states plans as today. Growth is {growthBroadcasts}/month, sent
   right away, with basic targeting. Pro is unlimited, scheduled, with full targeting. This comes through one
   `plan` field plus the `plans` table. The other four previews mention broadcasts with no badge (Platform's v2.1
   rule). When STA-549 ships (Starter 8/month; Growth and Pro unlimited; targeting and scheduling stay Pro), only
   that field, the table cells and `UNBADGED` change.
2. **Where `related` links go.** Default: to the sibling previews, so the set can be compared, not to the live
   `/features/*`. Platform's own toggle links stay on the live pages.
3. **Stampeo's own figures on campaigns** (88% add rate, 95% still installed at 90 days, 86 businesses, Feb–Oct
   2026). Default: keep them as today's page does, each with its source line. Say if you want them re-measured on
   November data first.
4. **Drawn minis of the Scanner app and the dashboard** (stepper, keypad, rewards list, team code, limit; habits,
   busiest grid, reward progress). Default: yes, with the apps' own English labels, as Platform's analytics minis
   do.
5. **FAQs.** Default: only where today's pages have them (card design, campaigns). Scanner, notifications and
   analytics close without one, as Platform does.
6. **Card design without the 15-card style carousel.** Default: dropped in favour of the fan plus three stamp rows.
   It can come back as an 11th section.
7. **What happens to the winner.** Default: the previews stay English-only and noindex. If you pick one,
   replacing `/features/<slug>` in four languages is its own issue: the copy moves into the catalogs, and "punch
   card" and US-only lines are split per market.
8. **Dashboard captures saying "Paris (GMT+1)"** (STA-548). The analytics hero's `DashboardDuo` uses the same
   captures Platform shows today. The desktop one prints "Paris (GMT+1)" in its date bar and under Busiest times,
   and it shows the Growth and Pro busiest-times grid with no caption (your v2.1 call). Default: proceed as Platform
   does, and pick up the US re-shoot when STA-548 lands. The drawn minis in the rows say no city.
