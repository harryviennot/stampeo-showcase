import type { CompetitorFacts } from "../types";

/** A second made-up US competitor, with its own pages and wording, so a market has more than one page to link between. */
export const GLOBEX_STAMPS: CompetitorFacts = {
  id: "globex-stamps",
  name: "Globex Stamps",
  website: "https://globex-stamps.example",
  markets: {
    us: {
      pricingUrl: "https://globex-stamps.example/plans",
      facts: [
        {
          id: "card.where",
          value: "A Globex pass in Apple Wallet or Google Wallet",
          sourceUrl: "https://globex-stamps.example/how-it-works",
          sourceTitle: "How Globex Stamps works",
          quote: "Customers tap once to add their card to the wallet on their phone",
          checkedAt: "2026-10-14",
        },
        {
          id: "price.entry",
          value: "$19 a month, billed yearly",
          sourceUrl: "https://globex-stamps.example/plans",
          sourceTitle: "Globex Stamps plans",
          quote: "Basic: $19 per month when billed annually",
          checkedAt: "2026-10-22",
        },
        {
          id: "trial",
          value: "No free trial; 30-day money-back guarantee",
          sourceUrl: "https://globex-stamps.example/terms",
          sourceTitle: "Globex Stamps terms",
          quote: "Not happy within 30 days? We refund your first payment",
          checkedAt: "2026-10-14",
        },
      ],
    },
  },
};
