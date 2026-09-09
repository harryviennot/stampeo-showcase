# Screenshot specs — add-a-team-member

Captured 9 September 2026 against dev. Recapture any shot whose UI changes; the
spec is what makes that reproducible.

All four were taken on **Aurevo** (Growth, stamps) at 1280x900, dashboard language
switched to English, cropped to the element named under "Capture".

Aurevo rather than a Starter business on purpose: Starter covers two people and
Patoune already has two, so the invite flow there only shows the seat limit. The
dialog itself is identical on every plan.

> Both shots of the dialog need an **owner**, and all six demo businesses are owned
> by harry.viennot@icloud.com. To capture these I temporarily promoted
> `camille@aurevo.seed.stampeo.app` from admin to owner and set her locale to
> English, then put both back. If you would rather not repeat that, capture these
> two while signed in as yourself.

---

SHOT: add-a-team-member-01.png
Business: Aurevo (Growth, stamps), signed in as owner
Where: Dashboard > Team
Data prep: none
Capture: the page header only, from the title down to the subtitle, including the
  Add Member button on the right. Excludes the members table.
Shows: where **Add Member** is
Why cropped this tight: the members table below carries real addresses, including
  the owner's own. Never widen this shot to include it.

SHOT: add-a-team-member-02.png
Business: Aurevo (Growth, stamps), signed in as owner
Where: Dashboard > Team > Add Member
Data prep: none; dialog freshly opened so the first role is selected
Capture: the dialog only
Shows: the two roles with their descriptions, the first one selected, and the code
  form that follows from it

SHOT: add-a-team-member-03.png
Business: Aurevo (Growth, stamps), signed in as owner
Where: Dashboard > Team > Add Member, after creating a code
Data prep: name "Yasmine Okonkwo", email "yasmine@aurevo.example" (an invented
  person on a reserved example domain, so nothing real is on screen). Delete the
  invitation afterwards.
Capture: the dialog only
Shows: the six-character code, who it is for, the copy button, and the line saying
  it works once for 14 days

SHOT: add-a-team-member-04.png
Business: Aurevo (Growth, stamps), signed in as owner
Where: Dashboard > Team > Add Member, second role selected
Data prep: none; fields left empty so their placeholders read
Capture: the dialog only
Shows: the second role selected and the email invitation form that replaces the
  code form

---

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
