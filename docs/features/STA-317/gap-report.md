# Gap report: STA-317

AUDITED: 2026-09-16, `coverage-auditor` (fresh context: plan + diff + tests only)
VERDICT AT AUDIT TIME: gaps found + drift found
STATUS NOW: all gaps closed or accepted with a reason, below.

## Gaps closed

| Finding | Resolution |
|---|---|
| **AC8 (`stampeo:consent`) untested, and not in the manual script either.** The seam STA-318/319/320 are all blocked on; renaming the event string breaks three downstream issues with a green suite. | Closed. `lib/consent.test.ts` now pins both event name constants as contract, asserts a subscriber receives the event with the new state as `detail`, asserts unsubscribe detaches, and asserts subscribing off the browser still returns a callable cleanup. Mutation-checked: renaming the constant reds the suite. |
| **The entire browser half of `lib/consent.ts` was untested** (`writeConsentRecord`, `clearCookiesFor`, `detectGpc`, `detectConsentRegime`, `hasAnalyticsConsent`, `hasMarketingConsent`). | Closed. The tests install a fake `document`/`window`/`navigator`, so the hand-assembled cookie string, the storage-refused `try/catch`, the multi-scope deletion loop, the strict `=== true` GPC read and the `Intl`-throws fallback are all asserted. |
| **`consentCookieAttributes` skipped `secure` and `domain`** — the two fields D9 specifies and the two the implementation changed. | Closed. Both are now asserted, including that an unset `NEXT_PUBLIC_COOKIE_DOMAIN` yields no `Domain` attribute at all rather than an empty one. |
| **`ConsentPreferences` rendered unconditionally, including on untrackable acquisition pages**, so a stray `stampeo:consent-open` could write a consent record from `/some-cafe`. AC10 had been evaluated for the banner only. | Closed, and it was a real hole. `trackable` now gates the dialog and the `CONSENT_OPEN_EVENT` listener, not just the banner. Verified those pages render no `Footer`, so no reachable control was removed. |
| **Notice dismissal was component state only**, so the US notice returned on every navigation and reload. | Closed. Dismissing now records the opt-out regime's default through the same `commit` path, so it persists for six months and leaves evidence of what the visitor was told. |
| **AC14's first clause was unguarded** — the retired "does not require a cookie consent banner" sentence could silently return, especially via the parallel tree under `.claude/worktrees/`. | Closed. `lib/legal/legal.test.ts` now asserts, per locale, that the retired claim is absent, that Google/Meta/TikTok are named, and that every cookie the revocation path deletes is listed. Mutation-checked: reintroducing the sentence, and dropping `_ttp`, each red the suite. |
| **`CONSENT_VERSION` was not pinned to `1`**, so a bump would invalidate every stored choice while passing every test. | Closed. Pinned, plus an assertion on the serialized wire form. |

## Findings accepted, with reasons

