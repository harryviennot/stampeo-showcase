# Security Report — STA-324 (consent ledger)

REVIEWED: 2026-09-20 (`security-reviewer`, adversarial pass)
SCOPE: a new **unauthenticated public write endpoint** plus three migrations
VERDICT AT REVIEW: **FINDINGS — 2 HIGH, 7 MEDIUM/LOW**
STATUS NOW: 5 fixed · 1 was stale · 2 documented · 1 escalated to the user

## Fixed

| # | Sev | Finding | Fix |
|---|-----|---------|-----|
| 3 | MED | **Deeply nested JSON escaped the parse guard as a 500.** `json.loads` raises `RecursionError`, which subclasses `RuntimeError`, not `ValueError` — so `except (ValueError, TypeError)` let it through. An oracle on an endpoint whose whole defence is being uninformative, plus stack burn and a Sentry flood, from one cheap request. | Broad `except Exception` around the parse, with the reason written in. **Independently reproduced**: a nested body hung for 60 s with no response. |
| 4 | MED | **No request body size cap.** `await request.body()` buffered the whole body; `sendBeacon`'s 64 KB browser limit is irrelevant to curl. The plan promised a payload cap that was never built. | 4 KB cap, checked against `Content-Length` **before** the body is read — reading it is the expensive part. |
| 5 | MED | **Blocking Supabase I/O on the event loop.** The only `async def` in the router, calling a synchronous httpx round trip; one slow insert would stall the whole API worker, not just this route. | `run_in_threadpool`, matching how every other (sync) handler in this router already behaves. |
| 6 | MED | **`ON DELETE SET NULL` never fires.** Account deletion anonymises the business and scrubs the user *in place*, so the cascade is dead code and the identifiers would survive erasure — on the one table exempt from erasure, joinable to ten years of billing records. The privacy policy already claimed otherwise, in four languages. | Explicit unlink in `purge_business_data`. See gap-report.md — this was the most serious finding of the day. |
| 1b | HIGH | **Forged-subject rows were unprunable forever.** A malformed `subject_id` gets a *fresh* UUID, so every junk row is a singleton — and migration 175 only prunes rows that have a **newer** row for the same subject. An unauthenticated caller could grow the table without bound. | Migration **176** adds an orphan floor. A singleton past the window is prunable because the `stampeo_consent` cookie carrying it has a six-month Max-Age and expired long ago; a *recent* singleton — an ordinary live visitor — is never touched. Verified across four fixture shapes. |

## Stale finding

**HIGH 1 — "the retention sweep is never wired up."** Not true as of review
time. The reviewer read `retention_cleanup.py` before my edit landed (it had
already read migration 175, which I wrote moments earlier — a mid-flight
snapshot). Verified after the fact: `CONSENT_RECORDS_RETENTION_DAYS` at line 35,
`_prune_consent_records` called at line 85, 8 tests passing. Recorded here
because a report claiming an unwired retention job against a published 3-year
promise should not sit uncorrected.

## Accepted and documented

**7 — the ledger is forgeable by the person it binds, and writable
cross-origin.** True, and largely inherent. The endpoint is unauthenticated by
necessity: the people whose consent is hardest to prove are the anonymous
majority, and a signup-only ledger would record the wrong population. A row
carries no IP, no user agent and no server-issued nonce, so a fabricated record
is not distinguishable from a real one.

What bounds it: the endpoint reads nothing and returns nothing, a forger can
only write under a `subject_id` they invented (v4 UUIDs are not enumerable, and
there is no read path), `decided_at` is clamped to ±7 days, and every field is
allowlisted before it reaches a column. The realistic harm is a data subject
injecting a "refusal" into their own chain — which weakens *our* evidence, not
theirs, and is self-defeating.

A signed nonce issued when the banner renders would close it properly. That is
a larger design change than this issue, and worth its own ticket.

**8 / 9 — LOW.** Claiming another subject's history needs the cookie value, so
it reduces to "XSS on any `.stampeo.app` subdomain", which has far worse
consequences than consent mis-attribution. The logged exception text is bounded
by PostgREST's error shape and contains the pseudonymous subject id at worst.

## Escalated — needs your decision

**2 — HIGH: the rate limit is one global bucket, not per-IP.**

`get_remote_address` reads `request.client.host`. Production runs behind
Dokploy's Traefik on a container network, and uvicorn starts without
`--forwarded-allow-ips`, so it trusts `X-Forwarded-For` only from loopback.
Every request on the internet therefore shares one rate-limit key: **one host
sending 30 requests a minute can 429 every genuine consent decision**, silently,
because `sendBeacon` discards the response.

I have **not** changed this, for two reasons. It is **pre-existing and
platform-wide** — `/public/customers` and `/public/contact` have the same
exposure, so this is not a STA-324 regression. And the obvious fix
(`--forwarded-allow-ips="*"`) makes the client IP spoofable via a forged header
if the app is ever reachable directly, which is a deployment trade-off that is
yours to make, not mine to assume.

Recommended: set `FORWARDED_ALLOW_IPS` to the proxy network's CIDR rather than
`*`, back slowapi with the Redis already in the stack so the limit survives
restarts and is shared across replicas, and alert on consent inserts per hour
dropping to zero — which is currently the only way this failure would ever be
noticed.

## Checked and sound

Injection into the `uuid` column and PostgREST filters (validated twice, before
any filter); column allowlisting (`build_consent_row` builds key by key, so
`user_id`, `business_id` and `recorded_at` are structurally unreachable from a
browser); type confusion (`bool` excluded explicitly from the int paths);
clock-skew clamping; the linking UPDATE's inability to rewrite a decision;
cross-tenant reads (no read path exists); RLS with zero policies plus the
`SECURITY DEFINER` prune function revoked from `PUBLIC`/`anon`/`authenticated`;
no secrets or PII in responses (204 with an empty body on every path).
