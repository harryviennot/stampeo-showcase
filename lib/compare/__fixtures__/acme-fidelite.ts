import type { CompetitorFacts } from "../types";

/** A made-up French competitor, quoting prices excluding VAT. */
export const ACME_FIDELITE: CompetitorFacts = {
  id: "acme-fidelite",
  name: "Acme Fidélité",
  website: "https://acme-fidelite.example",
  markets: {
    fr: {
      pricingUrl: "https://acme-fidelite.example/tarifs",
      facts: [
        {
          id: "card.where",
          value: "Dans l'application du client",
          sourceUrl: "https://acme-fidelite.example/fonctionnement",
          sourceTitle: "Acme Fidélité, fonctionnement",
          quote: "Vos clients téléchargent l'application Acme",
          checkedAt: "2026-10-12",
        },
        {
          id: "price.entry",
          value: "19 € HT par mois",
          sourceUrl: "https://acme-fidelite.example/tarifs",
          sourceTitle: "Acme Fidélité, tarifs",
          quote: "Formule Essentiel : 19 € HT / mois",
          checkedAt: "2026-10-25",
        },
      ],
    },
  },
};
