import type { LandingCopy } from "../bundle";

// The Platform page in French: a tour of the product, in the shape of `copy/platform.ts`.

export const PLATFORM: LandingCopy["platform"]["PLATFORM"] = {
  meta: {
    title: "Cartes de fidélité digitales Apple & Google Wallet | Stampeo",
    description:
      "Créez, partagez et tamponnez votre carte de fidélité dans Apple Wallet et Google Wallet, avec un tableau de bord et une application scanner gratuite.",
  },
  hero: {
    h1: "Des cartes de fidélité pour Apple & Google Wallet.",
    accent: "Apple & Google Wallet.",
  },
  heroCards: {
    stackAlt:
      "Des cartes de fidélité empilées comme dans un téléphone\u00a0: la carte à tampons d'un café devant, et derrière, le haut de la carte à points d'un salon, de la carte à niveaux d'un toiletteur et de la carte à tampons d'une boulangerie.",
  },
  marquee: {
    label: "Pensé pour",
    types: [
      "Cafés",
      "Boulangeries",
      "Barbiers",
      "Ongleries",
      "Restaurants",
      "Librairies",
      "Food trucks",
      "Spas",
      "Bars à cils",
      "Bars à jus",
      "Lavages auto",
      "Toiletteurs",
    ],
  },
  deliver: {
    eyebrow: "Dans leur téléphone",
    title: "Directement dans Apple Wallet et Google Wallet.",
    lead: "Aucune application à télécharger. Leur carte se range à côté de leur carte bancaire.",
    analyticsLabel: "Statistiques",
    notificationsLabel: "Sur l'écran de verrouillage",
    updatesLabel: "En temps réel",
    updatesFrom: "5/8",
    updatesTo: "6/8",
  },
  analyticsCard: {
    visits: "Visites",
    returnRate: "Retour à 30 jours",
    overTime: "Visites dans le temps",
    returning: "Déjà venus",
    first: "Première visite",
    points: "pts",
    alt: "Statistiques\u00a0: {visits} visites, en hausse de {visitsChange} %\u00a0; {returnRate}\u00a0: {returnRatePercent} %, en hausse de {returnRateChange} points\u00a0; et les visites dans le temps, semaine par semaine.",
  },
  numbers: {
    eyebrow: "En chiffres",
    title: "Où en est Stampeo aujourd'hui.",
    figures: [
      {
        value: "95 %",
        text: "de cartes conservées",
        source: "Données Stampeo\u00a0: 2 786 cartes de 73 commerces, ajoutées de juin à août 2026",
      },
    ],
  },
  how: {
    eyebrow: "Comment ça marche",
    title: "Créez, partagez, tamponnez.",
    lead: "Créez votre carte, affichez-la au comptoir, tamponnez avec n'importe quel téléphone.",
    cells: [
      { title: "Créez", body: "Une carte à l'image de votre commerce\u00a0: votre logo, vos couleurs, votre récompense." },
      { title: "Partagez", body: "Vos clients scannent le QR code du comptoir ou ouvrent votre lien. Sans application, sans compte." },
      {
        title: "Tamponnez",
        body: "Scannez leur carte avec n'importe quel téléphone. Elle se met à jour en quelques secondes, jusque sur leur écran de verrouillage.",
      },
    ],
    link: "Testez le tampon vous-même",
  },
  demo: {
    eyebrow: "Démo en direct",
  },
  programTypes: {
    eyebrow: "Types de programme",
    title: "Tampons, points ou niveaux.",
    lead: "Récompensez les visites, la dépense, ou offrez des niveaux à vos habitués.",
    closer: "Comment choisir entre tampons et points",
  },
  platform: {
    eyebrow: "La plateforme Stampeo",
    title: "Gérez tout sur ordinateur ou sur téléphone.",
    lead: "Un tableau de bord pour vous, une application scanner gratuite pour votre équipe.",
    tabs: { dashboard: "Tableau de bord", scanner: "Scanner" },
    dashboard: {
      title: "Tout au même endroit",
      facts: [
        { text: "Créez votre carte et voyez-la en direct" },
        { text: "Chaque client, sa progression et ses récompenses" },
        { text: "Des diffusions sur chaque carte" },
        { text: "Vos chiffres, mis à jour à chaque scan" },
      ],
      link: "Voir les statistiques",
    },
    scanner: {
      title: "Gratuite pour toute votre équipe",
      facts: [
        { text: "iPhone, Android ou le navigateur de n'importe quel téléphone" },
        { text: "Vos employés rejoignent avec un code et ne voient que le scanner" },
      ],
      link: "Voir le scanner",
    },
  },
  share: {
    eyebrow: "Partagez-la partout",
    title: "Mettez votre carte là où sont déjà vos clients.",
    lead: "Un QR code et un lien\u00a0: au comptoir, et partout en ligne.",
    channels: [
      { title: "Affichette comptoir", body: "À imprimer, avec votre QR code" },
      { title: "Application scanner", body: "Affiche votre QR code à la caisse" },
      { title: "Instagram", body: "Votre lien en bio ou en story" },
      { title: "Facebook", body: "Votre lien sur votre page" },
      { title: "Votre site", body: "Un bouton ou un QR code" },
      { title: "Fiche d'établissement Google", body: "Votre lien là où l'on vous trouve" },
    ],
  },
  band: {
    title: "Lancez votre carte dès aujourd'hui.",
    accent: "dès aujourd'hui.",
    sub: "Créez-la, testez-la sur votre téléphone, puis choisissez un plan.",
  },
  blog: {
    eyebrow: "Blog",
    title: "Des guides pour les commerçants.",
    lead: "Des conseils concrets pour une carte de fidélité qui fait revenir vos clients.",
    viewAll: "Tout voir",
  },
};
