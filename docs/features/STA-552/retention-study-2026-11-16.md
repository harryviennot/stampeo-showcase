# Wallet retention study, re-run 16 Nov 2026 (for Platform's "By the numbers")

Harry (16 Nov): "Let's redo the study again, and then maybe we can have this as a 95% pass retention rate, and we can add that to our landing page stats."

**Method:** STA-358's Q8 (`docs/features/STA-358/benchmark-sources.md`), run read-only on production on 2026-11-16 through the Supabase MCP.
- Same BASE cohort rules: internal businesses and staff self-cards excluded; a qualifying business has ≥ 10 non-staff customers and ≥ 10 scanner scans.
- Simplified BASE: the time-zone and category columns were dropped, because Q8 doesn't read them.
- The founder e-mail list was left empty (placeholders in the source doc). Founders' own businesses are still excluded by the `@stampeo.app` / `testsample` / test-or-demo-name rules and by the ≥ 10-customer threshold.
- **Retention rule:** a card counts as still installed at day N when the latest wallet event within N days of its first add is not `card_deleted`.
- **Cohort:** cards first added from 2026-06-01, the date Google Wallet callbacks worked.

| Metric | Value | n |
|---|---|---|
| Qualifying businesses | 106 | |
| Still in the wallet at day 30 | **98.1%** | 7,324 cards |
| Still in the wallet at day 90 | **95.5%** | 2,786 cards, from 73 businesses, first added 2026-06-01 to 2026-08-18 |

**Published as:** "95%" (rounded down, as STA-358 does), "of cards are still in the wallet after 90 days".

**Source line:** "Stampeo data: 2,786 cards from 73 businesses, added June to August 2026".
