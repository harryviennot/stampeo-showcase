# Screenshot specs: how-locations-work

Captured 27 October 2026 from a production build of the STA-189 web branch and the branch
backend, on the dev database, through the journey harness in
`web/docs/features/STA-189/journey-harness.md`.
Common setup: Xeniká (Pro, points), owner session, English, phone viewport 402x874 CSS px at 2x.
Overlays, all in the capture browser only: the `rest/v1/memberships` role rewritten to `owner`;
`NEXT_LOCALE=en` and `GET /profile/me` rewritten to `locale: "en"`; every non-GET request to the
API and to Supabase aborted (nothing was written).

---

SHOT: how-locations-work-01.png
Business: Xeniká (Pro, points), owner
Where: Locations with the real two locations (route: /program/locations)
Data prep: the batch stats response (`GET /locations/{business_id}/stats`) was patched in the
  browser with plausible sign-ups (38 and 24) and last-scan times (2 hours and 35 minutes before
  the shot), because migration 226 is not on dev yet and the real values are missing. Scans,
  rewards and the Main link count (12) are the real dev values.
  RETAKE once migration 226 is on dev: use the real sign-ups and last scans, without the patch.
Capture: from the "Last 30 days" line to the bottom of the second location card. The notice
  above it (one scanner without a location, a real dev state) is cropped out.
Shows: the Main link row above the locations, and for each location Scans, Sign-ups, Rewards
  and the last scan
Goes under: "From two locations, you see each one"
