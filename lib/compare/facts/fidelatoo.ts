import type { CompetitorFacts } from "../types";
import { factsReadOn } from "./build";

/**
 * Fidelatoo on the French page. Every fact is a VERIFIED row of
 * `docs/compare/dossiers/fidelatoo.md`. Its pages disagree on whether the wallet
 * card shows a balance and notifies without its app, so no fact states either.
 */

const PAGES = {
  home: { sourceUrl: "https://fidelatoo.fr", sourceTitle: "Fidelatoo, page d'accueil" },
  pricing: { sourceUrl: "https://fidelatoo.fr/tarifs/", sourceTitle: "Fidelatoo, tarifs" },
  faq: { sourceUrl: "https://fidelatoo.fr/faq/", sourceTitle: "Fidelatoo, questions fréquentes" },
  terms: { sourceUrl: "https://fidelatoo.fr/conditions-generales-de-vente/", sourceTitle: "Fidelatoo, conditions générales de vente" },
  program: { sourceUrl: "https://fidelatoo.fr/programme-de-fidelite/", sourceTitle: "Fidelatoo, programme de fidélité" },
  notifications: { sourceUrl: "https://fidelatoo.fr/notifications-push/", sourceTitle: "Fidelatoo, notifications" },
  popina: { sourceUrl: "https://fidelatoo.fr/integration-popina/", sourceTitle: "Fidelatoo, intégration Popina" },
  walletCard: { sourceUrl: "https://fidelatoo.fr/carte-de-fidelite-apple-wallet/", sourceTitle: "Fidelatoo, carte de fidélité Apple Wallet" },
  vsZerosix: {
    sourceUrl: "https://fidelatoo.fr/comparaison-fidelatoo-vs-zerosix/",
    sourceTitle: "Fidelatoo, comparatif Fidelatoo et Zerosix",
  },
  appStore: { sourceUrl: "https://apps.apple.com/fr/app/fidelatoo/id1619041868", sourceTitle: "Fidelatoo sur l'App Store" },
} as const;

const fact = factsReadOn("2026-11-04");

