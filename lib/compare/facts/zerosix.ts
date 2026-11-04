import type { CompetitorFacts, SourcedFact } from "../types";

/** Zerosix on the French page. Every fact is a VERIFIED row of `docs/compare/dossiers/zerosix.md`. */

const READ_ON = "2026-11-04";

const PAGES = {
  home: { url: "https://www.zerosix.com/", title: "Zerosix, page d'accueil" },
  pricing: { url: "https://www.zerosix.com/tarifs-programme-fidelite", title: "Zerosix, tarifs" },
  terms: { url: "https://www.zerosix.com/condition-generales", title: "Zerosix, conditions générales" },
  loyaltySpace: { url: "https://www.zerosix.com/espace-fidelite", title: "Zerosix, espace fidélité" },
  journeys: { url: "https://www.zerosix.com/parcours-clients", title: "Zerosix, parcours clients" },
  program: { url: "https://www.zerosix.com/programme-de-fidelite", title: "Zerosix, programme de fidélité" },
  campaigns: {
    url: "https://www.zerosix.com/animations-campagnes-marketing",
    title: "Zerosix, animations et campagnes",
  },
  multiSite: {
    url: "https://www.zerosix.com/multi-etablissements-franchises",
    title: "Zerosix, multi-établissements et franchises",
  },
} as const;

const fact = (id: string, value: string, page: keyof typeof PAGES, quote: string): SourcedFact => ({
  id,
  value,
  sourceUrl: PAGES[page].url,
  sourceTitle: PAGES[page].title,
  quote,
  checkedAt: READ_ON,
});

