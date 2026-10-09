BRANCH: `feat/sta-315-us-landing` (showcase)
SCOPES: showcase
ENVIRONMENT: **dev only.** No migration, no backend change, no Stripe write. Every case is a page read. The one production-shaped risk is SEO metadata, which is asserted by reading `<meta>` and `/sitemap.xml`, not by changing anything.

# US market landing test pass

Covers the `/us` copy layer, the hero trial line, and the SEO directives on the
two `/us` pages. Work top to bottom: MK first, because if the market override
leaks into another market nothing else matters and the release is blocked.

Two ideas are being protected throughout.

**First: `/us` must never state a trial length, price or reassurance that
Stripe will not honour.** The US trial is 14 days, not 30, and every new signup
attaches a card, so "no credit card required" is false. A case showing a
plausible-looking "30 days" or a no-card promise on any `/us`-reachable page is
a real failure even if the page looks fine.

**Second: the other five markets must be unchanged.** This release adds a
market's copy; it does not edit anyone else's. `/`, `/en`, `/es`, `/pl` and
`/uk` are the control group, and a difference there is a regression even when
the new wording reads better.

> **Amended 2026-09-21 (STA-330):** prices and trial-day NUMBERS now follow the
> visitor's DETECTED region on every page, not the URL — `/us` shows € + 30 to
> a France-detected browser, `/fr` shows $ + 14 to a US-detected one. Any case
> below that asserts a currency glyph or a day count is region-dependent: run
> it with the matching timezone spoof (see `docs/qa/region-pricing.md`, recipe
> R1), or its EXPECT is wrong by design, not failed. The COPY assertions (which
> sentences appear on which page) are untouched — copy stays per-market.

> **Amended 2026-10-09 (STA-358):** before any region detection, the server
> HTML of `/us` and `/us/pricing` now carries their own market's numbers ($ and
> 14), and the international pages carry € and 30. That is what crawlers read,
> and what TR-04 checks with `curl`. The region rule above still decides what a
> browser shows after hydration. The sector demo cards are the exception: they
> quote the page's market currency ("$10 off" on `/us`) for every visitor.

---

## SETUP: Before you start

Everything runs against dev. Nothing here touches production, and no migration
ships with this branch.

### Where things live

| Surface | URL / Command | Notes |
|---|---|---|
| Showcase (dev) | `https://showcase.dev.stampeo.app` | `dev.stampeo.app` is the API, not the showcase. ISR caches 300s: hard-reload twice, or wait, before calling a string stale. |
| Showcase (local) | `http://localhost:3001` | `bun run dev` from `showcase/`. Faster for copy cases. **Do not run `bun run build` while this is up**, it clobbers `.next` out from under the dev server. |
| Market switcher | bottom-left pill, dev only | `VariantDevToggle`. Flips int·fr / int·en / uk / us in one click. The fastest way to run the control group. |
| Plan catalog | `GET https://api.dev.stampeo.app/public/plans?currency=usd` | What the pricing page should be quoting. If the backend is down the page serves a baked fallback, so check here before reporting a wrong price. |
| Server HTML | `curl -s <host><path>` | What crawlers read, with no JavaScript run. `<host>` is `http://localhost:3001` or `https://showcase.dev.stampeo.app`. R3 prints its visible text. |

### Accounts

**None.** Every case in this runbook is an anonymous page view. No login, no
fixture, no seeded business. If a case seems to need an account, it is the
wrong runbook.

### Reset recipes

| ID | Recipe |
|---|---|
| R1 | Clear the market cookie: devtools > Application > Cookies > delete `stampeo_market`. Needed before MK-05, because visiting `/us` sets it for 30 days. |
| R2 | Bypass ISR: append `?cachebust=<random>` to the URL, or hard-reload twice. Use whenever a string looks stale rather than wrong. |
| R3 | Visible text of the server HTML: the block below, with the page's URL. Scripts are removed because every English page carries the whole English catalog, `/us` strings included, inside its scripts, where a raw `grep` finds words no reader sees. |

