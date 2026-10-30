# Screenshot specs: switch-off-levels

None captured yet. STA-525 is on feature branches and the deployed dev dashboard does not have levels, so these screens cannot be shot today. To capture: serve the web repo's STA-525 branch locally (`next dev -p 3100`), pass `--app http://localhost:3100` to `bun scripts/help-shots/run.ts`, and write the recipe `scripts/help-shots/recipes/switch-off-levels.ts` first. The fixture needs the levels state described under each shot, set up in advance, because the capture aborts every write.
Common setup: Lustre (Pro, stamps), phone 402x874 at 2x (saved at 804x1748), English, a fixture admin session shown as the owner (`asOwner`). Levels work the same on every plan, so the lowest plan with a dashboard login would do; Patoune and Vanity (Starter) have none. Lustre has a login and a stamps program. Do not use Aurevo: its card uses photo icons, so every level would look the same.
Overlays: Owner view from an admin session (`asOwner`), profile shown in English. Nothing is written.

SHOT: switch-off-levels-01.png
Business: Lustre (Pro, stamps)
Where: Dashboard > Overview > Levels card > Switch off
Data prep: Levels on with 3 levels
Capture: The Switch off levels? bottom sheet with the Announce it on their card toggle and the Cancel and Switch off levels buttons
Shows: What the switch-off promises before the owner confirms
Goes under: Switch levels off, after step 3
NOT CAPTURED: STA-525 is not deployed to the dev dashboard, so the screen does not exist there yet.
