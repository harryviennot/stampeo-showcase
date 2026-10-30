# Screenshot specs: change-a-customers-level

None captured yet. STA-525 is on feature branches and the deployed dev dashboard does not have levels, so these screens cannot be shot today. To capture: serve the web repo's STA-525 branch locally (`next dev -p 3100`), pass `--app http://localhost:3100` to `bun scripts/help-shots/run.ts`, and write the recipe `scripts/help-shots/recipes/change-a-customers-level.ts` first. The fixture needs the levels state described under each shot, set up in advance, because the capture aborts every write.
Common setup: Lustre (Pro, stamps), phone 402x874 at 2x (saved at 804x1748), English, a fixture admin session shown as the owner (`asOwner`). Levels work the same on every plan, so the lowest plan with a dashboard login would do; Patoune and Vanity (Starter) have none. Lustre has a login and a stamps program. Do not use Aurevo: its card uses photo icons, so every level would look the same.
Overlays: Owner view from an admin session (`asOwner`), profile shown in English. Nothing is written. A fictional customer name replaces any real-looking one.

SHOT: change-a-customers-level-01.png
Business: Lustre (Pro, stamps)
Where: Dashboard > Customers > a customer on Silver (route: /customers)
Data prep: A fictional customer on Silver with 3 stamps toward Gold, with a perk on Silver
Capture: The customer panel from the Silver chip down through the card, the line 15 stamps to Gold with its bar, the Perks line and the Change level button
Shows: The level block under the card and the Change level button
Goes under: Change a customer's level, after step 3
NOT CAPTURED: STA-525 is not deployed to the dev dashboard, so the screen does not exist there yet.

SHOT: change-a-customers-level-02.png
Business: Lustre (Pro, stamps)
Where: Dashboard > Customers > customer > Change level
Data prep: The same customer, with Gold chosen so the level-up message box shows
Capture: The Change level bottom sheet: the three levels with Current level on Silver, the box Send the level-up message and their Gold gift, and Move to Gold
Shows: The choice of level and the optional message
Goes under: Change a customer's level, after step 5
NOT CAPTURED: STA-525 is not deployed to the dev dashboard, so the screen does not exist there yet.
