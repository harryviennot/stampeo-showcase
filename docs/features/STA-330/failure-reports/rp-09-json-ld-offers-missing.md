CASE: RP-09
VERDICT: FAILED
SEVERITY: CORE
RUN: 2026-09-21, `feat/sta-330-region-detected-pricing` at `fd8c880`
SURFACE: `https://showcase.dev.stampeo.app`
ACCOUNT: `No session (raw HTTP fetch and public-page DOM inspection)`

## Failed at

Step 3: In each, read the SoftwareApplication offers and the FAQPage answers.

## Expected

`/` JSON-LD quotes EUR amounts; `/us` JSON-LD quotes USD amounts. FAQ JSON-LD answers contain real numbers and do NOT contain the literal text `{starterPrice}`, `{trialDays}`, or any other `{...}` token. The visible-HTML price slots in the curl output contain skeleton markup, not amounts — that is expected.

## Actual

Both `/` and `/us` expose four JSON-LD blocks after the page loads. The `jsonld-SoftwareApplication` block contains no `offers` field and no `priceCurrency` value on either page. The `jsonld-FAQPage` block contains resolved numbers and no pricing placeholders.

The public dev pricing API was reachable during the observation: both `GET /public/plans?currency=eur` and `GET /public/plans?currency=usd` returned HTTP 200 with complete three-tier ladders.

## Evidence

- URLs: `https://showcase.dev.stampeo.app/` and `https://showcase.dev.stampeo.app/us`
- Browser DOM inspection found `jsonld-Organization`, `jsonld-WebSite`, `jsonld-SoftwareApplication`, and `jsonld-FAQPage`; `jsonld-SoftwareApplication` was 273 characters long and had neither `offers` nor `priceCurrency`.
- `https://api.dev.stampeo.app/public/plans?currency=eur` returned HTTP 200 with EUR Starter/Growth/Pro amounts.
- `https://api.dev.stampeo.app/public/plans?currency=usd` returned HTTP 200 with USD Starter/Growth/Pro amounts.

## State at time of failure

- Session: no session for the raw HTTP/API checks
- Preceding cases this run: RP-05 and RP-06 passed; US-spoof and unknown-region cases were not executable in the available browser
- Relevant data: showcase branch commit `fd8c880`; checked at approximately 2026-09-21 16:20 Europe/Paris

## Aftermath

- RESET performed: none needed
- Dependents skipped: none
- Run continued: yes

## Hypothesis (optional, clearly speculative)

The deployed showcase appears to be rendering its baked fallback ladder even though the public dev pricing endpoint is healthy, so `softwareApplicationJsonLd()` deliberately suppresses Offer data.

## Resolution (2026-09-21, fix track)

ROOT CAUSE: environmental, not product. `showcase.dev.stampeo.app` tunnels to the
LOCAL dev server, whose `.env.local` pinned `NEXT_PUBLIC_API_URL` to a stale LAN
IP (`http://10.1.241.183:8000`, unreachable — the machine no longer holds a 10.x
address). Every `getPlanCatalog` call therefore fell into the baked fallback, and
`softwareApplicationJsonLd` SUPPRESSED Offers exactly as designed (`isFallback`
guard: never assert an uncertain price to a machine). The healthy
`api.dev.stampeo.app` the QA agent probed was never the server's target.

FIX: `.env.local` repointed to `https://api.dev.stampeo.app` (local config, not
committed). Re-verified after restart: `/` JSON-LD carries EUR Offers
(price "20", priceCurrency EUR), `/us` carries USD Offers, FAQ JSON-LD
interpolated, no leftover tokens in rendered output.

REGRESSION TEST: none — no product code changed; the guard's behavior is already
covered (`resolveRegionLadder` tests + the JSON-LD omission is pre-STA-330
behavior). The runbook now carries the environmental check instead (see RP-09
amendment in docs/qa/region-pricing.md).
