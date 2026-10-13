# Plan: Account creation that works inside the Instagram/Facebook in-app browser

ISSUE: STA-456 (https://linear.app/stampeo/issue/STA-456)
BRANCH: feat/sta-456-in-app-signup (worktree `showcase/.claude/worktrees/sta-456`, cut from `dev` at 3c23ee2)
REPOS: showcase
MIGRATION: no
STATUS: APPROVED (2026-10-13, Harry: hybrid version, with the recommended answers to every open question). REVISED 2026-10-13 after review and QA, approved by Harry: password rules unchanged; the escape lands on a forwarding page `/start`.

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
- **When the switch fails, the visitor gets a guide, not another button into the same trap.** Device test (Harry, iPhone, 2026-10-13): the iOS switch failed immediately in both Instagram and Messenger. Both apps put the ••• at the top right, and both menus say "Open in external browser". A full-screen guide dims the page, points an animated arrow at the top-right corner and shows two steps: ① tap ••• at the top right, ② tap "Open in external browser". Its only actions are "Use email instead" and a close button. "Continue with … here" is removed: people tap it without reading and land back in the failing in-app sign-in.
- **Real browsers and `/login` are unchanged.** An owner whose account is Google-only or Apple-only has no password, so changing `/login` in-app could lock them out.
- **The escape link carries no personal data** (URLs reach analytics). It carries `utm_*` (from `stampeo_src`) and `fbclid` (from `stampeo_ad`).
- **The escape lands on a forwarding page, `/{locale}/start`, not on `/onboarding`.** `/onboarding` is a PRIVATE_SEGMENTS path (`lib/consent-routes.ts`) where no tag and no attribution capture run. `/start` is a marketing path: `AttributionCapture` and the Meta pixel run there exactly as on a landing page. It then replaces itself with `/{locale}/onboarding` (fixed destination, never taken from the URL). It is noindex and stays out of the sitemap.
- **In-app visitors enter sign-up through one real page load of `/{locale}/start?<ad params>`.** Device test (Harry, 2026-10-13): Meta's "Open in external browser" opens the in-app browser's last full page load, not the current address, so `history.replaceState` has no effect, and our CTAs reach `/onboarding` by client-side navigation. In-app only, when `/onboarding` was reached without its own document load (the document was loaded on another page), the wizard shows the spinner and `location.replace`s to `/{locale}/start?<params>`, which forwards to step 1. That load is what the app hands to Safari/Chrome: `/start` records the click there and forwards to step 1. The cost is one extra load (about 1 s) for in-app visitors entering sign-up. A direct load of `/start` or `/onboarding` (reload, resume) never reloads, and real browsers never do.
- **The Android escape opens the default browser,** not specifically Chrome: `intent://…#Intent;scheme=https;end`, with no `package` and no `browser_fallback_url`. A phone without Chrome uses its own browser. If nothing handles the intent, the page stays visible and the fallback appears, instead of the fallback URL reloading the same in-app page (which would loop back to step 1).
- **An in-app browser reporting a desktop platform** (rare, e.g. a tablet in desktop mode) skips the escape and goes straight to OAuth: there is no phone browser to hand over to.
- **Password rules: unchanged.** The dev cloud project enforces lowercase, uppercase, number and symbol on the server: QA got a 422 "Password should contain at least one character of each…". The local `config.toml` and the STA-421 notes were wrong about that. Relaxing the rules would need Supabase changes on dev and prod plus a common-password check (security review, MED), so Harry kept today's rules.
- **Resume storage:** localStorage, so it survives Instagram closing its browser while the visitor is in Mail. It holds only the email, the code type and the send time (security review, LOW: name/phone stay in the tab-scoped sessionStorage draft). It expires 60 min after the code was sent (the code's own lifetime), is written only when a code was actually sent, is cleared on completion, and never holds the password. A record dated in the future is discarded.
- **In-app browsers in scope:** the Meta family (Instagram, Facebook, Messenger, Threads). Others are treated as real browsers.
- **Analytics:** onboarding events carry `in_app_browser`, and two new events measure the escape. That tells us how often the iOS switch actually works.
- **A real-device check is required before release:** iPhone + Android, inside Instagram and Facebook.

## UX decisions

Built on `ux-brief.md` (ux-designer, MODE: DESIGN), adjusted to the hybrid that Harry chose after the brief.

- **PLACEMENT:** step 2 of `OnboardingWizard.tsx` / `AuthenticationStep.tsx`; no new route. `/login` and the shared `AuthMethodChooser` keep today's behaviour.
- **ENTRY:** landing CTA → step 1 → Continue → step 2 chooser. In-app, it reads Email, Google, Apple. Resume: a reload or return within 60 min reopens the existing code screen.
- **ADDED: email first on the in-app chooser.** Removes a step: email is the one path that always works in-app (AC2).
- **ADDED: Google/Apple in-app try the real browser first.** Prevents a mistake: the saved login lives there (AC4, AC5).
- **ADDED: a full-screen guide after a failed switch.** An arrow points at the top-right •••, with two numbered steps and "Use email instead" plus close. Answers "nothing happened" and shows the one route that works (AC5).
- **ADDED: `autoComplete="email"` / `"new-password"` on the email form.** Removes a step (AC11).
- **ADDED: `verifyMode` restored together with step, phase and email on resume.** Prevents a wrong-code-type error (AC6).
- **REJECTED:**
  - a "Continue with {provider} here" button after a failed switch (device test: people tap without reading, back into the trap);
  - an escape banner on step 1 or the landing page (pushes everyone out before email gets a chance);
  - an automatic browser switch on load (blocked on iOS and jarring);
  - hiding Google/Apple in-app (Harry's call: keep them);
  - an "Open Mail" button;
  - a "welcome back" note;
  - restoring the resend cooldown;
  - prefilling step 1 through the URL;
  - "copy link";
  - any change on `/login`.
- **MOBILE (390px, Instagram on iOS):** the chooser card shows three full-width h-14 rows: Email, Google, Apple. After a failed switch, a fixed full-screen layer dims the page. An arrow at the top-right edge points up at the app's •••. A card near the top holds the title, the two numbered steps (the ••• and "Open in external browser" rendered as bold tokens), "Use email instead" (full-width secondary) and a close button. It is a dialog: focus moves in, Escape and the close button dismiss it, and the background is inert. No sheet, no dialog, no hover. There's no flash, because step 2 renders only after a tap on step 1 or after the auth spinner, so the user-agent check has always run.
- **REUSES:** `MethodButton` (exported as-is from `AuthMethodChooser.tsx`), `hooks/useDevicePlatform.ts`, the existing code screen, `parseSourceCookie` / `parseAdCookie`.
- **NEW:** `components/onboarding/steps/InAppAuthChooser.tsx`. The escape-then-fallback behaviour must not live in the shared chooser that `/login` renders.

## Non-goals

- Ads Manager, campaign structure, Instant Forms, Meta CAPI or pixel changes.
- Backend, Supabase auth config, email templates, OTP expiry.
- The web dashboard and the scanner app.
- Linking a visitor's in-app and real-browser PostHog identities.
- `/login`, and the shared `AuthMethodChooser` behaviour.
- Code-only (passwordless) signup, and any change to password rules.

## Edge cases considered

- **Storage unavailable** (private mode, quota): no resume, and the flow works exactly as today.
- **Return after the code expired** (60 min): the resume record is ignored and removed. The wizard opens on step 1 with the draft name/phone, NOT a dead code screen.
- **Reload within 60 min:** the code screen shows the email, resend and "use a different email". The resend cooldown restarts at 0 (accepted; Supabase rate-limits on its side).
- **"Use a different email" on a resumed screen:** goes to the email form and drops the resume record.
- **Already signed in on reload:** the existing redirect to the app wins over resume.
- **OAuth return** (`?just_authed=oauth`): unchanged; resume is not read on that path.
- **Switch succeeds** (page hidden within the wait): nothing more happens in-app. If the visitor comes back to Instagram, the chooser is as they left it.
- **Switch fails** (page still visible after the wait, or the navigation throws): the guide opens (AC5).
- **The in-app browser reloads while the guide is open:** the address is `/start?…`, so `/start` runs inside the app and forwards to step 1. Accepted (rare); the visitor re-types the name.
- **A returning real-browser visitor with an older attribution cookie opens `/start`:** the forward waits for this visit's cookie (or the 1.5 s ceiling), so the new click is recorded first.
- **Android without Chrome:** the intent names no package, so the phone's default browser opens. If nothing handles it, the page stays visible and the fallback appears.
- **Meta's "Leave Instagram?" or iOS's "Open in Safari?" prompt held open past 1.5 s, then accepted:** the fallback (and `onboarding_browser_escape_failed`) shows although the switch then succeeds. Accepted: it slightly undercounts escape success in AC10.
- **Two tabs on one resume record:** after one verifies, the other shows a stale code screen until reload. Accepted.
- **Meta's in-app browser shows its own "Leave Instagram?" confirm:** the page is still visible, so the fallback may appear under the confirm. That's harmless: both choices still work.
- **Escape to the real browser:** `/start` forwards to step 1, where the visitor re-types the name (the draft doesn't cross browsers).
- **Attribution cookies absent** (no consent, direct visit): the escape URL carries no parameters, just the onboarding path.
- **Unknown or non-Meta in-app browsers** (TikTok, LinkedIn): treated as real browsers (today's behaviour).
- **Existing account on the email path:** unchanged (sign-in code, `verifyMode = signin`). The resume record keeps `signin` so the code verifies.

## Acceptance criteria

- **AC1:** Given a user-agent string, when classified, then Instagram (iOS + Android), Facebook (`FBAN`/`FBAV`/`FB_IAB`/`FB4A`), Messenger (`MessengerForiOS`/`Orca`) and Threads (`Barcelona`) return their name. Safari, Chrome (`CriOS` + Android), Samsung Internet, Firefox, desktop browsers, Gmail and LinkedIn/TikTok in-app return null. Parametrized over real UA strings.
- **AC2:** Given an in-app visitor on step 2, then the chooser shows Email first, then Google, then Apple.
- **AC3:** Given a real-browser visitor, then step 2 shows today's chooser (Google, Apple, Email) with today's behaviour. And `/login` is unchanged in every browser, in-app included.
- **AC4:** Given an in-app visitor on Android, when they tap Google or Apple, then the page navigates to `intent://<host>/<locale>/start?<params>#Intent;scheme=https;end`. On iOS it navigates to `x-safari-https://<host>/<locale>/start?<params>`. `<params>` holds only the `utm_*` and `fbclid` from the attribution cookies, NOT name, phone or email. `signInWithOAuth` is NOT called on that tap.
- **AC5:** Given the switch attempt, when the page becomes hidden (`visibilitychange` → hidden, or `pagehide`) within 1500 ms, then nothing else happens. When it stays visible (or the navigation throws), the guide opens: dimmed page, arrow at the top-right corner, step ① "Tap ••• at the top right" and step ② "Tap “Open in external browser”". "Use email instead" closes it and opens the email form. The close button and Escape close it, back to the chooser. There is NO "continue with {provider} here" action, and `signInWithOAuth` is never called from an in-app tap on a phone (the desktop-platform exception in Decisions is the only path that signs in directly). The address is not touched while the guide is open.
- **AC6:** Given a visitor on the code screen for email x (sign-up or sign-in code), when the page reloads, or the browser is closed and `/onboarding` reopened within 60 min of the code being sent (or re-sent), then the wizard opens on that code screen for x, with the same `verifyMode`. Verify, resend (a sign-in record resends with `signInWithOtp`) and "use a different email" all work. When a send fails, no record is written.
- **AC7:** Given the same visitor more than 60 min after the last send (exactly 60:00 still resumes), then the wizard opens on step 1 (with the draft if the tab still has it), NOT on the code screen, and the expired record is removed.
- **AC8:** Given any point in the flow, then the password is never written to localStorage, sessionStorage or a URL, and the localStorage record holds only the email, the code type and the send time (no name, no phone).
- **AC9:** Given a successful verify or OAuth completion, then the resume record is removed together with the existing draft.
- **AC10:** Then `onboarding_wizard_started` and `onboarding_step_completed` carry `in_app_browser` (the classified name or null). An escape tap fires `onboarding_browser_escape_attempted` {provider, platform, in_app_browser}. The fallback appearing fires `onboarding_browser_escape_failed` {provider, platform, in_app_browser}. None of these carry an email.
- **AC11:** Given the email form in any browser, then the email input has `autoComplete="email"` and the password input `autoComplete="new-password"`.
- **AC14:** Given an in-app visitor who reached `/onboarding` by an in-page navigation from another page, then the page does one full load of `/{locale}/start?<utm_*/fbclid from the cookies>`, which forwards to step 1. `onboarding_wizard_started` fires once, after that load. Given a direct document load of `/onboarding` or `/start`, or a real browser, then no reload happens.
- **AC12:** RETIRED (2026-10-13). Password rules stay as on `dev`: the checklist and validation in signup and `/reset-password` are unchanged.
- **AC13:** Given a visitor opening `/{locale}/start?utm_…&fbclid=…` in a real browser, then `stampeo_src` and `stampeo_ad` record those values (consent permitting, as on any landing page), and the page replaces itself with `/{locale}/onboarding` step 1 within about 2 s. Query parameters never change the destination. `/start` is noindex and absent from the sitemap.

## File layout

- `lib/auth/in-app-browser.ts` (+ test): `classifyInAppBrowser(ua)` and `buildBrowserEscapeUrl({platform, origin, path, params})`, both pure. (`lib/` has 90+ entries; `lib/auth/` has 11.)
- `lib/auth/browser-escape.ts` (+ test): `attemptBrowserEscape({navigate, doc, win, timeoutMs})` resolves `"left" | "stayed"`. Its document, window and timers are injected so the test drives them.
- `lib/auth/escape-params.ts` (+ test): `escapeParamsFromCookies(cookieHeader)` gives the `utm_*` from `stampeo_src` and the `fbclid` from `stampeo_ad`, and nothing else.
- `lib/auth/onboarding-resume.ts` (+ test): read, write and expiry of `{v, step, phase, email, verifyMode, sentAt}` in localStorage, with storage and clock injected.
- `app/[locale]/start/page.tsx`: the forwarding page (noindex; `start` added to `MARKETING_SEGMENTS` in `lib/consent-routes.ts`), with its forwarding decision in a pure lib helper + test.
- `components/onboarding/steps/InAppAuthChooser.tsx`: the in-app chooser, escape, fallback and its analytics.
- `components/onboarding/steps/AuthenticationStep.tsx` (554 lines, already over the cap): only the mount switch, the `verifyMode` lift (for resume) and the `autoComplete` attributes. These must not grow it past 554.
- `components/onboarding/OnboardingWizard.tsx` (281 lines): initial state from the resume record, writes the record on code send/resend, clears it on completion, adds `in_app_browser` to the two events.
- `components/auth/AuthMethodChooser.tsx`: export `MethodButton`, with no behaviour change.
- `components/onboarding/steps/BrowserEscapeGuide.tsx` (+ `browser-escape-guide.css`, test in `lib/auth/browser-escape-guide.test.tsx`): the guide, a native modal `<dialog>`. Copy: title, the two steps, the note "Your saved {provider} account works there.", "Use email instead", close.
- `components/onboarding/steps/OnboardingMethodChooser.tsx`: the single in-app vs real-browser dispatch, which keeps `AuthenticationStep.tsx` under 554 lines.
- `components/onboarding/StartForwarder.tsx` + `lib/auth/start-forward.ts`: the `/start` timing. `/start` renders the site footer, as every cookie-setting page must (`consent-routes` footer rule).
- `lib/auth/send-code.ts`: the code senders, so "write the record only when a code was sent" is testable.
- `hooks/useInAppBrowser.ts`, `lib/dom/body-scroll-lock.ts` (shared with the header menu).
- `lib/auth/in-app-entry.ts` (+ test) and `hooks/useInAppEntryReload.ts`: the one-time reload through `/start` (AC14).
- `lib/locale-negotiation.ts`: `start` reserved as a top segment. A business with slug `start` would lose its `/start` page: dev has none (checked 2026-10-13). **Prod must be checked before release.**
- `messages/{en,fr,es,pl}/onboarding.json`: the guide strings via the stampeo-copywriting skill (fr/es/pl menu labels unverified on a device); password checklist keys unchanged.

## Touched areas and risks

- **Auth:** the change touches the signup flow, so the security reviewer is mandatory.
- **Consent routes:** adding `start` to `MARKETING_SEGMENTS` makes tags and the consent banner eligible there, exactly as on a landing page; the consent-route tests must cover it.
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
