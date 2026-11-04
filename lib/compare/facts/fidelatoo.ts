import type { CompetitorFacts, SourcedFact } from "../types";

/**
 * Fidelatoo on the French page. Every fact is a VERIFIED row of
 * `docs/compare/dossiers/fidelatoo.md`. Its pages disagree on whether the wallet
 * card shows a balance and notifies without its app, so no fact states either.
 */

const READ_ON = "2026-11-04";

const PAGES = {
  home: { url: "https://fidelatoo.fr", title: "Fidelatoo, page d'accueil" },
  pricing: { url: "https://fidelatoo.fr/tarifs/", title: "Fidelatoo, tarifs" },
  faq: { url: "https://fidelatoo.fr/faq/", title: "Fidelatoo, questions fréquentes" },
  terms: { url: "https://fidelatoo.fr/conditions-generales-de-vente/", title: "Fidelatoo, conditions générales de vente" },
  program: { url: "https://fidelatoo.fr/programme-de-fidelite/", title: "Fidelatoo, programme de fidélité" },
  notifications: { url: "https://fidelatoo.fr/notifications-push/", title: "Fidelatoo, notifications" },
  popina: { url: "https://fidelatoo.fr/integration-popina/", title: "Fidelatoo, intégration Popina" },
  walletCard: { url: "https://fidelatoo.fr/carte-de-fidelite-apple-wallet/", title: "Fidelatoo, carte de fidélité Apple Wallet" },
  vsZerosix: {
    url: "https://fidelatoo.fr/comparaison-fidelatoo-vs-zerosix/",
    title: "Fidelatoo, comparatif Fidelatoo et Zerosix",
  },
  appStore: { url: "https://apps.apple.com/fr/app/fidelatoo/id1619041868", title: "Fidelatoo sur l'App Store" },
} as const;

const fact = (id: string, value: string, page: keyof typeof PAGES, quote: string): SourcedFact => ({
  id,
  value,
  sourceUrl: PAGES[page].url,
  sourceTitle: PAGES[page].title,
  quote,
  checkedAt: READ_ON,
});

