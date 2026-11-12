BRANCH: `feat/sta-546-landing-variants` (showcase)
SCOPES: showcase
ENVIRONMENT: **dev only.** No migration, no backend change, no Stripe write. Every case is an anonymous page view, apart from LP-09, which reads a browser cookie.

# US landing pages test pass (`/us/landing-pages/*`)

This pass covers the four US ad landing pages built in STA-546 (v2, after Harry asked for more depth):
- `how-it-works` (variant `lp_howto`, 12 sections)
- `features` (`lp_features`, 12 sections)
- `outcomes` (`lp_outcomes`, 11 sections)
- `platform` (`lp_platform`, 13 sections: passentry.com's homepage structure, rebuilt for Stampeo)

> **Amended 13 Nov 2026 (v2):** the pages were rebuilt with richer sections and a fourth page. LP-01,
> LP-04 to LP-07, LP-12 and LP-13 have v2 expectations; LP-18 to LP-27 are new. Case ids are unchanged.
> **Amended 13 Nov 2026 (v2.1, Platform polish):** LP-28 to LP-34 are new. On Platform, LP-13's "Sample data"
> and LP-27's turning-wheel wording are superseded: Platform shows no captions, and its hero is the fan (LP-28).

Work top to bottom. Run LP-01 first: if a page doesn't render, nothing else can be tested.

Three things are protected throughout:

1. **The pages stay out of search.** They are drafts for ad traffic. A page that is indexable, in the sitemap or linked from the site is a release blocker, even if it looks perfect.
2. **Each page tells the truth.** Every claim must be live in the product:
   - broadcasts always say "Growth and Pro";
   - nothing "reminds" customers;
   - no "no credit card required";
   - each sourced figure shows its source under it.
3. **Each page is measured as itself.** Every visit and every signup carries the page's own variant name (`lp_howto`, `lp_features`, `lp_outcomes` or `lp_platform`). That name is how trials per page get counted later (STA-547). A missing or wrong variant makes the whole comparison worthless.

The existing `/us` homepage is the control group. It must be byte-for-byte unchanged (LP-14).

---

## SETUP: Before you start

Everything runs against dev or a local server. No migration ships with this branch.

### Where things live

| Surface | URL / Command | Notes |
|---|---|---|
| Showcase (local) | `http://localhost:3001` | `bun run dev` from the worktree. **Never run `bun run build` while dev is up.** |
| Showcase (dev host) | `https://showcase.dev.stampeo.app` | After the branch is merged to `dev`. ISR caches for 300 s. |
| The four pages | `/us/landing-pages/how-it-works`, `/us/landing-pages/features`, `/us/landing-pages/outcomes`, `/us/landing-pages/platform` | English only. `/en/us/...` redirects to `/us/...`. |
| Server HTML | `curl -s <host><path>` | What crawlers read. |

### Accounts

**None.** Every case is an anonymous visit.

### Reset recipes

**R1: US visitor** (any case asserting $ or 14 days)
- Set the browser time zone to `America/New_York`: Chrome DevTools → Sensors → Location, or Playwright `timezoneId`.
- Prices then show in USD with a 14-day trial, and no cookie banner appears.
- A France time zone shows € and 30 days by design (STA-330). That is not a failure.

**R2: Fresh visit** (tracking cases)
- Close the tab.
- Clear site data for the host: DevTools → Application → Clear storage.
- Open a new tab.
- PostHog runs in memory, so each full page load counts as a new visitor anyway.

### Known state before you start

- **The demo can't reach the API on a plain local server** (no `.env.local`). It shows its idle state only. Run the demo cases (LP-10) on the dev host.
- **The dashboard capture shows "Paris (GMT+1)".** This is known, tracked in STA-548, and not a failure here.
- **The PostHog connector in Claude points at the wrong organisation.** For LP-07, read the variant from the page itself, not from PostHog.
- **Levels are shown as live (Harry, 12 Nov).** Before ads point at these pages, levels must be switched on for new businesses too (Harry handles it). LP-20 checks the pages; whether a new sign-up can turn levels on is outside this runbook.
- **Reduced motion:** to test LP-24, emulate `prefers-reduced-motion: reduce` (DevTools → Rendering, or Playwright `reducedMotion: "reduce"`).

---

## LP: Routing and indexing

### LP-01: Each page renders in English with the US header and footer [BLOCKER]

| Field | Content |
|---|---|
| WHY | The pages are ad destinations. A 404 or a French page wastes every click sent to it. |
| DEPENDS | none |
| ACCOUNT | No session. |
| STEPS | 1. R1. 2. Open each of the four URLs. 3. Scroll to the bottom. |
| EXPECT | Each page returns 200 and is in English. It shows the site header, with nav links that stay under `/us`. The site footer is at the bottom. Sections, in order: **How-to:** hero, three steps map, step 1 (card designer), step 2 (they scan), step 3 (you stamp), live demo, "watch it work" feed, "Stampeo adapts to your business", first day timeline, pricing, FAQ, final call to action. **Features:** hero, live demo, card styles, stamps/points/levels, lock-screen moments, scanner, analytics, "everything around it" tiles, sectors, pricing, FAQ, final call to action. **Outcomes:** hero, 6× figure, always on them, head start, quiet hours, levels, regulars, sectors, pricing, FAQ, final call to action. **Platform:** hero (card fan), business-type strip, "Straight to Apple Wallet and Google Wallet", numbers, how it works, live demo, program types, Dashboard/Scanner toggle, share tree, pricing, orange band, sectors, blog. You do NOT see a language switcher, French text, or more than 13 sections. |
| RESET | None. |

### LP-02: The pages stay out of search and out of the site's links [BLOCKER]

| Field | Content |
|---|---|
| WHY | They are drafts competing with `/us`. Indexing them would split `/us`'s ranking and expose unfinished copy. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | 1. `curl -s <host>/us/landing-pages/features \| grep -i robots`, and the same for the other two. 2. Open `<host>/sitemap.xml` and `<host>/llms.txt` and search for `landing-pages`. 3. Look through the header menus and the footer on `/us`. |
| EXPECT | Each page has `<meta name="robots" content="noindex, nofollow">`. You do NOT find `landing-pages` in the sitemap, in llms.txt, or in any header or footer link. |
| RESET | None. |

### LP-03: The bare path is not a page [EDGE]

| Field | Content |
|---|---|
| WHY | Only `/us/landing-pages/*` should exist. The bare path renders in French with no US market, so nothing may link to it. |
| DEPENDS | none |
| ACCOUNT | No session. |
| STEPS | Open `<host>/landing-pages/features`. |
| EXPECT | A not-found page. You do NOT see the Features landing page. |
| RESET | None. |

## LP: Heroes

### LP-04: On a phone, the promise and the button are above the fold [CORE]

| Field | Content |
|---|---|
| WHY | Most ad clicks come from phones. If the visitor has to scroll to find the button, the hero has failed. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | 1. R1. 2. Set the viewport to 390x844. 3. Open each page and don't scroll. |
| EXPECT | How-to, Features and Outcomes show above the fold: the H1 (How-to "Launch a digital punch card today.", Features "Your punch card, in Apple & Google Wallet.", Outcomes "Turn first‑time customers into regulars."), the subhead, the full-width "Start my free trial", the line "14 days free · Cancel anytime" and "Used by 120+ businesses in 25+ countries". Platform shows "Digital punch cards for Apple & Google Wallet.", the card fan and both buttons ("Start my free trial", "Try it on your phone"). You do NOT see "first-" break onto its own line on Outcomes. No horizontal scroll. |
| RESET | None. |

### LP-05: On desktop, the whole hero visual is above the fold [CORE]

| Field | Content |
|---|---|
| WHY | A cut-off phone or card on a 1440 screen reads as broken. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | 1. R1. 2. Set the viewport to 1440x900. 3. Open each page. |
| EXPECT | How-to, Features and Outcomes: the wallet badges and the top of the desktop dashboard (in a browser frame, with the phone over it) are visible. Platform: the card fan and the button row sit above the fold. You do NOT see the visual cut off by the window edge, or text running under the fan. |
| RESET | None. |

### LP-06: "Try it on your phone" goes to the demo, and only where there is one [CORE]

| Field | Content |
|---|---|
| WHY | A link that points nowhere is a dead end. Outcomes has no demo by design. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | 1. On How-to, Features and Platform, click "Try it on your phone" (Platform: in the hero and in the numbers section). 2. On Outcomes, look for the same link. |
| EXPECT | On How-to, Features and Platform the page scrolls to the live demo section ("Try it on your own phone."). On Outcomes there is no such link. You do NOT land on another page. |
| RESET | None. |

## LP: Tracking and attribution

### LP-07: Each page announces its own variant [BLOCKER]

| Field | Content |
|---|---|
| WHY | The variant is how STA-547 will tell which page won. A wrong value attributes signups to the wrong argument. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | 1. R2. 2. Open How-to. 3. In the DevTools console, run `document.body.dataset.landingVariant`. 4. Repeat on the other two pages. |
| EXPECT | The value is `lp_howto` on How-to, `lp_features` on Features, `lp_outcomes` on Outcomes and `lp_platform` on Platform. On `/us` it is `wallet`. You do NOT see the same value on two pages, or `undefined`. |
| RESET | R2. |

### LP-08: The sign-up buttons go to onboarding [CORE]

| Field | Content |
|---|---|
| WHY | Every button on these pages must lead to the trial. A button that goes anywhere else, or isn't tracked, breaks the comparison. |
| DEPENDS | LP-07 |
| ACCOUNT | No session. |
| STEPS | 1. R1. 2. On each page, click "Start my free trial" in the hero and come back. 3. Do the same with the final call to action. 4. Click "Try it on your phone". |
| EXPECT | The hero and final buttons open onboarding (`/en/onboarding` or `/onboarding`, in English). "Try it on your phone" only scrolls. You do NOT see the demo link open the contact page. |
| RESET | None. |

### LP-09: An ad click is attributed to the page [CORE]

| Field | Content |
|---|---|
| WHY | Trials per page are counted from the stored attribution. If the variant isn't stored on the ad landing, STA-547 has nothing to read. |
| DEPENDS | LP-07 |
| ACCOUNT | No session. |
| STEPS | 1. R2 and R1. 2. Open `/us/landing-pages/outcomes?utm_source=google&utm_medium=cpc&gclid=TEST-LP09`. 3. DevTools → Application → Cookies: open `stampeo_src` (the campaign-source cookie; its fields are listed in `lib/attribution/source.ts`). |
| EXPECT | `stampeo_src` holds `lp` = `/us/landing-pages/outcomes` and `lv` = `lp_outcomes`, plus the UTM values. You do NOT see `lv` = `wallet` or an empty `lv`. |
| RESET | R2. |

## LP: The live demo

### LP-10: There is always a way to the trial in the demo section [CORE]

| Field | Content |
|---|---|
| WHY | About two in three iPhone visitors who tap "add" never get past the wallet step. The outline trial button is their way forward. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | 1. On the dev host, open Features on a desktop: the demo shows a QR code. 2. Scan it with a phone and add the card. 3. Watch the desktop page. 4. Repeat on a real iPhone: tap "Add to your Wallet" directly. |
| EXPECT | The outline "Start my free trial" stays visible under the demo in every state: idle, waiting for the wallet, added and stamped. The only scannable QR code on the page is the demo's. The step-2 counter sign on How-to is a mark, not a working code. You do NOT see the trial button disappear while the demo waits. |
| RESET | None. |

## LP: Claims and copy

### LP-11: Prices follow the visitor's region [CORE]

| Field | Content |
|---|---|
| WHY | A US visitor must see dollars and 14 days, because that is what Stripe charges. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | 1. R1 and open Outcomes. 2. Read the hero line and the pricing block. 3. Switch the time zone to `Europe/Paris` and reload. |
| EXPECT | New York: "14 days free" in the hero and USD in the pricing block. Paris: 30 days and €, by design. You do NOT see "30 days" with a New York time zone. |
| RESET | R1. |

### LP-12: No claim the product doesn't keep [CORE]

| Field | Content |
|---|---|
| WHY | These pages go in front of paying ad traffic. Promising something we don't do invites refunds and complaints. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | Read each page top to bottom. |
| EXPECT | Every mention of broadcasts carries a "Growth and Pro" label on the same line or chip. Earning limits, reward expiry and bonus points say "Growth and Pro"; several locations says "Pro". The "6×" and the head-start bars (34% / 19%) on Outcomes each show their source in small print (Square, 2026 Local Economy Report; Nunes & Drèze, 2006). Platform's share tree names channels, not integrations. You do NOT see "no credit card", "reminder", "offline", "tiers", "integration", a number of minutes, or a notification from "Stampeo". |
| RESET | None. |

### LP-13: Dashboard captures say "Sample data" [CORE]

| Field | Content |
|---|---|
| WHY | Next to "turn first-time customers into regulars", a 61% return rate would read as a promise. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | At 390 and at 1440, look under the phone showing the Analytics page, on Features and on Outcomes. |
| EXPECT | "Sample data" is readable under each capture, at both sizes: the hero dashboards ("Sample data · Some charts come with Growth and Pro."), Features' analytics, Outcomes' quiet hours and regulars, Platform's analytics card and Dashboard tab. You do NOT see it hidden by the crop at 390. |
| RESET | None. |

## LP: Regressions

### LP-14: The `/us` homepage is unchanged [BLOCKER]

| Field | Content |
|---|---|
| WHY | `/us` is the control group and today's live page. |
| DEPENDS | none |
| ACCOUNT | No session. |
| STEPS | 1. R1. 2. Open `/us`, then `/en`, then `/`. |
| EXPECT | Same sections and copy as on `dev` before this branch: the "Turn first‑time customers into regulars." hero with the card fan, then the dashboard shot and so on. You do NOT see any `Lp`-style section or a missing section. |
| RESET | None. |

### LP-15: The feature pages that share components look as before [CORE]

| Field | Content |
|---|---|
| WHY | Three existing components gained optional props. Their current pages must not change. |
| DEPENDS | none |
| ACCOUNT | No session. |
| STEPS | 1. Open `/en/features/notifications-push` at 390 and wait about 4 s. 2. Open `/en/features/card-design` (it redirects) and scroll to the card-style gallery. |
| EXPECT | The notifications page: the lock-screen banners still animate in, with Stampeo's orange bell icon. The gallery keeps its own heading ("Fifteen shops, fifteen styles") and its call to action. You do NOT see an Aurevo icon on the notifications page, or a gallery with no heading. |
| RESET | None. |

## LP: Mobile edges

### LP-16: Nothing overflows or hides at 390 [EDGE]

| Field | Content |
|---|---|
| WHY | One horizontal scroll breaks the whole page on a phone. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | At 390x844, scroll each page from top to bottom and try to swipe sideways. |
| EXPECT | No horizontal scroll. Phones in the spotlights fade out at the bottom instead of being cut flat. Every new button or link is at least 44px tall. You do NOT see text running under a device or a clipped shadow edge. |
| RESET | None. |

### LP-17: A non-US visitor's cookie banner doesn't hide the button [EDGE]

| Field | Content |
|---|---|
| WHY | European visitors get a consent banner, and it must not cover the main button. |
| DEPENDS | LP-04 |
| ACCOUNT | No session. |
| STEPS | 1. Time zone `Europe/Paris`, viewport 390x844, R2. 2. Open How-to. |
| EXPECT | The cookie banner sits below "Start my free trial". You do NOT see it covering the hero button. |
| RESET | R1, R2. |

## LP: v2 depth (added 13 Nov 2026)

### LP-18: The hero shows the web dashboard, on a phone too [CORE]

| Field | Content |
|---|---|
| WHY | Harry's ask: owners must see it's not only a phone scanner, there's a dashboard on their computer. On `/us` the desktop capture is hidden on phones, where ad clicks land. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | 1. R1. 2. At 390x844 and 1440x900, open How-to, Features and Outcomes. 3. Scroll just below the hero buttons. |
| EXPECT | The official Add to Apple Wallet and Add to Google Wallet badges, then the desktop dashboard in a browser frame ("app.stampeo.app") with the phone dashboard overlapping it, at both sizes. You do NOT see the desktop capture missing at 390, or the badges acting as links. |
| RESET | None. |

### LP-19: "Stampeo adapts to your business" on every page, never as testimonials [CORE]

| Field | Content |
|---|---|
| WHY | Harry wants the sector carousel kept. Its brands are fictional: presenting them as customers would be a fabricated testimonial. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | On each of the four pages, find the carousel and swipe through it. |
| EXPECT | The heading "Stampeo adapts to your business" over the sector slides, with dollar amounts. On Platform a small label "For every kind of shop" sits above it. You do NOT see "testimonials", "stories" or "our customers" near it. |
| RESET | None. |

### LP-20: Levels appear as a real option, named "levels" [CORE]

| Field | Content |
|---|---|
| WHY | Levels are shown as live by Harry's decision; the word must match the product, and the visual must show a real level card. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | 1. Features: click the "Levels" tab. 2. Outcomes: scroll to "Give your regulars a level to reach." 3. Platform: scroll to "Stamps, points or levels." |
| EXPECT | The barbershop card at Bronze, Silver and Gold with the level name in each card's header, the "You've reached Silver! Your card has a new look." banner, and an "Every plan" chip. You do NOT see the word "tiers", or Aurevo's café card used for levels. |
| RESET | None. |

### LP-21: Platform's program rows follow the scroll on desktop and are all open on a phone [CORE]

| Field | Content |
|---|---|
| WHY | PassEntry's signature interaction, rebuilt. On a phone or with reduced motion nothing may stay hidden. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | 1. At 1440x900, scroll slowly through "Stamps, points or levels." 2. Click a closed row. 3. Repeat at 390x844. 4. Repeat at 1440 with reduced motion. |
| EXPECT | At 1440 the row nearest the middle of the screen opens (its small label and description appear) and the others close; a click opens a row. At 390 and with reduced motion every row is open. You do NOT see an empty row or a description that never appears. |
| RESET | None. |

### LP-22: Platform's share tree names channels, not integrations [CORE]

| Field | Content |
|---|---|
| WHY | Stampeo has no integrations and never claims a POS one. PassEntry's section is about integrations; ours is about where you put your link. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | At 1440 and 390, read "Put your card where customers already are." |
| EXPECT | Six channels: Counter flyer, Scanner app, Instagram, Facebook, Your website, Google Business Profile. Branches draw in once on desktop; a vertical list at 390. You do NOT see "integration", "connect", "sync" or a POS name. |
| RESET | None. |

### LP-23: Platform's blog block links to real posts [EDGE]

| Field | Content |
|---|---|
| WHY | A broken link at the bottom of an ad page wastes the reader's last click. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | Click each of the three cards under "Guides for shop owners.", then "View all". |
| EXPECT | Each card opens its English blog post (200); "View all" opens the blog. Each card shows a reading time. You do NOT see a 404 or a French post. |
| RESET | None. |

### LP-24: The reused demos tell the truth and calm down under reduced motion [CORE]

| Field | Content |
|---|---|
| WHY | Demos taken from the feature pages carried "REC", a "0.8s" timing and "Stampeo" as sender, all false here. Motion must respect the visitor's setting. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | 1. Watch the scanner on How-to step 3, Features and Platform. 2. Watch the lock-screen moments on Features. 3. Turn on reduced motion and reload. |
| EXPECT | No "REC" and no timing on any scanner; every notification comes from Aurevo (or the barbershop for levels) with its own icon; the broadcast moment carries "Growth and Pro". With reduced motion the scanner rests on a finished scan, the live feed stops adding rows and the marquee stops scrolling. You do NOT see "Stampeo" as a notification sender. |
| RESET | Turn reduced motion off. |

### LP-25: The interactive pieces work [CORE]

| Field | Content |
|---|---|
| WHY | The depth Harry asked for is mostly interactive; a dead control reads as broken. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | 1. How-to step 1: change the theme, icon, stamps/points and stamp count. 2. Features: switch Stamps / Points / Levels; tap each lock-screen moment. 3. Outcomes: switch "Card starts empty" / "2 stamps on the house". 4. Platform: switch Dashboard / Scanner app. |
| EXPECT | 1. The card updates live. 2. The card and text change per tab without the section jumping in height; the phone shows the tapped moment. 3. The card shows 0/8 or 2/8 and the highlighted bar moves between 19% and 34%. 4. The card cross-fades between the dashboard and the scanner without changing height. Every control is at least 44px tall. You do NOT see a control that does nothing. |
| RESET | Reload. |

### LP-26: Length and button spacing on a phone [EDGE]

| Field | Content |
|---|---|
| WHY | Depth must not turn into a page nobody finishes; the trial button must stay within reach. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | At 390x844, scroll each page from top to the end of its last section, noting where "Start my free trial" appears. |
| EXPECT | About 13 to 15 screens per page (footer excluded), with no stretch of more than about 4.5 screens without a "Start my free trial". You do NOT see two tinted bands touching. |
| RESET | None. |

### LP-27: Platform reads like PassEntry's structure, in our words [EDGE]

| Field | Content |
|---|---|
| WHY | Harry asked for PassEntry's page rebuilt for Stampeo. The structure should match; their words, images and logos must not appear. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | Open Platform at 1440 beside `docs/features/STA-546/shots/passentry/desktop-*.png`. |
| EXPECT | Same order and patterns: centred headline over a card fan with two buttons, a strip under it, eyebrow + centred heading sections, two phones with floating cards and wallet badges, numbers, a three-column how-it-works table over phones, scroll-following rows, a toggle card, a branching tree, our pricing, an orange band, then sectors and the blog. You do NOT see PassEntry's name, copy, customer logos or images. |
| RESET | None. |

## LP: Platform polish v2.1 (added 13 Nov 2026)

### LP-28: Platform's hero fan shows our own sample shops [CORE]

| Field | Content |
|---|---|
| WHY | Harry chose the fan over a turning wheel and hand-picked its cards. A real brand on the fan would be a false claim. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | 1. Open Platform at 1440x900 and at 390x844. 2. Look at the fan, then at `/us`'s fan at 1440. |
| EXPECT | Platform's fan, left to right: Gelo, Rolling Slice (pizza), Vanity, Aurevo at the top, Fournée (croissants), Marginalia, Pace. A phone shows Vanity, Aurevo and Fournée. "Start my free trial" and "Try it on your phone" sit in clear space below the cards at 1024, 1280 and 1440, with the reassurance above the fold. `/us`'s fan is unchanged (Pace, Marginalia, Xeniká, Aurevo, Vanity, Lustre, Gelo). You do NOT see a barbershop card, or a card overlapping the buttons. |
| RESET | None. |

### LP-29: "Built for" runs as two rows on a phone [EDGE]

| Field | Content |
|---|---|
| WHY | Harry's call: two rows in opposite directions show more shop types on a small screen. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | 1. Open Platform at 390x844. 2. Repeat with reduced motion. 3. Open it at 768. |
| EXPECT | At 390, two rows under "BUILT FOR", moving in opposite directions, with faded edges. With reduced motion there is one still, wrapped row. At 768 and up there is a single moving row. You do NOT see horizontal page scroll. |
| RESET | None. |

### LP-30: "In their wallet" shows both wallets and three matching cards [CORE]

| Field | Content |
|---|---|
| WHY | The section shows the customer's side on both platforms, plus the three things the business gets. Mismatched cards read as unfinished. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | At 1440, 1024 and 390, look at "Straight to Apple Wallet and Google Wallet." |
| EXPECT | An iPhone with Aurevo in Apple Wallet and an Android phone with Aurevo in Google Wallet, both at 5 of 8. Three floating cards with the same title style ("Analytics", "Lock-screen notifications", "Updates on every scan"). The Analytics card is drawn by us: visits 2,770, 30-day return rate 61%, visits over time. The notification comes from Aurevo with its cup icon. The official wallet badges sit under the phones. You do NOT see "Sample data", a cropped dashboard screenshot, or "Stampeo" as the notification's sender. |
| RESET | None. |

### LP-31: The numbers use the handwritten figures [EDGE]

| Field | Content |
|---|---|
| WHY | Harry asked for the original homepage's figures. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | Look at "Where Stampeo stands today." at 390 and 1440. |
| EXPECT | 120+, 20,000+ and 25+ in the handwriting face, with their labels. You do NOT see the figures in the regular sans font. |
| RESET | None. |

### LP-32: The Scanner loop plays on screen, rests under reduced motion, and matches the cards beside it [CORE]

| Field | Content |
|---|---|
| WHY | The loop replaced a demo Harry called outdated. It must look like the real app, cost little to load, and agree with the cards beside it. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | 1. Open How-to step 3, the Features scanner, Platform "Create it, share it, stamp it" and Platform's "Scanner app" tab. 2. Watch one loop of each. 3. Scroll away and back. 4. Turn on reduced motion and reload. 5. In DevTools → Network, load Platform without scrolling. |
| EXPECT | 1-2. The loop runs: the scan screen with Sophie's card, "Sophie 4/8", the tap on Add Stamp, "Stamp Added! 5/8", Scan Next Customer, back to the camera. Every Aurevo card or banner shown beside it says 5 of 8. 3. It pauses off-screen and resumes. With Platform's Dashboard tab shown, the scanner video is paused. 4. With reduced motion there is no video, only the "Stamp Added! 5/8" frame. 5. Without scrolling, only the small first-frame images load, not the video files. You do NOT see "REC", a timer, or the old drawn scanner demo. |
| RESET | Turn reduced motion off. |

### LP-33: Program rows open on hover and carry no plan chips [CORE]

| Field | Content |
|---|---|
| WHY | Harry's call: rows open on hover, not on scroll, and the "Every plan" chips go. Levels must be drawn on a fictional brand. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | 1. At 1440, rest the mouse on each row of "Stamps, points or levels." for a moment. 2. Sweep the mouse quickly across the rows. 3. Tab through the rows. 4. Open the page at 390. |
| EXPECT | A row opens when the mouse rests on it, focus opens a row, and a quick sweep opens nothing. At 390 every row is open. Stamps shows Aurevo, Points shows Vanity, Levels shows Wrenfold's cards at Bronze, Silver and Gold. The level-up banner on Features and Outcomes comes from Wrenfold too. You do NOT see an "Every plan" chip on these rows, or a barbershop card. |
| RESET | None. |

### LP-34: No captions, no plan badge on broadcasts, a calm final card [EDGE]

| Field | Content |
|---|---|
| WHY | Harry: a landing page doesn't need the detail. Broadcasts open to every plan right after these pages ship (STA-549). |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | 1. Look at "Run it from your computer or your phone." 2. Scroll the share tree. 3. Look at the final call to action. |
| EXPECT | 1. The dashboard has no caption under it, and "Broadcasts to every card" carries no "Growth and Pro" badge. 2. The orange fills each branch of "Put your card where customers already are." as you scroll down, and empties as you scroll up; with reduced motion the tree is complete. 3. "Launch your loyalty card today." sits on a cream card with an orange accent word and an orange button. You do NOT see "Sample data" anywhere on Platform, or a solid orange box. |
| RESET | None. |

---

## Execution rules (for the testing agent)

1. **Order:** setup first, then sections top to bottom, with BLOCKER cases first within a section unless DEPENDS says otherwise.
2. **BLOCKER failure:** stop the section and mark its dependents SKIPPED. If LP-01 fails, stop the run.
3. **CORE failure:** write a failure report, skip only its dependents, continue.
4. **EDGE failure:** write a failure report and continue.
5. **Ambiguity:** read the WHY. If it's still unclear, report it as AMBIGUOUS.
6. **Resets:** run the case's RESET after any failure.
7. **Reports:** one failure report per failed case (`failure-report-template.md`), referring to cases by ID only.
8. **Re-runs after fixes:** re-run only the failed case, its dependents, and the cases listed in "Known state".
