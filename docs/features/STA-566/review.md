# STA-566 review: Phase A (site events, PostHog hygiene, heatmaps off)

One review, fresh context, 17 Nov 2026, on `feat/sta-566-posthog-journey` (Phase A only: AC13, AC14, H7). No security review:
no auth, billing, Stripe, webhook or migration; the change only removes data from what PostHog receives.

## Coverage (coverage-auditor): 4 BLOCKs → fixed (d431041, 940663f, 57ab01a, 7492808)
- Click ids still reached PostHog through posthog-js's own `$session_entry_<clickid>` properties; the scrub now drops a click
  id after any PostHog prefix, and names the vendor only for a click id that has a value (a ChatGPT landing came out "google").
- The scrub's fixtures were hand-built and hid that; they are now raw events captured from posthog-js on the site's pages
  (`lib/posthog/__fixtures__/`).
- `faq_answer_opened` never fired on the pricing pages (their FAQ is its own markup); now wired, tests on real routes.
- "A failed send never costs the visitor their tap" was untested; now 7 call sites with `capture` throwing.

## Quality (code-quality-reviewer): 4 BLOCKs → fixed
- A history comment and two headers that contradicted the code; `lib/privacy` past 30 entries: the PostHog-only scrub
  moved to `lib/posthog/scrub.ts`.

## Also fixed while there
`session_token` dropped by the scrub itself (the source-scan test is gone); `/join/{code}` gets the `:token` treatment; the
top-level Loyalty link reports `nav_preview_opened`; a double tap in the quiz sends one answer; PostHog sends no
feature-flag request at all (1096d91), since that request carries person properties past the scrub.

## Notes for the PR description
`FAQList` became a client component; `faq` carries the localized question (`position` is the cross-language key); the
legacy quiz and blog FAQs send nothing; scroll depth relies on posthog-js's `$prev_pageview_max_scroll_percentage`.

## Waivers
None.