export const FIDELATOO: CompetitorFacts = {
  id: "fidelatoo",
  name: "Fidelatoo",
  website: "https://fidelatoo.fr",
  markets: {
    fr: {
      pricingUrl: PAGES.pricing.url,
      facts: [
        fact(
          "card.where",
          "Dans Apple Wallet ou Google Wallet, sur le téléphone du client",
          "home",
          "La carte est toujours sur eux, parce qu'elle vit dans leur téléphone. / La carte, dans Apple Wallet et Google Wallet.",
        ),
        fact(
          "customer.app_required",
          "Aucune pour s'inscrire et cumuler des points\u00a0: le numéro de téléphone suffit",
          "faq",
          "Il n'a rien à faire, aucune app à télécharger !",
        ),
        fact(
          "program.types",
          "Points selon la dépense (1 € = 1 point) ou selon les passages en caisse, qui débloquent des paliers",
          "program",
          "en fonction de leurs dépenses (1 € = 1 point) / 1 passage en caisse = 1 point / Les points débloquent différents paliers.",
        ),
        fact(
          "push.automatic",
          "Non communiqué pour les points crédités ou les récompenses\u00a0; une «\u00a0reconquête automatisée\u00a0» relance les clients absents depuis longtemps",
          "notifications",
          "Reconquête automatisée / Relancez les clients qui ne sont pas venus depuis longtemps avec une offre personnalisée.",
        ),
        fact(
          "push.broadcasts",
          "Notifications illimitées, envoyées tout de suite ou programmées, à tous les clients ou à un groupe (VIP, anniversaire, absents, dernière visite, panier moyen)\u00a0; SMS en plus, facturés à l'envoi",
          "notifications",
          "Contrairement aux SMS facturés à l'envoi, les Notifications Push sont illimitées. / Envoyez la notification en temps réel, ou programmez-la à l'avance",
        ),
        fact(
          "staff.scanning",
          "Application commerçant\u00a0: l'équipe saisit le numéro de téléphone du client ou scanne son QR code",
          "faq",
          "Saisissez le numéro de téléphone du client ou scannez son QR code pour accéder à sa carte de fidélité.",
        ),
        fact(
          "pos.integration",
          "Oui, avec la caisse Popina, comprise dans l'abonnement",
          "popina",
          "chaque passage en caisse nourrit le profil client, les paliers et vos statistiques / comprise dans votre abonnement Fidelatoo à 25€/mois HT",
        ),
        fact(
          "locations.multiple",
          "Oui, avec un abonnement et des statistiques par établissement",
          "popina",
          "Chaque établissement a son abonnement et ses statistiques",
        ),
        fact(
          "languages",
          "Applications client et commerçant en français et en anglais",
          "appStore",
          "Français et Anglais",
        ),
        fact(
          "price.entry",
          "25 € HT par mois avec engagement d'un an, ou 30 € HT par mois sans engagement",
          "pricing",
          "Le Plan Premium est à 25€ HT/mois (avec engagement d'un an) ou 30€ HT/mois (sans engagement – arrêtez quand vous voulez)",
        ),
        fact(
          "trial",
          "14 jours, sans moyen de paiement demandé",
          "terms",
          "précédée d'un essai gratuit de quatorze jours / L'essai ne nécessite aucun moyen de paiement.",
        ),
        fact(
          "commitment",
          "Au mois\u00a0: un mois renouvelé automatiquement. À l'année\u00a0: non résiliable avant son terme, sans remboursement partiel",
          "terms",
          "Elle ne peut pas être résiliée avant son terme et ne donne lieu à aucun remboursement partiel.",
        ),
        fact(
          "export",
          "Export des données des porteurs de carte depuis le tableau de bord, réservé aux abonnements en cours\u00a0; format non communiqué",
          "terms",
          "Cet export est réservé aux abonnements en cours de validité",
        ),
        fact(
          "designer",
          "Non communiqué\u00a0: les réglages de la carte ne sont pas décrits sur les pages publiques. La page d'adhésion du commerce présente son logo, son programme et ses récompenses",
          "faq",
          "Cette page web propre à votre commerce présente votre logo, votre programme de fidélité et vos récompenses.",
        ),
        fact(
          "customer.signup",
          "le client donne son numéro de téléphone en caisse, et le commerce crédite ses points",
          "home",
          "Votre client donne son numéro, vous créditez ses points.",
        ),
        fact(
          "staff.no_scan",
          "créditer des points et échanger des récompenses sans scanner",
          "pricing",
          "Donnez des points et échangez des récompenses sans scanner",
        ),
        fact(
          "program.status",
          "une carte avec une durée de validité et un statut, pour les adhérents ou les meilleurs clients",
          "home",
          "Activez une carte avec une durée de validité et un statut pour vos adhérents ou meilleurs clients.",
        ),
        fact(
          "card.network",
          "une seule carte, valable dans tous les commerces du réseau Fidelatoo",
          "walletCard",
          "Une seule carte suffit pour tous les commerces du réseau.",
        ),
        fact(
          "push.geo",
          "des notifications géolocalisées vers les utilisateurs qui passent à proximité",
          "home",
          "Push géo-localisés à tous les utilisateurs passant à proximité.",
        ),
        fact("trial.days", "14 jours", "terms", "précédée d'un essai gratuit de quatorze jours"),
        fact("sms.price", "0,06 € HT par SMS (soit 0,072 € TTC, TVA à 20 %)", "pricing", "0,06€ / coût unitaire du SMS"),
        fact("price.setup", "aucuns frais d'installation", "pricing", "sans aucun frais d'installation ni coût caché"),
        fact(
          "pos.other",
          "d'autres caisses étudiées sur demande",
          "popina",
          "Nous étudions chaque intégration sur demande et nous n'avons aucune limite technique sur le sujet",
        ),
        fact(
          "pos.embed",
          "le QR code peut s'intégrer à l'application ou au site mobile du commerce (API)",
          "home",
          "Intégrez le QR Code dans votre propre app ou site mobile (API, Webview).",
        ),
        fact(
          "locations.program",
          "plusieurs points de vente réunis dans un seul programme, vu comme une seule carte par le client",
          "faq",
          "vous permet d'associer plusieurs points de vente à un seul et unique programme de fidélité du point de vue client",
        ),
        fact(
          "locations.pricing",
          "un tarif dégressif dès 2 établissements, dont le montant n'est pas publié",
          "vsZerosix",
          "Multi-points de vente / Oui – Tarif dégressif dès 2 établissements",
        ),
        fact(
          "customers.limit",
          "cartes, clients, points et notifications en illimité",
          "pricing",
          "Cartes, clients, points et Push illimités",
        ),
        fact("crm", "des filtres et une segmentation de la base clients", "pricing", "Filtrez et segmentez votre base de données clients (CRM)"),
        fact(
          "extra.google_reviews",
          "une demande d'avis Google automatisée",
          "vsZerosix",
          "Booster d'avis Google automatisé / Oui — au pic émotionnel client",
        ),
        fact(
          "extra.kit",
          "un kit imprimé livré (vitrophanie et autocollant)",
          "vsZerosix",
          "Kit de communication imprimé livré / Oui — vitrophanie et sticker HD",
        ),
        fact("import", "l'import d'une base clients existante", "faq", "Importez votre base clients existante"),
        fact(
          "data.after_cancel",
          "repasse sur un plan gratuit et garde le programme, les membres et leurs points",
          "terms",
          "votre compte repasse en formule gratuite : votre programme, vos membres et leurs points sont conservés.",
        ),
      ],
    },
  },
};
