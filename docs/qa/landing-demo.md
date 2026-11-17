BRANCH: fix/sta-526-demo-page-misses-install
SCOPES: showcase, backend
ENVIRONMENT: the real landing page (`stampeo.app`, or a `bun run publicdev` tunnel with a backend whose public URL and Apple/Google certs are valid). Real phones only: a Wallet pass cannot be added from a desktop emulator. Anonymous visitor, no account. Nothing here touches customer data; demo sessions expire after 24 hours.

# Landing demo Test Pass

The "Try it yourself" card on the landing page: a visitor adds a demo pass to their wallet, the page notices, and the "Add Stamp" button appears and reaches the card. Work top to bottom on the devices named in each case. DEMO-01 gates everything on the phone; DEMO-02 is the same flow on a computer.

---

## SETUP: Before you start

Everything below uses the public demo, no login. Each case starts from a visitor who has never used the demo (R1).

### Where things live

| Surface | URL / Command | Notes |
|---|---|---|
| Landing page, stamp demo | `https://stampeo.app` | The first card in the hero. A phone shows an "add to your Wallet" button; a computer shows a QR code on the card. |
| Landing page, points demo | same page, switch the card type | Uses the same session logic with its own session; not a separate case. |
| Events from the page | PostHog `demo_step_reached` (steps `pass_downloaded`, `pass_installed`) | One event per step per session. A step arriving twice is a failure. |

### Accounts

None.

### Reset recipes

**R1: start as a new visitor** (before every case)
Open the page in a private tab, or clear the site data for the page. The session lives in the `stampeo_demo_session` key (`stampeo_demo_session_points` for the points card). On the phone, also remove the demo pass from Wallet (iPhone: open the pass, ... , Remove Pass; Android: Google Wallet, the pass, Remove).

### Known state before you start

- **DEMO-01 and DEMO-04: fixed, pending re-verification on a real iPhone.** On iOS the page failed to flip to "added" (F1): it closes its event stream when the tab is hidden and opens a new one when visible, and the server gave the new stream the old stream's queue, so the install update went to a dead connection. The server now keeps one queue per connection, and the page re-reads the session when it becomes visible and polls while the install is unconfirmed. Verified with unit tests on both sides only; not yet run on a device. Test these two first.
- **Targeted re-run for this fix:** DEMO-01, DEMO-04, and DEMO-02 (same code path, must not have regressed).
- **A desktop browser proves nothing about the iPhone cases.** Safari on a Mac does not close the Wallet sheet onto the page the way iOS 27 does.

---

## DEMO: The wallet demo

### DEMO-01: iPhone Safari, direct add flips the page [BLOCKER]

| Field | Content |
|---|---|
| WHY | The reported failure. On iPhone the page must notice the install without the visitor doing anything; if it stays on "Add the pass...", the demo looks broken to the visitor who matters most. |
| DEPENDS | none |
| ACCOUNT | No session at all. iPhone, Safari, iOS 26 or later. |
| STEPS | 1. R1. 2. Open the landing page. 3. Tap "Try it — add to your Wallet". 4. Tap Add in the Wallet sheet. 5. Stay on the page and watch it. |
| EXPECT | Within about 5 seconds of Add, "Add the pass to your Apple Wallet..." is replaced by "Your pass is ready! Try adding a stamp." with the "Add Stamp" button, with no reload. You do NOT see "Add Stamp" before Add (the page shows the Wallet button, then the waiting hint). About 5 minutes after Add, the phone shows the demo's follow-up notification. |
| RESET | R1. |

### DEMO-02: computer page, phone scans the QR [CORE]

| Field | Content |
|---|---|
| WHY | The original path: the computer tab stays open and visible while the phone adds the pass. The fix touches the same code, so this must not regress. |
| DEPENDS | none |
| ACCOUNT | No session at all. A computer and an iPhone. |
| STEPS | 1. R1 on the computer. 2. Open the landing page and keep the tab visible. 3. Scan the QR code on the card with the iPhone camera and tap the link. 4. Tap Add in the Wallet sheet. 5. Look at the computer. |
| EXPECT | The computer page flips to "Your pass is ready!" with the "Add Stamp" button within about 5 seconds of Add, without a reload. You do NOT see the waiting hint stay after that, and the card's QR code is gone. |
| RESET | R1. |

### DEMO-03: Android Chrome and Google Wallet [CORE]

| Field | Content |
|---|---|
| WHY | Google Wallet confirms the install through a server-to-server callback, a different path from Apple's; it must still end on the same page state. |
| DEPENDS | none |
| ACCOUNT | No session at all. Android phone, Chrome, signed in to Google Wallet. |
| STEPS | 1. R1. 2. Open the landing page. 3. Tap "Try it — add to your Wallet" and save the pass in Google Wallet. 4. Return to the page. |
| EXPECT | The page shows "Your pass is ready!" with the "Add Stamp" button within a few seconds of saving, without a reload. (If it takes noticeably longer, record the time in the failure report.) You do NOT see "Add Stamp" before the pass is saved. |
| RESET | R1. |

### DEMO-04: leave the page during the add, come back [BLOCKER]

| Field | Content |
|---|---|
| WHY | The cause of the failure: the page drops its live connection while hidden. A visitor who switches apps while adding (or whose browser buffers the live connection) must still land on "added" without reloading. |
| DEPENDS | DEMO-01 |
| ACCOUNT | No session at all. iPhone, Safari. |
| STEPS | 1. R1. 2. Open the landing page, tap "Try it — add to your Wallet" and tap Add. 3. Straight away, switch to another app (or the Home Screen) and stay away for about 10 seconds. 4. Switch back to Safari. |
| EXPECT | The page already shows "Your pass is ready!" with the "Add Stamp" button, or does within a few seconds of coming back, with no reload. You do NOT have to reload or reopen the page. PostHog shows one `pass_installed` step for the session, not two. |
| RESET | R1. |

### DEMO-05: a stamp after "added" reaches the card [CORE]

| Field | Content |
|---|---|
| WHY | "Added" is only useful if the demo's promise holds: tapping Add Stamp updates the card in the visitor's wallet. |
| DEPENDS | DEMO-01 (or DEMO-02) |
| ACCOUNT | The session from DEMO-01 or DEMO-02. |
| STEPS | 1. With the page at "Your pass is ready!", tap "Add Stamp". 2. Look at the pass in Wallet. |
| EXPECT | The pass shows 1 stamp within a few seconds, and the page's card shows 1 stamp. You do NOT see the stamp count on the page and in Wallet disagree. |
| RESET | R1. |

---

## Execution rules (for the testing agent)

1. **Order.** Setup first. Then DEMO-01 and DEMO-04 (the fix), then the rest.
2. **On BLOCKER failure:** stop. DEMO-04 and DEMO-05 are SKIPPED if DEMO-01 fails. Write a failure report.
3. **On CORE failure:** write a failure report, skip only its dependents, continue.
4. **On ambiguity:** consult WHY. If still ambiguous, report it as AMBIGUOUS with what you saw, so the runbook gets fixed.
5. **After any failure:** run the case's RESET before retrying or moving on.
6. **Reporting:** one failure report per failed case, using the failure report template. Reference cases only by ID.
7. **Re-runs after fixes:** re-run the failed case, its dependents, and any case listed in "Known state" as needing re-verification. Nothing else.