- **`useConsent()` lives in `hooks/`, not `lib/`** (plan D6 put it in `lib/consent.ts`). Moving it back would not make it testable: `bun test lib` has no DOM, so a React hook is unrun wherever it sits. It sits beside `hooks/use-detected-country.ts`, which solves the same problem the same way. The logic it wraps is in `lib/` and is tested; the hook is snapshot plumbing. Plan amended rather than code moved.
- **Cookie `Domain` comes from `NEXT_PUBLIC_COOKIE_DOMAIN`, not `cookieDomainForHost()`** as D9 said. `cookieDomainForHost` takes a request host and is used by middleware; this is a client-side write with no request in hand, and `lib/last-login.ts` — the existing client-side cookie writer — already reads the env var. Now covered by a test either way. Plan amended.
- **Exported names differ from the approved list** (`readConsentRecord`/`writeConsentRecord`/`clearCookiesFor` rather than `readConsent`/`writeConsent`/`clearCategoryCookies`). The names three other issues consume — `hasAnalyticsConsent`, `hasMarketingConsent`, `useConsent` — are unchanged. Plan's Files section updated so Phase 6 amends STA-318/319/320 onto the real names.
- **`lib/timezone-country.ts` extraction is unplanned scope.** Necessary, not optional: `lib/phone-utils.ts` pulls `libphonenumber-js` and its example-number data, and the banner renders on every page, so importing `countryForTimezone` from there would have put that payload in the global bundle on a site with a CI Lighthouse gate. Behaviour-preserving, re-exported, and still covered by the unmodified `lib/phone-country.test.ts`. Plan amended.
- **The dialog opens with both switches ON for a US visitor with no stored record.** In tension with D5's "both off by default", but D5 was written about the opt-in case. Under D2 those categories genuinely ARE on for that visitor; showing them off would misreport the live state. Kept, and now stated in the plan.
- **`Cancel` in the preferences dialog** is unplanned but is not the forbidden dismiss-that-is-not-a-choice: it closes a second-layer dialog and returns the visitor to the banner, which still demands an answer. Escape and the backdrop do the same thing by D6's design. Plan amended.
- **AC15's dialog half is not gated by Lighthouse**, since a closed `<dialog>` never enters the accessibility tree. True. The dialog is built on the native element precisely so the trap, Escape and labelling are the browser's rather than ours; the runbook adds a manual keyboard case.
- **`isTrackablePath` "private routes" test is vacuous** — it would pass with `PRIVATE_SEGMENTS` empty, since the predicate is an allowlist. The predicate now rejects private segments explicitly (so the table is load-bearing in the code), and the test comment states plainly that the drift guard, not this test, is what pins the table.
- **The `#` branch of the path split, and `cookieNamesToClear`'s dedupe, remain untested.** Both are one-line, and a failure is cosmetic (a banner shown on a fragment URL, a duplicate expiry write). Accepted.

## Waivers

None requested.

---

# Review round: Greptile on PR #128

Three findings, all valid, all fixed. CI was green (test, lint-and-build,
lighthouse, audit) before and after.

| Finding | Resolution |
|---|---|
| **P1 — consent lost when storage fails.** The `catch` around the cookie write kept no in-memory record, so with storage blocked (Safari private mode) the reader re-read an unchanged jar: clicking Refuse left the banner up, and in the opt-out regime a refusal resolved straight back to granted. The comment claimed "the choice still holds for this session in memory" and no such thing existed. | Fixed. `writeConsentRecord` now verifies the write by reading the jar back and keeps an in-memory `sessionRecord` **only when it did not stick** — which also catches the silent failures a `try/catch` never sees, such as a `Secure` cookie dropped over plain http. It is a fallback, not a cache: a readable cookie always outranks it, so a choice made in another tab still wins, and a successful write clears it. Four tests, mutation-checked. |
| **P2 — the footer preferences button did nothing on `/email-preferences`.** That route is in `PRIVATE_SEGMENTS` but renders the `Footer`, so gating the dialog on `isTrackablePath` made a visible control dead on click. | Fixed, and it corrects an overreach from the coverage-audit round. `trackable` now gates **solicitation only**. Asking is what must not happen on a business's QR enrollment page; reopening an existing choice must work wherever it can be reached, because withdrawal has to be as easy as consent. The footer is the real gate, and acquisition pages render no footer. A test reads the route folders off disk and pins that `/email-preferences` carries a footer while being untrackable. |
| **P2 — the GPC promise did not match behaviour.** §5 said, in four languages and without qualification, that a Global Privacy Control signal is treated as a refusal and that we do not ask. In fact an existing stored grant outranks GPC, and an opt-in visitor is still shown the banner. | Fixed in all four locales. The section now states the no-record condition, that the US sees no notice while Europe is still offered the banner so it can opt in deliberately, and that a choice the visitor makes themselves takes precedence over the signal. |

Nothing was disputed or deferred.
