# Plan: /qr redirect for the business cards

ISSUE: STA-388 (https://linear.app/stampeo/issue/STA-388/add-qr-redirect-on-stampeoapp-for-the-new-business-cards)
BRANCH: feat/sta-388-qr-redirect (showcase, stacked on fix/sta-389-matcher-segment-boundary)
REPOS: showcase
MIGRATION: no
STATUS: APPROVED (2026-10-07, Harry, with utm_campaign added)

## Problem

500 business cards printed on Vistaprint carry a static QR code that encodes
`https://stampeo.app/qr`. That path does not exist: the middleware takes `qr`
for a shop slug, rewrites it to the enrollment page, and the page 404s
(verified on prod 2026-10-07). It has to work before the cards arrive.

## Decisions

- Route handler at `app/qr/route.ts`, built like `app/go/app/route.ts` (the existing
  QR redirect), not a `next.config.ts` redirect: it can be unit-tested with
  `bun test` and it sits beside the redirect it resembles.
- Status 302, `Cache-Control: no-store`: the destination can change later, and
  no browser or proxy keeps a cached copy of the hop.
- Relative `Location: /?utm_source=card&utm_medium=qr&utm_campaign=business-cards-2026-10`: one build behaves the same on
  prod, dev and localhost. A dev scan stays on dev and never adds a test visit
  to prod analytics, and nothing depends on `request.url`, which reads
  `localhost` behind the proxy.
- The incoming query string is dropped. The printed code carries none, and a
  fixed destination is the whole contract.
- `qr` joins `RESERVED_TOP_SEGMENTS` and the middleware matcher's exclusions,
  matched on the WHOLE first segment (`qr(?:/|$)`), so a future shop slugged
  `qrious-cafe` still reaches its enrollment page (see Touched areas: today's
  `go` exclusion is a bare prefix and already breaks a prod shop).
- `utm_campaign=business-cards-2026-10` added to the ticket's two tags, so a later
  reprint can be told apart from this batch (GA would otherwise show "(not set)").
- No new tracking code. The homepage already reads UTMs (see Analytics below).

## UX decisions

No UX pass (DESIGN or POLISH): the change is a server redirect onto the
existing homepage, which stays as it is. No screen is added or changed.

## Analytics: what a card scan produces

Nothing is sent from `/qr` itself. The visitor lands on `/?utm_source=card&utm_medium=qr&utm_campaign=business-cards-2026-10`
(an English or Polish phone is sent on to `/en?…` / `/pl?…` with the UTMs kept,
checked on prod), and the existing tags handle the rest:

- **PostHog**: every scan. It runs cookieless (`persistence: "memory"`) without
  waiting for consent, and its automatic `$pageview` carries the UTMs. This is
  the count that stays complete.
- **GA4**: only visitors who accept analytics cookies. gtag.js loads at that
  moment and reads the campaign from the current URL, so GA files the session
  under source `card` / medium `qr` if the visitor accepts while still on the
  landing page. Someone who refuses, or browses to another page before
  answering, never reaches GA as a card visit.
- **Meta**: only with marketing consent. The pixel's PageView includes the URL,
  but Meta attributes on its own click ids (`fbclid`), not UTMs: a card scan
  never appears as a campaign result in Ads Manager. At most it adds the
  visitor to a website audience. No CAPI event, because the server-side ad
  carrier is only written when there is a paid click id.
- **Sign-up attribution** (`stampeo_src` cookie, either consent category): if
  the visitor later signs up, the business record carries source `card`.

## Non-goals

- Fixing the matcher's prefix bug for `api|auth|go|join|internal`: a separate
  fix-track issue (see Touched areas).
- A server-side scan counter that works without consent.
- Per-card or per-batch codes (`/qr?c=…`), A/B destinations, or a landing page
  written for card holders.

## Edge cases considered

- `/qr/` with a trailing slash: Next's default 308 to `/qr`, then the 302. Same destination.
- `/QR` in uppercase: unhandled. Paths are case-sensitive, so `/QR` is still
  read as a shop slug and 404s. It only matters if the printed code was
  uppercased. The phone scan in Done-when shows the encoded URL, and fixing it
  then is a small middleware addition.
- `HEAD /qr` (link previewers, some scanner apps): Next answers HEAD with the
  GET handler. Checked live with `curl -I`.
- `www.stampeo.app/qr`: the middleware's www→apex 301 runs first, then `/qr`.
  Checked live.
- A shop slugged `qr`: none on prod or dev (checked 2026-10-07). The dashboard's
  slug check already rejects slugs under 3 characters.
- A shop slug that starts with `qr` (e.g. `qrious-cafe`): still goes through the
  middleware to its enrollment page (AC3).

## Acceptance criteria

- AC1: Given any visitor, when they GET `/qr`, then the response is 302 with
  `Location: /?utm_source=card&utm_medium=qr&utm_campaign=business-cards-2026-10` and `Cache-Control: no-store`, and NOT a 307/308
  or an absolute URL built from the request host.
- AC2: Given a GET `/qr?anything=1`, then the Location is exactly the same fixed
  destination (the incoming query is not forwarded).
- AC3: Given the middleware matcher, `/qr` and `/qr/` are excluded from it, and
  `/qrious-cafe`, `/qrious-cafe/l/store` and `/kippa` are NOT excluded (they
  still reach the enrollment rewrite).
- AC4: `acquisitionSlug("/qr")` is null (`qr` is in `RESERVED_TOP_SEGMENTS`), so no
  caller treats it as a shop.
- AC5 (live, dev): `curl -L` on `showcase.dev.stampeo.app/qr` ends 200 on the
  homepage with all three UTMs in the final URL, for `fr`, `en` and `pl`
  Accept-Language. `curl -I` answers HEAD with the same 302.
- AC6 (live, prod, Harry): scanning a printed card on one iPhone and one Android
  phone opens the homepage with the UTMs, and after accepting cookies the visit
  appears in GA4 Realtime under source `card` and in PostHog with
  `utm_source = card`.

## File layout

- NEW `app/qr/route.ts`: a one-line `GET`, next to `app/go/`.
- NEW `lib/routing/card-qr.ts`: the destination and the response. In `lib/`
  because CI only runs `bun test lib scripts`, and in a new `routing/`
  subfolder because `lib/` already holds 88 entries.
- NEW `lib/routing/card-qr.test.ts`: AC1–AC2, through the route's own `GET`.
- `middleware.ts`: one matcher entry. It is 135 lines.
- `lib/locale-negotiation.ts` (+ its test): `qr` in the reserved set. 178 lines.
- `lib/middleware-matcher.test.ts` (added by STA-389): AC3 cases for `qr`.

## Touched areas and risks

- **The matcher regex**: one wrong character excludes real shop pages from the
  middleware. AC3 pins it.
- **Existing bug found while planning, fixed separately as STA-389** (this
  branch is stacked on it): the matcher's
  exclusions are bare prefixes. `go` also excludes every slug that starts with
  "go", so `stampeo.app/good-vibe-lemonade-and-more` (active prod shop, created
  2026-07-27) returns 404 today, while `stampeo.app/kippa` returns 200.
  The same applies to slugs starting with `api`, `auth`, `join`, `internal`.
  Since 2026-06-17 (758485f).
- Analytics: no change to any tag, consent, or attribution code.

## Docs impact (preliminary)

Probably none. Business owners never see the card redirect.
