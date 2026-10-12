BRANCH: `fix/sta-419-reset-password-lock`, then `fix/sta-418-420-421-425-reset-hardening` (showcase)
SCOPES: showcase (`/reset-password`)
ENVIRONMENT: dev. No migration. The reset email itself comes from Supabase (or the STA-416 hook when it is on).

# Password reset test pass

The page a reset email links to: it checks the link, takes a new password and
signs the person in.

---

## SETUP: Before you start

### Where things live

| Surface | URL / Command | Notes |
|---|---|---|
| Showcase | `https://showcase.dev.stampeo.app` | Started with `bun run publicdev` from this worktree. |
| Forgot password | `https://showcase.dev.stampeo.app/en/login` | "Forgot password" link on the email form. |

### Accounts

A plus-alias of your own inbox (the reset email must arrive), created and
confirmed on dev. Fixture password convention for seeded accounts: `StampeoSeed!2026`.

### Reset recipes

**R1: delete the test account** (dev SQL editor)

```sql
delete from auth.users where email = '<alias>';
```

### Known state before you start

- **RP-01 failed on dev 2026-10-10** (found as STA-416 HK-04;
  `docs/features/STA-419/failure-reports/F-01-reset-lock-stolen.md`): submitting
  the new password showed "Lock broken by another request with the 'steal'
  option." Fixed in `lib/supabase/recovery-client.ts` (one client, own storage
  key, in-memory session; a failed update shows the page's error). Unit-tested.
  **RP-01 PASSED on dev 2026-10-10** (Harry). Seen on the way: a password equal to
  the current one (or below the project policy) is refused by Supabase with a 422
  and the page only says "update failed"; that is expected today, not a failure.
  RP-02 and RP-03 not yet run.
- **2026-10-11 batch (STA-418/420/421/425):** the address bar drops the token once
  read; PostHog and Sentry strip credential parameters; old recovery sessions in
  localStorage are signed out and removed when any page loads; the form names the account and appears only after the link is verified;
  refused passwords say why; the onboarding forgot link opens the login with the
  email filled. Unit-tested; **not yet verified in a browser.** Run RP-03 and
  RP-04 to RP-09.

---

## RP: Reset password

### RP-01: A new password saves and signs you in [CORE]

| Field | Content |
|---|---|
| WHY | The whole page. It failed on submit with a lock error after typing the password. |
| DEPENDS | none |
| ACCOUNT | Your alias, confirmed. |
| STEPS | 1. From `/en/login`, Forgot password, enter the alias. 2. Open the email, press the button. 3. Type a new password slowly in both fields (many keystrokes), submit. |
| EXPECT | You are signed in and sent to the dashboard; the new password works on the next sign-in. You do NOT see "Lock broken by another request…" or any raw English error on a non-English page. (On dev, React Strict Mode builds the client twice, so a "Multiple GoTrueClient instances" console warning there is expected.) |
| RESET | R1 when done. |

### RP-02: A used or expired link says so [EDGE]

| Field | Content |
|---|---|
| WHY | The link is single-use; a second visit must explain itself, not spin. |
| DEPENDS | RP-01 |
| ACCOUNT | Same alias. |
| STEPS | Open the same reset link from RP-01 again. |
| EXPECT | The page shows the "link expired" message with a way to request a new one. You do NOT see an endless spinner. |
| RESET | R1. |

### RP-03: Reloading after the link is checked asks for a new email [EDGE]

| Field | Content |
|---|---|
| WHY | The recovery session is kept in memory only (that is what removes the lock contention), so a reload loses it; the page must say so instead of failing silently. |
| DEPENDS | none |
| ACCOUNT | Your alias, confirmed. |
| STEPS | 1. Request a reset, open the link (the form appears). 2. Reload the page. 3. If the form shows again, submit a new password. |
| EXPECT | After the reload the page shows the "link expired" message in the red box (it says to choose "Forgot password?" on the sign-in page) and a full-width sign-in button, and NO password form. You do NOT see a raw error, an endless spinner, or a form that cannot save. |
| RESET | R1. |

### RP-04: The token leaves the address bar and the analytics [CORE]

