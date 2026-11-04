import type { CompetitorFacts, SourcedFact } from "../types";

/**
 * Hey Pongo ("Pongo" on its own site) on the French page. Every fact is a
 * VERIFIED row of `docs/compare/dossiers/heypongo.md`. It publishes no price.
 */

const READ_ON = "2026-11-04";

const PAGES = {
  home: { url: "https://www.heypongo.com", title: "Hey Pongo, page d'accueil" },
  demo: { url: "https://www.heypongo.com/demo", title: "Hey Pongo, demande de démo" },
  program: { url: "https://www.heypongo.com/programme-de-fidelite", title: "Hey Pongo, programme de fidélité" },
  independents: {
    url: "https://www.heypongo.com/solutions/independants",
    title: "Hey Pongo, solution pour les indépendants",
  },
  franchises: { url: "https://www.heypongo.com/solutions/franchises", title: "Hey Pongo, solution pour les franchises" },
  integrations: { url: "https://www.heypongo.com/integrations", title: "Hey Pongo, intégrations" },
  logicielsPro: { url: "https://www.logiciels.pro/heypongo/", title: "logiciels.pro, fiche Hey Pongo" },
} as const;

const fact = (id: string, value: string, page: keyof typeof PAGES, quote: string): SourcedFact => ({
  id,
  value,
  sourceUrl: PAGES[page].url,
  sourceTitle: PAGES[page].title,
  quote,
  checkedAt: READ_ON,
});

export const HEY_PONGO: CompetitorFacts = {
  id: "heypongo",
  name: "Hey Pongo",
  website: "https://www.heypongo.com",
  markets: {
    fr: {
      pricingUrl: PAGES.demo.url,
      facts: [
        fact(
          "card.where",
          "Six canaux au choix du client\u00a0: Apple Wallet ou Google Wallet, application mobile, tablette au comptoir, borne de commande, terminal de paiement ou QR code sur la table",
          "program",
          "Le client ajoute sa carte à son Apple ou Google Wallet / Le client choisit le canal qui lui convient",
        ),
        fact(
          "customer.app_required",
          "Non présentée comme obligatoire\u00a0: l'application est un canal parmi d'autres, et un scan suffit pour s'inscrire depuis le téléphone",
          "program",
          "Un scan suffit pour s'inscrire depuis son téléphone",
        ),
        fact(
          "program.types",
          "Points, paliers et récompenses (produits offerts ou expériences), avec un nombre de points par euro choisi librement",
          "program",
          "Points, paliers, récompenses expérientielles ou produits offerts / vous définissez librement le ratio points/euro",
        ),
        fact(
          "push.automatic",
          "Oui, par SMS ou email, selon des déclencheurs à régler (anniversaire, inactivité, seuil de points atteint)",
          "program",
          "Pongo envoie le bon SMS ou email au bon moment, sans intervention de votre part. / Vous configurez les déclencheurs (anniversaire, inactivité, seuil de points atteint…)",
        ),
        fact("push.broadcasts", "Campagnes par SMS, email et notifications", "home", "Campagnes email, SMS & push"),
        fact(
          "staff.scanning",
          "Non communiqué\u00a0: les pages lues ne décrivent pas le geste de l'équipe. Hey Pongo se connecte à la caisse existante",
          "independents",
          "Vous gardez votre caisse et vos habitudes : Pongo s'y connecte.",
        ),
        fact(
          "pos.integration",
          "Oui\u00a0: caisses (dont Lightspeed, Zelty, SumUp, Square, L'Addition, Hiboutik, Izipass et Popina), bornes et outils de commande en ligne",
          "integrations",
          "Branché sur plus de 60 solutions du monde physique.",
        ),
        fact(
          "locations.multiple",
          "Offre multisite\u00a0: un seul endroit pour piloter le réseau, avec un tableau de bord qui regroupe visites, chiffre d'affaires, clients et note Google",
          "franchises",
          "Un réseau multisites. Un seul endroit pour tout piloter. / Un dashboard consolide visites, CA, clients et note Google en temps réel.",
        ),
        fact(
          "languages",
          "Site en français\u00a0; aucune autre langue du produit indiquée",
          "home",
          "[observation] Site en français ; https://en.heypongo.com renvoie une redirection 301 vers https://www.heypongo.com/",
        ),
        fact(
          "price.entry",
          "Sur devis, après une démo\u00a0: aucun prix publié",
          "demo",
          "C'est un échange de 30 minutes pour voir si Pongo correspond à vos besoins, sans obligation de souscription.",
        ),
        fact(
          "trial",
          "Pas d'essai gratuit indiqué\u00a0; une démo gratuite de 30 minutes, sans obligation de souscription",
          "demo",
          "La démo est-elle gratuite et sans engagement ? / Oui. C'est un échange de 30 minutes pour voir si Pongo correspond à vos besoins, sans obligation de souscription.",
        ),
        fact(
          "commitment",
          "Non communiqué sur son site\u00a0; selon logiciels.pro, la durée d'engagement varie selon l'offre",
          "logicielsPro",
          "nombre de fonctionnalités, quotas d'utilisation, durée d'engagement",
        ),
        fact(
          "customer.signup.payment",
          "au moment de payer, le client saisit son numéro de téléphone",
          "independents",
          "Ils tapent leur numéro au moment de payer. 10 secondes.",
        ),
        fact(
          "customer.signup",
          "l'inscription prend moins de 30 secondes",
          "program",
          "Le client choisit le canal qui lui convient, l'inscription prend moins de 30 secondes.",
        ),
        fact(
          "extra.google_reviews",
          "des demandes d'avis automatiques après un nombre de visites choisi, et des réponses à tous les avis depuis son outil",
          "independents",
          "Demande d'avis automatique après x visites / Vous répondez à tous vos avis depuis Pongo",
        ),
        fact(
          "extra.local_listings",
          "des fiches Google, Facebook et Apple Plans synchronisées, et des horaires, photos et infos à jour sur plus de 20 plateformes",
          "independents",
          "Fiche Google, Facebook, Apple Plan syncronisées / Horaires, photos et infos à jour sur 20+ plateformes",
        ),
        fact(
          "onboarding",
          "la plupart des indépendants sont opérationnels en 48 heures, et l'équipe accompagne chaque étape",
          "independents",
          "La plupart des indépendants sont opérationnels en 48 heures. / Notre équipe vous accompagne à chaque étape.",
        ),
        fact("price.setup", "Non communiqué", "demo", "[observation] Aucun prix ni frais sur /demo, /tarifs, l'accueil et /solutions/independants"),
        fact("sms.price", "Non communiqué", "demo", "[observation] Aucun prix de SMS sur /demo, /tarifs, l'accueil et /solutions/independants"),
      ],
    },
  },
};
