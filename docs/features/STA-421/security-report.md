# Security Report: STA-418 / STA-420 / STA-421 showcase auth batch (reset-batch worktree)
REVIEWED: 2026-10-11  DIFF: uncommitted worktree `the batch worktree` (batch-code.diff + batch-tests.diff, then re-read live files)
VERDICT: FINDINGS (no HIGH, nothing blocks the pipeline)

**Two files changed while I was reviewing. This report covers the current worktree, not the diff snapshot.**
- `lib/privacy/credential-params.ts` now splits text into words (`\S+`) instead of skipping any string that contains whitespace.
- `instrumentation-client.ts:8` now skips `posthog.init` when the landing URL has a credential parameter.

Against the snapshot I had found three leaks. The live code closes all three. Keep the init gate: it is load-bearing.
- **Whitespace skip:** strings containing a space were never scrubbed.
- **PostHog `/flags` request:** this request never goes through `before_send`.
  - Because of `persistence: "memory"`, every full page load counts as the start of a visit.
  - PostHog stores the unmasked landing `location.href` as `$initial_current_url` (`posthog-persistence.js:289`, `event-utils.js:216-220`). It does this on the first pageview, 1 ms after init, before the page cleans the address bar.
  - It then POSTs that value in `person_properties` to `/flags/?v=2` (`posthog-featureflags.js:510`, triggered by `remote-config.js:126-128`).
  - So the live `token_hash` reached PostHog whenever the project has any feature flag.
- **Heatmap URL keys:** `$heatmap_data` is keyed by `location.href` (`heatmaps.js:250-261`), and the scrubber only rewrites values, never keys.

## Findings
- **[SEV: MED]** `components/onboarding/steps/AuthenticationStep.tsx:470-475` and `lib/auth/login-link.ts:2-5`
  - **Attack:** every onboarding visitor who clicks "Forgot password?" now has the email they typed put in the URL (`/login?email=…`). It goes out in several places:
    - PostHog: the autocapture `$elements_chain` (`attr__href`/`href`), then `$current_url` on the `/login` pageview and pageleave.
    - Sentry: navigation breadcrumbs and `url.full`/`url.query`. `email` is not in Sentry's sensitive-key list.
    - Server and proxy access logs, through the RSC navigation request.
  - **Impact:** a routine path now sends an identifying address to PostHog, which runs without consent (memory persistence, no identify anywhere in showcase). `credential-params.test.ts` explicitly keeps `?email=` unscrubbed.
  - **Suggested direction:** pass the email to `/login` through sessionStorage or in-memory state, or strip `email` from the analytics copies (scrubber plus PostHog masking).

- **[SEV: LOW]** `lib/privacy/credential-params.ts:8,84-92` — the scrubber only matches query/fragment parameters by name, and only in values. Credentials it does not remove (all pre-existing, none on the reset path):
  - `/join/<code>`: a single-use scanner team join code in the path. PostHog loads on that page.
  - `/demo/wallet-select/<token>`: a token in the path.
  - `/email-preferences?u=&t=`: `t` is a working preference credential. It is also in the Sentry fetch breadcrumb for `${API_URL}/email/preferences?u=…&t=…` (`EmailPreferencesClient.tsx:35,64`).
  - `provider_token` / `provider_refresh_token` in implicit-flow fragments.
  - Object keys, such as `$heatmap_data` on any other page.

  **Impact:** anyone who can read PostHog or Sentry can redeem a team join code or change someone's email preferences.
  **Suggested direction:** extend the names per route (at least `t` on email-preferences), redact path credentials by route, and scrub `$heatmap_data` keys.

- **[SEV: LOW]** `lib/privacy/credential-params.ts:24-31,46-61` and `instrumentation-client.ts:8` — over-scrubbing.
  - PostHog sends `$elements_chain` as one string (`autocapture.js:172-174`). A chain word holding `?code=` or `?token=` loses everything after it up to the next space: the href, `nth-child`, the text and the next element selectors. That corrupts the chain for that click. This is latent: no showcase link carries these names today.
  - The init gate turns PostHog off for the whole page lifetime, including later client-side navigations, for any landing URL with `code` or `token`. A future `?code=PROMO` campaign link would silently lose all analytics.
  - The PostHog test models `$elements` (an array), not the string chain PostHog actually sends by default.

  **Suggested direction:** handle `$elements_chain` hrefs explicitly, test with a real chain string, and keep the gate's parameter list limited to auth flows.

- **[SEV: LOW]** `lib/supabase/auth-provider.tsx:95-111` — the legacy cleanup only runs where AuthProvider mounts: the login, onboarding and reset-password layouts.
  - **Attack:** a shared computer where someone reset a password before STA-419, and where nobody opens those three pages again, keeps the recovery session in localStorage.
  - **Impact:** that session survives the password change server-side, and its refresh token does not expire by default. So it stays a working account credential and the STA-420 fix is incomplete for that group.
  - **Suggested direction:** check the localStorage key cheaply on every page and import supabase-js only when the key exists.

