# Screenshot specs: update-your-opening-hours-and-contact-details

Captured 2026-10-28 from a local build of the web repo's dev branch (origin/dev 58f74a0c) on localhost:3100, signed in through the dev showcase and talking to the dev backend, because the deployed dev dashboard was serving an older checkout without the STA-192 settings redesign. Capture script: scripts/help-shots/run.ts, recipe scripts/help-shots/recipes/update-your-opening-hours-and-contact-details.ts. Re-take one shot with `bun scripts/help-shots/run.ts update-your-opening-hours-and-contact-details --shot NN --app http://localhost:3100` (drop `--app` once app.dev.stampeo.app serves the dev branch).
Common setup: Aurevo (Growth, stamps), phone 402x874 at 2x, English, the admin session `camille@aurevo.seed.stampeo.app` shown as the owner (Settings is owner-only and not gated by plan).
Overlays: English profile and `NEXT_LOCALE=en`; the role shown as owner; the business shown as English-speaking (main language English, opening-hours days read Mon - Fri, Saturday, Sunday); every write blocked. The back-of-card title reads "Aurevo loyalty card" (the fixture's is French).

SHOT: update-your-opening-hours-and-contact-details-01.png
Business: Aurevo (Growth, stamps)
Where: Dashboard > Settings > On your customers' cards  (route: /settings, section #card-back)
Data prep: none (the seeded Opening Hours, Website and Phone lines; this business has no Address line)
Capture: the section only, all lines closed
Shows: each line with its summary, Add info, and the Card style note
Goes under: "Change your hours or a contact detail", step 1

SHOT: update-your-opening-hours-and-contact-details-02.png
Business: Aurevo (Growth, stamps)
Where: same section, the Opening Hours line opened
Data prep: Saturday's closing time typed as 17:00 on the page (not saved; writes are blocked)
Capture: from the section title down to the open line's Remove row (clipped above the Website line)
Shows: the rows, the Closed switches (Sunday on), Add time slot, the summary already reading Saturday: 10am-5pm
Goes under: step 3

SHOT: update-your-opening-hours-and-contact-details-03.png
Business: Aurevo (Growth, stamps)
Where: same section, after selecting Preview (on a phone it opens a sheet)
Data prep: none
Capture: the sheet from the Back of your card title to the Card style note
Shows: the real back of the card with its title, Opening Hours, Website and Phone
Goes under: "See what your customers see"

SHOT: update-your-opening-hours-and-contact-details-04.png
Business: Aurevo (Growth, stamps)
Where: Settings with one unsaved change (Saturday's closing time), viewport taller than the page so the bar sits after the last card with only plain background behind it
Capture: the Save bar only (the sticky element around Save changes)
Shows: Discard and Save changes. The Unsaved changes hint is hidden below 480 px, so a phone does not show it.
Goes under: step 4
