# Security Report: STA-323

REVIEWED: 2026-09-16 (security-reviewer, adversarial pass on the diff)
DIFF: `3f1aba4` (backend) + `905db84` (showcase) + `d7c6523` (web)
VERDICT: **FINDINGS — 1 HIGH (blocks)**

## HIGH — no RLS on the new tables

`database/migrations/172_business_ad_attribution.sql` creates two `public`
tables with **no `ENABLE ROW LEVEL SECURITY`**, so they inherit Supabase's
default grants to `anon`/`authenticated`. Anyone holding the publishable key —
which ships in the browser bundle by definition — can:

- `SELECT` every business's `click_id` / `browser_id` (the migration's own
  header calls these personal data) — **cross-tenant read**;
- `INSERT` a forged attribution row against **any** `business_id`;
- `UPDATE revoked_at`, or pre-`INSERT` / `DELETE` rows in
  `business_ad_conversion` to suppress or re-arm conversion sends.

Combined: an attacker can make the platform report an attacker-chosen
gclid/campaign against a victim business's real invoice amount at
`invoice.paid`.

This is exactly the class migration `145_enable_rls_backend_only_tables.sql`
was written to close — "with RLS off, every one of these is readable and
writable by anyone holding the publishable (anon) key" — and
`163_customer_rewards.sql` follows that convention. Both tables are
backend-only; no client reads them.

**Fixed in migration 173.**

## MED findings

1. **Zero-value trial invoice defeats the whole purpose.** `handle_invoice_paid`
   fires for Stripe's trial-opening `amount_paid == 0` invoice, so a `purchase`
   with `value=0.0` is sent at trial start *and* permanently consumes the
   `(business_id, vendor, 'purchase')` slot — the real first payment is then
   silently dropped. Independently found by the coverage audit. **Fixed.**
2. **Blocking HTTP on the event loop.** `stripe_webhook` is `async def` and
   calls handlers directly, so a synchronous `httpx.post` with a 5s timeout
   blocks the whole uvicorn process per event. A slow third party plus a
   renewal-day burst serialises 5s stalls across every API request.
   **Fixed** — sends moved off the request and webhook paths.
3. **API secret in the URL query string.** GA4 requires `api_secret` as a query
   parameter, and Sentry's httpx instrumentation records `http.query` on spans
   at the configured trace sample rate, exporting a live Doppler credential to a
   third-party error store. **Fixed** — scrubbed before send.
4. **`revoked_at` is never written.** The withdrawal branch is dead code: a
   visitor who revokes after signing up still has their `gclid` transmitted
   weeks later at `invoice.paid`. The migration comment and plan AC12 both
   assert otherwise. **Fixed** — revocation now reaches the server.
5. **No rate limit on `POST /businesses`.** An authenticated account can loop
   "create business with forged cookie" and emit one GA4 `sign_up` per
   iteration with chosen campaign attribution — conversion-feedback poisoning.
   **Not fixed — see Accepted below.**
6. **Unbounded cookie client-side.** The 512-char cap exists only server-side,
   after the cookie is already set. A crafted `utm_campaign` plants a ~4KB
   cookie on `.stampeo.app` for 182 days, sent on every request to both
   subdomains alongside the chunked Supabase auth cookies — the victim can be
   pushed over the request-header ceiling and get persistent 400/431 on the
   dashboard. The plan claimed a "~2KB cap" that did not exist. **Fixed.**

## LOW findings

7. **`abs(hash(click_id))` is not deterministic.** Python's string hash is
   salted per process, so the `sign_up` id and the `purchase` id derived weeks
   later differ — GA4 records two users and never joins lead to revenue. The
   code comment asserted determinism. **Fixed** — stable SHA-256 digest.
8. **Consent evidence is an unverifiable client claim.** `consent_at` in the
   future is accepted, `consent_version` is never compared to the live version,
   and `isinstance(True, int)` is True so `cv: true` passes validation and then
   fails the integer column write. **Fixed.**

## Accepted, not fixed

**Finding 5 (rate limiting).** `POST /businesses` has no rate limit today and
never has; that is a pre-existing property of the endpoint, not something this
diff introduces. What this diff adds is a consequence — a conversion per
creation. Adding rate limiting to business creation is a separate change with
its own blast radius on legitimate signup, and it belongs in its own issue
rather than being bolted onto an attribution feature. Recorded here so it is a
decision and not an oversight.

## Checked and sound

- `business_id` is never read from the payload — always from the freshly created
  row or `_find_business_by_subscription`. No cross-tenant path through the API.
- Stripe signature is verified before any dispatch; no state change precedes it.
- Handler exceptions return 200, so an ad-platform outage cannot cause a Stripe
  retry storm or a stuck subscription transition.
- A malformed or forged cookie yields `None` before any DB write; business
  creation is never rolled back or 500'd by attribution.
- No SQL injection: all writes go through PostgREST with structured values, and
  the literals are allowlisted in Python before reaching the DB CHECKs.
- The `(business_id, vendor, event_name)` PRIMARY KEY is a real database
  constraint, and `_claim` inserts before the HTTP call, so two concurrent
  deliveries cannot both send.
- No PII in the Measurement Protocol body, and no forwarded client IP.
- No log injection: attacker-controlled strings land in a column, not a format
  string.
- Enrollment pages (`/[locale]/[slug]`) cannot harvest or forge the cookie —
  capture is gated by the whole-first-segment allowlist, and no showcase route
  renders business-controlled HTML.
- web's courier matches the exact cookie name, rejects non-objects, never throws.
