BRANCH: `fix/sta-413-redirect-origin-check` (showcase + web)
SCOPES: showcase (login page, OAuth callback), web (OAuth callback)
ENVIRONMENT: dev only. No migration. Nothing here touches production.

# Login return-address test pass

Where the sign-in flow is allowed to send someone afterwards. Work top to
bottom; every case starts signed out.

---

## SETUP: Before you start

Everything runs against dev with the dev fixtures.

### Where things live

| Surface | URL / Command | Notes |
|---|---|---|
| Showcase login | `https://showcase.dev.stampeo.app/login` | Choose **Continue with email** unless the case says otherwise. |
| Dashboard | `https://app.dev.stampeo.app` | Web started with `bun run publicdev`. |

### Accounts

All accounts are dev fixtures. Password for every one: `StampeoSeed!2026`.

| Use for | Account | Business / State |
|---|---|---|
| Every case | `camille@aurevo.seed.stampeo.app` | Owner with finished setups. |

### Reset recipes

**R1: sign out** (before every case)

Sign out from the dashboard's account menu, or clear the site data for
`.dev.stampeo.app`.

### Known state before you start

- **LR-01 to LR-03 failed on review 2026-10-10**
  (`docs/features/STA-413/failure-reports/F-01-redirect-host-only-check.md`):
  the checks compared the host only. Fixed with `lib/auth/app-redirect.ts`
  (showcase) and `src/lib/auth/callback-next.ts` (web). Both callback routes
  are also tested end to end without a `code`. **Ship with STA-226:** before it,
  the dashboard sends `https://0.0.0.0:3000/...` as the return address, which
  both the old and the new check refuse. **Not yet verified** in a browser. Run
  all four cases, and LR-04 once more through the tunnel and on prod (a proxy
  that rewrites the scheme would now be refused).

---

## LR: Return address after sign-in

A crafted login link must never run script or send a signed-in owner off the
app. LR-04 proves the legitimate return still works.

### LR-01: A javascript: return address does nothing [BLOCKER]

| Field | Content |
|---|---|
| WHY | This was an account takeover: the script ran on the showcase right after sign-in, where the session is readable. |
| DEPENDS | none |
| ACCOUNT | `camille@aurevo.seed.stampeo.app` |
| STEPS | 1. R1. 2. Open `https://showcase.dev.stampeo.app/login?email=camille%40aurevo.seed.stampeo.app&redirect=javascript%3A%2F%2Fapp.dev.stampeo.app%2F%250Aalert(document.domain)`. 3. Sign in with the password. |
| EXPECT | You land on the dashboard home. You do NOT see an alert box, and the address bar never shows `javascript:`. |
| RESET | R1. |

### LR-02: An http or foreign return address falls back to the dashboard [CORE]

| Field | Content |
|---|---|
| WHY | Downgrades and other sites must not be reachable through the login. |
| DEPENDS | none |
| ACCOUNT | `camille@aurevo.seed.stampeo.app` |
| STEPS | 1. R1. 2. Open the login with `redirect=http%3A%2F%2Fapp.dev.stampeo.app%2Fprogram%2Fdesign`, sign in. 3. R1, then again with `redirect=https%3A%2F%2Fexample.com%2F`. |
| EXPECT | Both sign-ins land on `https://app.dev.stampeo.app/` (the home). You do NOT end on an `http://` address or on `example.com`. |
| RESET | R1. |

### LR-03: The web callback refuses a backslash path [CORE]

| Field | Content |
|---|---|
| WHY | `/\host` was read as `//host`, an open redirect on the app's own domain. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. Open `https://app.dev.stampeo.app/auth/callback?next=/%5Cexample.com`. |
| EXPECT | You end on the app (its home, or the login it sends you to). You do NOT end on `example.com`. |
| RESET | None. |

### LR-04: A real app page is still followed [CORE]

| Field | Content |
|---|---|
| WHY | The fix must not break the normal return (invite links, deep links). |
| DEPENDS | none |
| ACCOUNT | `camille@aurevo.seed.stampeo.app` |
| STEPS | 1. R1. 2. Open the login with `redirect=https%3A%2F%2Fapp.dev.stampeo.app%2Fprogram%2Fdesign`, sign in with the password. 3. R1, repeat with **Continue with Google** if the dev Google client is set up for you. |
| EXPECT | Each sign-in lands on `/program/design`. You do NOT land on the home. |
| RESET | R1. |

---

## Execution rules (for the testing agent)

1. **Order.** Setup first. Then sections top to bottom, and within a section,
   BLOCKER cases first unless DEPENDS forces otherwise.
2. **On BLOCKER failure:** stop the section. Cases that DEPEND on it are
   marked SKIPPED, not failed. Write a failure report, then continue with
   sections that do not depend on the failed case, if any.
3. **On CORE failure:** write a failure report, skip only its dependents,
   continue the run.
4. **On EDGE failure:** write a failure report, continue.
5. **On ambiguity:** consult WHY. If still ambiguous, report it as AMBIGUOUS
   with what you saw, so the runbook gets fixed.
6. **After any failure:** run the case's RESET before retrying or moving on.
7. **Reporting:** one failure report per failed case, using
   failure-report-template.md. Reference cases only by ID.
8. **Re-runs after fixes:** re-run the failed case, its dependents, and any
   case listed in "Known state" as needing re-verification. Nothing else.
