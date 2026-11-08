import type { CompetitorFacts } from "../types";
import { factsReadOn } from "./build";

/** Zerosix on the French page. Every fact is a VERIFIED row of `docs/compare/dossiers/zerosix.md`. */

const PAGES = {
  home: { sourceUrl: "https://www.zerosix.com/", sourceTitle: "Zerosix, page d'accueil" },
  pricing: { sourceUrl: "https://www.zerosix.com/tarifs-programme-fidelite", sourceTitle: "Zerosix, tarifs" },
  terms: { sourceUrl: "https://www.zerosix.com/condition-generales", sourceTitle: "Zerosix, conditions générales" },
  loyaltySpace: { sourceUrl: "https://www.zerosix.com/espace-fidelite", sourceTitle: "Zerosix, espace fidélité" },
  journeys: { sourceUrl: "https://www.zerosix.com/parcours-clients", sourceTitle: "Zerosix, parcours clients" },
  program: { sourceUrl: "https://www.zerosix.com/programme-de-fidelite", sourceTitle: "Zerosix, programme de fidélité" },
  campaigns: {
    sourceUrl: "https://www.zerosix.com/animations-campagnes-marketing",
    sourceTitle: "Zerosix, animations et campagnes",
  },
  multiSite: {
    sourceUrl: "https://www.zerosix.com/multi-etablissements-franchises",
    sourceTitle: "Zerosix, multi-établissements et franchises",
  },
} as const;

const fact = factsReadOn("2026-11-04");

