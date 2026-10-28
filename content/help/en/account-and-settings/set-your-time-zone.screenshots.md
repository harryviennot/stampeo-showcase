# Screenshot specs: set-your-time-zone

Captured 2026-10-28 from a local build of the web repo's dev branch (origin/dev 58f74a0c) on localhost:3100, signed in through the dev showcase and talking to the dev backend, because the deployed dev dashboard was serving an older checkout without the STA-192 settings redesign. Capture script: scripts/help-shots/run.ts, recipe scripts/help-shots/recipes/set-your-time-zone.ts. Re-take one shot with `bun scripts/help-shots/run.ts set-your-time-zone --shot NN --app http://localhost:3100` (drop `--app` once app.dev.stampeo.app serves the dev branch).
Common setup: Aurevo (Growth, stamps), phone 402x874 at 2x, English, the admin session `camille@aurevo.seed.stampeo.app` shown as the owner (Settings is owner-only and not gated by plan).
Overlays: English profile and `NEXT_LOCALE=en`; the role shown as owner; the business shown as English-speaking (main language English, opening-hours days read Mon - Fri, Saturday, Sunday); every write blocked.

SHOT: set-your-time-zone-01.png
Business: Aurevo (Growth, stamps)
Where: Dashboard > Settings > Address and time zone  (route: /settings, section #address)
Data prep: none
Capture: from the section title to the hint under Time zone (the street address below is left out)
Shows: Country and Time zone, one under the other on a phone, with the hint
Goes under: "Check or change it", after step 2

SHOT: set-your-time-zone-02.png
Business: Aurevo (Growth, stamps)
Where: Settings > Time zone, opened (a sheet on a phone), "Paris" typed in the search
Data prep: none
Capture: the sheet from its title to the match
Shows: the search box with Paris and the Paris (GMT+1) match
Goes under: "Check or change it", after step 4
