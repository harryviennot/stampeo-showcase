# Gap Report: STA-419
AUDITED: 2026-10-10 (coverage-auditor, fresh context; F-01 + diff + tests)
VERDICT: DRIFT + GAPS FOUND → resolved or open as listed

## Criteria without tests
| Gap | Resolution |
|---|---|
| Page flow (verify → update on the same client → sign in → redirect) untested. | **OPEN, manual:** showcase has no component/DOM test runner (`bun test lib scripts` only). Covered by QA RP-01. |
| The lock contention itself never reproduced. | **Fixed:** test simulates a browser with a recording `navigator.locks`: a default client asks for `lock:sb-<ref>-auth-token`, the recovery client asks for no lock at all. Mutation-checked (a persisted recovery session fails it). |
| One client per page (lazy `useState`). | **OPEN, manual:** page-level; RP-01 types many keystrokes before submitting. |
| Raw abort text never reaches the page. | Helper now pins the exact message it returns (so `translateError` can route it); the page mapping is manual (RP-01). |

## Drift
| Item | Resolution |
|---|---|
| `persistSession: false` changes behaviour: a reload after the link is checked loses the recovery session. | Kept on purpose: it is what removes the Web Lock (`GoTrueClient.js:146-151`) and leaves no recovery tokens in storage. Recorded in F-01; QA RP-03 added. The code comment now names the real mechanism. |
| `autoRefreshToken` / `detectSessionInUrl` off; `verifyOtp` catch/finally. | Kept: a one-page recovery session needs neither, and every reset link uses `?token_hash=`. The catch stops a thrown verify from leaving the spinner up forever (same class of failure). |

## Suspect tests
| Gap | Resolution |
|---|---|
| storageKey comparison pinned the means, and bun has no Web Locks. | Replaced by the browser-simulated lock test above. |
| Error tests only asserted `toBeString()`. | Now assert the exact message. |

## Unrealistic or missing workflow tests
| Gap | Resolution |
|---|---|
| Reload / tab discard after verify. | QA RP-03 (manual). |
| Retry after a failed submit; sign-in failing after the save; two tabs. | Not added: page-level, no runner; the helper is stateless, so a retry reuses the same in-memory client. |
| RP-01 expected no "Multiple GoTrueClient instances" warning, but dev Strict Mode builds the client twice. | Fixed: RP-01 notes the warning is expected on dev. |

## Waivers
None. Open manual items await Harry's RP-01..RP-03 run.
