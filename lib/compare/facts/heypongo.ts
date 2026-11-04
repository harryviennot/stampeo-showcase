import type { CompetitorFacts } from "../types";
import { factsReadOn } from "./build";

/**
 * Hey Pongo ("Pongo" on its own site) on the French page. Every fact is a
 * VERIFIED row of `docs/compare/dossiers/heypongo.md`. It publishes no price.
 */

const PAGES = {
  home: { sourceUrl: "https://www.heypongo.com", sourceTitle: "Hey Pongo, page d'accueil" },
  demo: { sourceUrl: "https://www.heypongo.com/demo", sourceTitle: "Hey Pongo, demande de démo" },
  program: { sourceUrl: "https://www.heypongo.com/programme-de-fidelite", sourceTitle: "Hey Pongo, programme de fidélité" },
  independents: {
    sourceUrl: "https://www.heypongo.com/solutions/independants",
    sourceTitle: "Hey Pongo, solution pour les indépendants",
  },
  franchises: { sourceUrl: "https://www.heypongo.com/solutions/franchises", sourceTitle: "Hey Pongo, solution pour les franchises" },
  integrations: { sourceUrl: "https://www.heypongo.com/integrations", sourceTitle: "Hey Pongo, intégrations" },
} as const;

const fact = factsReadOn("2026-11-04");

export const HEY_PONGO: CompetitorFacts = {
  id: "heypongo",
  name: "Hey Pongo",
  website: "https://www.heypongo.com",
  markets: {
    fr: {
      pricingUrl: PAGES.demo.sourceUrl,
      facts: [
        fact(
          PAGES.program,
          "card.where",
          "Six canaux au choix du client\u00a0: Apple Wallet ou Google Wallet, application mobile, tablette au comptoir, borne de commande, terminal de paiement ou QR code sur la table",
          "Le client ajoute sa carte à son Apple ou Google Wallet / Le client choisit le canal qui lui convient",
        ),
        fact(
          PAGES.program,
          "customer.app_required",
          "Non présentée comme obligatoire\u00a0: l'application est un canal parmi d'autres, et un scan suffit pour s'inscrire depuis le téléphone",
          "Un scan suffit pour s'inscrire depuis son téléphone",
        ),
        fact(
          PAGES.program,
          "program.types",
          "Points, paliers et récompenses (produits offerts ou expériences), avec un nombre de points par euro choisi librement",
          "Points, paliers, récompenses expérientielles ou produits offerts / vous définissez librement le ratio points/euro",
        ),
        fact(
          PAGES.program,
          "push.automatic",
          "Oui, par SMS ou email, selon des déclencheurs à régler (anniversaire, inactivité, seuil de points atteint)",
          "Pongo envoie le bon SMS ou email au bon moment, sans intervention de votre part. / Vous configurez les déclencheurs (anniversaire, inactivité, seuil de points atteint…)",
        ),
        fact(PAGES.home, "push.broadcasts", "Campagnes par SMS, email et notifications", "Campagnes email, SMS & push"),
        fact(
          PAGES.independents,
          "staff.scanning",
          "Non communiqué\u00a0: les pages lues ne décrivent pas le geste de l'équipe. Hey Pongo se connecte à la caisse existante",
          "Vous gardez votre caisse et vos habitudes : Pongo s'y connecte.",
        ),
        fact(
          PAGES.integrations,
          "pos.integration",
          "Oui\u00a0: caisses (dont Lightspeed, Zelty, SumUp, Square, L'Addition, Hiboutik, Izipass et Popina), bornes et outils de commande en ligne",
          "Branché sur plus de 60 solutions du monde physique.",
        ),
        fact(
          PAGES.franchises,
          "locations.multiple",
          "Offre multisite\u00a0: un seul endroit pour piloter le réseau, avec un tableau de bord qui regroupe visites, chiffre d'affaires, clients et note Google",
          "Un réseau multisites. Un seul endroit pour tout piloter. / Un dashboard consolide visites, CA, clients et note Google en temps réel.",
        ),
        fact(
          PAGES.home,
          "languages",
          "Site en français\u00a0; aucune autre langue du produit indiquée",
          "[observation] Site en français ; https://en.heypongo.com renvoie une redirection 301 vers https://www.heypongo.com/",
        ),
        fact(
          PAGES.demo,
          "price.entry",
          "Sur devis, après une démo\u00a0: aucun prix publié",
          "C'est un échange de 30 minutes pour voir si Pongo correspond à vos besoins, sans obligation de souscription.",
        ),
        fact(
          PAGES.demo,
          "trial",
          "Pas d'essai gratuit indiqué\u00a0; une démo gratuite de 30 minutes, sans obligation de souscription",
          "La démo est-elle gratuite et sans engagement ? / Oui. C'est un échange de 30 minutes pour voir si Pongo correspond à vos besoins, sans obligation de souscription.",
        ),
        fact(
          PAGES.demo,
          "commitment",
          "Non communiqué",
          "C'est un échange de 30 minutes pour voir si Pongo correspond à vos besoins, sans obligation de souscription.",
        ),
        fact(
          PAGES.independents,
          "customer.signup.payment",
          "au moment de payer, le client saisit son numéro de téléphone",
          "Ils tapent leur numéro au moment de payer. 10 secondes.",
        ),
        fact(
          PAGES.program,
          "customer.signup",
          "l'inscription prend moins de 30 secondes",
          "Le client choisit le canal qui lui convient, l'inscription prend moins de 30 secondes.",
        ),
        fact(
          PAGES.independents,
          "extra.google_reviews",
          "des demandes d'avis automatiques après un nombre de visites choisi, et des réponses à tous les avis depuis son outil",
          "Demande d'avis automatique après x visites / Vous répondez à tous vos avis depuis Pongo",
        ),
        fact(
          PAGES.independents,
          "extra.local_listings",
          "des fiches Google, Facebook et Apple Plans synchronisées, et des horaires, photos et infos à jour sur plus de 20 plateformes",
          "Fiche Google, Facebook, Apple Plan syncronisées / Horaires, photos et infos à jour sur 20+ plateformes",
        ),
        fact(
          PAGES.independents,
          "onboarding",
          "la plupart des indépendants sont opérationnels en 48 heures, et l'équipe accompagne chaque étape",
          "La plupart des indépendants sont opérationnels en 48 heures. / Notre équipe vous accompagne à chaque étape.",
        ),
        fact(PAGES.demo, "price.setup", "Non communiqué", "[observation] Aucun prix ni frais sur /demo, /tarifs, l'accueil et /solutions/independants"),
        fact(PAGES.demo, "sms.price", "Non communiqué", "[observation] Aucun prix de SMS sur /demo, /tarifs, l'accueil et /solutions/independants"),
      ],
    },
  },
};
