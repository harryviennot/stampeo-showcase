BRANCH: `feat/sta-546-landing-variants` (showcase)
SCOPES: showcase
ENVIRONMENT: **dev only.** No migration, no backend change, no Stripe write. Every case is an anonymous page view, apart from LP-09, which reads a browser cookie.

# US landing pages test pass (`/us/landing-pages/*`)

This pass covers the three US ad landing pages built in STA-546:
- `how-it-works` (variant `lp_howto`, 6 sections)
- `features` (`lp_features`, 8 sections)
- `outcomes` (`lp_outcomes`, 8 sections)

Work top to bottom. Run LP-01 first: if a page doesn't render, nothing else can be tested.

Three things are protected throughout:

1. **The pages stay out of search.** They are drafts for ad traffic. A page that is indexable, in the sitemap or linked from the site is a release blocker, even if it looks perfect.
2. **Each page tells the truth.** Every claim must be live in the product:
   - broadcasts always say "Growth and Pro";
   - nothing "reminds" customers;
   - no "no credit card required";
   - each sourced figure shows its source under it.
3. **Each page is measured as itself.** Every visit and every signup carries the page's own variant name (`lp_howto`, `lp_features` or `lp_outcomes`). That name is how trials per page get counted later (STA-547). A missing or wrong variant makes the whole comparison worthless.

The existing `/us` homepage is the control group. It must be byte-for-byte unchanged (LP-14).

---

## SETUP: Before you start

Everything runs against dev or a local server. No migration ships with this branch.

### Where things live

| Surface | URL / Command | Notes |
|---|---|---|
| Showcase (local) | `http://localhost:3001` | `bun run dev` from the worktree. **Never run `bun run build` while dev is up.** |
| Showcase (dev host) | `https://showcase.dev.stampeo.app` | After the branch is merged to `dev`. ISR caches for 300 s. |
| The three pages | `/us/landing-pages/how-it-works`, `/us/landing-pages/features`, `/us/landing-pages/outcomes` | English only. `/en/us/...` redirects to `/us/...`. |
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

---

## LP: Routing and indexing

### LP-01: Each page renders in English with the US header and footer [BLOCKER]

| Field | Content |
|---|---|
| WHY | The pages are ad destinations. A 404 or a French page wastes every click sent to it. |
| DEPENDS | none |
| ACCOUNT | No session. |
| STEPS | 1. R1. 2. Open each of the three URLs. 3. Scroll to the bottom. |
| EXPECT | Each page returns 200 and is in English. It shows the site header, with nav links that stay under `/us`. The site footer is at the bottom. Sections, in order: **How-to:** hero, steps, demo, pricing, FAQ, final call to action. **Features:** hero, demo, messages, card styles, analytics, pricing, FAQ, final call to action. **Outcomes:** hero, 6× figure, come back sooner, slow days, know your regulars, pricing, FAQ, final call to action. You do NOT see a language switcher, French text, or more than 8 sections. |
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
| EXPECT | Each page shows above the fold: the H1 (How-to "Launch a digital punch card today.", Features "Your punch card, in Apple & Google Wallet.", Outcomes "Turn first‑time customers into regulars."), the subhead, the full-width "Start my free trial", the line "14 days free · Cancel anytime" and "Used by 120+ businesses in 25+ countries". You do NOT see "first-" break onto its own line on Outcomes. No horizontal scroll. |
| RESET | None. |

### LP-05: On desktop, the whole hero visual is above the fold [CORE]

| Field | Content |
|---|---|
| WHY | A cut-off phone or card on a 1440 screen reads as broken. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | 1. R1. 2. Set the viewport to 1440x900. 3. Open each page. |
| EXPECT | The whole hero visual is visible: How-to's phone with the Aurevo card, Features' card stack with the notification, Outcomes' lock screen with the "Stamp collected!" banner. Every notification names **Aurevo**, never "Stampeo". You do NOT see the visual cut off by the fold or by the window edge. |
| RESET | None. |

### LP-06: "Try it on your phone" goes to the demo, and only where there is one [CORE]

| Field | Content |
|---|---|
| WHY | A link that points nowhere is a dead end. Outcomes has no demo by design. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | 1. On How-to and Features, click "Try it on your phone" under the main button. 2. On Outcomes, look for the same link. |
| EXPECT | On How-to and Features the page scrolls to the live demo section ("Try it on your own phone."). On Outcomes there is no such link. You do NOT land on another page. |
| RESET | None. |

## LP: Tracking and attribution

### LP-07: Each page announces its own variant [BLOCKER]

| Field | Content |
|---|---|
| WHY | The variant is how STA-547 will tell which page won. A wrong value attributes signups to the wrong argument. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | 1. R2. 2. Open How-to. 3. In the DevTools console, run `document.body.dataset.landingVariant`. 4. Repeat on the other two pages. |
| EXPECT | The value is `lp_howto` on How-to, `lp_features` on Features and `lp_outcomes` on Outcomes. On `/us` it is `wallet`. You do NOT see the same value on two pages, or `undefined`. |
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
| EXPECT | Every mention of broadcasts sits on a line with a "Growth and Pro" label. The "6×" and the head-start figure on Outcomes each show their source in small print (Square, 2026 Local Economy Report; Nunes & Drèze, 2006). You do NOT see "no credit card", "reminder", "offline", "levels", a number of minutes, or a notification from "Stampeo". |
| RESET | None. |

### LP-13: Dashboard captures say "Sample data" [CORE]

| Field | Content |
|---|---|
| WHY | Next to "turn first-time customers into regulars", a 61% return rate would read as a promise. |
| DEPENDS | LP-01 |
| ACCOUNT | No session. |
| STEPS | At 390 and at 1440, look under the phone showing the Analytics page, on Features and on Outcomes. |
| EXPECT | "Sample data" is readable under each capture, at both sizes. You do NOT see it hidden by the crop at 390. |
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
