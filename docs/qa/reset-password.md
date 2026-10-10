BRANCH: `fix/sta-419-reset-password-lock` (showcase)
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
| EXPECT | Either the "link expired" message right after the reload, or the page's "update failed" message on submit, each with a way to request a new email. You do NOT see a raw error or an endless spinner. |
| RESET | R1. |

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
