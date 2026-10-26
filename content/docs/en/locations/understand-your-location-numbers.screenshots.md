# Screenshot specs: understand-your-location-numbers

Captured 26 October 2026 against a production build of the STA-189 web branch
and the branch backend, on the dev database. Recapture both shots as soon as
migration 226 is on the dev database (see below).

Both were taken on **Xeniká** (Pro, points), signed in as its owner, at a
1280 px wide window with a 2x pixel ratio, cropped to the element named under
"Capture". The dashboard was switched to English for the capture only: the
`NEXT_LOCALE` cookie was set to `en` and the `GET /profile/me` response was
rewritten in the browser to `locale: "en"`, so the account is still French in
the database and nothing had to be set back.

**Two numbers on these shots are not from the database.** The dev database does
not have migration 226 yet, so the backend answers `enrolled_in_range: 0` and no
`last_scan_at`, which would show Sign-ups at 0 and no "Last scan" line. To show
what the page looks like with the migration, the stats responses (`GET
/locations/{business_id}/stats?range=30d` and `.../{location_id}/stats?range=30d`)
were patched in the browser:

| Location | Sign-ups | Last scan |
|---|---|---|
| Xeniká Marais (primary) | 18 | 2 hours ago |
| Xeniká Batignolles | 9 | about 35 minutes ago |

Scans (345 and 250), Rewards (59 and 41), Customers served (171) and the Main
link count (12) are what the dev database returned. Nothing was written.

---

SHOT: understand-your-location-numbers-01.png
Business: Xeniká (Pro, points), signed in as owner
Where: Locations (/program/locations)
Data prep: the patched stats described above
Capture: from the "Last 30 days" line down to the bottom of the cards. Excludes
  the page header and the sidebar.
Shows: the period line, the **Main link** row, and the two cards with **Scans**,
  **Sign-ups**, **Rewards** and the **Last scan** line

SHOT: understand-your-location-numbers-02.png
Business: Xeniká (Pro, points), signed in as owner
Where: Locations > "Xeniká Batignolles" > Activity section
Data prep: the patched stats described above, period left on 30d
Capture: the Activity section only, from its heading down to the "Activity at
  this location" row
Shows: **See trends**, the 7d, 30d, 90d and All buttons, the four numbers
  (**Scans**, **Sign-ups here**, **Customers served**, **Rewards redeemed**) and
  the last-scan line
