# F1: the landing demo page only shows the added card after a reload (iPhone)

**Reported:** Harry, 17 Nov 2026, on his iPhone, after the STA-526 fix shipped (showcase #204, backend #319).

**Expected:** on the phone, tap Add to Apple Wallet, then Add in the sheet: within a few seconds the page shows the card
as added and offers the stamp button, with no reload.

**Actual:** the card is in Wallet, but the page keeps showing the Add button until it is reloaded.

**State:** the visitor's own phone, direct add (no QR); the page's session is still `pending` when the button is tapped.

**Observed in code (not on a device log):**
- `lib/demo/session-sync.ts` polls only while the page already knows the pass was opened (`pass_downloaded`).
- The phone's Add button (`MobileWalletButton` in `components/sections/HeroDemo.tsx`) is a plain link, so the page never
  learns it was tapped.
- iOS 27 opens the Wallet sheet over the page without hiding it, so the re-read on "visible again" never runs.
- When the event stream misses the server's update, nothing makes the page read the session again until a reload does.

**Fix:** the tap tells the page to expect the install (`expectInstall`), and the page polls every 3 s until the card is
installed or the page has been idle for 10 minutes. Regression tests: `lib/demo/session-sync.test.ts`, "a … demo added from
the phone while the page still shows it pending" and "after a tap on Add".
