# UX Review: STA-421 (with STA-425, plus the STA-418 shell and onboarding link)
MODE: POLISH   DOMAIN: showcase
VIEWED: code + screenshots (390x844, 360x780, 375x667, 1440x900)
VERDICT: FIXED WITH FINDINGS

I changed one line in one file: `app/[locale]/reset-password/page.tsx`. Type-check, lint and tests all pass.

The no-session state was checked live in all four locales. The form needs a real reset link, so I checked the form states (email line, hint, refusal lines, top error box) on a temporary route that copied the page's form markup with fixed state. That route was `app/[locale]/reset-password/ux-scratch-sta421/page.tsx`; I deleted it and it is not in the diff.

## Fixed
- `app/[locale]/reset-password/page.tsx:162` - When the card is taller than the screen, it slides under the fixed logo header, which is 71px tall and has no background.
  - The new email line, hint and refusal lines make the card taller, so this now happens on real phones.
  - At 360x780 with the long refusal, the card started at y=40 and the logo sat on its top edge.
  - At 375x667 with the `same_password` refusal, the card was 10px from the logo.
  - Change: the page wrapper went from `px-3 sm:px-0` to `px-3 py-20 sm:px-0`. A tall card now starts at y=80 and the page scrolls.
  - Short states look exactly as before because the padding is the same top and bottom. I checked: the no-session card at 390x844 stays at y=302, and desktop is unchanged.

## Mobile findings
- `page.tsx:162` - card under the fixed header when it is tall - fixed (above).
- `page.tsx:213` - a long email with no break points (70+ characters) wraps inside the card at 360px; `wrap-anywhere` works on the inline span. Nothing to fix.
- `page.tsx:252-259, 307-314` - the show/hide password (eye) buttons are 20x20 tap targets, under the 44px minimum. This was already there (the brief noted it) and those lines are outside the diff - left alone.
- `components/onboarding/steps/AuthenticationStep.tsx:470-475` - the "Forgot password?" link is `text-xs`, so its tap target is about 16px tall. The diff only changed its href - left alone.

## Brief drift
- **Email line, hint, refusal lines, no-session state and side/card padding:** all match `ux-brief.md`.
  - The refusal lines use the specified styles and ARIA wiring (`role="alert"`, `aria-describedby`, `aria-invalid`) and sit below the checklist.
  - The side and card padding match login's.
- **No-session message:** the red box picks one of three messages (expired link, network error, too many requests). This follows gate answer 2 rather than the brief's "the verify error". Fine.
- **Vertical padding:** the page wrapper now has `py-20`, which login's does not. This is intended. It only shows when the card would otherwise sit under the header.
- **Onboarding link:** it now goes to `/login?email=...`, which answers the brief's open question 3 (gate answer 1). Fine.

## Copy flagged
- **`page.tsx:199-202`, no-session state (all four locales):** the box says "This reset link has expired or is invalid. Please request a new one." The only button says "Sign in" (`resetPassword.signIn`).
  - The text asks for a new link, but the button is labelled for something else.
  - Requesting a link takes three taps after it: Sign in, then Continue with email, then Forgot password?
  - Copy problem for stampeo-copywriting. Landing directly on the forgot step is the brief's open question 4, a separate issue.
- **`weakPasswordCharacters` (all four locales), dormant line:** it says accented letters and spaces don't count as symbols.
  - But the page's own checklist counts any character outside `[a-zA-Z0-9]` as a symbol.
  - So this red line would show directly under a green "Symbol" tick, and the page would contradict itself.
  - The wording is fine; the conflict comes from the checklist logic. Making the checklist match the server's password rules is a non-goal in `plan.md`.

## Left alone
- **`page.tsx:317`, the "passwords do not match" line:** it uses `text-xs text-red-500`, while the new refusal lines use `text-sm text-red-600`.
  - That gives two different red inline styles on one form.
  - red-500 on the cream card is about 3.6:1 contrast, which fails AA for 12px text.
  - This line was already there and is outside the diff. It should match the refusal style in a follow-up (implementer).
- **`app/[locale]/login/page.tsx:177`:** login has the same wrapper with no vertical padding, so its taller steps can slide under the logo on short phones in the same way. Outside the diff (implementer, follow-up).
- **Console error on load:** `/reset-password` once logged `AuthApiError: Invalid Refresh Token` from `token?grant_type=refresh_token`. Probably a stale session cookie in the test browser; not investigated, and not a presentation issue.

## Verification
- type-check: pass   lint: pass (0 errors; 6 warnings, all in files this diff does not touch)   test: pass (3393 pass, 4 skip, 0 fail)
- screenshots, all in ``.playwright-mcp/` (local, not committed)`:
  - `sta421-nosession-en-390.png`, `sta421-nosession-fr-360.png`, `sta421-nosession-pl-360.png`, `sta421-nosession-es-360.png`, `sta421-nosession-fr-1440.png` (live page)
  - `sta421-form-email-fr-390.png`, `sta421-form-weak-fr-360-full.png` (before the fix)
  - `sta421-form-same-fr-375x667-before.png`, `sta421-form-same-fr-375x667-after.png`
  - `sta421-form-weak-fr-360-after.png`, `sta421-form-same-en-1440.png`
- The worktree status also shows `docs/qa/reset-password.md` modified and an untracked `docs/features/STA-421/docs-decision.md`. Neither is my change; they appeared during this pass.

## Resolution (2026-10-11)

- No-session copy: `resetPassword.linkExpired` now says, in all four locales, to choose "Forgot password?" on the sign-in page, which is where the only button leads.
- "Passwords do not match" line: now `text-sm text-red-600 dark:text-red-400`, like the refusal lines.
- `weakPasswordCharacters` vs the checklist: left as is (dormant; matching the checklist to the server policy is a non-goal).
- Login wrapper padding, eye-toggle and onboarding-link tap targets: outside this batch, not filed.
