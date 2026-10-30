# Screenshot specs: set-up-levels

None captured yet. STA-525 is on feature branches and the deployed dev dashboard does not have levels, so these screens cannot be shot today. To capture: serve the web repo's STA-525 branch locally (`next dev -p 3100`), pass `--app http://localhost:3100` to `bun scripts/help-shots/run.ts`, and write the recipe `scripts/help-shots/recipes/set-up-levels.ts` first. The fixture needs the levels state described under each shot, set up in advance, because the capture aborts every write.
Common setup: Lustre (Pro, stamps), phone 402x874 at 2x (saved at 804x1748), English, a fixture admin session shown as the owner (`asOwner`). Levels work the same on every plan, so the lowest plan with a dashboard login would do; Patoune and Vanity (Starter) have none. Lustre has a login and a stamps program. Do not use Aurevo: its card uses photo icons, so every level would look the same.
Overlays: Owner view from an admin session (`asOwner`), profile shown in English. Nothing is written. Growth and Pro show **Valid for (days)** on a gift and an editable level-up message; Starter does not. Keep both out of the crop.

SHOT: set-up-levels-01.png
Business: Lustre (Pro, stamps)
Where: Dashboard > Overview > Set up levels > step 1 (route: /levels)
Data prep: A saved levels draft with 3 levels named Bronze, Silver, Gold; Bronze 2 full cards, Silver 3 full cards; Silver 8 stamps, Gold 6 stamps; at least 20 repeat customers so the estimate lines show
Capture: The Number of levels stepper, level 1 with its Your card box, level 2 with Stamps on the card, Full cards to move up and the estimate line. Crop below the wizard header, above the footer.
Shows: The Number of levels stepper and the Your card box, level 2's rules and the estimate line
Goes under: Set up your levels, after step 2
NOT CAPTURED: STA-525 is not deployed to the dev dashboard, so the screen does not exist there yet.

SHOT: set-up-levels-02.png
Business: Lustre (Pro, stamps)
Where: Dashboard > Set up levels > Level cards (route: /levels/cards)
Data prep: The same draft, with the Silver and Gold cards made and ready, in different colors from Bronze
Capture: The grid of three tiles: Bronze marked Your card, Silver and Gold with Tap to edit. Crop to the grid and its title.
Shows: Three cards in three looks, and which one is the live card
Goes under: Set up your levels, after step 4
NOT CAPTURED: STA-525 is not deployed to the dev dashboard, so the screen does not exist there yet.

SHOT: set-up-levels-03.png
Business: Lustre (Pro, stamps)
Where: Dashboard > Set up levels > Where do your customers start? (route: /levels/place)
Data prep: A business with customers spread over the three levels by history, a gift set on Silver, so both switches show
Capture: By their history selected, the count per level, the cards will update line, and the two switches Give level gifts now (off) and Tell customers who move up (on)
Shows: The placement choice, counts per level and the two switches
Goes under: Your current customers
NOT CAPTURED: STA-525 is not deployed to the dev dashboard, so the screen does not exist there yet.

SHOT: set-up-levels-04.png
Business: Lustre (Pro, stamps)
Where: Dashboard > Set up levels > Review your levels > Turn on levels sheet
Data prep: The same draft
Capture: The Turn on levels? bottom sheet: Levels, Customers placed above, Cards updated, Gifts given, Customers told, and the pinned Cancel and Turn on levels buttons
Shows: The last confirmation before customers move
Goes under: Set up your levels, after step 7
NOT CAPTURED: STA-525 is not deployed to the dev dashboard, so the screen does not exist there yet.