```bash
curl -s <host><path> | python3 -c 'import sys,re,html; h=re.sub(r"(?s)<(script|style)\b.*?</\1>","",sys.stdin.read()); print(re.sub(r"\s+"," ",html.unescape(re.sub(r"<[^>]+>"," ",h))))'
```

---

## MK: the override reaches /us and nowhere else

### MK-01 The hero states the trial on /us — BLOCKER

WHY: The whole issue. The trial is the strongest thing this page can say and it
was not said above the fold at all.

1. Open `/us`.
2. Read the hero, above the wallet badges.

EXPECT:
- Headline reads "Turn first-time customers into regulars."
- Primary button reads "Start my free trial".
- Directly under the buttons: **"14 days free · Cancel anytime"**.
- NOT "30 days". NOT "no credit card required", in any wording. NOT a literal
  `{trialDays}` anywhere on the page.

### MK-02 The other five markets are untouched — BLOCKER
DEPENDS: MK-01

WHY: The override layer being inert outside `us` is the main regression risk in
the diff, and next-intl has no per-key fallback, so a mistyped key renders a raw
key path rather than falling back to English.

1. Using the dev switcher, visit `/`, `/en`, `/es`, `/pl`, `/uk` in turn.
2. Read each hero.

EXPECT, on every one:
- The headline is the original ("Loyalty, in the phone they already carry." on
  the English ones, "La fidélité…" on `/`).
- Primary button reads "Create my card" (localised).
- There is **NO** reassurance line under the buttons, and no extra vertical gap
  where one would go.
- NOT "Turn first-time customers". NOT "Start my free trial". NOT a visible
  `variant.` or `hero.` key path anywhere on the page.

### MK-03 The US differentiator and FAQ are the US ones — CORE
DEPENDS: MK-01

> **Amended 2026-10-09 (STA-358):** on `/us` the differentiator heading now
> reads "Why businesses choose our digital punch card.", and the FAQ gained
> "Is this a digital punch card?" (MK-07).

WHY: The FAQ array is replaced wholesale rather than merged by index. A merge
bug shows as a mix of the two lists.

1. On `/us`, scroll to "Why businesses choose our digital punch card." and
   then to the FAQ.

EXPECT:
- Differentiator cards include "Works with the POS you already have" and
  "No contract".
- FAQ includes "Is there a contract?" and "Who owns my customer data?".
- FAQ includes "Is this a digital punch card?", once.
- FAQ does **NOT** include "Is my data safe?" and no answer anywhere says our
  servers are in Europe or leads with GDPR.
- No answer appears twice, and no answer is half-European (e.g. a US question
  with the shared answer under it).

### MK-04 "Made in Europe" is absent from /us and present elsewhere — CORE

WHY: The strip is hidden by `europeTrust: false`, which predates this issue.
Confirming both halves catches a gate inverted while refactoring around it.

1. On `/us`, look between the hero and the benefits section.
2. Repeat on `/en`.

EXPECT:
- `/us`: no flag, no "Made in Europe", no "GDPR compliant · Data hosted in
  Europe", and no empty band or double border where the strip used to be.
- `/en`: the strip is present and unchanged.

### MK-05 A market is remembered, but only as a hint — EDGE
DEPENDS: MK-01, R1

WHY: The cookie prefills the signup country. It must never be treated as
pricing authority.

1. Run R1. 2. Visit `/us`. 3. Inspect cookies.

EXPECT: `stampeo_market=us`, domain-scoped so the dashboard can read it. It is
NOT `NEXT_LOCALE`, and visiting `/en` afterwards does not rewrite it to `int`.

### MK-06 /us has its own title and description — CORE
DEPENDS: MK-01

WHY: `/us` served `/en`'s title and description, so search results showed the
generic English snippet for the page the US ads point at. Its own title is
also where "digital punch card", the US search term, can rank. Metadata is
rendered on the server per URL and never follows the visitor's region, so no
timezone spoof is needed.

