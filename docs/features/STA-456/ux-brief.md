# UX Brief: STA-456
MODE: DESIGN   DOMAIN: showcase
VERDICT: READY

## Already shipped
- **The code screen already exists** (`components/onboarding/steps/AuthenticationStep.tsx:257-355`). It shows the email, has resend with a 60 s cooldown, and has "Use a different email". Resume only restores state into it; no new screen.
- **Resume must restore five things, not four:** `step`, `authPhase`, `email` (`OnboardingWizard.tsx:95-98`) and `verifyMode` (`AuthenticationStep.tsx:57`, `"signup" | "signin"`). Verify and resend choose the code type from `verifyMode` (lines 212, 235). If a reload drops it, a returning user who was sent a sign-in code gets "Invalid verification code".
- **Platform detection exists, in-app detection does not:** `hooks/useDevicePlatform.ts` returns ios/android/desktop. Nothing in showcase or web detects an in-app browser.
- **A browser-switch pattern exists once:** `app/join/[code]/open-in-app.tsx`. It uses inline styles, so it is not a visual model.
- **The code email holds a code only** (`{{ .Token }}`), no link. The code works in any browser for 60 minutes.
- **The password rules exist only in the browser:** the server requires 6 characters and no character classes (`backend/supabase/config.toml`, `minimum_password_length = 6`, `password_requirements = ""`). `/reset-password` uses the same four-class checklist.
- **`/login` has no "email me a code" sign-in.** It offers choose / login / verify / forgot only.
- **The escape link has no ad parameters to copy:** CTAs go to a bare `/onboarding` (`lib/cta/events.test.ts:30-39`). `utm_*` must come from the attribution source cookie (`lib/attribution/source.ts`, `parseSourceCookie`).
- **No autofill hints:** the email input (`AuthenticationStep.tsx:439`) and the password input (line 478) have no `autoComplete`.

## Placement
- **Inside step 2** of `OnboardingWizard.tsx` / `AuthenticationStep.tsx`. No new route.
- **In-app, step 2 opens straight on the email form and skips the chooser.** Back on that form goes to step 1.
- **Google and Apple are replaced, not added to.** Below the form's legal line: a divider, then one row that opens the page in the phone's real browser. That row is the only route to Google or Apple in-app.
- **Real browsers are unchanged**, chooser included.
- **`/login` keeps today's chooser everywhere.** Owners whose account uses only Google or Apple have no password, so hiding those buttons in-app would lock them out.

## Entry points
- **The ad path:** landing CTA → `/onboarding` step 1 → Continue → email form, with the escape row below it.
- **The resume path:** a reload, or a return within 60 minutes, reopens the existing code screen for that email.
- **The escape lands on step 1** of `/{locale}/onboarding` in Safari or Chrome. That is the normal real-browser flow.

## Proposed additions
- **In-app, step 2 opens on the email form.** Removes a step: the chooser is the screen all 6 paid visitors left from.
- **One escape row instead of the Google and Apple buttons.** Prevents a mistake.
  - Label along the lines of "Google or Apple" plus the browser name, with an `ArrowSquareOut` icon.
  - Android goes to `intent://…;package=com.android.chrome`; iOS goes to `x-safari-https://`.
- **Manual instruction, shown only after a tap on the row.** Answers "I tapped it and nothing happened". One muted line, roughly "Nothing opened? Tap ••• then Open in browser", in a polite live region.
- **`autoComplete="email"` and `autoComplete="new-password"`** on the email and password inputs. Removes a step: on a phone keyboard, typing is the friction.
- **Restore `verifyMode` on resume.** Prevents a mistake (wrong code type).

## Rejected additions
- **Escape banner on step 1 or the landing page:** it pushes everyone out before email gets a chance.
- **Keeping Google and Apple in-app below email:** those buttons are where the 6 of 6 exits happened.
- **Both brand logos in the icon slot:** two logos don't fit legibly, and they read as "sign in here" again.
- **An "Open Mail" button:** it would guess the mail app, and `one-time-code` autofill already exists.
- **A "welcome back" note on resume:** the code screen already says "we sent a code to x".
- **Restoring the resend cooldown across a reload.**
- **Pre-filling step 1 in the real browser:** personal details in a URL reach analytics.
- **Opening the real browser automatically:** we can't detect whether it worked, and the switch is jarring.
- **"Copy link" as the iOS fallback:** more steps than ••• then Open in browser.
- **The in-app treatment on `/login`.**

## Mobile shape
390px, Instagram on iOS, about 390x700 usable, top to bottom:
1. Header and step dots.
2. The card with the title and subtitle.
3. Email field, then password field with its checklist.
4. Back / Continue.
5. Legal line.
6. An "or" divider, then the escape row (h-14). It is near the fold, and a short scroll is fine.
7. After a tap, the instruction line.

No sheets, no hover, no tables. The resume code screen is unchanged. Desktop and real phone browsers are untouched.

**No flash:** step 2 renders only after a tap on step 1 or after the auth spinner, so the user-agent check has always run by then.

## Components to reuse
- `AuthMethodChooser` `MethodButton`, exported as-is, as the escape row's look.
- `hooks/useDevicePlatform.ts`.
- The `components/icons/index.tsx` barrel, plus an `ArrowSquareOut` alias.
- The code-screen branch of `AuthenticationStep.tsx`.
- The `loadDraft`/`saveDraft` pattern.
- `parseSourceCookie`.

## New components required
- **`components/onboarding/steps/OpenInBrowserOption.tsx`.**
  - It builds the per-platform URL, navigates, and reveals the instruction after a tap. That behaviour doesn't belong in the shared chooser.
  - It keeps `AuthenticationStep.tsx` from growing.

## Open questions for the user
1. **Password rules.** Recommendation: a length minimum without the four classes, keeping 6 to match the server or raising it to 8 client-side. Apply the same change on `/reset-password`. Not code-only in this issue: `/login` has no code sign-in yet.
2. **Resume storage.** sessionStorage is lost if Instagram closes its browser while the visitor is in Mail. localStorage with a 60-minute expiry (email + `verifyMode` only, never the password) survives that. The trade-off is an email kept on the device for up to an hour.
3. **Which in-app browsers.** Recommendation: the Meta family (Instagram, Facebook, Messenger, Threads).
4. **Copy (en/fr/es/pl):**
   - the escape row label, plus a short variant;
   - the divider word;
   - the after-tap instruction;
   - the in-app form subtitle, if question 1 relaxes the rules.
