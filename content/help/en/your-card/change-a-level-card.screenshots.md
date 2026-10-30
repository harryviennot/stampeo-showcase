# Screenshot specs: change-a-level-card

None captured yet. STA-525 is on feature branches and the deployed dev dashboard does not have levels, so these screens cannot be shot today. To capture: serve the web repo's STA-525 branch locally (`next dev -p 3100`), pass `--app http://localhost:3100` to `bun scripts/help-shots/run.ts`, and write the recipe `scripts/help-shots/recipes/change-a-level-card.ts` first. The fixture needs the levels state described under each shot, set up in advance, because the capture aborts every write.
Common setup: Lustre (Pro, stamps), phone 402x874 at 2x (saved at 804x1748), English, a fixture admin session shown as the owner (`asOwner`). Levels work the same on every plan, so the lowest plan with a dashboard login would do; Patoune and Vanity (Starter) have none. Lustre has a login and a stamps program. Do not use Aurevo: its card uses photo icons, so every level would look the same.
Overlays: Owner view from an admin session (`asOwner`), profile shown in English. Nothing is written.

SHOT: change-a-level-card-01.png
Business: Lustre (Pro, stamps)
Where: Dashboard > Card styles (route: /program/templates)
Data prep: Levels on with 3 levels; Silver and Gold cards in different colors
Capture: The Level cards group with its description and the Silver and Gold tiles, each with Edit only. Crop to the group, not the whole library.
Shows: Level cards sit in their own group and offer Edit only
Goes under: Change a level card, after step 2
NOT CAPTURED: STA-525 is not deployed to the dev dashboard, so the screen does not exist there yet.

SHOT: change-a-level-card-02.png
Business: Lustre (Pro, stamps)
Where: Dashboard > Card styles > Edit Silver > Save Card Style (route: /design/<silver card id>)
Data prep: Silver has 12 customers; a colour change made but not saved
Capture: The Update the card for 12 Silver customers? bottom sheet with Cancel and Update the card
Shows: The customer count shown before the new look goes out
Goes under: Change a level card, after step 5
NOT CAPTURED: STA-525 is not deployed to the dev dashboard, so the screen does not exist there yet.
