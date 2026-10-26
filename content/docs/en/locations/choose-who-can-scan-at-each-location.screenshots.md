# Screenshot specs: choose-who-can-scan-at-each-location

Captured 26 October 2026 against a production build of the STA-189 web branch
and the branch backend, on the dev database. Recapture any shot whose UI changes.

All three were taken on **Xeniká** (Pro, points), signed in as its owner, at a
1280 px wide window with a 2x pixel ratio, cropped to the element named under
"Capture". The dashboard was switched to English for the capture only: the
`NEXT_LOCALE` cookie was set to `en` and the `GET /profile/me` response was
rewritten in the browser to `locale: "en"`, so the account is still French in
the database and nothing had to be set back.

Read only: no box was ticked or unticked. Every write request to `/locations/**`
was blocked in the browser.

---

SHOT: choose-who-can-scan-at-each-location-01.png
Business: Xeniká (Pro, points), signed in as owner
Where: Locations > "Xeniká Batignolles" > Who can scan here
Data prep: none. Xeniká has two scanners: Sarah Nguyen (assigned here) and Marc
  Lefevre (assigned to the other location).
Capture: the section only, from its heading down to the footnote
Shows: one ticked row, one unticked row, and **Owners and admins can scan at every
  location.**

SHOT: choose-who-can-scan-at-each-location-02.png
Business: Xeniká (Pro, points), signed in as owner
Where: Locations (/program/locations)
Data prep: every scanner of Xeniká has a location, so the members response of
  "Xeniká Batignolles" (`GET /locations/{business_id}/{location_id}/members`) was
  replaced by an empty list in the browser. That leaves Sarah Nguyen with no
  location, which raises the notice.
Capture: the page header and the notice, down to the **Assign a location** link.
  Excludes the list.
Shows: **1 scanner isn't assigned to a location and can't scan yet.** and the
  **Assign a location** link

SHOT: choose-who-can-scan-at-each-location-03.png
Business: Xeniká (Pro, points), signed in as owner
Where: Locations > "Xeniká Batignolles" > Who can scan here
Data prep: same members response as shot 02, so Sarah Nguyen is unassigned
Capture: the section only
Shows: the unticked rows, and **Can't scan: no location** in orange under Sarah
  Nguyen's name
