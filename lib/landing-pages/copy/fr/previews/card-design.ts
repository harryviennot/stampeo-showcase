import type { LandingCopy } from "../../bundle";

// The card design preview in French: can the card look like my shop, and what can I change on it.

export const CARD_DESIGN_PREVIEW: LandingCopy["previews"]["cardDesign"]["CARD_DESIGN_PREVIEW"] = {
  meta: {
    title: "Créez votre carte de fidélité digitale | Stampeo",
    description:
      "Créez une carte de fidélité digitale avec votre logo, vos couleurs et vos icônes de tampon, pour Apple Wallet et Google Wallet. Tampons, points ou niveaux. Essai gratuit.",
  },
  hero: {
    h1: "Créez votre carte de fidélité digitale.",
    accent: "carte de fidélité digitale.",
    sub: "Votre logo, vos couleurs, vos icônes de tampon, dans Apple Wallet et Google Wallet.",
    secondary: "Voir chaque élément de la carte",
  },
  reskin: {
    captions: ["Lavage auto", "Boulangerie", "Bar à vin", "Bar à cils", "Librairie", "Camion pizza"],
    previous: "Commerce précédent",
    next: "Commerce suivant",
    dot: "Afficher la carte\u00a0: {shop}",
    alt: "Une carte de fidélité qui prend le style de six commerces\u00a0: un lavage auto, une boulangerie, un bar à vin, un bar à cils, une librairie et un camion pizza.",
  },
  anatomy: {
    eyebrow: "Chaque élément",
    title: "Chaque élément de la carte est à vous.",
    lead: "Changez logo, couleurs, tampons, récompense et infos. Le QR code, on s'en charge.",
    labels: ["Logo", "Nombre de tampons", "Tampons", "Nom du client", "Récompense", "QR code à scanner"],
    mobileLabels: ["Logo", "Progression", "Tampons", "Nom", "Récompense", "QR code"],
    pointsLabels: ["Logo", "Solde de points", "Bande de points", "Nom du client", "Prochaine récompense", "QR code à scanner"],
    pointsMobileLabels: ["Logo", "Solde", "Points", "Nom", "Récompense", "QR code"],
  },
  programs: {
    eyebrow: "Tampons, points ou niveaux",
    title: "Carte à tampons, carte à points ou niveaux.",
    lead: "Les tampons récompensent les visites, les points la dépense, les niveaux vos habitués.",
    cards: [
      { title: "Carte à tampons", line: "Un tampon par visite, et une récompense quand la carte est pleine." },
      { title: "Carte à points", line: "Des points sur la dépense, et un menu de récompenses au choix." },
      { title: "Niveaux", line: "Jusqu'à cinq niveaux. Vos habitués montent, et leur carte change de style." },
    ],
    alts: [
      "La carte à tampons d'un bar à burgers",
      "La carte à points d'une salle de sport",
      "La carte d'un pressing en Bronze, Argent et Or",
    ],
  },
  icons: {
    eyebrow: "Icônes de tampon",
    title: "Nos icônes de tampon, ou les vôtres.",
    lead: "Choisissez parmi 98 icônes prêtes, ou importez votre logo. On détoure le fond.",
    facts: [
      "98 icônes de tampon prêtes à l'emploi, avec recherche par nom",
      "Importez n'importe quelle image\u00a0: le fond est détouré automatiquement",
      "Une icône différente par tampon, et une spéciale pour la récompense",
      "Tampons alignés, en quinconce ou superposés",
      "Pas de logo\u00a0? La carte affiche vos initiales à la place",
    ],
    cards: ["Pulp\u00a0: ses propres icônes d'agrumes", "Gelo\u00a0: ses propres cornets", "Un toiletteur\u00a0: des pattes de la bibliothèque"],
  },
  wallets: {
    eyebrow: "iPhone et Android",
    title: "Votre carte de fidélité sur tout téléphone.",
    lead: "La même carte dans Apple Wallet et Google Wallet. Vos clients scannent un seul QR code.",
    cells: [
      { title: "Un seul QR code", body: "Vos clients le scannent et reçoivent la carte adaptée à leur téléphone." },
      { title: "Aperçu en direct", body: "Voyez les deux versions de la carte pendant que vous la composez." },
      { title: "Toujours à jour", body: "Modifiez votre carte\u00a0: toutes celles déjà dans les téléphones se mettent à jour." },
    ],
    phoneAlts: {
      apple: "Un iPhone avec la carte de fidélité ouverte dans Apple Wallet",
      google: "Un téléphone Android avec la même carte ouverte dans Google Wallet",
    },
  },
  cardFields: {
    holder: "Titulaire",
    reward: "Récompense",
    nextReward: "Prochaine récompense",
    shops: [
      { holder: "Théo", reward: "Lavage offert" },
      { holder: "Juliette", reward: "Croissant offert" },
      { holder: "Hugo", reward: "Verre offert" },
      { holder: "Manon", reward: "Remplissage offert" },
      { holder: "Elias", reward: "Sac en toile offert" },
      { holder: "Léo", reward: "Part offerte" },
    ],
    anatomy: {
      stamps: { holder: "Élodie", reward: "Soin offert" },
      points: { holder: "Inès", reward: "Sac en toile offert" },
    },
    wallets: { holder: "Rosa", reward: "-10 %" },
  },
  faq: {
    title: "Votre carte, en questions",
    items: [
      {
        question: "Puis-je utiliser mes propres icônes de tampon\u00a0?",
        answer:
          "Oui. Importez n'importe quelle image, comme votre croissant, votre mascotte ou votre logo. Le fond est détouré automatiquement et elle devient un tampon. Vous pouvez même utiliser une icône différente par tampon.",
      },
      {
        question: "Et si je n'ai pas de logo\u00a0?",
        answer:
          "Votre carte fonctionne quand même. Sans logo, elle affiche vos initiales dans votre couleur d'accent, et vous pouvez choisir parmi 98 icônes de tampon prêtes à l'emploi.",
      },
      {
        question: "Puis-je créer une carte à tampons ou une carte à points\u00a0?",
        answer:
          "Les deux. Une carte à tampons fonctionne comme une carte papier, avec un tampon par visite. Une carte à points récompense la dépense. Ajoutez des niveaux à l'une ou à l'autre, et changez plus tard sans que vos clients perdent leur carte.",
      },
      {
        question: "La carte fonctionne-t-elle sur iPhone et Android\u00a0?",
        answer:
          "Oui. La même carte va dans Apple Wallet et Google Wallet, et l'éditeur affiche les deux pendant que vous composez. Vos clients scannent un seul QR code, quel que soit leur téléphone.",
      },
      {
        question: "Puis-je modifier la carte plus tard\u00a0?",
        answer:
          "Quand vous voulez. Modifiez votre carte, et celles déjà dans les téléphones de vos clients se mettent à jour automatiquement.",
      },
      {
        question: "Vous pouvez créer la carte pour moi\u00a0?",
        answer:
          "Oui, gratuitement. Envoyez-nous votre logo et vos informations, et on vous renvoie une carte prête à l'emploi. Vous pouvez toujours la modifier vous-même ensuite.",
      },
    ],
  },
  band: {
    title: "Créez une carte qui vous ressemble.",
    accent: "qui vous ressemble.",
    sub: "Composez-la vous-même, ou envoyez-nous votre logo\u00a0: on la crée pour vous, gratuitement.",
  },
};
