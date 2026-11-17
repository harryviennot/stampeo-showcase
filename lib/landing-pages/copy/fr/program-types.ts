import type { LandingCopy } from "../bundle";

// Stamps, points and levels in French, as the Features tabs and the Platform rows describe them.

type ProgramTypes = LandingCopy["programTypes"];

export const PROGRAM_TYPES: ProgramTypes["PROGRAM_TYPES"] = [
  {
    key: "stamps",
    label: "Tampons",
    eyebrow: "Récompensez chaque visite",
    title: "Tampons",
    body: "Chaque visite ajoute un tampon, et une carte pleine donne la récompense. Votre équipe peut ajouter plusieurs tampons en un seul scan.",
    facts: [
      { text: "Les tampons en trop peuvent passer sur la récompense suivante" },
      { text: "Un cadeau de bienvenue pour bien démarrer" },
    ],
  },
  {
    key: "points",
    label: "Points",
    eyebrow: "Récompensez la dépense",
    title: "Points",
    body: "Votre équipe saisit le montant dépensé et les points s'additionnent. Vos clients choisissent dans votre menu de récompenses, dans l'ordre qu'ils veulent.",
    facts: [{ text: "Les points n'expirent jamais" }],
  },
  {
    key: "levels",
    label: "Niveaux",
    eyebrow: "Récompensez vos habitués",
    title: "Niveaux",
    body: "Jusqu'à 5 niveaux, comme Bronze, Argent et Or. Vos clients montent en revenant, et leur carte change de style.",
    facts: [
      { text: "Des avantages à chaque niveau, affichés à votre équipe en caisse" },
      { text: "Un cadeau quand ils montent de niveau" },
    ],
  },
];

export const PROGRAM_TABS_LABEL: ProgramTypes["PROGRAM_TABS_LABEL"] = "Type de programme";

export const PROGRAM_SWITCH_LINE: ProgramTypes["PROGRAM_SWITCH_LINE"] =
  "Commencez avec les tampons ou les points, et changez plus tard. Vos clients gardent la carte qu'ils ont déjà.";
