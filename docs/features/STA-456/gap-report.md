# Gap Report: STA-456
AUDITED: 2026-10-13  DIFF: origin/dev (3c23ee2)..feat/sta-456-in-app-signup
VERDICT: DRIFT FOUND (gaps found too)

## Criteria without tests (component wiring; no component runner, runbook only)
- AC2 (IA-01), AC3 (RB-01/02), AC4 "no signInWithOAuth on the tap" (IA-02), AC5 fallback + continue-here (IA-03), AC11 (PW-02), AC12 "refused before any request" (PW-01).
- AC6 resend on a resumed sign-in record (must call signInWithOtp, not resendOtp): no test of any kind.
- AC9 OAuth half (clearDraft now clears the resume record): no test.
- AC10: no check before release (dev has no PostHog key).

## Untested diff behavior
- AuthenticationStep routeExistingUserToOtp writes a resume record even when both sends fail.
- OnboardingWizard reads resume once; a just_authed=oauth return without session → router.replace does not re-read.
- Resume cleared on any phase other than "verify" (only RS-06 covers the form phase).
- InAppAuthChooser "continue here" error path.
- reset-password aria-describedby now always set.

## Drift (in diff, not in plan)
- In-app + desktop platform → straight OAuth, no escape, no event.
- navigate() throwing → "stayed" (tested).
- Resume record with sentAt in the future → rejected (tested).

## Suspect tests
- browser-escape "still visible when the wait ends": advance(1499)+advance(1) without an assertion between; 1500 ms never pinned.
- browser-escape "pagehide = left" bakes in the Android-without-Chrome loop (browser_fallback_url loads in the same WebView).
- in-app-browser: the "Gmail" case is the Google app (GSA); LinkedIn UA is cut down.
- onboarding-resume "lifetime is one hour" asserts a constant.
- Runbook cites non-existent ids (OS-04, OS-05, OS-07, OS-09, OS-10, OS-17).

## Missing workflow tests
- Android without Chrome (likely loops back to step 1 instead of showing the fallback).
- Meta pixel / STA-373 regression on /onboarding after the escape.
- Meta "Leave Instagram?" / iOS "Open in Safari?" prompt held past 1.5 s then accepted (counts as failed, skews AC10).
- Resend on a resumed screen, then reload.
- Two tabs on one record.
- Exact 60:00 boundary (> vs >=).

## Waivers
(none)

---

# Gap Report: STA-456, final pass
AUDITED: 2026-10-13  DIFF: dev@3c23ee2..feat/sta-456-in-app-signup (HEAD 235bcd5)
VERDICT: DRIFT FOUND (gaps too)

The audit read the runbook before the coordinator recorded the later QA results. RS-01..08, AN-02, the IA-06 re-run and IA-08 have since passed (see the runbook's Known state), which closes the "not run" gaps for AC6, AC9, AC10, AC11 and AC13 (cookies).

## Acted on (final fix round)
- The guide's address swap made tracking components see `/start` on `/onboarding` → tracking reads the held real route, and PostHog pageviews are dropped while held (same as security LOW).
- `/start` forwarded on any `stampeo_src`, stale included → forward only on a cookie written this visit, or at the ceiling; the suspect test is replaced.
- The `FBAV` and `FB4A` regex alternatives were never isolated → dedicated fixtures.
- Plan drift → plan updated: new files, the guide's account note, the `/start` footer, `start` reserved (prod slug check before release), the stale edge cases, AC5's desktop exception.

## Accepted, covered by QA only (no component runner)
AC2/AC3 dispatch, AC5 wiring (guide open/close/focus/address), the chooser double-tap and re-open sequences, and the wizard reading the record. The in-app reload while the guide is open → `/start` forwards to step 1 (plan edge case).

## Waivers
(none)
