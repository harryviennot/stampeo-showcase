# Screenshot specs: send-a-broadcast-to-a-level

None captured yet. STA-525 is on feature branches and the deployed dev dashboard does not have levels, so these screens cannot be shot today. To capture: serve the web repo's STA-525 branch locally (`next dev -p 3100`), pass `--app http://localhost:3100` to `bun scripts/help-shots/run.ts`, and write the recipe `scripts/help-shots/recipes/send-a-broadcast-to-a-level.ts` first. The fixture needs the levels state described under each shot, set up in advance, because the capture aborts every write.
Common setup: Marginalia (Growth, points), phone 402x874 at 2x (saved at 804x1748), English, a fixture admin session shown as the owner (`asOwner`). Growth is the lowest plan with broadcasts.
Overlays: Owner view from an admin session (`asOwner`), profile shown in English. Nothing is written. The broadcast is never sent: the capture stops on the Audience step and aborts every write.

SHOT: send-a-broadcast-to-a-level-01.png
Business: Marginalia (Growth, points)
Where: Dashboard > Broadcasts > New broadcast > Audience (route: /program/broadcasts/new)
Data prep: Levels on with 3 levels and customers on each; a title and body typed on Compose
Capture: Filtered audience selected, the Level group with its pills (Bronze, Silver, Gold with counts) and the estimate line
Shows: The Level pills, selectable on Growth
Goes under: Pick a level, after step 4
NOT CAPTURED: STA-525 is not deployed to the dev dashboard, so the screen does not exist there yet.
