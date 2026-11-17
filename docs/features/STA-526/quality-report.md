# Quality Report: STA-526
REVIEWED: 2026-11-13  DIFF: backend a753b734..f0ad1b4d (branch fix/sta-526-demo-page-misses-install); showcase 34601c3..6b7337a, code commit 604c608, docs excluded
VERDICT: FINDINGS

## Comments
- lib/demo/session-sync.ts:6 and hooks/useDemoSession.ts:128-130: "All three feed `receive`" omits the fourth caller, the SSE-fallback poll (useDemoSession.ts:243), which keeps its own 5 s interval and null handling; every stop needs two calls. Fix: name the fallback poll or say "every status read". Follow-up: move the fallback poll into session-sync.
- lib/demo/session-sync.ts:27 and :80: "null when it cannot be read right now" / "never treated as gone", but the wired `fetchSession` also returns null on a 404. Fix: "null on a network error or a 404; both are retried until idle".
- lib/demo/session-sync.ts:48: `isIdle` doc says "No status change", but `adopt` and `pageVisible` also reset the clock. Fix: "No status change or return to the page within INACTIVITY_TIMEOUT_MS."
- lib/demo/session-sync.ts:56: "Bumped on every state change", but it is bumped on every adopt/receive/stop. Fix the wording.
- hooks/useDemoSession.ts:128-130: three lines, the path repeats the import. Fix: one line.
- History/narrative: none. Density: in range (tests/test_demo_events.py docstring borderline, optional trim).

## File size
None found.

## Folder tree
- backend tests/ (192 root test files + 37 domain subfolders): new tests/test_demo_events.py. Move to tests/demo/ (with `__init__.py`), e.g. tests/demo/test_sse_fanout.py.

## Flag-gated paths
None found.

## Test shape
- tests/test_demo_events.py:46-70: two tests differing only in whether the old connection closes before the push. Fix: one test parametrized on `old_closed_first`.
- tests/test_demo_events.py:80: asserts on the private `_demo_queues`. Fix: keep `queue.empty()` only.
- tests/test_demo_events.py:99-104: the `(None, PUSHED)` row repeats :85-96. Fix: drop it, keep the points case as a plain test.
- lib/demo/session-sync.test.ts:94: asserts the interval equals its own constant. Fix: `expect(v.timers.size).toBe(1)`.
- lib/demo/session-sync.test.ts:119-127: two scenarios in one test. Fix: `test.each`.
- lib/demo/session-sync.test.ts: copied setup (adopt "tok" x9, adopt + server.state x4, pending literal x3). Fix: a `pending()` builder and `visitor()` taking an optional start and server state.

## Waivers
(none)