## Checked and sound

**Legacy session cleanup (STA-420)**
- **It cannot disturb the real cookie session:**
  - Its own storageKey means it gets its own BroadcastChannel (`GoTrueClient.js:191-193`, the app's channel is `sb-<ref>-auth-token`). It also gets its own lock name plus a no-op lock, and its own instance-ID bucket, so no "Multiple GoTrueClient" warning on the app.
  - The storage adapter maps only the legacy key; everything else stays in memory.
  - `@supabase/ssr` 0.5.2 never touches localStorage.
  - Its SIGNED_OUT event never reaches AuthProvider's listener or `nukeSupabaseAuthStorage`.
  - `scope: "local"` revokes only the legacy session (`GoTrueClient.js:3156-3181`).
  - `stopAutoRefresh` removes its visibilitychange listener.
  - The key is deleted in `finally`.
- **One side effect:** an expired legacy session is refreshed once (`__loadSession`, line 2366) before logout. The rotated token is written to the legacy key and then removed, which is harmless.
- **Abuse:** the token only ever goes to `NEXT_PUBLIC_SUPABASE_URL`. Planting a value in localStorage needs XSS.

**Reset page**
- Token is read once into state. `replaceState` only rewrites the page's own path, so there is no open redirect.
- The deferral is correct: child effects run before the AppRouter's history patch.
- The form only renders after a successful verify. Verify runs once (ref guard, StrictMode-safe). Single use is enforced by GoTrue in the database.
- The email is rendered as React text. Refusal keys come from a closed set; raw Supabase text is never shown. The post-save redirect target is a constant.
- **Next router state header:** Next 16 strips `__PAGE__?{search}` from `Next-Router-State-Tree` (`flight-data-helpers.js:187-192`), so prefetches made after the cleanup do not carry the token.

**Login CSRF / account confusion**
- Showing the email plus the "not your address" hint is a real improvement.
- Residual, unchanged: the page still signs the user in automatically after a save, so ignoring the hint still completes the attack.

**Third-party tags**
- GA4, the Meta Pixel and AttributionCapture never fire on login, onboarding or reset-password (`lib/consent-routes.ts:53-58`, `lib/attribution/capture.ts:145`).
- There is no Referrer-Policy header, so the browser default applies: Supabase, PostHog and Sentry receive the origin only.

**Sentry**
- No Replay integration is configured.
- `beforeSend`/`beforeSendTransaction` run after the event processors, so request data is present when it is scrubbed.
- Sentry 10 already filters `*token*` query keys (`filtering-snippets.js`); the custom scrubber adds `code`.
- Next 16 span names are the method or route only, with no query string.

**PostHog**
- `before_send` covers `$snapshot`: replay Meta `href` and network entries are plain objects. Full snapshots are gzipped, and rrweb replaces script contents with a placeholder.
- The project key `properties.token` is a key, not a value, so it is not over-scrubbed.
- No marketing parameter named `code` or `token` exists in showcase.

**Input abuse**
- `loginHrefWithEmail` encodes with URLSearchParams onto a fixed path. The login page only prefills; it sends nothing on its own.
- Any `token_hash` value is validated by Supabase, and the type is forced to `recovery`.

**Race and replay**
- Two devices using one link: GoTrue lets exactly one succeed.
- Residual, unchanged: the page verifies on load, so a link scanner that runs JS can use up the token (an availability problem, not a confidentiality one).

**Not applicable here**
- Cross-tenant access, paid-tier gate bypass, webhook forgery, abuse economics: no tenant data, billing gate, webhook or tier limit is touched.

**Scratch page**
- `app/[locale]/reset-password/ux-scratch-sta421/page.tsx` existed when I started and is deleted now. It hard-coded a real team address as a default and showed any `?email=` text on a public page that looks like the reset page.
- It was never in the diff. Confirm nothing under `reset-password/ux-scratch-*` lands in the commit.

## Resolution (2026-10-11)

- MED, email in `/login?email=`: `email` is now scrubbed from every URL PostHog and Sentry receive, and PostHog no longer sends its flags request (the one path outside `before_send`).
- LOW, other credentials (`/email-preferences` `t`, `/join/<code>`, `/demo/wallet-select/<token>`, `provider_*` fragments): pre-existing; filed as STA-427.
- LOW, over-scrubbing: the PostHog start gate only reacts to `token_hash`, `access_token` and `refresh_token` (a `?code=` promo link keeps analytics); URLs end at a double quote, so `$elements_chain` keeps everything but the scrubbed parameter (tested on a real chain string). `$heatmap_data` keys are scrubbed.
- LOW, cleanup reach: moved to the `[locale]` root layout with a lazy supabase-js import; removal tracked in STA-426.
- Scratch page: confirmed absent (`app/[locale]/reset-password/` holds only `layout.tsx` and `page.tsx`).
- Residual, unchanged: the page still signs in after a save; a JS-running link scanner can spend the token.
