# Screenshot specs: export-your-customer-list

Captured 2026-10-28 from a local build of the web repo's dev branch (origin/dev 58f74a0c) on localhost:3100, signed in through the dev showcase and talking to the dev backend, because the deployed dev dashboard was serving an older checkout without the STA-192 settings redesign. Capture script: scripts/help-shots/run.ts, recipe scripts/help-shots/recipes/export-your-customer-list.ts. Re-take one shot with `bun scripts/help-shots/run.ts export-your-customer-list --shot NN --app http://localhost:3100` (drop `--app` once app.dev.stampeo.app serves the dev branch).
Common setup: Aurevo (Growth, stamps), phone 402x874 at 2x, English, the admin session `camille@aurevo.seed.stampeo.app` shown as the owner (the Export button is owner-only and appears on every plan).
Overlays: English profile and `NEXT_LOCALE=en`; the role shown as owner; every write blocked. Nothing is clicked: the export is never run.

SHOT: export-your-customer-list-01.png
Business: Aurevo (Growth, stamps)
Where: Dashboard > Customers  (route: /customers)
Data prep: none (the business has 240 customers, so the button shows)
Capture: the top 124 px of the page only: the menu button, Export, the title and the subtitle
Shows: where Export sits on a phone, next to the menu button
Goes under: "Download the list", after step 2
Why cropped this tight: the customer names sit just below. Never widen this shot to include them.
