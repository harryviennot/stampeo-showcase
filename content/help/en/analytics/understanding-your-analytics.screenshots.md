# Screenshot specs: understanding-your-analytics

NOT CAPTURED YET. The page text is written and its UI labels were checked against the
English message catalog of the web branch `feat/sta-482-s4-loose-ends` (`messages/en/analytics.json`),
but the Analytics page is not served by the dev tunnel until that branch is deployed, so no
shot exists and the page has no image references. Capture these once the page is live on dev,
then add each image under the heading named in "Goes under", as
`![alt](/docs/understanding-your-analytics-NN.png)`.

All shots: 1280x900, dashboard language switched to English (and back afterwards), cropped
to the card named under "Capture". The seeded history is dense up to the day of seeding,
so re-seed the fixtures first if the newest bar is empty. Analytics works for an admin, so
`driss@lustre.seed.stampeo.app` and `camille@aurevo.seed.stampeo.app` are enough; the
owner session is only needed for the **Change the reward** link (shot 05).

SHOT: understanding-your-analytics-01.png
Business: Lustre (Pro, stamps)
Where: Dashboard > Analytics, 30 days, all locations
Data prep: none
Capture: from the page title down to the end of the KPI row (period buttons, coverage line, the three KPI cards)
Shows: the period buttons, the dates and time zone under them, and the KPIs
Goes under: "The period, and when it ends"

SHOT: understanding-your-analytics-02.png
Business: Aurevo (Growth, stamps)
Where: Dashboard > Analytics, 30 days
Data prep: none; Aurevo has a sent broadcast on 29 Sep, which shows as a dot under a bar while it is inside the 30 days. If the date has moved out of the window, use 90 days.
Capture: the Visits over time card only, one bar focused
Shows: the two series, the legend with "Broadcast sent", the dot, and the readout under the chart
Goes under: "Visits over time"

SHOT: understanding-your-analytics-03.png
Business: Lustre (Pro, stamps)
Where: Dashboard > Analytics, 30 days
Data prep: tap the Busiest row so its cell is ringed
Capture: the Busiest times card only
Shows: the Busiest and Quietest open hour rows, the grid, the ring and the readout
Goes under: "Busiest times"

SHOT: understanding-your-analytics-04.png
Business: Lustre (Pro, stamps)
Where: Dashboard > Analytics, 30 days
Capture: the How often they come card only
Shows: the five groups with their counts
Goes under: "How often they come"

SHOT: understanding-your-analytics-05.png
Business: Aurevo (Growth, stamps), signed in as the OWNER (harry.viennot@icloud.com)
Where: Dashboard > Analytics
Data prep: none
Capture: the Reward progress card only
Shows: the columns split into Still coming and Not back for 30+ days, the star column, the redeemed line and Change the reward
Goes under: "Reward progress"

SHOT: understanding-your-analytics-06.png
Business: Marginalia (Growth, points)
Where: Dashboard > Analytics
Capture: the Reward progress card only
Shows: the points bands, so the page is not documented with stamps only
Goes under: "Reward progress"

SHOT: understanding-your-analytics-07.png
Business: Lustre (Pro, stamps)
Where: Dashboard > Analytics
Capture: the Monthly cohorts card only, one cell selected
Shows: the four horizons, a dash in a month not finished, and the sentence under the table
Goes under: "Monthly cohorts"

SHOT: understanding-your-analytics-08.png
Business: Aurevo (Growth, stamps)
Where: Dashboard > Analytics, tap the crowned 1 year button
Capture: the panel that opens
Shows: the plan named in the title, and that nothing changed behind it
Goes under: "How much history your plan shows"

SHOT: understanding-your-analytics-09.png
Business: Patoune (Starter, stamps), as the owner
Where: Dashboard > Analytics, 7 days
Data prep: none; Patoune has about 27 visits in 7 days, below the 50 Busiest times needs
Capture: the Unlocks as you grow card only
Shows: a row with its progress bar and "27 of 50 visits in the last 7 days"
Goes under: "Why a section says it unlocks later"

SHOT: understanding-your-analytics-10.png
Business: Lustre (Pro, stamps)
Where: Dashboard > Analytics, location menu open on a phone-size or desktop viewport
Capture: the Location filter and its menu
Shows: All locations and the three locations
Goes under: "Filter by location"
