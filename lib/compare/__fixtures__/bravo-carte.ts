import type { CompetitorFacts } from "../types";

/** A second made-up French competitor, quoting prices including VAT, so the table has a TTC price to leave as published. */
export const BRAVO_CARTE: CompetitorFacts = {
  id: "bravo-carte",
  name: "Bravo Carte",
  website: "https://bravo-carte.example",
  markets: {
    fr: {
      pricingUrl: "https://bravo-carte.example/prix",
      facts: [
        {
          id: "card.where",
          value: "Dans une carte Apple Wallet ou Google Wallet",
          sourceUrl: "https://bravo-carte.example/carte",
          sourceTitle: "Bravo Carte, la carte",
          quote: "Vos clients ajoutent la carte à leur Wallet en un geste",
          checkedAt: "2026-10-18",
        },
        {
          id: "price.entry",
          value: "29 € TTC par mois",
          sourceUrl: "https://bravo-carte.example/prix",
          sourceTitle: "Bravo Carte, prix",
          quote: "Offre Boutique : 29 € TTC / mois",
          checkedAt: "2026-10-30",
        },
      ],
    },
  },
};
