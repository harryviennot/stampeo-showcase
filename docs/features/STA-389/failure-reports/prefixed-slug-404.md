CASE: none (no runbook case covered shop URLs whose slug shares a prefix with a route handler)
VERDICT: FAILED
SEVERITY: BLOCKER
RUN: 2026-10-07, prod (stampeo.app), showcase dev @ 253fdf4
SURFACE: showcase, public enrollment page
ACCOUNT: none (anonymous visitor, as a customer scanning a counter QR code)

## Failed at

GET `https://stampeo.app/good-vibe-lemonade-and-more` with `Accept-Language: fr-FR`.

## Expected

The shop's enrollment page renders (200), as it does for every other active
shop: `https://stampeo.app/kippa` with the same header returns 200.

## Actual

404. The body is the site's not-found page under the marketing `<title>`.

## Evidence

```
$ curl -s -o /dev/null -w "%{http_code}" -H "Accept-Language: fr-FR" https://stampeo.app/good-vibe-lemonade-and-more
404
$ curl -s -o /dev/null -w "%{http_code}" -H "Accept-Language: fr-FR" https://stampeo.app/kippa
200
```

## State at time of failure

- Session: none
- Preceding cases this run: none
- Relevant data: `businesses.url_slug = 'good-vibe-lemonade-and-more'`, active,
  created 2026-07-27, 1 customer. It is the only prod or dev slug starting with
  `api`, `auth`, `go`, `join`, `internal` or `qr` (dev has `golden-hour-coffee`).

## Aftermath

- RESET performed: none needed (read-only GETs)
- Dependents skipped: none
- Run continued: yes

## Hypothesis (optional, clearly speculative)

The middleware matcher `/((?!api|auth|go|join|internal|_next|_vercel|.*\..*).*)`
excludes every path that merely starts with `go`, so the slug never reaches the
acquisition rewrite. `go` entered the list in 758485f (2026-06-17).
