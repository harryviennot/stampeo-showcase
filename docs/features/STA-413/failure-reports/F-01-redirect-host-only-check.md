CASE: LR-01, LR-02, LR-03 (new, see `docs/qa/login-redirects.md`)
VERDICT: FAILED
SEVERITY: BLOCKER
RUN: 2026-10-10, code review of showcase `dev` @ e255001 and web `dev` @ d47f7fa, reproduced in Node (no request sent to prod)
SURFACE: showcase login + showcase OAuth callback + web OAuth callback
ACCOUNT: none needed to build the links; the victim is any signed-out owner

## Failed at

Building a return address that is not on the app's origin and checking whether
the sign-in flow follows it.

## Expected

After sign-in the user is sent only to `https://app.stampeo.app/...` (the
configured app origin: scheme, host and port). Anything else falls back to the
default landing.

## Actual

```
showcase resolvePostLoginUrl (host-only check):
  "javascript://app.stampeo.app/%0Aalert(document.cookie)" host=app.stampeo.app accepted=true
  "http://app.stampeo.app/design"                          host=app.stampeo.app accepted=true

web auth/callback (string guard: starts with "/" and not "//"):
  "/\\evil.example" guard passes=true -> https://evil.example/
```

The showcase login assigns the accepted value to `location.href` after a
password or code sign-in, so the `javascript:` value runs script on
`stampeo.app`, where the Supabase session cookies are readable from JS. The
showcase OAuth callback uses the same host-only check for `next`. The web
callback runs outside the middleware and redirects even without a `code`.

## Evidence

- `showcase/app/[locale]/login/page.tsx:86-100` (`resolvePostLoginUrl`), sinks at `:127` and `:149`
- `showcase/app/auth/callback/route.ts:89-100`
- `web/src/app/auth/callback/route.ts:55-58`
- Node reproduction above (`new URL` behaviour, no network)
- Same route, logging: `web/src/app/auth/callback/route.ts:17-21` writes the full
  callback URL (OAuth `code`) and `next` (on the invite path, the invite token,
  which alone authorises a join) to the server log.

## State at time of failure

- Session: none
- Preceding cases this run: none
- Relevant data: none

## Aftermath

- RESET performed: none needed
- Dependents skipped: none
- Run continued: yes

## Hypothesis (optional, clearly speculative)

The checks compare `host`, which ignores the scheme; `origin` compares scheme,
host and port, and is `"null"` for `javascript:` URLs.
