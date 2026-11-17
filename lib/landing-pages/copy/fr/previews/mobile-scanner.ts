import type { LandingCopy } from "../../bundle";

// The scanner preview in French: staff scan a card with the free app or with the web scanner in a browser.

export const MOBILE_SCANNER_PREVIEW: LandingCopy["previews"]["mobileScanner"]["MOBILE_SCANNER_PREVIEW"] = {
  meta: {
    title: "Scanner de carte de fidélité pour iPhone et Android | Stampeo",
    description:
      "Scannez les cartes de fidélité avec l'application scanner Stampeo, gratuite sur iPhone et Android, ou le scanner web dans n'importe quel navigateur. Aucun matériel. Essai gratuit.",
  },
  hero: {
    h1: "Une application scanner pour votre équipe.",
    accent: "application scanner",
    sub: "Gratuite sur iPhone et Android, ou dans un navigateur avec le scanner web. Aucun matériel.",
    secondary: "Voir au comptoir",
  },
  counter: {
    eyebrow: "Au comptoir",
    title: "Tampons, points ou récompenses en un scan.",
    lead: "Scannez la carte, appuyez une fois : elle se met à jour en quelques secondes.",
    options: [
      { key: "stamps", title: "Tampons", line: "Un seul, ou plusieurs d'un coup" },
      { key: "points", title: "Points", line: "Saisissez le montant dépensé" },
      { key: "rewards", title: "Récompenses", line: "Utilisez-la maintenant ou à sa prochaine visite" },
      { key: "levels", title: "Niveaux", line: "Voyez son niveau et ses avantages" },
    ],
    fact: "Le client reçoit aussitôt une notification sur son écran de verrouillage.",
    panes: [
      {
        screenAlt:
          "L'application scanner ajoute trois tampons à la carte de Sophie en un seul scan : un compteur réglé sur 3 et le bouton Ajouter 3 tampons.",
        cardAlt: "La carte de Sophie chez Aurevo, pleine à 8 tampons sur 8.",
        result: "5 → 8 tampons",
      },
      {
        screenAlt:
          "L'application scanner avec un montant de 12,50 saisi au clavier, et les points qu'il rapporte, environ 12, avant toute validation.",
        cardAlt: "La carte de Sophie chez Marginalia, une librairie, désormais à 252 points.",
        result: "240 → 252 pts",
      },
      {
        screenAlt: "La liste des récompenses à utiliser dans l'application scanner : trois récompenses, chacune avec un bouton Utiliser.",
        cardAlt: "La carte de Sophie chez Aurevo, revenue à 2 tampons sur 8 une fois sa récompense utilisée.",
        result: "Café offert utilisé",
      },
      {
        screenAlt: "L'application scanner affichant les avantages d'un client Argent, à appliquer en caisse avant d'encaisser.",
        cardAlt: "La carte de Sophie chez Wrenfold, un pressing, au niveau Argent.",
        result: "Niveau : Argent",
      },
    ],
  },
  screens: {
    customer: "Sophie",
    stamps: { detail: "5 / 8", added: "+3 tampons", completes: "La carte sera complète", button: "Ajouter 3 tampons" },
    points: { detail: "240 pts", amount: "12,50", earns: "≈ +12 pts", button: "Ajouter des points" },
    rewards: {
      detail: "8 / 8",
      title: "Récompenses à utiliser",
      redeem: "Utiliser",
      gift: "Cadeau",
      expiresToday: "Expire aujourd'hui",
      expiresLater: "Expire dans 5 jours",
      held: ["Café offert", "Viennoiserie offerte", "Café offert"],
    },
    levels: {
      detail: "4 / 6",
      perks: ["Housse offerte", "Retrait prioritaire"],
      perkOne: "Avantage {level} : {perk}",
      perkMany: "Avantages {level} :",
      applyOne: "Appliquez-le en caisse avant d'encaisser.",
      applyMany: "Appliquez-les en caisse avant d'encaisser.",
      button: "Ajouter un tampon",
    },
  },
  ways: {
    eyebrow: "Application ou navigateur",
    title: "L'application, ou un simple navigateur.",
    lead: "L'application scanne le plus vite. Pas envie d'installer ? Le scanner web suffit.",
    cells: [
      {
        title: "Application scanner Stampeo",
        body: "Gratuite sur l'App Store et Google Play. Connectez-vous avec Google ou Apple en un appui.",
        devices: ["iPhone", "Android"],
      },
      {
        title: "Scanner web",
        body: "Ouvrez scan.stampeo.app dans n'importe quel navigateur. Rien à installer.",
        devices: ["Téléphone", "Tablette", "Ordinateur"],
      },
    ],
    fact: "Les deux font la même chose : scanner la carte, ajouter des tampons ou des points, utiliser les récompenses.",
  },
  band: {
    title: "Votre premier tampon, aujourd'hui.",
    accent: "aujourd'hui.",
    sub: "Créez votre carte, puis scannez votre premier client avec n'importe quel téléphone.",
  },
};
