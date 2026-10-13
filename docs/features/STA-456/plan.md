# Plan: Account creation that works inside the Instagram/Facebook in-app browser

ISSUE: STA-456 (https://linear.app/stampeo/issue/STA-456)
BRANCH: feat/sta-456-in-app-signup (worktree `showcase/.claude/worktrees/sta-456`, cut from `dev` at 3c23ee2)
REPOS: showcase
MIGRATION: no
STATUS: APPROVED (2026-10-13, Harry: hybrid version, with the recommended answers to every open question)

## Problem

Meta ads send US phone users to `stampeo.app/us`, and almost all of them browse
inside the Instagram or Facebook in-app browser. On the second signup step the
first two options are "Continue with Google" and "Continue with Apple". That
browser has none of the phone's Google or Apple logins, so both buttons mean
typing full credentials. All 6 paid visitors who reached that step tapped one,
left, and never came back: 0 accounts from 188 paid sessions.

The email path has a second weak spot. Which screen the visitor is on and their
email live only in memory, so if the in-app browser reloads or closes while
they fetch the code from their mail app, they're sent back to step 1.

## Evidence (PostHog, project 141822, 3–13 Oct 2026)

Paid = session entry `utm_medium = paid`. All paid sessions land on `/us`; all
are US and about 98% mobile. Device split: iOS 122, Android 41.

| Paid funnel | Sessions |
|---|---|
| Landed on `/us` | 188 |
| Hero CTA (`landing_cta_clicked`, sends Meta `Lead`) | 10 |
| `onboarding_wizard_started` | 10 |
| `onboarding_step_completed` user_info | 6 |
| `onboarding_step_completed` authentication | **0** |

- **Browser of paid sessions:** Instagram in-app 88, Facebook in-app 59, real browsers 16.
- **The 6 step-1 finishers** each fired `$pageleave` 4–8 s after step 1, on the chooser. That's too fast to type an email and password, so it was an OAuth tap. None returned to `?just_authed=oauth`.
- **OAuth isn't hard-blocked in-app:** 13 in-app returns over 60 days (6 Apple on iOS, 4 Google on Android, 3 Google on iOS), against 291 from real browsers.

| Account step, all traffic, 30 days | Step 1 | Step 2 | Rate |
|---|---|---|---|
| Desktop/tablet | 44 | 11 | 25% |
| Phone browser | 102 | 16 | 16% |
| Instagram/Facebook in-app | 14 | 1 | 7% |

**Caveats:**
- 6 people is a small sample.
- A visitor who finishes later in another browser is a different PostHog person and isn't linked.
- The step-2 rates are session-scoped, so they undercount OAuth round-trips that start a new session.
- Ads Manager (spend, CPM, CTR) was not read.

## Decisions

- **The trigger is the in-app browser, not the traffic source.** An organic visitor from an Instagram bio link has the same problem.
- **Hybrid, not removal.** In-app, Google and Apple stay on the chooser, below email. A tap first tries to reopen the page in the phone's real browser, where the saved Google or Apple login lives. The page can't force that on iOS (Apple allows no reliable way, and Meta blocks the known tricks inconsistently). Android's `intent://` to Chrome works on a tap.
- **When the switch fails**, the visitor gets a choice: the "Tap ••• → Open in browser" instruction, or continue with Google or Apple right here (today's behaviour). Today's in-app OAuth went 0 for 6 for paid visitors, so we don't send them back into it silently.
- **Real browsers and `/login` are unchanged.** An owner whose account is Google-only or Apple-only has no password, so changing `/login` in-app could lock them out.
- **The escape link carries no personal data** (URLs reach analytics). It carries `utm_*` (from `stampeo_src`) and `fbclid` (from `stampeo_ad`). `AttributionCapture` runs from the `[locale]` layout on every page, so Safari records them on its first load.
- **Password rules:** minimum 8 characters, no character-class rules, on both signup and `/reset-password`. The cloud projects enforce only a 6-character minimum, with no character classes and leaked-password protection off (STA-421 notes), so the client is the stricter side. Existing passwords are untouched; `/login` never checks rules. Code-only signup is a separate issue: `/login` has no code sign-in yet.
- **Resume storage:** localStorage, so it survives Instagram closing its browser while the visitor is in Mail. It expires 60 min after the code was sent (the code's own lifetime), is cleared on completion, and never holds the password.
- **In-app browsers in scope:** the Meta family (Instagram, Facebook, Messenger, Threads). Others are treated as real browsers.
- **Analytics:** onboarding events carry `in_app_browser`, and two new events measure the escape. That tells us how often the iOS switch actually works.
- **A real-device check is required before release:** iPhone + Android, inside Instagram and Facebook.

## UX decisions

Built on `ux-brief.md` (ux-designer, MODE: DESIGN), adjusted to the hybrid that Harry chose after the brief.

- **PLACEMENT:** step 2 of `OnboardingWizard.tsx` / `AuthenticationStep.tsx`; no new route. `/login` and the shared `AuthMethodChooser` keep today's behaviour.
- **ENTRY:** landing CTA → step 1 → Continue → step 2 chooser. In-app, it reads Email, Google, Apple. Resume: a reload or return within 60 min reopens the existing code screen.
- **ADDED: email first on the in-app chooser.** Removes a step: email is the one path that always works in-app (AC2).
- **ADDED: Google/Apple in-app try the real browser first.** Prevents a mistake: the saved login lives there (AC4, AC5).
- **ADDED: an inline fallback after a failed switch.** It shows one instruction line ("Tap ••• then Open in browser") and a "Continue with {Google|Apple} here" button. Answers "nothing happened" and keeps today's path one tap away (AC5).
- **ADDED: `autoComplete="email"` / `"new-password"` on the email form.** Removes a step (AC11).
- **ADDED: `verifyMode` restored together with step, phase and email on resume.** Prevents a wrong-code-type error (AC6).
- **ADDED: one password rule ("At least 8 characters") instead of a five-line checklist.** Removes a step (AC12).
- **REJECTED:**
  - an escape banner on step 1 or the landing page (pushes everyone out before email gets a chance);
  - an automatic browser switch on load (blocked on iOS and jarring);
  - hiding Google/Apple in-app (Harry's call: keep them);
  - an "Open Mail" button;
  - a "welcome back" note;
  - restoring the resend cooldown;
  - prefilling step 1 through the URL;
  - "copy link";
  - any change on `/login`.
- **MOBILE (390px, Instagram on iOS):** the chooser card shows three full-width h-14 rows: Email, Google, Apple. After a failed switch, a muted `text-sm` instruction line (polite live region) and a secondary "Continue with … here" button appear under the tapped row, inside the card. No sheet, no dialog, no hover. There's no flash, because step 2 renders only after a tap on step 1 or after the auth spinner, so the user-agent check has always run.
- **REUSES:** `MethodButton` (exported as-is from `AuthMethodChooser.tsx`), `hooks/useDevicePlatform.ts`, the existing code screen, `parseSourceCookie` / `parseAdCookie`.
- **NEW:** `components/onboarding/steps/InAppAuthChooser.tsx`. The escape-then-fallback behaviour must not live in the shared chooser that `/login` renders.

## Non-goals

- Ads Manager, campaign structure, Instant Forms, Meta CAPI or pixel changes.
- Backend, Supabase auth config, email templates, OTP expiry.
- The web dashboard and the scanner app.
- Linking a visitor's in-app and real-browser PostHog identities.
- `/login`, and the shared `AuthMethodChooser` behaviour.
- Code-only (passwordless) signup.

## Edge cases considered

- **Storage unavailable** (private mode, quota): no resume, and the flow works exactly as today.
- **Return after the code expired** (60 min): the resume record is ignored and removed. The wizard opens on step 1 with the draft name/phone, NOT a dead code screen.
- **Reload within 60 min:** the code screen shows the email, resend and "use a different email". The resend cooldown restarts at 0 (accepted; Supabase rate-limits on its side).
- **"Use a different email" on a resumed screen:** goes to the email form and drops the resume record.
- **Already signed in on reload:** the existing redirect to the app wins over resume.
- **OAuth return** (`?just_authed=oauth`): unchanged; resume is not read on that path.
- **Switch succeeds** (page hidden within the wait): nothing more happens in-app. If the visitor comes back to Instagram, the chooser is as they left it.
- **Switch fails** (page still visible after the wait): the fallback appears. Tapping "Continue with … here" runs today's `signInWithOAuth` with today's stash.
- **Android without Chrome:** the intent's `browser_fallback_url` is the same https URL, so the visitor stays in-app, the wait expires, and the fallback appears.
- **Meta's in-app browser shows its own "Leave Instagram?" confirm:** the page is still visible, so the fallback may appear under the confirm. That's harmless: both choices still work.
- **Escape to the real browser:** the visitor lands on step 1 and re-types the name (the draft doesn't cross browsers).
- **Attribution cookies absent** (no consent, direct visit): the escape URL carries no parameters, just the onboarding path.
- **Unknown or non-Meta in-app browsers** (TikTok, LinkedIn): treated as real browsers (today's behaviour).
- **Existing account on the email path:** unchanged (sign-in code, `verifyMode = signin`). The resume record keeps `signin` so the code verifies.

## Acceptance criteria

- **AC1:** Given a user-agent string, when classified, then Instagram (iOS + Android), Facebook (`FBAN`/`FBAV`/`FB_IAB`/`FB4A`), Messenger (`MessengerForiOS`/`Orca`) and Threads (`Barcelona`) return their name. Safari, Chrome (`CriOS` + Android), Samsung Internet, Firefox, desktop browsers, Gmail and LinkedIn/TikTok in-app return null. Parametrized over real UA strings.
- **AC2:** Given an in-app visitor on step 2, then the chooser shows Email first, then Google, then Apple.
- **AC3:** Given a real-browser visitor, then step 2 shows today's chooser (Google, Apple, Email) with today's behaviour. And `/login` is unchanged in every browser, in-app included.
- **AC4:** Given an in-app visitor on Android, when they tap Google or Apple, then the page navigates to `intent://<host>/<locale>/onboarding?<params>#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=<same https url>;end`. On iOS it navigates to `x-safari-https://<host>/<locale>/onboarding?<params>`. `<params>` holds only the `utm_*` and `fbclid` from the attribution cookies, NOT name, phone or email. `signInWithOAuth` is NOT called on that tap.
- **AC5:** Given the switch attempt, when the page becomes hidden (`visibilitychange` → hidden, or `pagehide`) within 1500 ms, then nothing else happens. When it stays visible for 1500 ms, the instruction line and a "Continue with {provider} here" button appear. Tapping that button runs today's OAuth (stash + `signInWithOAuth`).
- **AC6:** Given a visitor on the code screen for email x (sign-up or sign-in code), when the page reloads, or the browser is closed and `/onboarding` reopened within 60 min of the code being sent (or re-sent), then the wizard opens on that code screen for x, with the same `verifyMode` and the name/phone draft. Verify, resend and "use a different email" all work.
- **AC7:** Given the same visitor more than 60 min after the last send, then the wizard opens on step 1 with the draft, NOT on the code screen, and the expired record is removed.
- **AC8:** Given any point in the flow, then the password is never written to localStorage, sessionStorage or a URL.
- **AC9:** Given a successful verify or OAuth completion, then the resume record is removed together with the existing draft.
- **AC10:** Then `onboarding_wizard_started` and `onboarding_step_completed` carry `in_app_browser` (the classified name or null). An escape tap fires `onboarding_browser_escape_attempted` {provider, platform, in_app_browser}. The fallback appearing fires `onboarding_browser_escape_failed` {provider, platform, in_app_browser}. None of these carry an email.
- **AC11:** Given the email form in any browser, then the email input has `autoComplete="email"` and the password input `autoComplete="new-password"`.
- **AC12:** Given the signup form or `/reset-password`, then a password of 8+ characters is accepted whatever its character mix (e.g. `abcdefgh`). 7 characters is refused before any request is made. The visible requirement is the single line "at least 8 characters" in all four locales.

## File layout

- `lib/auth/in-app-browser.ts` (+ test): `classifyInAppBrowser(ua)` and `buildBrowserEscapeUrl({platform, origin, path, params})`, both pure. (`lib/` has 90+ entries; `lib/auth/` has 11.)
- `lib/auth/browser-escape.ts` (+ test): `attemptBrowserEscape({navigate, doc, win, timeoutMs})` resolves `"left" | "stayed"`. Its document, window and timers are injected so the test drives them.
- `lib/auth/escape-params.ts` (+ test): `escapeParamsFromCookies(cookieHeader)` gives the `utm_*` from `stampeo_src` and the `fbclid` from `stampeo_ad`, and nothing else.
- `lib/auth/onboarding-resume.ts` (+ test): read, write and expiry of `{v, step, phase, email, verifyMode, name, phone, sentAt}` in localStorage, with storage and clock injected.
- `lib/auth/password-rules.ts` (+ test): one `isPasswordAcceptable(pw)` (length ≥ 8) shared by signup and reset-password.
- `components/onboarding/steps/InAppAuthChooser.tsx`: the in-app chooser, escape, fallback and its analytics.
- `components/onboarding/steps/AuthenticationStep.tsx` (554 lines, already over the cap): only the mount switch, the `verifyMode` lift (for resume), the `autoComplete` attributes and the password-rule swap. These must not grow it. Move the password checklist block to a small `PasswordRequirement` sub-component if needed, to stay ≤ 554.
- `components/onboarding/OnboardingWizard.tsx` (281 lines): initial state from the resume record, writes the record on code send/resend, clears it on completion, adds `in_app_browser` to the two events.
- `app/[locale]/reset-password/page.tsx`: the password-rule swap only.
- `components/auth/AuthMethodChooser.tsx`: export `MethodButton`, with no behaviour change.
- `messages/{en,fr,es,pl}/onboarding.json` + `auth.json`: new strings via the stampeo-copywriting skill. Remove the now-unused checklist keys from all four locales together (catalog parity test).

## Touched areas and risks

- **Auth:** the change touches the signup and reset-password flows, so the security reviewer is mandatory.
- **Attribution:** the escape URL is the only way Safari can attribute the click. Verify `utm_*`/`fbclid` round-trip into `stampeo_src`/`stampeo_ad` on the first Safari load (runbook case).
- **Privacy:**
  - The resume record keeps an email and a name/phone on the device for up to 60 min, cleared on completion or expiry.
  - The escape URL and the analytics events stay free of personal data.
  - PostHog records `$current_url`, so the escape URL (with `fbclid`) is recorded in Safari. That's the same as any ad landing today.
- **Meta pixel:** the escape navigation must not reintroduce the STA-373 auto-PageView leak on `/onboarding`.
- **i18n:** every new or removed key changes in all 4 locales at once.
- **`AuthenticationStep.tsx` size:** see File layout.

## Docs impact (preliminary)

Probably a small update if a help page describes password requirements; otherwise none. Revisited at Phase 7.
