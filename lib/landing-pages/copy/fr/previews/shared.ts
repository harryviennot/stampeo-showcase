import type { LandingCopy } from "../../bundle";

// The sibling links of the French feature previews, named as the live feature pages name them.

export const PREVIEW_SHARED: LandingCopy["previews"]["shared"]["PREVIEW_SHARED"] = {
  related: {
    title: "D'autres fonctionnalités Stampeo.",
    cards: {
      cardDesign: { title: "Design de carte", line: "Votre logo, vos couleurs et vos icônes de tampon." },
      mobileScanner: { title: "Scanner mobile", line: "Tamponnez depuis l'application ou un navigateur." },
      pushNotifications: { title: "Notifications push", line: "Chaque tampon, chaque récompense, sur leur écran." },
      analytics: { title: "Statistiques", line: "Visites, taux de retour et heures de pointe." },
      promotionalCampaigns: { title: "Campagnes promotionnelles", line: "Un message sur la carte de chaque client." },
      geolocation: { title: "Géolocalisation", line: "Bientôt : votre carte quand ils passent devant." },
      loyaltyPrograms: { title: "Programmes de fidélité", line: "Tampons, points et niveaux pour vos habitués." },
    },
  },
};