1. `curl -s <host>/us | grep -oE '<title>[^<]*</title>|<meta name="description"[^>]*>'`
2. The same on `/us/pricing`, then on `/en`.

EXPECT:
- `/us`: "Digital Punch Cards for Apple &amp; Google Wallet | Stampeo", and the
  description "Digital punch cards your customers keep in Apple Wallet and
  Google Wallet. No app to download. From $49/mo, 14-day free trial."
- `/us/pricing`: "Digital Punch Card Pricing from $49/mo | Stampeo", with a
  description that quotes "$49/mo" and a "14-day free trial".
- `/en`: "Digital Loyalty Cards for Apple &amp; Google Wallet | Stampeo".
- NOT the same title on `/us` and `/en`. NOT "Stampeo" twice. NOT `€`,
  "30-day", or a literal `{starterPrice}` or `{trialDays}`. (`&amp;` is how
  the HTML writes "&".)

### MK-07 "Digital punch card" is said on /us and nowhere else — CORE
DEPENDS: MK-06

WHY: "Punch card" is how US owners search. Everywhere else the product says
"stamps", so the term is allowed only on the `/us` search surfaces: the
metadata (MK-06), one heading and one FAQ entry. On any other page it would
read as a translation slip.

1. On `/us`, read the heading above the differentiator cards, then the FAQ.
2. For each of `/`, `/en`, `/uk`, `/es`, `/pl` and `/en/pricing`: R3, piped
   into `grep -oi punch | wc -l`.

EXPECT:
- `/us`: the heading reads "Why businesses choose our digital punch card." and
  the FAQ includes "Is this a digital punch card?", once each.
- Step 2 prints `0` for every page.
- NOT "punch" in the visible text of any page except `/us` and `/us/pricing`
  (whose title says it). NOT the punch-card heading on `/en`, which still
  reads "Why businesses choose Stampeo.".

---

## TR: no page reachable from /us promises the wrong trial

### TR-01 The demo card offers the US trial — CORE
DEPENDS: MK-01

WHY: The interactive demo's reward is our own trial, and it said "30 days free"
to an American. It is the one trial claim that is not obviously copy.

1. On `/us`, scroll to "Try it yourself" and add stamps to the demo card.

EXPECT: the reward field reads "14 days free with 8 stamps!", and at 8 stamps
"You're eligible for 14 days free!". NOT 30. NOT "1 month free".

### TR-02 Feature and loyalty pages promise a trial, not a month — CORE

WHY: These are shared English pages a `/us` visitor reaches from the nav, and
they said "Start your free month".

1. Visit `/en/features/notifications-push`, `/en/features/geolocalisation`,
   `/en/features/campagnes-promotionnelles` and `/en/loyalty` (follow the nav
   from `/us` rather than typing URLs, to confirm the links are reachable).
2. Read each closing CTA.

EXPECT: "Start your free trial", or "Free to try, cancel anytime" on the
loyalty page. NOT "free month", NOT "One month free", NOT a bare "30 days".

### TR-03 The pricing page agrees with the hero — CORE
DEPENDS: MK-01

WHY: Quoting two different trial lengths one click apart is what STA-275's QA
caught last time.

1. From `/us`, click Pricing in the nav.

EXPECT:
- URL is `/us/pricing`, NOT `/pricing` and NOT `/en/pricing`.
- Every plan card says "14-day free trial · Cancel anytime".
- Prices are `$49 / $79 / $119` monthly. Toggle to Yearly: `$39 / $63 / $95`
  per month, billed `$468 / $756 / $1,140`.
- There is **no `€` anywhere on the page**, including the ROI calculator.

### TR-04 The server HTML on /us already says dollars and 14 days — CORE
DEPENDS: MK-01

