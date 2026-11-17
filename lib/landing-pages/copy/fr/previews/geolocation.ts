import type { LandingCopy } from "../../bundle";
import { SAMPLE_BUSINESS } from "../shared";

// The geolocation preview in French. Geolocation is not live: every claim is in the future tense or "bientôt".

export const GEOLOCATION_PREVIEW: LandingCopy["previews"]["geolocation"]["GEOLOCATION_PREVIEW"] = {
  meta: {
    title: "Notifications géolocalisées, bientôt disponibles | Stampeo",
    description:
      "Bientôt\u00a0: des notifications géolocalisées qui afficheront votre carte de fidélité sur l'écran de verrouillage de vos clients quand ils passeront près de votre commerce.",
  },
  hero: {
    h1: "La géolocalisation, bientôt sur votre carte.",
    accent: "bientôt sur votre carte.",
    sub: "Quand un client passera près de chez vous, votre carte s'affichera sur son écran de verrouillage.",
    secondary: "Voir comment ça marchera",
    alt: "Un écran de verrouillage avec une notification d'Aurevo\u00a0: Aurevo est à deux pas. Votre 6ᵉ café vous attend. Plus que 2 tampons avant le café offert.",
  },
  banner: {
    sender: SAMPLE_BUSINESS,
    title: "Aurevo est à deux pas",
    body: "Votre 6ᵉ café vous attend. Plus que 2 tampons avant le café offert.",
  },
  how: {
    eyebrow: "Comment ça marchera",
    title: "Comment marchera la géolocalisation.",
    lead: "Vous ajouterez votre adresse une fois. Leur téléphone fera le reste, sans application.",
    cells: [
      { title: "Ajoutez l'adresse de votre commerce", body: "Vous la saisirez une fois dans votre tableau de bord." },
      { title: "Un client passe à proximité", body: "Son téléphone remarquera qu'il est près de votre commerce." },
      { title: "Sa carte apparaît sur son écran de verrouillage", body: "Un appui l'ouvrira, prête à scanner au comptoir." },
    ],
  },
  privacy: {
    eyebrow: "Vie privée",
    title: "Leur position restera sur leur téléphone.",
    lead: "La carte contiendra l'adresse de votre commerce. On ne saura jamais où ils sont.",
    facts: [
      { text: "Leur téléphone calculera lui-même la distance" },
      { text: "On ne recevra jamais leur position" },
      { text: "Ils pourront la désactiver dans les réglages de leur téléphone" },
    ],
    alt: "Un téléphone dans un cercle en pointillés autour d'un commerce. Le lien vers le nuage est coupé\u00a0: aucune position ne quittera le téléphone.",
  },
  faq: {
    title: "La géolocalisation, en questions",
    items: [
      {
        question: "Quand sera-t-elle disponible\u00a0?",
        answer: "On n'a pas encore de date. Dès qu'elle sera prête, on l'annoncera sur notre page Nouveautés.",
      },
      {
        question: "Mes clients auront-ils besoin d'une nouvelle carte\u00a0?",
        answer: "Non. La carte déjà dans leur téléphone en profitera à sa prochaine mise à jour.",
      },
      {
        question: "Mes clients auront-ils quelque chose à configurer\u00a0?",
        answer:
          "Non. Il n'y aura aucune application à installer. Leur téléphone s'en chargera, et ils pourront la désactiver dans leurs réglages.",
      },
      {
        question: "Puis-je commencer avant son lancement\u00a0?",
        answer:
          "Oui. Votre carte, vos tampons, vos récompenses et vos notifications fonctionnent dès aujourd'hui, et la géolocalisation les rejoindra dès qu'elle sera prête.",
      },
    ],
  },
  band: {
    title: "Votre carte, prête dès aujourd'hui.",
    accent: "prête dès aujourd'hui.",
    sub: "Commencez avec les tampons ou les points. Votre carte sera prête pour la géolocalisation.",
  },
  related: {
    title: "Faites revenir vos clients dès aujourd'hui.",
  },
};
