# Screenshot specs: manage-a-team-member

Captured 2026-10-28 from a local build of the web repo's dev branch (origin/dev 58f74a0c) on localhost:3100, signed in through the dev showcase and talking to the dev backend, because the deployed dev dashboard was serving an older checkout without the STA-192 settings redesign. Capture script: scripts/help-shots/run.ts, recipe scripts/help-shots/recipes/manage-a-team-member.ts. Re-take one shot with `bun scripts/help-shots/run.ts manage-a-team-member --shot NN --app http://localhost:3100` (drop `--app` once app.dev.stampeo.app serves the dev branch).
Common setup: Aurevo (Growth, stamps), phone 402x874 at 2x, English. Growth is the lowest plan with Activity (last scan, all-time scans); Locations only shows on Pro, so these shots have none.
Overlays: English profile and `NEXT_LOCALE=en`; the owner row of the team list shown as Mathilde Garnier (the real owner's name and address never load); last scan and all-time scans invented for the team members the dev backend sends none for (Sofia Alvarez: 2 hours ago, 143 scans; Yanis Merah: 3 days ago, 38); every write blocked.

SHOT: manage-a-team-member-01.png
Business: Aurevo (Growth, stamps)
Where: Dashboard > Team > Sofia Alvarez  (route: /team)
Data prep: none beyond the overlay. Session: the admin login `camille@aurevo.seed.stampeo.app` shown as the owner, so the owner controls render.
Capture: the whole panel, from the name to the end of Danger zone (viewport made taller so it fits)
Shows: Role cards, Activity (Joined, Last scan, All-time scans), Scanning access, Remove from team
Goes under: "Open someone", after the status list

SHOT: manage-a-team-member-02.png
Business: Aurevo (Growth, stamps)
Where: Team > Sofia Alvarez, signed in as the admin `camille@aurevo.seed.stampeo.app` (no owner overlay)
Data prep: none beyond the overlay
Capture: the panel from the name through Activity
Shows: the role as text, the line "Only the owner can change roles and scanning access.", Activity, and no controls
Goes under: "Before you start"
