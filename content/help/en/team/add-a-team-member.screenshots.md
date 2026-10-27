# Screenshot specs: team pages

Shots 01 to 04 and 10 of add-a-team-member, and the manage-a-team-member and remove-a-team-member shots, were captured 26 October 2026 on the STA-190 branch of the web app (production build served on a local port, signed in as the Lustre fixture admin). They were not taken from a deployed dashboard: recapture them from `dev` or prod once the STA-190 web PR ships.

Common setup: **Lustre** (Pro, stamps), desktop viewport 1280x900 at 2x, English. The dashboard language comes from the user profile, so the capture script overlaid the profile locale to `en` (display only). The same script overlaid, in the browser only and without writing anything: last-scan and all-time-scan figures (Marion 143 scans, 2 hours ago; Amine 3 days ago), Kevin as paused, two invitations (Sofia: code K7P-2QM, 9 days left; Lucas: email invitation, expired), and the owner row renamed to "Camille Laurent / camille@lustre.seed.stampeo.app" so the real owner address never shows. `owner` mode also overlays the viewer's role to owner so the owner controls render. Nothing was submitted.

Script: copy of the STA-190 `shoot.cjs` pipeline (Playwright, routes app.dev.stampeo.app to the branch build). Crops are by element region of the 2x capture.

SHOT: add-a-team-member-01.png
Where: Dashboard > Team
Capture: page header, Members list and Waiting to join list (no sidebar)
Shows: Add member button, roles, status lines, Waiting to join with a code and an expired email invitation

SHOT: add-a-team-member-02.png
Where: Team > Add member (owner), freshly opened
Capture: the dialog only
Shows: Scanner selected, the code form (Who is it for?, Their email, Create the code)

SHOT: add-a-team-member-03.png
Where: Team > Waiting to join > Sofia (code invitation), owner
Capture: the panel from the top through Cancel invitation
Shows: the code with its copy button, New code and its note, Cancel invitation
Note: the dialog state right after Create the code was not shot because it needs a real submit. The panel shows the same code display.

SHOT: add-a-team-member-04.png
Where: Team > Add member (owner), Admin selected
Capture: the dialog only
Shows: Admin selected, Full Name, Email Address, Send Invitation

SHOT: add-a-team-member-10.png
Where: Team > Waiting to join > Lucas (expired email invitation), owner
Capture: the panel through Cancel invitation
Shows: the expired notice, Resend invitation, Cancel invitation

SHOT: manage-a-team-member-01.png
Where: Team > Marion Perez, owner
Capture: the whole panel
Shows: Role cards, Activity (Joined, Last scan, All-time scans), Locations, Scanning access switch, Danger zone

SHOT: manage-a-team-member-02.png
Where: Team > Marion Perez, signed in as admin (no owner overlay)
Capture: the panel through Locations
Shows: read-only role, the line "Only the owner can change roles and scanning access.", no controls

SHOT: remove-a-team-member-01.png
Where: Team > Marion Perez, owner
Capture: the bottom of the panel, from Scanning access down
Shows: the switch and the Remove from team button under Danger zone

Not captured: the Starter states (seat count "N of 2", team-full upgrade card, gated Activity). The fixtures have no Starter business with a dashboard login. Capture them on Patoune as the owner account next time.

## The invited person's side (05 to 09)

These five come from the scanner app. They were captured on the **Expo web build
at 390x844**, not on a device, because typing a code into the simulator needs a
real tap and the simulator here was set to French with a stored override that the
usual language switch does not clear. The components are the same ones the app
renders, so the layout matches, but recapture them on a device when one is to
hand: a web screenshot has been wrong about native layout before on this project.

SHOT: add-a-team-member-05.png
Where: scanner app, first screen when signed out (/welcome)
Data prep: signed out
Capture: the full phone viewport
Shows: **Join my team** as the main action

SHOT: add-a-team-member-06.png
Where: scanner app > Join my team (/join)
Data prep: signed out, empty field
Capture: the full phone viewport
Shows: the six boxes and **Find my shop**

SHOT: add-a-team-member-07.png
Where: scanner app, after entering a valid code while signed out
Data prep: a live code entered, so the account form says the code has been kept
Capture: the full phone viewport
Shows: the account form and the line "We've kept your code"

SHOT: add-a-team-member-08.png
Business: Aurevo (Growth, stamps)
Where: scanner app, the confirmation before joining
Data prep: an invitation row for Aurevo with code AVR3K7, invited_by Camille Roux,
  name "Yasmine Okonkwo", email "yasmine@aurevo.example". Signed in as a memberless
  account, code entered, and NOT joined. Delete the invitation afterwards.
Capture: the full phone viewport
Shows: **Join Aurevo?**, the shop's logo, who invited you, and **Join this team**
Why this data: the inviter's name is on screen, so it must be a seeded person and
  not the real owner of the demo businesses.

SHOT: add-a-team-member-09.png
Where: scanner app, the Join another shop panel
Data prep: this panel normally opens from the shop banner, which needs a signed-in
  account with a membership. It was captured by temporarily rendering
  `<JoinBusinessSheet visible />` on the welcome screen and reverting straight
  after. Capture it the normal way if you have an account with a shop.
Capture: the full phone viewport, panel over the dimmed screen
Shows: **Join another shop** and the line saying the current shop stays put
