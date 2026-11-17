import type { LandingCopy } from "../bundle";

// The words every French page shares. The banners are the French defaults of
// backend/app/services/programs/notification_defaults.py, with the samples' numbers and level filled in.

type Shared = LandingCopy["shared"];

export const SAMPLE_BUSINESS: Shared["SAMPLE_BUSINESS"] = "Aurevo";

export const STAMP_BANNER: Shared["STAMP_BANNER"] = {
  sender: SAMPLE_BUSINESS,
  body: "Tampon collecté ! Vous avez 5 sur 8 tampons.",
};

export const REWARD_BANNER: Shared["REWARD_BANNER"] = {
  sender: SAMPLE_BUSINESS,
  body: "Vous avez débloqué votre récompense ! Venez la récupérer.",
};

export const LEVELS_BUSINESS: Shared["LEVELS_BUSINESS"] = "Wrenfold";

export const LEVEL_UP_BANNER: Shared["LEVEL_UP_BANNER"] = {
  sender: LEVELS_BUSINESS,
  body: "Vous avez atteint le niveau Argent ! Votre carte a un nouveau style.",
};

export const SHARED: Shared["SHARED"] = {
  cta: "Commencer mon essai gratuit",
  reassurance: "{trialDays} jours gratuits · Sans engagement",
  proof: (businesses: string, countries: string) => `Utilisé par ${businesses} commerces dans ${countries} pays`,
  demoLink: "Essayez sur votre téléphone",
  demo: {
    title: "Essayez-la sur votre téléphone.",
    lead: "Ajoutez une carte d'exemple, tamponnez-la et voyez ce que voient vos clients.",
  },
  sampleData: "Données d'exemple",
  dashboardUrl: "app.stampeo.app",
  levelCardsAlt: "La carte de fidélité d'un pressing à trois niveaux : Bronze, Argent et Or.",
  sectorsEyebrow: "Pour tous les commerces",
  faq: {
    title: "Les questions qu'on nous pose",
    items: [
      {
        question: "Mes clients doivent-ils télécharger une application ?",
        answer:
          "Non. Apple Wallet et Google Wallet sont déjà sur leur téléphone. Ils scannent votre QR code, et leur carte s'ajoute en quelques secondes.",
      },
      {
        question: "Dois-je acheter du matériel ou changer de caisse ?",
        answer:
          "Non. Vous tamponnez les cartes avec notre application gratuite ou depuis le navigateur de n'importe quel téléphone. Rien ne change à votre caisse, et il n'y a rien à connecter.",
      },
      {
        question: "Comment mes clients s'inscrivent-ils ?",
        answer:
          "Ils scannent le QR code de votre comptoir, ou ouvrent le lien que vous partagez en ligne, puis ajoutent la carte à Apple Wallet ou Google Wallet. Votre tableau de bord vous fournit une affichette prête à imprimer.",
      },
      {
        question: "Que se passe-t-il à la fin de l'essai gratuit ?",
        answer:
          "Vous choisissez de continuer ou non. Votre carte bancaire est demandée pour démarrer l'essai, mais aucun débit n'a lieu avant la fin des {trialDays} jours. Vous pouvez résilier à tout moment avant cette date.",
      },
      {
        question: "Y a-t-il un engagement ?",
        answer:
          "Non. Les plans mensuels sont sans engagement et sans frais de mise en service. Vous résiliez quand vous voulez depuis votre tableau de bord.",
      },
    ],
    contact: {
      before: "Une autre question ?",
      link: "Nous contacter",
      after: "On vous répond sous 24h.",
    },
  },
};
