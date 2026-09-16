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

### Accounts

**None.** Every case in this runbook is an anonymous page view. No login, no
fixture, no seeded business. If a case seems to need an account, it is the
wrong runbook.

### Reset recipes

| ID | Recipe |
|---|---|
| R1 | Clear the market cookie: devtools > Application > Cookies > delete `stampeo_market`. Needed before MK-05, because visiting `/us` sets it for 30 days. |
| R2 | Bypass ISR: append `?cachebust=<random>` to the URL, or hard-reload twice. Use whenever a string looks stale rather than wrong. |

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

WHY: The FAQ array is replaced wholesale rather than merged by index. A merge
bug shows as a mix of the two lists.

1. On `/us`, scroll to "Why businesses choose Stampeo" and then to the FAQ.

EXPECT:
- Differentiator cards include "Works with the POS you already have" and
  "No contract".
- FAQ includes "Is there a contract?" and "Who owns my customer data?".
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

WHY: The founding programme closed 2026-08-04 and its description still quoted
"€20/month for life", in euros, to every market.

1. View source on `/en/founding-partner` and `/programme-fondateur`.

EXPECT: the meta description names the programme without quoting a price. No
`€`, no `$`, no `zł`, and no literal `{growthFoundingPrice}`.

---

## Known state before you start

Nothing is currently known-broken in this area.

First run of this runbook. `/us` went live as an indexable market on
2026-09-15 (STA-275); this pass is the first to check its copy rather than its
prices.

Not covered by any case, and deliberately so:
- **Page-level rendering is not unit-tested anywhere in `showcase/`** (there is
  no component test harness, only `lib/*.test.ts`). MK-01 through MK-04 are the
  only thing standing between a mistyped translation key and a raw key path on
  a live page. Treat them as load-bearing, not as a formality.
- `/uk` copy. It has no overrides and is expected to read exactly like `/en`.

---

## CM: the comparison table

### CM-01 It appears on /us, and only there — BLOCKER

WHY: The cells name Square, Loopy and Stamp Me. A claim verified for the US
market is not a claim we have checked anywhere else, and printing it under a
French or Polish URL is comparative advertising in a market we never researched.

1. Open `/us` and scroll past the feature grid.
2. Repeat on `/`, `/en`, `/es`, `/pl`, `/uk`.

EXPECT:
- `/us`: a table headed "How we compare." with columns Stampeo, Square Loyalty,
  Loopy Loyalty, Stamp Me.
- Everywhere else: **no table, and no empty band or double gap** where it would
  have been. View source and confirm `data-landing-section="comparison"` is
  absent entirely, not present-but-empty.

### CM-02 Our own price tracks the live ladder — CORE
DEPENDS: CM-01

WHY: Competitor cells are literal by design; ours is not. If the Stampeo cell
ever hardcodes a number it will drift from checkout, which is the whole failure
STA-268 existed to end.

1. On `/us`, read the "Starting price" row.

EXPECT: the Stampeo cell reads **$49/month**, matching the Starter price on
`/us/pricing`. NOT a literal `{starterPrice}`, NOT a euro figure, and NOT a
number that differs from the pricing page.

### CM-03 The claims are the verified ones — CORE
DEPENDS: CM-01

WHY: Each row exists because of one checked fact. A cell flipped by a careless
edit is a false public statement about another company.

EXPECT, reading across:
- Google Wallet: Stampeo ✓, **Square a dash**, Loopy ✓, Stamp Me ✓.
- App for your customers: None / None / None / **Required** (Stamp Me).
- Stamp cards: Stampeo ✓, **Square a dash**.
- Points programs: **Loopy and Stamp Me a dash**.
- Keeps the POS you have: **Square a dash**.
- Stampeo is the only column with no dash anywhere.
- A verification date line sits under the table.

### CM-04 It scrolls, it does not stretch the page — EDGE
DEPENDS: CM-01

1. Open `/us` on a phone, or at a 390px viewport.

EXPECT: the table scrolls sideways inside its own box. The **page body does not
scroll sideways** and nothing overflows the viewport.
