# Screenshot specs: delete-a-location

Captured 26 October 2026 against a production build of the STA-189 web branch
and the branch backend, on the dev database. Recapture any shot whose UI changes.

Both were taken on **Xeniká** (Pro, points), signed in as its owner, at a
1280 px wide window with a 2x pixel ratio, cropped to the element named under
"Capture". The dashboard was switched to English for the capture only: the
`NEXT_LOCALE` cookie was set to `en` and the `GET /profile/me` response was
rewritten in the browser to `locale: "en"`, so the account is still French in
the database and nothing had to be set back.

Read only: **Delete** was never pressed (the message was closed with Keep), and
every write request to `/locations/**` was blocked in the browser. Never press
it on the shared fixtures.

---

SHOT: delete-a-location-01.png
Business: Xeniká (Pro, points), signed in as owner
Where: Locations > "Xeniká Batignolles" (not the primary) > Danger zone > Delete
  location
Data prep: none. Sarah Nguyen is assigned only to this location, which is why the
  message names her. Close with Keep.
Capture: the message only
Shows: the title, the three consequences (filters and assignments, past activity,
  printed QR code under the main link), the scanner who can no longer scan, and
  **Keep** and **Delete**

SHOT: delete-a-location-02.png
Business: Xeniká (Pro, points), signed in as owner
Where: Locations > "Xeniká Marais" (the primary) > Danger zone
Data prep: none
Capture: the Danger zone section only
Shows: **The primary location can't be deleted. Make another location primary
  first.** and no Delete button
