import type { Market, RowGroupId, StandardFactId } from "../types";
import { NBSP } from "./format";

/**
 * The words around the facts on a comparison page, one set per market. A page
 * is written in one language, so these live here rather than in the catalogs
 * that every locale shares.
 */
export interface PageCopy {
  h1: (competitor: string) => string;
  /** The "Checked" line, given the date already written out. */
  checked: (date: string) => string;
  criterion: string;
  tableCaption: (competitor: string) => string;
  rowLabels: Record<StandardFactId, string>;
  /** The title of each theme the rows are grouped under. */
  groupLabels: Record<RowGroupId, string>;
  /** The note that adds a TTC equivalent to an HT price; absent where prices carry no such basis. */
  ttcEquivalent?: (ttc: string) => string;
  chooseIf: { competitor: (competitor: string) => string; stampeo: string };
  faqTitle: string;
  sourcesTitle: string;
  sourceRead: (date: string) => string;
  correction: { before: string; email: string; after: string };
  /** Said once, under the sources: this page is Stampeo's own and is as accurate as its date. */
  disclaimer: string;
  otherTitle: string;
  otherLabel: (competitor: string) => string;
  /** The label over the comparison links in the site footer. */
  footerTitle: string;
  /** The button after the Choose if cards. */
  cta: { title: string; button: string };
  /** The closing call to action. */
  closing: { title: string; subtitle: string };
}

const EN: PageCopy = {
  h1: (competitor) => `${competitor} vs Stampeo`,
  checked: (date) => `Checked ${date}`,
  criterion: "Criterion",
  tableCaption: (competitor) => `${competitor} and Stampeo compared`,
  rowLabels: {
    "card.where": "Where the customer's card lives",
    "customer.app_required": "App or account for the customer",
    "program.types": "Stamps, points, levels",
    "push.automatic": "Automatic notifications",
    "push.broadcasts": "Promotional messages",
    "staff.scanning": "How staff add stamps or points",
    "pos.integration": "Till (POS) integration",
    "locations.multiple": "Several locations",
    languages: "Languages",
    "price.entry": "Cheapest paid plan",
    trial: "Free trial",
    commitment: "Commitment",
    export: "Customer data export",
    designer: "Designing the card",
  },
  groupLabels: {
    customer: "Your customer's side",
    program: "The program",
    counter: "At the counter",
    price: "Price and commitment",
  },
  chooseIf: { competitor: (competitor) => `Choose ${competitor} if`, stampeo: "Choose Stampeo if" },
  faqTitle: "Frequently asked questions",
  sourcesTitle: "Sources",
  sourceRead: (date) => `Read on ${date}`,
  correction: {
    before: "Spotted a mistake or something out of date? Email ",
    email: "contact@stampeo.app",
    after: " and we will fix it within a week.",
  },
  disclaimer:
    "Written by Stampeo. Competitor information is accurate as of the date checked above. Features and prices may have changed since.",
  otherTitle: "Other comparisons",
  otherLabel: (competitor) => `${competitor} vs Stampeo`,
  footerTitle: "Compare",
  cta: { title: "Ready to see Stampeo in your shop?", button: "Start Free" },
  closing: {
    title: "Try Stampeo in your shop",
    subtitle: "Create your card, add it to your own phone and see what your customers will see.",
  },
};

const FR: PageCopy = {
  h1: (competitor) => `${competitor} ou Stampeo${NBSP}: lequel choisir pour votre commerce${NBSP}?`,
  checked: (date) => `Vérifié le ${date}`,
  criterion: "Critère",
  tableCaption: (competitor) => `${competitor} et Stampeo, côte à côte`,
  rowLabels: {
    "card.where": "Où vit la carte du client",
    "customer.app_required": "Appli ou compte pour le client",
    "program.types": "Tampons, points, niveaux",
    "push.automatic": "Notifications automatiques",
    "push.broadcasts": "Messages promotionnels",
    "staff.scanning": "Comment l'équipe ajoute tampons ou points",
    "pos.integration": "Intégration caisse",
    "locations.multiple": "Plusieurs établissements",
    languages: "Langues",
    "price.entry": "Plan payant le moins cher",
    trial: "Essai gratuit",
    commitment: "Engagement",
    export: "Export des données clients",
    designer: "Création de la carte",
  },
  groupLabels: {
    customer: "Côté client",
    program: "Le programme",
    counter: "Au comptoir",
    price: "Prix et engagement",
  },
  ttcEquivalent: (ttc) => `soit ${ttc} TTC, TVA à 20${NBSP}%`,
  chooseIf: { competitor: (competitor) => `Choisissez ${competitor} si`, stampeo: "Choisissez Stampeo si" },
  faqTitle: "Questions fréquentes",
  sourcesTitle: "Sources",
  sourceRead: (date) => `Lu le ${date}`,
  correction: {
    before: `Une information vous semble fausse ou périmée${NBSP}? Écrivez à `,
    email: "contact@stampeo.app",
    after: ", nous la corrigeons sous une semaine.",
  },
  disclaimer:
    "Comparatif rédigé par Stampeo. Les informations sur les concurrents sont exactes à la date de vérification indiquée. Les fonctionnalités et tarifs peuvent avoir évolué.",
  otherTitle: "Autres comparatifs",
  otherLabel: (competitor) => `${competitor} ou Stampeo`,
  footerTitle: "Comparatifs",
  cta: { title: "Envie de voir Stampeo dans votre commerce\u00a0?", button: "Commencer gratuitement" },
  closing: {
    title: "Essayez Stampeo dans votre commerce",
    subtitle: "Créez votre carte, ajoutez-la à votre téléphone et voyez ce que verront vos clients.",
  },
};

export const COPY: Record<Market, PageCopy> = { us: EN, fr: FR };
