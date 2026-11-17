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
