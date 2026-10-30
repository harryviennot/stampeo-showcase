# Screenshot specs: move-up-levels

None captured yet. These need the STA-525 backend serving passes with levels on for a fixture business (the dev stack serves `main`, which has no levels), then a real card added to Apple Wallet on the promo simulator. Nothing here is drawn by hand.
Common setup: Lustre (Pro, stamps) with levels on and Silver in a different color from Bronze. Phone only, a real Apple Wallet render on the promo simulator ("Stampeo Promo iPhone 17 Pro", English, 9:41, full battery). The wallet card is never drawn by hand.
Overlays: None. The customer is a fictional fixture customer with an invented name.

SHOT: move-up-levels-01.png
Business: Lustre (Pro, stamps)
Where: Apple Wallet on the promo simulator, a fixture customer's card on Silver
Data prep: A fixture customer on Silver with 1 of 8 stamps
Capture: The front of the card: the level name above the count, and the Silver look
Shows: The level name on the card
Goes under: How it works, after step 2
NOT CAPTURED: STA-525 is not deployed to the dev dashboard, so the screen does not exist there yet.

SHOT: move-up-levels-02.png
Business: Lustre (Pro, stamps)
Where: Apple Wallet > the same card > details
Data prep: The same customer
Capture: The back of the card with the How the levels work field, one line per level
Shows: Where a customer finds the levels
Goes under: See your levels
NOT CAPTURED: STA-525 is not deployed to the dev dashboard, so the screen does not exist there yet.

SHOT: move-up-levels-03.png
Business: Lustre (Pro, stamps)
Where: The lock screen after a move up
Data prep: A scan that moves the customer from Bronze to Silver, on a business with the default level-up message
Capture: The lock-screen notification: You've reached Silver! Your card has a new look.
Shows: The message a customer gets when they move up
Goes under: How it works, after step 3
NOT CAPTURED: STA-525 is not deployed to dev, and a lock-screen message needs a real scan, which writes to the dev database. Ask Harry before capturing it.