export const FIDELATOO: CompetitorFacts = {
  id: "fidelatoo",
  name: "Fidelatoo",
  website: "https://fidelatoo.fr",
  markets: {
    fr: {
      pricingUrl: PAGES.pricing.sourceUrl,
      facts: [
        fact(
          PAGES.home,
          "card.where",
          "Dans Apple Wallet ou Google Wallet, sur le téléphone du client",
          "La carte est toujours sur eux, parce qu'elle vit dans leur téléphone. / La carte, dans Apple Wallet et Google Wallet.",
        ),
        fact(
          PAGES.faq,
          "customer.app_required",
          "Aucune pour s'inscrire et cumuler des points\u00a0: le numéro de téléphone suffit",
          "Il n'a rien à faire, aucune app à télécharger !",
        ),
        fact(
          PAGES.program,
          "program.types",
          "Points selon la dépense (1 € = 1 point) ou selon les passages en caisse, qui débloquent des paliers",
          "en fonction de leurs dépenses (1 € = 1 point) / 1 passage en caisse = 1 point / Les points débloquent différents paliers.",
        ),
        fact(
          PAGES.notifications,
          "push.automatic",
          "Non communiqué pour les points crédités ou les récompenses\u00a0; une «\u00a0reconquête automatisée\u00a0» relance les clients absents depuis longtemps",
          "Reconquête automatisée / Relancez les clients qui ne sont pas venus depuis longtemps avec une offre personnalisée.",
        ),
        fact(
          PAGES.notifications,
          "push.broadcasts",
          "Notifications illimitées, envoyées tout de suite ou programmées, à tous les clients ou à un groupe (VIP, anniversaire, absents, dernière visite, panier moyen)\u00a0; SMS en plus, facturés à l'envoi",
          "Contrairement aux SMS facturés à l'envoi, les Notifications Push sont illimitées. / Envoyez la notification en temps réel, ou programmez-la à l'avance",
        ),
        fact(
          PAGES.faq,
          "staff.scanning",
          "Application commerçant\u00a0: l'équipe saisit le numéro de téléphone du client ou scanne son QR code",
          "Saisissez le numéro de téléphone du client ou scannez son QR code pour accéder à sa carte de fidélité.",
        ),
        fact(
          PAGES.popina,
          "pos.integration",
          "Oui, avec la caisse Popina, comprise dans l'abonnement",
          "chaque passage en caisse nourrit le profil client, les paliers et vos statistiques / comprise dans votre abonnement Fidelatoo à 25€/mois HT",
        ),
        fact(
          PAGES.popina,
          "locations.multiple",
          "Oui, avec un abonnement et des statistiques par établissement",
          "Chaque établissement a son abonnement et ses statistiques",
        ),
        fact(
          PAGES.appStore,
          "languages",
          "Applications client et commerçant en français et en anglais",
          "Français et Anglais",
        ),
        fact(
          PAGES.pricing,
          "price.entry",
          "25 € HT par mois avec engagement d'un an, ou 30 € HT par mois sans engagement",
          "Le Plan Premium est à 25€ HT/mois (avec engagement d'un an) ou 30€ HT/mois (sans engagement – arrêtez quand vous voulez)",
        ),
        fact(
          PAGES.terms,
          "trial",
          "14 jours, sans moyen de paiement demandé",
          "précédée d'un essai gratuit de quatorze jours / L'essai ne nécessite aucun moyen de paiement.",
        ),
        fact(
          PAGES.terms,
          "commitment",
          "Au mois\u00a0: un mois renouvelé automatiquement. À l'année\u00a0: non résiliable avant son terme, sans remboursement partiel",
          "Elle ne peut pas être résiliée avant son terme et ne donne lieu à aucun remboursement partiel.",
        ),
        fact(
          PAGES.terms,
          "export",
          "Export des données des porteurs de carte depuis le tableau de bord, réservé aux abonnements en cours\u00a0; format non communiqué",
          "Cet export est réservé aux abonnements en cours de validité",
        ),
        fact(
          PAGES.faq,
          "designer",
          "Non communiqué\u00a0: les réglages de la carte ne sont pas décrits sur les pages publiques. La page d'adhésion du commerce présente son logo, son programme et ses récompenses",
          "Cette page web propre à votre commerce présente votre logo, votre programme de fidélité et vos récompenses.",
        ),
        fact(
          PAGES.home,
          "customer.signup",
          "le client donne son numéro de téléphone en caisse, et le commerce crédite ses points",
          "Votre client donne son numéro, vous créditez ses points.",
        ),
        fact(
          PAGES.pricing,
          "staff.no_scan",
          "créditer des points et échanger des récompenses sans scanner",
          "Donnez des points et échangez des récompenses sans scanner",
        ),
        fact(
          PAGES.home,
          "program.status",
          "une carte avec une durée de validité et un statut, pour les adhérents ou les meilleurs clients",
          "Activez une carte avec une durée de validité et un statut pour vos adhérents ou meilleurs clients.",
        ),
        fact(
          PAGES.walletCard,
          "card.network",
          "une seule carte, valable dans tous les commerces du réseau Fidelatoo",
          "Une seule carte suffit pour tous les commerces du réseau.",
        ),
        fact(
          PAGES.home,
          "push.geo",
          "des notifications géolocalisées vers les utilisateurs qui passent à proximité",
          "Push géo-localisés à tous les utilisateurs passant à proximité.",
        ),
        fact(PAGES.terms, "trial.days", "14 jours", "précédée d'un essai gratuit de quatorze jours"),
        fact(PAGES.pricing, "sms.price", "0,06 € HT par SMS (soit 0,072 € TTC, TVA à 20 %)", "0,06€ / coût unitaire du SMS"),
        fact(PAGES.pricing, "price.setup", "aucuns frais d'installation", "sans aucun frais d'installation ni coût caché"),
        fact(
          PAGES.popina,
          "pos.other",
          "d'autres caisses étudiées sur demande",
          "Nous étudions chaque intégration sur demande et nous n'avons aucune limite technique sur le sujet",
        ),
        fact(
          PAGES.home,
          "pos.embed",
          "le QR code peut s'intégrer à l'application ou au site mobile du commerce (API)",
          "Intégrez le QR Code dans votre propre app ou site mobile (API, Webview).",
        ),
        fact(
          PAGES.faq,
          "locations.program",
          "plusieurs points de vente réunis dans un seul programme, vu comme une seule carte par le client",
          "vous permet d'associer plusieurs points de vente à un seul et unique programme de fidélité du point de vue client",
        ),
        fact(
          PAGES.vsZerosix,
          "locations.pricing",
          "un tarif dégressif dès 2 établissements, dont le montant n'est pas publié",
          "Multi-points de vente / Oui – Tarif dégressif dès 2 établissements",
        ),
        fact(
          PAGES.pricing,
          "customers.limit",
          "cartes, clients, points et notifications en illimité",
          "Cartes, clients, points et Push illimités",
        ),
        fact(PAGES.pricing, "crm", "des filtres et une segmentation de la base clients", "Filtrez et segmentez votre base de données clients (CRM)"),
        fact(
          PAGES.vsZerosix,
          "extra.google_reviews",
          "une demande d'avis Google automatisée",
          "Booster d'avis Google automatisé / Oui — au pic émotionnel client",
        ),
        fact(
          PAGES.vsZerosix,
          "extra.kit",
          "un kit imprimé livré (vitrophanie et autocollant)",
          "Kit de communication imprimé livré / Oui — vitrophanie et sticker HD",
        ),
        fact(PAGES.faq, "import", "l'import d'une base clients existante", "Importez votre base clients existante"),
        fact(
          PAGES.terms,
          "data.after_cancel",
          "repasse sur un plan gratuit et garde le programme, les membres et leurs points",
          "votre compte repasse en formule gratuite : votre programme, vos membres et leurs points sont conservés.",
        ),
      ],
    },
  },
};
