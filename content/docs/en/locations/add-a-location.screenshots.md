# Screenshot specs: add-a-location

Captured 26 October 2026 against a production build of the STA-189 web branch
and the branch backend, on the dev database. Recapture any shot whose UI changes.

All three were taken on **Xeniká** (Pro, points), signed in as its owner, at a
1280 px wide window with a 2x pixel ratio, cropped to the element named under
"Capture". The dashboard was switched to English for the capture only: the
`NEXT_LOCALE` cookie was set to `en` and the `GET /profile/me` response was
rewritten in the browser to `locale: "en"`, so the account is still French in
the database and nothing had to be set back.

Read only: nothing was created. Every write request to `/locations/**` was
blocked in the browser, and the Add location button was never pressed.

Browser-side adjustments, none of which touch the database:

- On-screen text `showcase.dev.stampeo.app` was replaced by `stampeo.app`, so no
  dev host is visible. The preview line therefore shows the production form of
  the link.

---

SHOT: add-a-location-01.png
Business: Xeniká (Pro, points), signed in as owner
Where: Dashboard > Loyalty Program > Locations (/program/locations)
Data prep: none
Capture: the page header only, from the title down to the subtitle, including the
  Add location button on the right. Excludes the sidebar and the list.
Shows: where **Add location** is

SHOT: add-a-location-02.png
Business: Xeniká (Pro, points), signed in as owner
Where: Locations > Add location
Data prep: the name "Westside" typed in Location name (the dialog's own placeholder
  value), then a short wait so the link check has finished. Cancel afterwards.
Capture: the dialog only
Shows: the name, the link preview with the end of the link in bold and **Change**
  beside it, the line saying the link can't be changed, and the address search

SHOT: add-a-location-03.png
Business: Xeniká (Pro, points), signed in as owner
Where: Locations > Add your first location (empty state)
Data prep: Xeniká already has two locations, so the locations list response
  (`GET /locations/{business_id}`) was replaced by an empty list in the browser to
  get the first-location state. Open the dialog, change nothing, cancel.
Capture: the dialog only, tall enough to include the switch
Shows: the name and address filled in from the business, the info line saying so,
  and the **Link my past activity to this location** switch, off
Do not: press Add location in this state. The list is only empty in the browser,
  so it would create a real location on the shared fixtures.
