import type { CompetitorFacts, SourcedFact } from "../types";

const source = (id: string, value: string, checkedAt: string, quote: string): SourcedFact => ({
  id,
  value,
  sourceUrl: "https://acme-loyalty.example/pricing",
  sourceTitle: "Acme Loyalty pricing",
  quote,
  checkedAt,
});

/** A made-up US competitor: standard rows read on different days, plus one non-standard fact. */
export const ACME_LOYALTY: CompetitorFacts = {
  id: "acme-loyalty",
  name: "Acme Loyalty",
  website: "https://acme-loyalty.example",
  markets: {
    us: {
      pricingUrl: "https://acme-loyalty.example/pricing",
      facts: [
        source("card.where", "Their own app on the customer's phone", "2026-10-20", "Customers keep their card in the Acme app"),
        source("customer.app_required", "App download and account", "2026-10-28", "Download the Acme app to collect stamps"),
        source("price.entry", "$25 a month, billed monthly", "2026-11-01", "Starter: $25 per month"),
        source("trial", "7-day free trial", "2026-10-05", "Try every plan free for 7 days"),
        source("support.hours", "Weekdays, 9am to 5pm Eastern", "2026-09-30", "Support is open weekdays 9am to 5pm ET"),
      ],
    },
  },
};