WHY: Prices used to be skeletons until JavaScript ran, so crawlers, ad
reviewers and AI assistants read `/us` with no price and no trial at all. The
server now renders `/us`'s own market. `curl` runs no region detection, so
this case needs no spoof; what a browser shows after hydration is the STA-330
amendment at the top.

1. R3 on `/us`. Look for the hero trial line, the dollar amounts and the
   sector demo cards.
2. R3 on `/us/pricing`. Look for the trial line and the plan amounts.
3. Pipe both outputs into `grep -o '€' | wc -l`.

EXPECT:
- `/us`: "14 days free · Cancel anytime", plan amounts in dollars (for example
  $39 / $63 / $95 a month billed yearly, $468 / $756 / $1,140 a year), and
  "$10 off" in the bookstore demo card.
- `/us/pricing`: "14-day free trial" and $49 / $79 / $119.
- Step 3: `0` for both.
- NOT a `€` anywhere in the visible text. NOT "30 days" or "30-day free
  trial". NOT an empty "/mo" slot.
- The sector demo cards follow the page's market, not the visitor's region:
  "$10 off" stays on `/us` after hydration even for a Paris-spoofed browser.
  They are sample rewards, not prices. Only the pricing numbers swap.

---

## SE: search engines get told the truth

### SE-01 /us/pricing is indexable — BLOCKER

WHY: It hardcoded `index: false` while the sitemap already advertised it, so
the sitemap invited Google to a page telling it to go away. An indexed snippet
outlives the page by weeks, and so does a missing one.

1. View source on `/us/pricing`.

EXPECT: `<meta name="robots" content="index, follow">`. NOT `noindex`.

### SE-02 /uk is still held back — CORE
DEPENDS: SE-01

WHY: The same change made both pricing pages derive their directive. `/uk`
quotes euros under a UK flag and must stay out of the index.

1. View source on `/uk` and `/uk/pricing`.

EXPECT: both carry `noindex, follow`. Neither appears in `/sitemap.xml`.

### SE-03 The sitemap and hreflang agree — CORE
DEPENDS: SE-01

1. Open `/sitemap.xml`. 2. View source on `/` and read the `hreflang` tags.

EXPECT: `/us` and `/us/pricing` both listed. `en-US` points at `/us`. No
`en-GB` entry. Nothing listed that SE-02 says is noindex.

### SE-04 No search snippet quotes a closed offer — EDGE

> **Amended 2026-10-09 (STA-358):** the founding routes now answer a 308
> before any page renders, so there is no snippet of theirs left to read. The
> case checks the redirect, and the description at its destination, instead.

WHY: The founding programme closed 2026-08-04 and its description still quoted
"€20/month for life", in euros, to every market.

1. `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" <host>/en/founding-partner`,
   then the same for `/programme-fondateur`, `/founding-partner` and
   `/en/programme-fondateur`.
2. `curl -s <host>/en/pricing | grep -o '<meta name="description"[^>]*>'`, and
   the same for `/pricing`.

EXPECT: step 1 answers `308` to `/en/pricing`, `/pricing`, `/pricing` and
`/en/pricing`. Step 2 shows descriptions that name the plans and the trial,
with no "founding", "fondateur", "for life" or "à vie". NOT a 200 or a 307 on
any founding URL, and no literal `{growthFoundingPrice}`.

### SE-05 /us/pricing sits in the pricing hreflang cluster — CORE
DEPENDS: SE-01

WHY: `/us/pricing` must rank for US searches without competing with
`/en/pricing`. Google only honours the `en-US` annotation if every pricing
page lists the same set of URLs. The cluster used to cover the homepage only.

1. `curl -s <host>/us/pricing | grep -oiE '<link rel="(canonical|alternate)"[^>]*>'`
2. The same on `/pricing` and `/en/pricing`.

EXPECT:
- All three list the same six alternates: `x-default` → `/en/pricing`, `fr` →
  `/pricing`, `en` → `/en/pricing`, `es` → `/es/pricing`, `pl` →
  `/pl/pricing`, `en-US` → `/us/pricing`. Next writes the attribute as
  `hrefLang`.