export const ZEROSIX: CompetitorFacts = {
  id: "zerosix",
  name: "Zerosix",
  website: "https://www.zerosix.com",
  markets: {
    fr: {
      pricingUrl: PAGES.pricing.url,
      facts: [
        fact(
          "card.where",
          "Un espace fidélité en ligne, avec une carte Apple Wallet ou Google Wallet pour s'identifier",
          "loyaltySpace",
          "Vos clients s'inscrivent depuis leur espace fidélité et s'identifient grâce à leur espace ou à leur Apple/Google Wallet.",
        ),
        fact(
          "customer.app_required",
          "Aucune application à télécharger",
          "loyaltySpace",
          "Vos membres n'ont pas besoin de télécharger une énième application.",
        ),
        fact(
          "program.types",
          "Cycle de points, statut (la dépense fait monter de niveau), boutique de récompenses, tampons, cagnotte ou club, avec des points renforcés sur des produits ou des catégories",
          "program",
          "Plus vos clients dépensent, plus ils montent en niveau. / Après un certain nombre de visites ou d'achats, vos clients reçoivent un cadeau. / Booster des produits ou des catégories de produits.",
        ),
        fact(
          "push.automatic",
          "Oui\u00a0: une notification à chaque événement client, comme des points mis à jour ou un coupon disponible",
          "loyaltySpace",
          "Envoyez une notification à chaque événement client (mise à jour des points, disponibilité d'un coupon, etc.).",
        ),
        fact(
          "push.broadcasts",
          "Campagnes SMS programmables, filtrées par anniversaire, établissement de référence, code postal, fréquence ou date de dernière visite",
          "campaigns",
          "Grâce à notre plateforme intuitive, concevez et programmez vos campagnes SMS en un instant. / Filtres clients : anniversaire, établissement de référence, code postal, etc. / Filtres comportementaux, RFM : fréquence de visite, date de dernière visite",
        ),
        fact(
          "staff.scanning",
          "Automatique avec une caisse connectée. Sinon, par le numéro de téléphone du client ou un QR code qu'il scanne pour afficher son profil\u00a0; aucune application pour l'équipe n'est décrite",
          "journeys",
          "il suffit d'entrer le numéro de téléphone pour inscrire un client / En permettant à vos clients de scanner un QR code avec leur téléphone, pour afficher en temps réel leur profil.",
        ),
        fact(
          "pos.integration",
          "Oui\u00a0: caisses, commande en ligne et boutiques en ligne (WooCommerce, Prestashop, Shopify), avec «\u00a070 intégrations logicielles\u00a0» annoncées",
          "home",
          "70 intégrations logicielles disponibles / compatible avec les boutiques en ligne comme WooCommerce, Prestashop et Shopify.",
        ),
        fact(
          "locations.multiple",
          "Un seul programme pour tous les établissements\u00a0; chaque franchisé voit les statistiques de son point de vente",
          "multiSite",
          "ils cumulent des points et utilisent leurs récompenses dans l'ensemble de vos établissements / consulter les statistiques qui concernent uniquement leur point de vente",
        ),
        fact(
          "languages",
          "Site en français et en espagnol\u00a0; l'espace fidélité peut parler la langue du client (langues non précisées)",
          "loyaltySpace",
          "Adaptez vos espaces à vos clients en parlant leur langue.",
        ),
        fact(
          "price.entry",
          "49 € HT par mois et par établissement, dégressif à partir de 4 établissements",
          "pricing",
          "49€ / mois* / * HT par établissement, prix dégressif à partir de 4 établissements",
        ),
        fact(
          "trial",
          "Non communiqué\u00a0: la page tarifs propose de contacter un conseiller",
          "pricing",
          "Contacter un conseiller",
        ),
        fact(
          "commitment",
          "Sans engagement\u00a0: un email suffit pour se désabonner dès le mois suivant",
          "pricing",
          "Sans engagement / Un mail suffit pour vous désabonner dès le mois suivant",
        ),
        fact(
          "export",
          "Les données appartiennent au commerce et se téléchargent à tout moment\u00a0; format non communiqué",
          "pricing",
          "Les données vous appartiennent / Vous pouvez les télécharger 24/7",
        ),
        fact(
          "designer",
          "Cartes Apple Wallet et Google Wallet et espace fidélité personnalisables aux couleurs du commerce\u00a0; qui réalise la carte n'est pas précisé",
          "loyaltySpace",
          "Personnalisez vos wallets Apple et Google à votre image. / Habillez l'espace fidélité à vos couleurs",
        ),
        fact(
          "price.setup",
          "190 € HT de frais de mise en service",
          "pricing",
          "+ Frais de mise en service : 190 €* / * HT par établissement, prix dégressif à partir de 4 établissements",
        ),
        fact(
          "sms.price",
          "en plus, à un prix non publié («\u00a0hors consommables\u00a0»)",
          "pricing",
          "Campagnes SMS* / * Hors consommables",
        ),
        fact(
          "customer.signup",
          "l'équipe saisit le numéro de téléphone du client, puis celui-ci finalise son inscription par SMS",
          "journeys",
          "Depuis la caisse ou tout autre canal de commande, il suffit d'entrer le numéro de téléphone pour inscrire un client. / Ce dernier reçoit ensuite un SMS pour finaliser son inscription",
        ),
        fact(
          "program.rewards",
          "un bon d'achat en euros ou en pourcentage, ou un produit offert",
          "program",
          "bon d'achat en € ou %, ou un produit offert",
        ),
        fact(
          "program.extras",
          "le parrainage et une roue de la fortune, en modules complémentaires",
          "pricing",
          "Programme de parrainage / Roue de la fortune",
        ),
        fact(
          "push.geo",
          "une notification aux clients qui approchent du point de vente, si la géolocalisation est activée",
          "loyaltySpace",
          "Activez la géolocalisation pour envoyer une notification à vos clients à l'approche de votre point de vente.",
        ),
        fact("customers.limit", "des membres illimités", "pricing", "Membres illimités"),
        fact("extra.google_reviews", "un «\u00a0booster d'avis clients\u00a0»", "pricing", "Booster d'avis clients"),
        fact(
          "onboarding",
          "un expert dédié, un premier rendez-vous sur vos objectifs, la formation de l'équipe et la reprise de votre programme existant",
          "home",
          "guidée par un expert dédié / Nous réalisons un premier rendez-vous pour comprendre vos objectifs. / nous formons vos équipes à la gestion de la fidélité depuis la caisse. / Reprise de votre programme",
        ),
        fact(
          "commitment.notice",
          "un mois de préavis",
          "terms",
          "le Contrat est conclu pour une durée indéterminée / délai de prévenance d'un (1) mois par l'envoi d'un email à ZS SERVICES",
        ),
      ],
    },
  },
};