export const ZEROSIX: CompetitorFacts = {
  id: "zerosix",
  name: "Zerosix",
  website: "https://www.zerosix.com",
  markets: {
    fr: {
      pricingUrl: PAGES.pricing.sourceUrl,
      facts: [
        fact(
          PAGES.loyaltySpace,
          "card.where",
          "Un espace fidélité en ligne, avec une carte Apple Wallet ou Google Wallet pour s'identifier",
          "Vos clients s'inscrivent depuis leur espace fidélité et s'identifient grâce à leur espace ou à leur Apple/Google Wallet.",
          "Espace en ligne et Apple/Google Wallet",
        ),
        fact(
          PAGES.loyaltySpace,
          "customer.app_required",
          "Aucune application à télécharger",
          "Vos membres n'ont pas besoin de télécharger une énième application.",
          "Aucune appli à télécharger",
        ),
        fact(
          PAGES.program,
          "program.types",
          "Cycle de points, statut (la dépense fait monter de niveau), boutique de récompenses, tampons, cagnotte ou club, avec des points renforcés sur des produits ou des catégories",
          "Plus vos clients dépensent, plus ils montent en niveau. / Après un certain nombre de visites ou d'achats, vos clients reçoivent un cadeau. / Booster des produits ou des catégories de produits.",
          "Points, statut, tampons, cagnotte, club",
        ),
        fact(
          PAGES.loyaltySpace,
          "push.automatic",
          "Oui\u00a0: une notification à chaque événement client, comme des points mis à jour ou un coupon disponible",
          "Envoyez une notification à chaque événement client (mise à jour des points, disponibilité d'un coupon, etc.).",
          "Oui, à chaque événement client",
        ),
        {
          ...fact(
            PAGES.campaigns,
            "push.broadcasts",
            "Campagnes SMS programmables, filtrées par anniversaire, établissement de référence, code postal, fréquence ou date de dernière visite\u00a0; les SMS sont facturés en plus de l'offre, à un prix non publié",
            "Grâce à notre plateforme intuitive, concevez et programmez vos campagnes SMS en un instant. / Filtres clients : anniversaire, établissement de référence, code postal, etc. / Filtres comportementaux, RFM : fréquence de visite, date de dernière visite / Page tarifs : Campagnes SMS* / * Hors consommables",
            "Campagnes SMS programmables et ciblées",
          ),
          shortNote: "SMS facturés en plus, prix non publié",
        },
        fact(
          PAGES.journeys,
          "staff.scanning",
          "Automatique avec une caisse connectée. Sinon, par le numéro de téléphone du client ou un QR code qu'il scanne pour afficher son profil\u00a0; aucune application pour l'équipe n'est décrite",
          "il suffit d'entrer le numéro de téléphone pour inscrire un client / En permettant à vos clients de scanner un QR code avec leur téléphone, pour afficher en temps réel leur profil.",
          "Caisse connectée, numéro ou QR code",
        ),
        fact(
          PAGES.home,
          "pos.integration",
          "Oui\u00a0: caisses, commande en ligne et boutiques en ligne (WooCommerce, Prestashop, Shopify), avec «\u00a070 intégrations logicielles\u00a0» annoncées",
          "70 intégrations logicielles disponibles / compatible avec les boutiques en ligne comme WooCommerce, Prestashop et Shopify.",
          "Oui, caisses et boutiques en ligne",
        ),
        fact(
          PAGES.multiSite,
          "locations.multiple",
          "Un seul programme pour tous les établissements\u00a0; chaque franchisé voit les statistiques de son point de vente",
          "ils cumulent des points et utilisent leurs récompenses dans l'ensemble de vos établissements / consulter les statistiques qui concernent uniquement leur point de vente",
          "Programme commun aux établissements",
        ),
        fact(
          PAGES.loyaltySpace,
          "languages",
          "Site en français et en espagnol\u00a0; l'espace fidélité peut parler la langue du client (langues non précisées)",
          "Adaptez vos espaces à vos clients en parlant leur langue.",
          "Site en français et en espagnol",
        ),
        fact(
          PAGES.pricing,
          "price.entry",
          "49 € HT par mois et par établissement, dégressif à partir de 4 établissements",
          "49€ / mois* / * HT par établissement, prix dégressif à partir de 4 établissements",
          "49 € HT/mois par établissement",
        ),
        fact(
          PAGES.pricing,
          "trial",
          "Non communiqué\u00a0: la page tarifs propose de contacter un conseiller",
          "Contacter un conseiller",
          "Non communiqué",
        ),
        fact(
          PAGES.pricing,
          "commitment",
          "Sans engagement\u00a0: un email suffit pour se désabonner dès le mois suivant",
          "Sans engagement / Un mail suffit pour vous désabonner dès le mois suivant",
          "Sans engagement, arrêt le mois suivant",
        ),
        fact(
          PAGES.pricing,
          "export",
          "Les données appartiennent au commerce et se téléchargent à tout moment\u00a0; format non communiqué",
          "Les données vous appartiennent / Vous pouvez les télécharger 24/7",
          "Oui, 24\u00a0h/24\u00a0; format non communiqué",
        ),
        fact(
          PAGES.loyaltySpace,
          "designer",
          "Cartes Apple Wallet et Google Wallet et espace fidélité personnalisables aux couleurs du commerce\u00a0; qui réalise la carte n'est pas précisé",
          "Personnalisez vos wallets Apple et Google à votre image. / Habillez l'espace fidélité à vos couleurs",
          "Personnalisable, sans préciser par qui",
        ),
        fact(
          PAGES.pricing,
          "price.setup",
          "190 € HT de frais de mise en service",
          "+ Frais de mise en service : 190 €* / * HT par établissement, prix dégressif à partir de 4 établissements",
        ),
        fact(
          PAGES.pricing,
          "sms.price",
          "en plus, à un prix non publié («\u00a0hors consommables\u00a0»)",
          "Campagnes SMS* / * Hors consommables",
        ),
        fact(
          PAGES.journeys,
          "customer.signup",
          "l'équipe saisit le numéro de téléphone du client, puis celui-ci finalise son inscription par SMS",
          "Depuis la caisse ou tout autre canal de commande, il suffit d'entrer le numéro de téléphone pour inscrire un client. / Ce dernier reçoit ensuite un SMS pour finaliser son inscription",
        ),
        fact(
          PAGES.program,
          "program.rewards",
          "un bon d'achat en euros ou en pourcentage, ou un produit offert",
          "bon d'achat en € ou %, ou un produit offert",
        ),
        fact(
          PAGES.pricing,
          "program.extras",
          "le parrainage et une roue de la fortune, en modules complémentaires",
          "Programme de parrainage / Roue de la fortune",
        ),
        fact(
          PAGES.loyaltySpace,
          "push.geo",
          "une notification aux clients qui approchent du point de vente, si la géolocalisation est activée",
          "Activez la géolocalisation pour envoyer une notification à vos clients à l'approche de votre point de vente.",
        ),
        fact(PAGES.pricing, "customers.limit", "des membres illimités", "Membres illimités"),
        fact(PAGES.pricing, "extra.google_reviews", "un «\u00a0booster d'avis clients\u00a0»", "Booster d'avis clients"),
        fact(
          PAGES.home,
          "onboarding",
          "un expert dédié, un premier rendez-vous sur vos objectifs, la formation de l'équipe et la reprise de votre programme existant",
          "guidée par un expert dédié / Nous réalisons un premier rendez-vous pour comprendre vos objectifs. / nous formons vos équipes à la gestion de la fidélité depuis la caisse. / Reprise de votre programme",
        ),
        fact(
          PAGES.terms,
          "commitment.notice",
          "un mois de préavis",
          "le Contrat est conclu pour une durée indéterminée / délai de prévenance d'un (1) mois par l'envoi d'un email à ZS SERVICES",
        ),
      ],
    },
  },
};
