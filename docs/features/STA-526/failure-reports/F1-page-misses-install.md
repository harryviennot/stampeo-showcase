CASE: STA-526 F1 (no runbook case yet: the landing demo has no runbook)
VERDICT: FAIL
SEVERITY: CORE
RUN: 2026-11-13, prod (stampeo.app + api.stampeo.app), Harry's iPhone, iOS 27
SURFACE: showcase landing page, "Try it yourself" (`components/sections/HeroDemo.tsx`, `hooks/useDemoSession.ts`), backend `app/demo/routes.py` + `app/demo/events.py`
ACCOUNT: none (anonymous visitor)

## Failed at

Step 3: tap Add in the Apple Wallet sheet, then look at the page.

Steps:
1. Open the landing page in Safari on an iPhone.
2. Tap "Add to Apple Wallet" on the demo card.
3. Tap Add in the Wallet sheet.

## Expected

The page flips to the "added" state and the stamp button is enabled.

## Actual

- The card is added to Wallet.
- The page stays on "Add the pass to your Apple Wallet…" and the stamp button never enables.
- About 5 minutes later the phone shows the demo's follow-up notification.
- On iOS 26 the tab used to land on the API pass URL after Add; going back to the landing page showed the "added" state. On iOS 27 the sheet closes back onto the landing page itself.

## Evidence

- The follow-up push is scheduled by `register_demo_device` (`app/demo/routes.py`) 300 s after Wallet's device registration. Receiving it 5 minutes after Add means Wallet registered right away and the backend set the session to `pass_installed`. The page missed an update the server had.
- `hooks/useDemoSession.ts` closes its EventSource when the page is hidden and opens a new one when it is visible again (and on SSE errors, after 2 s).
- `app/demo/events.py` keeps ONE queue per session token. A reconnecting stream gets the same queue as the old stream, which only notices its client is gone at its next 15 s keep-alive tick:
  - while the old stream is still waiting, it is first in line on the queue and takes the update, writing it to a closed connection;
  - when it exits, its `finally` pops the shared queue from the dict, so the new stream is deaf for good and `push_update` finds no queue.
- So the phone page only flips if Wallet registers before the page reconnects (the new stream's first message reads the status from the database). The computer + QR flow keeps one stream open on a visible tab, which is why it mostly works (55 of 78 vs 25 of 71 on iPhone Safari, F0).

## State at time of failure

- Session: not captured (Harry's own test on his phone).
- Preceding cases this run: none.

## Aftermath

- RESET performed: none needed (demo rows expire in 24 h).
- Run continued: no.

## Hypothesis (optional, clearly speculative)

iOS 27 closes the Wallet sheet back onto the page before Wallet's registration request lands, so the reconnect now usually wins the race. On iOS 26 the tab navigated to the API URL, and the user came back after the registration, so the first message carried `pass_installed`.
