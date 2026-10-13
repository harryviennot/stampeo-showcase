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
