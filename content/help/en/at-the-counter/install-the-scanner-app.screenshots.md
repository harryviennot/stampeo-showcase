# Screenshot specs: install-the-scanner-app

Captured 2026-10-28 on the promo simulator ("Stampeo Promo iPhone 17 Pro", iOS 26.2, English, 9:41, full battery) from a Release simulator build of scanner-app 2.3.2 (dev branch, signed out, pointed at the dev Supabase and dev API). Capture script: scripts/help-shots/scanner/run.ts (build instructions in scripts/help-shots/README.md). Re-take with `bun scripts/help-shots/scanner/run.ts --app <StampeoDev.app> --shot install-the-scanner-app-01 --shot install-the-scanner-app-02`.
Common setup: scanner app signed out (the simulator's keychain is reset first), phone 402x874 at 2x (saved at 804x1748), full screen.
Overlays: none. These are the app's own screens.

SHOT: install-the-scanner-app-01.png
Where: scanner app, first screen when signed out (welcome)
Data prep: signed out
Capture: the full phone screen
Shows: Let's get you scanning., Join my team and Sign in
Goes under: "Sign in as the owner or an admin", after step 1

SHOT: install-the-scanner-app-02.png
Where: scanner app, after tapping Sign in
Data prep: signed out
Capture: the full phone screen
Shows: Welcome back with Continue with Google, Continue with Apple and Continue with email
Goes under: "Sign in as the owner or an admin", after step 2
