# Screenshot specs: edit-your-levels

None captured yet. STA-525 is on feature branches and the deployed dev dashboard does not have levels, so these screens cannot be shot today. To capture: serve the web repo's STA-525 branch locally (`next dev -p 3100`), pass `--app http://localhost:3100` to `bun scripts/help-shots/run.ts`, and write the recipe `scripts/help-shots/recipes/edit-your-levels.ts` first. The fixture needs the levels state described under each shot, set up in advance, because the capture aborts every write.
Common setup: Lustre (Pro, stamps), phone 402x874 at 2x (saved at 804x1748), English, a fixture admin session shown as the owner (`asOwner`). Levels work the same on every plan, so the lowest plan with a dashboard login would do; Patoune and Vanity (Starter) have none. Lustre has a login and a stamps program. Do not use Aurevo: its card uses photo icons, so every level would look the same.
Overlays: Owner view from an admin session (`asOwner`), profile shown in English. Nothing is written.

SHOT: edit-your-levels-01.png
Business: Lustre (Pro, stamps)
Where: Dashboard > Overview > Levels card > Edit > Remove Gold? sheet (route: /levels/edit)
Data prep: Levels on with 3 levels and customers on Gold, so the removal sheet asks where they go
Capture: The Remove Gold? bottom sheet with Move them to Silver selected, the note that nothing is lost, and the Remove Gold button
Shows: The choice of where a removed level's customers go
Goes under: Remove a level (inside the details)
NOT CAPTURED: STA-525 is not deployed to the dev dashboard, so the screen does not exist there yet.

SHOT: edit-your-levels-02.png
Business: Lustre (Pro, stamps)
Where: Dashboard > Edit levels > Review your changes (route: /levels/edit/review)
Data prep: A pending edit that makes Bronze's rule easier (so Customers moving up now shows a number) and shrinks Silver's card from 8 to 6 stamps
Capture: The What changes list, the Tell customers who move up switch and the Apply changes button
Shows: What the impact review lists before Apply
Goes under: What changes for customers
NOT CAPTURED: STA-525 is not deployed to the dev dashboard, so the screen does not exist there yet.
