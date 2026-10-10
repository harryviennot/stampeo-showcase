# Security Report: STA-413
REVIEWED: 2026-10-10 (security-reviewer, fresh context, adversarial pass on the fix)
VERDICT: FINDINGS, all LOW → fixed. No bypass with the env values in the tree.

| Finding | Resolution |
|---|---|
| LOW (web): an unparseable `next` (`//[`, `/\[`) crashed the callback instead of falling back. | Fixed: parse in try/catch, return the app root; tested. |
| LOW (showcase): with a scheme-less `NEXT_PUBLIC_APP_URL` (`localhost:3000`), the app origin is `"null"`, which equals `javascript:`'s origin. | Fixed: the app URL and the target must both be http(s) with the same scheme; tested with two scheme-less values. |
| LOW (showcase, hardening): `blob:` URLs and `https://u:p@app…` passed. | Fixed: http(s) only, credentials refused; tested. |
| LOW (web): the callback still logged `next`, which on the invite path is the invite token (a bearer credential). | Fixed: logs `hasNext` only; a route test checks the token is not logged. |
| Note: the origin check now includes the scheme; a proxy that rewrites `x-forwarded-proto` would make `http://` return addresses fall back to home. | STA-226 builds the address from `NEXT_PUBLIC_APP_URL`, not the request. Runbook LR-04 is run through the tunnel and on prod. |

Checked and sound (from the review): script schemes, case, whitespace and control characters, credentials and `@` tricks, IDN/punycode, ports, backslashes, encoded slashes, relative vs absolute, empty env, chained redirects, request headers, error text, logs.
