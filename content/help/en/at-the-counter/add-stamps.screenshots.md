# Screenshot specs: add-stamps

Captured 2026-10-28 on the promo simulator ("Stampeo Promo iPhone 17 Pro", iOS 26.2, English, 9:41, full battery) from a Release simulator build of scanner-app 2.3.2 (dev branch, pointed at the dev Supabase and dev API). Capture script: scripts/help-shots/scanner/run.ts (build instructions in scripts/help-shots/README.md). Re-take with `bun scripts/help-shots/scanner/run.ts --app <StampeoDev.app> --shot add-stamps-01`.
Common setup: Aurevo (Growth, stamps), signed in as the fixture admin `camille@aurevo.seed.stampeo.app` (the stamp flow is the same on every plan and role), phone 402x874 at 2x (saved at 804x1748), full screen.
Overlays: none. The stamp screen is opened by deep link (`stampeo-scanner:///stamp/<customer id>`) because the simulator has no camera. The capture never taps Add Stamp, so nothing is written.

SHOT: add-stamps-01.png
Business: Aurevo (Growth, stamps)
Where: scanner app > stamp screen of a customer (Aaron Morel, 3 of 8, a fixture customer), after tapping + twice
Data prep: a fixture customer with no reward waiting
Capture: the full phone screen
Shows: the customer's name and count (3 / 8), the stepper at 3 and the button reading Add 3 stamps
Goes under: "Add several stamps at once"

SHOT: (add-stamps-02)
NOT CAPTURED: the Stamp Added! screen only shows after tapping Add Stamp, which writes a stamp to the dev database (and pushes to a wallet pass). The brief allows it only without a database write, so it is skipped.
