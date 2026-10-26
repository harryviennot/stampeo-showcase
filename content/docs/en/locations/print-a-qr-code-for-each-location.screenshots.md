# Screenshot specs: print-a-qr-code-for-each-location

Captured 26 October 2026 against a production build of the STA-189 web branch
and the branch backend, on the dev database. Recapture any shot whose UI changes.

All three were taken on **Xeniká** (Pro, points), signed in as its owner, at a
1280 px wide window with a 2x pixel ratio, cropped to the element named under
"Capture". The dashboard was switched to English for the capture only: the
`NEXT_LOCALE` cookie was set to `en` and the `GET /profile/me` response was
rewritten in the browser to `locale: "en"`, so the account is still French in
the database and nothing had to be set back.

Read only: no download button was pressed and nothing was written.

Browser-side adjustments, none of which touch the database:

- On-screen text `showcase.dev.stampeo.app` was replaced by `stampeo.app` (in the
  link row and in the flyer preview). The QR images themselves still encode the
  dev link, so do not publish these as scannable codes.

---

SHOT: print-a-qr-code-for-each-location-01.png
Business: Xeniká (Pro, points), signed in as owner
Where: Locations > a non-primary location ("Xeniká Batignolles") > QR code section
Data prep: none
Capture: the QR code section of the panel, from its heading down to the counter
  flyer row. Excludes the panel header and the sections below.
Shows: the QR code, the link with **Copy**, **Download PNG**, **Download PDF** and
  the **Counter flyer for this location** row

SHOT: print-a-qr-code-for-each-location-02.png
Business: Xeniká (Pro, points), signed in as owner
Where: /program/flyer?location={Batignolles id}
Data prep: the Language toggle set to English (it opens on the business language,
  French). Nothing is downloaded.
Capture: the page content area, from the "Program" back link down to the bottom
  of the preview card. Excludes the sidebar.
Shows: the flyer preview for one location, with the **Language**, **Location**,
  **Download PDF** and **Download all (one file)** controls

SHOT: print-a-qr-code-for-each-location-03.png
Business: Xeniká (Pro, points), signed in as owner
Where: Overview (/program), the "Your QR codes" card
Data prep: needs two or more locations; rows left collapsed
Capture: the card only
Shows: **Manage locations**, **Download all as PDF** and **Download all as PNG**,
  one row per location with **Primary** on the first, and the **Main link** row
