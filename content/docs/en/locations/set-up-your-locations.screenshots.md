# Screenshot specs: set-up-your-locations

Captured 27 October 2026 from a production build of the STA-189 web branch (localhost:3019)
and the branch backend (localhost:8011), on the dev database, through the journey harness
in `web/docs/features/STA-189/journey-harness.md`. Recapture any shot whose UI changes.
Common setup: Xeniká (Pro, points), owner session, English, phone viewport 402x874 CSS px at
2x (a separate mobile browser context), cropped as noted per shot.

Overlays, all in the capture browser only:
- Owner: the seeded login is an admin, so the `rest/v1/memberships` response role was rewritten
  to `owner`.
- English: `NEXT_LOCALE=en` cookie, and `GET /profile/me` rewritten to `locale: "en"`.
- Read only: every non-GET request to the API and to Supabase was aborted, except the simulated
  create below. Nothing was created, deleted, ticked or made primary. The writes counter stayed
  at 0 for the real requests.
- On-screen text `showcase.dev.stampeo.app` was replaced by `stampeo.app` in shots 01 and 03.

---

SHOT: set-up-your-locations-01.png
Business: Xeniká (Pro, points), owner
Where: Locations > Add your first location (route: /program/locations)
Data prep: the locations list response (`GET /locations/{business_id}`) was replaced by an empty
  list, to get the no-location state. The past-activity probe
  (`GET /transactions/{business_id}?location_id=__none__`) was the real response, so the question
  shows. The name "Rivoli" was typed. The address is the fixture business address, filled in by
  the form itself. Neither past-activity choice was selected, and Add location was not pressed.
Capture: the form dialog only, scrolled to the end (address card, the question and its two
  choices, the "choose once" line, the footer)
Shows: Where did your past activity happen? with Only at this location and At more than one
  location, neither selected
Goes under: step 3 of "Add your first location"

SHOT: set-up-your-locations-02.png
Business: Xeniká (Pro, points), owner
Where: Locations with one location (route: /program/locations)
Data prep: the locations list response was cut to the primary location (Xeniká Marais) only.
Capture: from the top of the page to the bottom of the Add your next location row, no sidebar
Shows: one location card with name and address only, no numbers, and the Add your next location
  row below it
Goes under: the paragraph on the past-activity choice, before "Add your next location"

SHOT: set-up-your-locations-03.png
Business: Xeniká (Pro, points), owner
Where: Locations > Add your next location, then the new location's panel
  (route: /program/locations?location=...)
Data prep: starting from the one-location state above, the name "Bastille" was typed and Add
  location pressed. The create request (`POST /locations/{business_id}`) was answered in the
  browser by a made-up 201 response, and the made-up location joined the list responses, so
  nothing was written. For the panel: the team response had a made-up scanner who has never
  scanned (Léa Martin) added; the first location's members response had Sarah Nguyen added, as the
  real split would place her (Marc Lefevre is really assigned there); the new location's QR response reused the
  first location's QR image with a link ending in `/l/bastille` (so the image matches no real
  link); its stats response was all zeros. The "Bastille added" message was left to fade before the
  shot.
Capture: the panel only, from its header down to the third scanner row
Shows: the QR code with Download PNG, Download PDF and Counter flyer for this location; Who can
  scan here with the note about who stays at the first location; nobody ticked; Léa Martin marked
  No location yet; the other two marked Scans at Xeniká Marais
Goes under: step 2 of "Add your next location"
