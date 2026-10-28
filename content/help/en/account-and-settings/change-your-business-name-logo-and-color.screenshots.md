# Screenshot specs: change-your-business-name-logo-and-color

Captured 2026-10-28 from a local build of the web repo's dev branch (origin/dev 58f74a0c) on localhost:3100, signed in through the dev showcase and talking to the dev backend, because the deployed dev dashboard was serving an older checkout without the STA-192 settings redesign. Capture script: scripts/help-shots/run.ts, recipe scripts/help-shots/recipes/change-your-business-name-logo-and-color.ts. Re-take one shot with `bun scripts/help-shots/run.ts change-your-business-name-logo-and-color --shot NN --app http://localhost:3100` (drop `--app` once app.dev.stampeo.app serves the dev branch).
Common setup: Aurevo (Growth, stamps), phone 402x874 at 2x, English, the admin session `camille@aurevo.seed.stampeo.app` shown as the owner (Settings is owner-only and not gated by plan).
Overlays: English profile and `NEXT_LOCALE=en`; the role shown as owner; the business shown as English-speaking (main language English, opening-hours days read Mon - Fri, Saturday, Sunday); every write blocked. The logo is shown as the business's own dark logo tile: the seeded logo is white lettering that disappears on the white card.

SHOT: change-your-business-name-logo-and-color-01.png
Business: Aurevo (Growth, stamps)
Where: Dashboard > Settings > Business profile  (route: /settings, section #profile)
Data prep: none
Capture: the Business profile card only (viewport made taller so it fits without scrolling)
Shows: the logo with Change, Adjust crop and Remove; Business name; Brand color with the card's swatch before the divider; the Card style note
Goes under: the intro, before "Change your logo"

SHOT: change-your-business-name-logo-and-color-02.png
Business: Aurevo (Growth, stamps)
Where: Settings > Business profile, after selecting Remove under Logo
Data prep: none (nothing is confirmed: the capture never selects Remove logo, and writes are blocked)
Capture: the confirmation dialog only
Shows: Remove your logo?, Remove logo, Keep logo
Goes under: "Remove your logo", step 2