- Each canonical is the page itself: `/us/pricing` names `/us/pricing`, not
  `/pricing`.
- NOT `en-GB`. NOT `/en/us/pricing`.

### SE-06 Nothing on /us links to /en/us, and /en/us URLs redirect once — CORE
DEPENDS: TR-03

WHY: The Header and Footer on `/us` linked to `/en/us/pricing`, which answered
200 as a copy of `/us/pricing`. Google saw two US pricing pages, and every
`/us` visit could reach the duplicate.

1. `curl -s <host>/us | grep -oE 'href="/(en/)?us[^"]*"' | sort | uniq -c`
2. `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" <host>/en/us/pricing`,
   then the same for `<host>/en/us`.

EXPECT:
- Step 1: only `href="/us/pricing"`, from the Header, the Footer column and
  the Footer's sitemap links (3 today). No `href="/en/us…"`.
- Step 2: `308` to `/us/pricing` and to `/us`.
- NOT a 200 on `/en/us/pricing`. NOT a 307.

### SE-07 /us and /us/pricing carry a full OpenGraph block — CORE
DEPENDS: MK-06

WHY: A link to `/us` pasted into WhatsApp, LinkedIn or an ad tool used to
preview as the generic English homepage, because the page set no OpenGraph
of its own.

1. `curl -s <host>/us | grep -oE '<meta property="og:[a-z_:]+"[^>]*>'`, then
   the same on `/us/pricing`.
2. Open the `og:image` URL on `<host>` (drop `https://stampeo.app`).

EXPECT:
- `/us`: `og:title` "Digital Punch Cards for Apple &amp; Google Wallet" (no
  " | Stampeo"), `og:description` equal to the meta description, `og:url`
  `https://stampeo.app/us`, `og:site_name` Stampeo, `og:locale` `en_US`,
  `og:type` website, and `og:image` `https://stampeo.app/en/opengraph-image?<hash>`
  with width 1200 and height 630. `/us/pricing` likewise, with its own title
  and URL.
- Step 2: the image loads (a 200 PNG).
- NOT a missing `og:image`. NOT `/en`'s title.

---

## Known state before you start

Nothing is currently known-broken in this area.

**STA-358 (2026-10-09).** `/us` now has its own title and description
(MK-06), says "digital punch card" in one heading and one FAQ entry and
nowhere else (MK-07, MK-03 amended), ships `$` and 14 days in its server HTML
(TR-04), sits in the pricing hreflang cluster (SE-05), never links to `/en/us`
(SE-06) and carries a full OpenGraph block (SE-07). The founding routes now
308 to pricing (SE-04 amended). MK-01 is unchanged, because STA-358 did not
touch the hero copy. Its H1 writes "first‑time" with a non-breaking hyphen, so
read that line on the rendered page rather than grepping the raw HTML for it.
The new cases were dry-run on a local production build at `903dfd5`, not yet
on dev. **Targeted re-run:** MK-01, MK-03, MK-06, MK-07, TR-03, TR-04, SE-01,
SE-03 to SE-07. The crawler-view checks shared by every page are in
`seo-indexing.md`.

First run of this runbook. `/us` went live as an indexable market on
2026-09-15 (STA-275); this pass is the first to check its copy rather than its
prices.

A comparison table against Square, Loopy and Stamp Me was built for `/us` and
then removed before QA. Cases CM-01 to CM-04 covered it and are **retired**:
they are not in this runbook and their ids are not reused.

Not covered by any case, and deliberately so:
- **Page-level rendering is not unit-tested anywhere in `showcase/`** (there is
  no component test harness, only `lib/*.test.ts`). MK-01 through MK-04 are the
  only thing standing between a mistyped translation key and a raw key path on
  a live page. Treat them as load-bearing, not as a formality.
- `/uk` copy. It has no overrides and is expected to read exactly like `/en`.
