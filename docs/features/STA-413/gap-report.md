# Gap Report: STA-413
AUDITED: 2026-10-10 (coverage-auditor, fresh context)  DIFF: uncommitted `fix/sta-413-redirect-origin-check` (showcase + web)
VERDICT: DRIFT + GAPS FOUND → resolved or open as listed below

## Criteria without tests

| Gap | Resolution |
|---|---|
| Showcase OAuth callback: a refused `next` falling through to the normal landing was only tested through the helper. | **Fixed:** `lib/routing/auth-callback-next.test.ts` calls the route's `GET` (no `code`): an app invite is followed; `javascript:`, `http:`, `blob:` and foreign values land on onboarding. |
| Showcase login: the value assigned to `location.href` (including the env fallback) was untested. | **Fixed:** extracted `postLoginUrl(redirect, appUrl)`, which the page calls; tested with env set, unset and empty. |
| Web callback route (LR-03) only tested through the helper. | **Fixed:** `src/app/auth/callback/route.test.ts` drives `GET`. |

## Untested diff behavior

| Gap | Resolution |
|---|---|
| Web: `next` values starting with `/` that do not parse (`//`, `//[`, `/\[`) threw after the code exchange (500). | **Fixed:** parse failure returns the app root; tested in the helper and the route. |
| Showcase: `blob:https://app.stampeo.app/…` passed the origin check. | **Fixed:** scheme must be http(s) and equal to the app's; also refuses credentials in the URL. |

## Drift

| Item | Resolution |
|---|---|
| The web callback log no longer prints the full URL (OAuth `code`), and now not `next` either (invite token). | Recorded in F-01 Evidence; it is part of this security fix. A route test checks the token is not logged. |

## Suspect tests

| Gap | Resolution |
|---|---|
| `follows /` expected the same value as the fallback. | **Fixed:** replaced by `/billing?success=true`. |

## Unrealistic or missing workflow tests

| Gap | Resolution |
|---|---|
| Middleware → showcase login → deep link, origin match between web's and the showcase's `NEXT_PUBLIC_APP_URL`. | **Depends on STA-226** (the middleware builds the address from `NEXT_PUBLIC_APP_URL`). Manual: STA-226 AU-02 and LR-04 through the tunnel and on prod. |
| Invite "switch account" flow (`InviteAlreadyAccepted` → login → invite). | **OPEN, manual:** its `redirect` is the browser's own `location.href`, so it is same-origin by construction; covered by LR-04's shape. |
| Showcase OAuth round trip with a membership (invite `next` beats the membership branch; refused `next` lands on `appUrl`). | **OPEN, manual:** needs a real session exchange. Branch order is unchanged by this diff. |
| Web callback with a real `code` and a crafted `next`. | **OPEN, manual:** needs a real exchange; the `next` handling is the same code path as the no-code tests. |

## Waivers
(only with Harry's explicit OK)
