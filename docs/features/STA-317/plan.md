# Plan: Cookie consent banner on showcase

ISSUE: STA-317 (https://linear.app/stampeo/issue/STA-317/implement-cookie-consent-banner-prerequisite-for-ga4-tiktok-and-meta)
BLOCKS: STA-318 (GA4), STA-319 (Meta pixel), STA-320 (TikTok pixel), STA-271
BRANCH: `harryviennot2/sta-317-implement-cookie-consent-banner-prerequisite-for-ga4-tiktok`
REPOS: showcase
MIGRATION: no
STATUS: APPROVED (2026-09-16, by Harry Viennot)


## Context

STA-271 wants GA4, a Meta pixel and a TikTok pixel on the marketing site so ad
campaigns have a conversion signal. All three set cookies, and under
GDPR/ePrivacy none may fire before explicit opt-in — so a consent layer has to
exist before any of them can ship. Today showcase has none, and does not need
one: PostHog runs with `persistence: "memory"`
([instrumentation-client.ts](showcase/instrumentation-client.ts)), the STA-313
posture, so no cookie is set and the privacy policy states in four languages
that no banner is required.

STA-318/319/320 are already drafted and each declares itself blocked on this
issue. Each invented its own consent stub (`readAnalyticsConsent()`,
`hasMarketingConsent()`, `readMarketingConsent()`) because it expected to land
first. **None of them is implemented.** Landing STA-317 first removes that
problem: this issue owns one `lib/consent.ts` and the three pixel plans are
amended to consume it rather than stub it. That amendment is part of this
issue's Phase 6.

Intended outcome: a visitor gets a real, CNIL-shaped choice; the three pixels
plug into a working gate with no consent code of their own; and the legal
pages stop asserting something the site no longer does.

## Decisions

### D1 — Prior blocking, not load-then-suppress, not Consent Mode
No gated tag's `<script>` is injected until consent exists. Refusing creates
nothing, so nothing has to be deleted. Rejected: Google Consent Mode v2 in
`denied` state, because it still contacts `googletagmanager.com` before a
choice, and Meta/TikTok have no cookieless equivalent at all — their pixels
send the visitor's IP regardless. This matches STA-318's own decision and its
AC2 ("NOT merely a Consent-Mode-denied tag that still pings Google").

### D2 — Geo-split: opt-in by default, opt-out only for the US
Two regimes, one gate:

| Regime | Who | Behaviour with no stored choice |
|---|---|---|
| `opt-in` | **everyone except a detected US visitor**, including unknown | Nothing fires. Blocking-ish banner with Refuse all / Accept all at equal prominence + Customise. |
| `opt-out` | detected US visitor | Tags load on arrival. Slim dismissible notice + a permanent "Your privacy choices" footer entry. Dismissing RECORDS the regime default rather than hiding the notice in component state, so it does not return on the next navigation. |

As of 2026 no US state privacy law requires a prior-consent banner; the 20
comprehensive laws are opt-out (notice + "Do Not Sell or Share"). A blocking
banner there buys no protection and destroys the pixel signal this whole
epic exists to produce. Everywhere else — EU/EEA, UK (PECR), Switzerland,
Canada/Quebec, Brazil — is treated as opt-in, which is correct for the first
three and conservatively safe for the rest.

**Unknown resolves to `opt-in`.** Every ambiguous case is the strict case.

### D3 — Region is detected client-side from the timezone, never from IP
Reuse `countryForTimezone()` from
[phone-utils.ts:226](showcase/lib/phone-utils.ts#L226) through the
`useSyncExternalStore` pattern already proven in
[MarketSuggestion.tsx](showcase/components/market/MarketSuggestion.tsx) —
server snapshot `null`, read after mount.

Why not IP geolocation: the repo has already rejected it with reasons
([market-suggestion.ts](showcase/lib/market-suggestion.ts)) — pages stay
byte-identical for crawler and human and fully static. `request.geo` was
removed from `NextRequest` in Next 15, and showcase is not on Vercel (Docker
standalone, `output: "standalone"`), so there is no `x-vercel-ip-country` to
read. Reading a header in the layout would also force dynamic rendering on a
statically generated site.

Deliberately **timezone only** — `countryForTimezone()`, not
`detectBrowserCountry()`. The latter falls back to `navigator.language`, so a
French visitor whose browser is set to `en-US` with an unmapped timezone would
be classified US and tracked without consent. Dropping the fallback makes the
failure mode "a US visitor sees the EU banner", which costs data, not
compliance.

### D4 — Global Privacy Control is honoured, in both regimes
`navigator.globalPrivacyControl === true` with no stored choice ⇒ both
categories denied, and in the `opt-out` regime no notice is shown at all (the
visitor has already spoken). 12 US states require honouring GPC automatically
with no banner and no confirmation; it is the only US requirement that is a
hard requirement. An **explicit** stored choice always wins over GPC — GPC
only decides the no-record case.

### D5 — Two categories, two layers
Layer 1: `Refuse all` and `Accept all`, identical component, identical size,
side by side (CNIL: refusing must be as easy as accepting), plus a
`Customise` link. **No `×` / close affordance in the opt-in regime** — a
dismiss that isn't a choice is the classic dark pattern, and scrolling is not
consent. Layer 2: a dialog with two switches, both off by default, plus Save.

| Category | Vendors | Cookies |
|---|---|---|
| `analytics` | Google Analytics 4 | `_ga`, `_ga_*`, `_gid` |
| `marketing` | Meta, TikTok | `_fbp`, `_fbc`, `_ttp` |

Three categories were rejected as more granular than three tags justify.

Two clarifications the build forced. **"Both off by default" is about the
opt-in case**: for a US visitor with no stored record the categories genuinely
are on, so the dialog opens showing them on rather than misreporting the live
state. And the dialog carries a **Cancel**, which is not the forbidden
dismiss-that-is-not-a-choice: it closes a second-layer dialog and hands the
visitor back to the banner, which still demands an answer. Escape and the
backdrop do the same, by D6's design.

### D6 — Built in-repo, zero new dependencies
~All decision logic is pure and lives in `lib/`, because
`showcase/package.json` runs `bun test lib` — a test outside `lib/` does not
run in CI. The dialog uses the **native `<dialog>` element** with
`showModal()`: focus trap, Esc-to-close and `::backdrop` for free, no
`@radix-ui/react-dialog`, no new `bun audit` surface, and real a11y semantics
for the Lighthouse gate (`lighthouserc.js` fails the PR below 0.9 on a11y).

### D7 — PostHog is untouched
Stays `persistence: "memory"`, consent-independent. No storage on the device
means it is outside ePrivacy's consent requirement; it remains legitimate
interest disclosed in the privacy policy. It keeps working for refusers, which
is the only way to know what the refusal rate is. Sentry likewise
(`sendDefaultPii: false`, no replay, no cookie).

### D8 — One route allowlist, owned here, shared by the three pixels
The banner must not appear on `/[locale]/[slug]` — those are *our customers'*
customers scanning a QR code, not ad prospects, and STA-320 already decided no
pixel fires there. So the same predicate answers "may a tag fire here?" and
"should the banner show here?". It lands once, in `lib/consent-routes.ts`,
instead of three times.

Allowlist, not denylist: an unknown segment under a locale is a business slug.
A new marketing page silently missing the banner is benign; a café's customers
silently reaching TikTok is not. Built from the static folder names under
[app/[locale]/](showcase/app/[locale]/), which are already the localized route
names (`programme-fidelite`, `programa-de-fidelizacion`,
`program-lojalnosciowy`).

### D9 — Cookie storage
`stampeo_consent`, URL-encoded JSON `{"v":1,"a":0,"m":0,"t":<unix>,"r":"opt-in"}`,
`Max-Age` 6 months (CNIL: re-ask after at most 6 months — **including after a
refusal**, so a refuser is not re-nagged), `SameSite=Lax`, `Secure` in prod,
`Domain` from `NEXT_PUBLIC_COOKIE_DOMAIN` so `web/` can read the same choice
later. (Not `cookieDomainForHost()` as first sketched: that takes a request
host and belongs to middleware, whereas this is a client-side write with no
request in hand. `lib/last-login.ts`, the existing client-side cookie writer,
already reads the env var, and a test now pins both the set and unset cases.) Not `httpOnly` — the client must read it, and it is not a
credential. Written with the `document.cookie` idiom already in
[last-login.ts](showcase/lib/last-login.ts).

`v` is the consent version: bumping it when a vendor or category is added
invalidates every stored choice and re-asks. Malformed or unknown-version ⇒
treated as absent, never a throw.

### D10 — Revocation reloads
Going granted ⇒ denied deletes every cookie in `COOKIES_BY_CATEGORY` (on both
the host and `.stampeo.app`) and calls `window.location.reload()`. A running
`gtag`/`fbq` cannot be unloaded; pretending otherwise would be the dishonest
version. STA-318's plan already anticipates this ("STA-317 should hard-reload
on revoke").

### D11 — Cookie policy lives in the privacy page, not a new route
`legal/{en,fr,es,pl}/*privacy*.md` §5 currently states the site *"does not
require a cookie consent banner"* — that sentence becomes false the moment
this ships, in four languages. §5 is rewritten into a real Cookies section
with an essential-cookie table and the two optional categories named with
their vendors (CNIL requires purposes **and recipients** on the banner, so
naming GA4/Meta/TikTok as consent-gated offers is accurate today even though
the tags do not exist yet).

A separate `/cookies` route was rejected: it would mean 4 new markdown files,
a `FILE_MAP` entry, a route, a sitemap entry and 4 localized URLs, for content
CNIL is satisfied to see inside the privacy policy. The banner's "Learn more"
links to `/privacy#cookies`, which requires a new **stable legal ID** —
`rehypeStableLegalIds` in [lib/legal/mdx.ts](showcase/lib/legal/mdx.ts) maps
locale-specific auto-slugs to stable anchors, and without an entry the link
breaks in fr/es/pl.

## Already true, do not rebuild

- `countryForTimezone()` — [phone-utils.ts:226](showcase/lib/phone-utils.ts#L226)
- `cookieDomainForHost()` — [markets.ts:246](showcase/lib/markets.ts#L246)
- Client cookie read/write idiom — [last-login.ts](showcase/lib/last-login.ts)
- Post-mount client snapshot pattern — [MarketSuggestion.tsx](showcase/components/market/MarketSuggestion.tsx)
- `cn()` — [lib/utils.ts](showcase/lib/utils.ts); button styling vocabulary — [CTAButton.tsx](showcase/components/ui/CTAButton.tsx)
- Legal markdown pipeline + stable IDs — [lib/legal/](showcase/lib/legal/)
- Catalog parity enforcement — [lib/i18n-catalogs.test.ts](showcase/lib/i18n-catalogs.test.ts)

## Non-goals

- **GA4, Meta and TikTok themselves** (STA-318/319/320). This issue ships the
  gate and zero tags. No `NEXT_PUBLIC_GA_MEASUREMENT_ID` / pixel-ID env vars,
  no `Dockerfile` ARG changes.
- **Google Consent Mode v2 signals.** A later refinement if GA4 wants it.
- **Server-side consent logging / audit trail.** The cookie carries a
  timestamp, version and regime, which is the pragmatic proof-of-consent
  minimum for a site this size. A regulator-grade ledger is a separate issue.
- **`web/` and `admin/`.** Neither has a browser tracker. The cookie is
  domain-scoped so `web/` can read it later; nothing is wired there now.
- **Changing PostHog or Sentry.**
- **A `/cookies` route** (see D11).
- **IAB TCF / vendor-consent strings.** Not an adtech publisher.
- **Server-side UTM attribution for refusers.** Worth a follow-up issue, not
  this one: UTM params arrive in the URL, so carrying them through the
  onboarding handoff and recording them against the created account gives
  campaign-level attribution with no device storage and therefore no consent
  requirement. It is the compliant way to measure the slice the pixels cannot
  see. Out of scope here because it touches `web/` and the backend.

## Edge cases considered

- **SSG.** Showcase pre-renders per locale; a `document.cookie` read at module
  scope breaks the build. Every reader is `typeof window` guarded and returns
  the denying default on the server; the banner's server snapshot renders
  nothing, so there is no hydration mismatch and no page goes dynamic.
- **`/join` and `/go` bypass `app/[locale]/layout.tsx`** entirely (middleware
  matcher excludes them). No banner there — and no tag either, so consistent.
- **Banner vs. the other bottom-of-screen furniture.** `FloatingLanguageSwitcher`,
  `MarketSuggestion` and the Header promo banner already compete for edges.
  The consent banner takes the bottom and the language switcher offsets while
  it is visible, or they overlap on mobile.
- **A US visitor on an unmapped timezone** gets the opt-in banner. Costs data,
  not compliance. Accepted.
- **GPC on in the EU with no stored choice** ⇒ denied, and the banner still
  shows (the visitor may still opt in deliberately).
- **Consent granted mid-session** ⇒ `stampeo:consent` `CustomEvent` on
  `window`, so STA-318/319/320 can load without a reload (their AC9).
- **Third-party cookies blocked / storage refused** (Safari private mode,
  `document.cookie` throwing) ⇒ the write is try/caught, the choice holds for
  the session in memory, the banner does not reappear mid-session.
- **Malformed or stale-version cookie** ⇒ treated as absent, re-ask, no throw.
- **Business slug colliding with a marketing segment** (a café slugged
  `pricing`) ⇒ the allowlist treats it as marketing. One page view of blast
  radius, versus the denylist alternative leaking every business page.
- **Em-dashes.** `i18n-catalogs.test.ts` enforces a shrink-only em-dash ratchet
  in house style — banner copy must not add any.
- **Polish.** The issue says EN/FR/ES; the repo ships **four** locales and the
  parity test fails on a missing PL key. PL is required.

## Acceptance criteria

- **AC1** — Given a visitor in an `opt-in` region with no `stampeo_consent`
  cookie, when any marketing page loads, then `resolveConsent()` returns both
  categories denied, and NOT "denied for marketing but granted for analytics".
- **AC2** — Given the same visitor, when the banner renders, then it offers
  `Refuse all` and `Accept all` rendered by the same component at the same
  size, and NOT an `×` or any dismiss that is not a recorded choice.
- **AC3** — Given a detected US timezone and no cookie, when consent is
  resolved, then both categories are **granted** and the surface shown is the
  dismissible notice, not the two-button banner.
- **AC4** — Given `navigator.globalPrivacyControl === true` and no cookie,
  when consent is resolved in **either** regime, then both categories are
  denied; and in the `opt-out` regime no notice is shown at all.
- **AC5** — Given a stored choice, when GPC is also on, then the stored choice
  wins (explicit beats signalled).
- **AC6** — Given `Accept all`, when the page is reloaded, then the banner does
  not reappear and both categories read granted; same for `Refuse all` with
  both denied.
- **AC7** — Given a granted category, when the visitor revokes it from the
  preferences dialog, then every cookie in that category's list is deleted and
  the page reloads.
- **AC8** — Given a consent change, when it is committed, then a
  `stampeo:consent` `CustomEvent` is dispatched on `window` carrying the new
  state — the seam STA-318/319/320 subscribe to.
- **AC9** — Given a malformed, truncated or wrong-version cookie value, when
  it is parsed, then the result is `null` (treated as no choice) and NOT a
  thrown exception.
- **AC10** — Given an acquisition path (`/some-cafe`, `/fr/some-cafe`,
  `/fr/some-cafe/l/centre`), when route eligibility is evaluated, then it is
  not trackable and the banner does not render; and given every marketing
  segment under every one of the four locales — including
  `programme-fidelite`, `programa-de-fidelizacion`, `program-lojalnosciowy` —
  it is trackable.
- **AC11** — Given a new folder is added under `app/[locale]/`, when the suite
  runs, then the test fails unless that segment is classified either trackable
  or explicitly private, so a new page cannot silently fall either way.
- **AC12** — Given any showcase page in any of the four locales, when it is
  rendered on the server, then no consent value is read, the build succeeds,
  and every page that was static stays static.
- **AC13** — Given `bun run test`, `bun run lint`, `bunx tsc --noEmit` and
  `bun run build`, then all four pass, the catalog parity test included.
- **AC14** — Given the privacy page in any locale, then it no longer claims the
  site requires no cookie banner, it lists the essential cookies and the two
  optional categories with their vendors, and `/privacy#cookies` resolves to
  that section in all four locales. (Manual, Phase 5.)
- **AC15** — Given the banner and the preferences dialog, when Lighthouse runs
  in CI, then the a11y score stays ≥ 0.9.

## Files

**New — logic (all under `lib/`, so `bun test lib` covers it)**
- `showcase/lib/consent.ts` — types; pure `parseConsentCookie`,
  `serializeConsentCookie`, `consentRecordFromCookieHeader`,
  `consentCookieAttributes`, `consentRegimeForCountry`, `resolveConsent`,
  `consentSurface`, `cookieNamesToClear`, `CONSENT_VERSION`, `CONSENT_COOKIE`;
  browser-side `readConsentRecord`, `writeConsentRecord`, `clearCookiesFor`,
  `detectGpc`, `detectConsentRegime`, `emitConsentChange`,
  `subscribeToConsentChange`; and the seam the pixel issues consume:
  `hasAnalyticsConsent()`, `hasMarketingConsent()`, `CONSENT_CHANGED_EVENT`.
  *(These names supersede the `readConsent`/`writeConsent`/
  `clearCategoryCookies` sketch above; the three consumer names are unchanged,
  and Phase 6 amends STA-318/319/320 onto this list.)*
- `showcase/lib/consent.test.ts` — pure logic, plus a fake
  `document`/`window`/`navigator` for the browser half.
- `showcase/lib/consent-routes.ts` — `isTrackablePath()`, `MARKETING_SEGMENTS`,
  `PRIVATE_SEGMENTS`.
- `showcase/lib/consent-routes.test.ts` — includes the `readdirSync` drift
  guard for AC11.
- `showcase/lib/timezone-country.ts` — **unplanned but necessary.**
  `countryForTimezone` and its table, lifted out of `lib/phone-utils.ts` and
  re-exported from it. The banner renders on every page and `phone-utils`
  pulls `libphonenumber-js` plus its example-number data, so importing the
  helper from there would have put that payload in the global bundle on a site
  with a CI Lighthouse budget. Behaviour-preserving; still covered by the
  unmodified `lib/phone-country.test.ts`.
- `showcase/hooks/use-consent.ts` — `useConsent()`. D6 put this in
  `lib/consent.ts`; it sits in `hooks/` beside `use-detected-country.ts`
  instead, because `bun test lib` has no DOM and a React hook is therefore
  unrun wherever it lives. Deliberately thin: every decision it renders is
  made by a tested `lib/` function.

**New — UI**
- `showcase/components/consent/ConsentBanner.tsx` — `"use client"`,
  `useSyncExternalStore`, renders nothing on the server. Both surfaces.
- `showcase/components/consent/ConsentPreferences.tsx` — native `<dialog>`,
  two switches, Save.
- `showcase/components/consent/CookiePreferencesButton.tsx` — the footer entry;
  dispatches `stampeo:consent-open`.

**Modified**
- `showcase/app/[locale]/layout.tsx` — mount `<ConsentBanner />` beside
  `<FloatingLanguageSwitcher />`.
- `showcase/components/sections/Footer.tsx` — `CookiePreferencesButton` in the
  Legal column (async server component importing a client child: fine).
- `showcase/messages/{en,fr,es,pl}/common.json` — `common.cookies.*`
  and `common.footer.cookiePreferences`. Reusing the existing `common`
  namespace avoids touching the hand-written import list in
  [i18n/request.ts](showcase/i18n/request.ts).
- `showcase/legal/{en,fr,es,pl}/<privacy>.md` — §5 rewritten (D11).
- `showcase/lib/legal/mdx.ts` — a `cookies` stable legal ID.

**Copy:** written per the `stampeo-copywriting` skill, four locales, no
em-dashes, Polish plural arms respected.

## Risks

- **Legal posture is the headline risk.** A regression here is exposure, not a
  bug. AC1/AC3/AC4/AC10 are the tripwires.
- **`.claude/worktrees/legal-retention/`** holds a parallel copy of the tree
  including legal text. Check for in-flight legal edits before rewriting §5 or
  expect a conflict.
- **The three sibling draft plans conflict with this design** — each names a
  different stub. They must be amended at Phase 6 (STA-318: `readAnalyticsConsent`
  → `hasAnalyticsConsent`, drop the "STA-318 owns the read side" decision;
  STA-319: drop the `hasMarketingConsent` hard-`false` stub and AC1; STA-320:
  drop `readMarketingConsent` and AC6, and the route allowlist moves here).
- **Lighthouse a11y gate** fails the PR below 0.9. A modal is the most likely
  way to break it.
- **Dev server blocks the showcase build** — stop it before `bun run build`.
- **CI test path scoping**: `bun test lib`. Logic outside `lib/` is untested by
  construction.

## Verification

```bash
cd showcase
bun test lib     # AC1, AC3-AC11 (AC2 and AC15 are component-only: manual)
bun run lint && bunx tsc --noEmit && bun run build   # AC12, AC13 (stop dev first)
```

Manual, on `app.dev.stampeo.app`'s sibling showcase dev host, DevTools →
Application → Cookies, and Network filtered to `googletagmanager|facebook|tiktok`:

1. **EU path** — fresh profile, `Europe/Paris`. Banner shows two equal buttons.
   Only `NEXT_LOCALE` present. `Refuse all` → banner gone, `stampeo_consent`
   with `a:0,m:0`, reload → still gone. (AC1, AC2, AC6)
2. **US path** — OS timezone `America/New_York`, clear cookies. Notice bar, not
   the banner; consent resolves granted. (AC3)
3. **GPC** — set `globalPrivacyControl` in a browser that supports it (or Brave)
   in both timezones: denied in both, and silent in the US. (AC4)
4. **Revoke** — Accept, then footer → *Cookie preferences* → turn Marketing off
   → Save. Page reloads, category cookies gone. (AC7)
5. **Corrupt cookie** — set `stampeo_consent=%7Bnope` by hand, reload: banner
   returns, no console error. (AC9)
6. **Acquisition page** — open a seeded business slug in all four locales: no
   banner. (AC10)
7. **Legal** — `/privacy#cookies`, `/en/privacy#cookies`, `/es/privacy#cookies`,
   `/pl/privacy#cookies` all land on the Cookies section; the "no banner
   required" sentence is gone in all four. (AC14)

Then Phase 3 (`coverage-auditor`; no auth/billing/webhook/migration paths, so
no `security-reviewer`), Phase 4 (`docs/qa/cookie-consent.md`, a new area),
Phase 5 manual QA, Phase 6 docs decision + the three plan amendments above.
