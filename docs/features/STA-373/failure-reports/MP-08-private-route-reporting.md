CASE: MP-08 (new — no existing case covered a client-side hop onto a private route)
VERDICT: FAILED
SEVERITY: BLOCKER
RUN: 2026-10-02/03, production stampeo.app, showcase `dev` @ 1ed3c48
SURFACE: web build (production), headless Chromium 1.61 with a desktop Chrome user agent
ACCOUNT: none (anonymous visitor)

## Failed at

A US visitor (opt-out regime, pixel loads without a click) lands on `/en`,
clicks two buttons on the page, then navigates client-side through the header
to `/en/loyalty-programs`, `/en/onboarding`, `/en/login`, and clicks
**Continue** on the onboarding form.

## Expected

From `lib/consent-routes.ts` and MP-02: nothing reaches Meta from a private
route (`/onboarding`, `/login`, `/reset-password`, `/email-preferences`) or a
business enrollment page. Only the events our code sends, each gated by
`isTrackablePath`, leave the browser.

## Actual

Requests to `facebook.com/tr` during the run:

```
PageView              @ /en
SubscribedButtonClick @ /en               "Stamps"
SubscribedButtonClick @ /en               "Points"
PageView              @ /en/loyalty-programs
PageView              @ /en/onboarding
SubscribedButtonClick @ /en/onboarding    "Continue"
PageView              @ /en/login          (separate run)
```

An `fbq` call recorder showed our code made no call for the `/en/onboarding`
PageView, and none of the `SubscribedButtonClick` events. Each
`SubscribedButtonClick` POST carried ~9 KB of page metadata.

Google Analytics on the same run sent `page_view` for `/en` and
`/en/loyalty-programs` only: GA4 is not affected.

## Evidence

- Pixel config served for 1088158323750710 enables `inferredEvents` (automatic
  button-click events) and `microdataFieldTransmission`.
- `fbevents.js`: `if(t.fbq.disablePushState!==!0 && …){ … automaticPageView.trigger() }`
  installs a History API listener unless `disablePushState` is true.
- Injecting `disablePushState`, `allowDuplicatePageViews` and
  `fbq('set','autoConfig',false,id)` into production by init script reduces
  the same run to `PageView @ /en` and `PageView @ /en/loyalty-programs`.
- `disablePushState` alone also drops our own `/en/loyalty-programs` PageView.

## State at time of failure

- Session: no session
- Preceding cases this run: none (ad-hoc audit of the live pixel)
- Relevant data: timezone America/New_York; no consent cookie (US default)

## Aftermath

- RESET performed: none needed (fresh browser context per run)
- Dependents skipped: none
- Run continued: yes

## Hypothesis (optional, clearly speculative)

Meta's script reports on its own (history-change PageViews and automatic
button-click events) without consulting our route gate; MP-03's premise that
"Meta only fires PageView at init" is what let this through.
