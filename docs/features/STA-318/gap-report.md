# Gap Report — STA-318 (GA4 on the marketing site)

AUDITED: 2026-09-20 (Phase 3, fresh-context `coverage-auditor`)
INPUTS: `plan.md`, the implementation diff, `lib/google-analytics.test.ts`
VERDICT AT AUDIT: **GAPS FOUND + DRIFT FOUND**
STATUS NOW: **all blocking gaps closed** — see "Resolution" per item.

## The headline finding

> The suite tested the *predicates* and never the *wiring*. Every consent and
> route decision was enforced at a call site no test touched. Delete
> `shouldLoadGa`'s result check, or `trackGaEvent`'s send guard, and the suite
> stayed green.

Every `trackable` in the original suite was a hand-written boolean literal, so
the route table and the gate could drift apart without failing anything. This
is the same failure mode the STA-323 audit found, and the reason each fix below
was **mutation-tested**: the guard was deleted, the suite was re-run, and the
fix was only accepted once the suite went red.

## Gaps and resolutions

| # | Gap | AC | Resolution |
|---|-----|-----|-----------|
| 1 | `isTrackablePath` never imported; `trackable` always a literal | AC13 | `describe("the gate, against the REAL route predicate")` derives every `trackable` from the real predicate, across `/onboarding`, `/{slug}` and the marketing routes. **Mutation: allowlist removed → CAUGHT; `pricing` dropped → CAUGHT.** |
| 2 | `trackGaEvent` / `isGaLoaded` / `initGa` / `trackGaPageView` untested — the consent-critical send guards | AC1–AC4, AC7, AC11 | `describe("the browser side, in load order")` runs them against a stubbed `window`/`document`. Tests that a gtag **already present** before load is still not called — the guard is our `initialised`, not the global. **Mutation: send guard removed → CAUGHT; idempotency guard removed → CAUGHT; page_path hardcoded → CAUGHT.** |
| 3 | CTA tables not pinned against `CTALocation` — a tenth location would be silently unmapped | AC10 | The union is now **read out of `lib/analytics.ts` at runtime**, not copied. A type-level `satisfies`/`never` guard was tried first and found **inert**: `tsconfig.json` excludes `**/*.test.ts` from the compile, so type assertions in test files are never checked. Mirrors `consent-routes.test.ts`, which reads the route folder for the same reason. **Mutation: new CTALocation added → CAUGHT.** |
| 4 | GA send not guarded — plan.md:163 "a throw inside a click handler breaks navigation site-wide" | plan.md:163 | `trackGaEvent` now wraps the `gtag` call in try/catch. Losing the measurement is the acceptable failure; losing the signup is not. **Mutation: try/catch removed → CAUGHT.** |
| 5 | `landing_variant` never sent — plan.md:174 "the tools will disagree on variant performance" | plan.md:174 | `trackGaEvent` attaches `landing_variant` from `document.body.dataset.landingVariant`, which `LandingTracker` already publishes. Absent stays absent — defaulting to the control would credit it for every conversion begun elsewhere. **Mutation: attach removed → CAUGHT; default to "a" → CAUGHT.** |
| 6 | Consent fixtures used `v: 1` while `CONSENT_VERSION` is 2 — they described a visitor `parseConsentCookie` rejects | — | Fixtures now import `CONSENT_VERSION`, so they cannot go stale again. |
| 7 | `readMeasurementId` edge cases: lowercase, bare `G-`, pasted URL, inner punctuation | AC1 | Added. **Mutation: `G-` validation weakened to an empty check → CAUGHT.** |
| 8 | `readDebugMode` untested | — | Added, plus an assertion that `?debug_mode=1` reaches the `config` call. |

## Findings assessed and NOT actioned

- **"GA and PostHog disagree on locale-prefixed `/contact` hrefs."** Not live.
  The `href` reaching `CTAButton` is the **unprefixed** route (`/contact?type=demo`
  at `VariantFinalCTA.tsx:42`); `Link` from `@/i18n/navigation` prefixes at render
  time. Both tools agree on every real call site. The GA regex is defensive, and
  the code comment claiming it "mirrors" PostHog is merely broader, not divergent.
- **`PRIVATE_SEGMENTS` mutations survive** (`onboarding` removed → suite stays
  green). Correct by design, and already documented at `consent-routes.ts:88-90`:
  the allowlist rejects `onboarding` anyway, so the private table is
  defence-in-depth. The invariant that makes the ordering matter — the two sets
  being disjoint — is pinned at `consent-routes.test.ts:128`.
- **Meta pixel / `AttributionCapture` in the same diff.** Branch scope, not code
  scope: STA-319 and STA-323 share this branch. Noted, not changed.

## Drift folded back into plan.md

- `contact_cta_click` and the `CONTACT_CTAS` taxonomy — a second conversion
  event the plan never named.
- `debug_mode` / `readDebugMode` — DebugView support, and the `?debug_mode=1`
  operator instruction in `ga4-setup.md`.

## Verification

- `bun test lib` — 652 pass, 0 fail
- `bun run type-check` — clean
- `bun run build` — succeeds
- **Consent gate verified against the real build**: of 213 prerendered HTML
  files, 210 contain "Stampeo" (control) and **0** contain `googletagmanager`
  or the measurement id. The tag never ships in server HTML.

## Waivers

None.
