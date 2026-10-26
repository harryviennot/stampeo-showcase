# Screenshot specs: edit-a-location

Captured 26 October 2026 against a production build of the STA-189 web branch
and the branch backend, on the dev database. Recapture any shot whose UI changes.

All four were taken on **Xeniká** (Pro, points), signed in as its owner, at a
1280 px wide window with a 2x pixel ratio, cropped to the element named under
"Capture". The dashboard was switched to English for the capture only: the
`NEXT_LOCALE` cookie was set to `en` and the `GET /profile/me` response was
rewritten in the browser to `locale: "en"`, so the account is still French in
the database and nothing had to be set back.

Read only: Save and Make primary were never pressed (the dialogs were cancelled),
and every write request to `/locations/**` was blocked in the browser.

Browser-side adjustment: on-screen text `showcase.dev.stampeo.app` was replaced
by `stampeo.app`.

---

SHOT: edit-a-location-01.png
Business: Xeniká (Pro, points), signed in as owner
Where: Locations > "Xeniká Batignolles" (not the primary) > Details section
Data prep: none
Capture: the Details section only, from its heading down to the two buttons
Shows: **Address**, **Map pin** set, the line about the scanner app, **Edit
  details** and **Make primary**

SHOT: edit-a-location-02.png
Business: Xeniká (Pro, points), signed in as owner
Where: Locations > "Xeniká Batignolles" > Make primary
Data prep: none; cancel the dialog
Capture: the confirmation only
Shows: the question and the **Cancel** and **Make primary** buttons

SHOT: edit-a-location-03.png
Business: Xeniká (Pro, points), signed in as owner
Where: Locations > "Xeniká Batignolles" > Edit details
Data prep: none; cancel the dialog. This seeded location has a hand-typed address,
  so the dialog opens on the Street, City, Postal code and Country fields with
  **Search with Google instead**. A location whose address was picked from the
  search opens on the search box instead.
Capture: the dialog only
Shows: the name, the link that can't change, the address fields, **Cancel** and
  **Save**

SHOT: edit-a-location-04.png
Business: Xeniká (Pro, points), signed in as owner
Where: Locations > "Xeniká Marais" (the primary) > panel header
Data prep: pointer hovering the "i" next to the **Primary** label, so its
  explanation is open
Capture: the top of the panel, from the top edge down to just below the open
  explanation (a sliver of the QR code section shows under it)
Shows: the **Primary** label, the "i", and its text: "Listed first. It's the
  scanner app's default for staff who haven't picked a location, and it can't be
  deleted."