| Field | Content |
|---|---|
| WHY | STA-418: a single-use reset token must not sit in the URL bar, PostHog or Sentry. |
| DEPENDS | none |
| ACCOUNT | Your alias, confirmed. |
| STEPS | 1. Request a reset, open the link with devtools Network open (filter `posthog`). 2. Watch the address bar after the spinner. 3. Look for PostHog requests. 4. Open `/en/pricing` in the same tab. |
| EXPECT | The address bar shows `/<locale>/reset-password` with no `token_hash` or `type`, and the form appears (the link still verified). No request goes to PostHog while the reset page is open (a page opened with a token starts without analytics). After step 4, PostHog requests appear again. You do NOT see the token come back in the address bar after typing in the form. |
| RESET | R1. |

### RP-05: An old recovery session is cleared from the browser [CORE]

| Field | Content |
|---|---|
| WHY | STA-420: resets before 2026-10-11 left a working refresh token in localStorage. |
| DEPENDS | none |
| ACCOUNT | Your alias, signed in on the dashboard (cookie session). |
| STEPS | 1. In devtools on `showcase.dev.stampeo.app`, Application → Local Storage: create `sb-ysdpjxzldqwlmhlwzdaq-auth-token` with a session JSON copied from a fresh sign-in (or any JSON). 2. Open the homepage `/en`. 3. Look at Local Storage again, and open `app.dev.stampeo.app` in another tab. 4. Reload `/en` with the Network tab open. |
| EXPECT | The key is gone after the homepage loads. On the reload in step 4 no request goes to `supabase.co` (nothing is stored any more). The dashboard tab is still signed in (the real cookie session is untouched). You do NOT get signed out anywhere. |
| RESET | None. |

### RP-06: The form names the account [CORE]

| Field | Content |
|---|---|
| WHY | STA-421: someone opening another person's reset link must notice before setting a password. |
| DEPENDS | none |
| ACCOUNT | Your alias, confirmed; also a long alias (40+ characters) at 390px width. |
| STEPS | 1. Request a reset, open the link. 2. Read under the title. 3. Repeat on a phone-width window with the long alias. |
| EXPECT | The alias is shown in full under the title, with a short line saying not to set a password if it isn't yours. A long address wraps inside itself; it is never cut with "…". |
| RESET | R1. |

### RP-07: Reusing the current password is explained [CORE]

| Field | Content |
|---|---|
| WHY | STA-425: Supabase refuses the current password with `same_password`; the page used to say only "update failed". |
| DEPENDS | none |
| ACCOUNT | Your alias, whose current password you know. |
| STEPS | 1. Request a reset, open the link. 2. Type the CURRENT password in both fields, submit. 3. Change one character in New password. |
| EXPECT | A red line under the New password field says it is already your current password. It disappears as soon as you edit New password. You do NOT see "Impossible de mettre à jour le mot de passe" / "update failed" for this case. |
| RESET | R1. |

### RP-08: A rate-limited or offline check says so [EDGE]

| Field | Content |
|---|---|
| WHY | Verify failures other than an expired link must not read as "expired". |
| DEPENDS | none |
| ACCOUNT | Your alias. |
| STEPS | 1. Request a reset. 2. Turn the network off in devtools, open the link. |
| EXPECT | The connection-error message in the red box and the sign-in button; no form, no endless spinner. |
| RESET | R1. |

### RP-09: The sign-up step's "Forgot password?" opens the login [EDGE]

| Field | Content |
|---|---|
| WHY | That link used to open the reset page with no token, now a dead end. |
| DEPENDS | none |
| ACCOUNT | None. |
| STEPS | 1. In the onboarding wizard's sign-up step, type an email, then press "Forgot password?". |
| EXPECT | The login page opens with that email filled in. You do NOT land on `/reset-password`. |
| RESET | None. |

---

## Execution rules (for the testing agent)

1. **Order.** Setup first. Then sections top to bottom, and within a section,
   BLOCKER cases first unless DEPENDS forces otherwise.
2. **On BLOCKER failure:** stop the section. Cases that DEPEND on it are
   marked SKIPPED, not failed. Write a failure report.
3. **On CORE failure:** write a failure report, skip only its dependents,
   continue the run.
4. **On EDGE failure:** write a failure report, continue.
5. **On ambiguity:** consult WHY. If still ambiguous, report it as AMBIGUOUS.
6. **After any failure:** run the case's RESET before retrying or moving on.
7. **Reporting:** one failure report per failed case, using
   failure-report-template.md. Reference cases only by ID.
8. **Re-runs after fixes:** re-run the failed case, its dependents, and any
   case listed in "Known state" as needing re-verification. Nothing else.
