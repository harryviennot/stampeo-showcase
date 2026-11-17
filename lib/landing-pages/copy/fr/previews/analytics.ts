import type { LandingCopy } from "../../bundle";

// The analytics preview in French; chart and segment names follow the dashboard's French catalogs.

export const ANALYTICS_PREVIEW: LandingCopy["previews"]["analytics"]["ANALYTICS_PREVIEW"] = {
  meta: {
    title: "Statistiques de fidélité : visites et taux de retour | Stampeo",
    description:
      "Les statistiques de votre programme de fidélité : visites, taux de retour, nouveaux clients et heures de pointe, remplies à chaque scan. Essai gratuit.",
  },
  hero: {
    h1: "Les statistiques fidélité de votre commerce.",
    accent: "statistiques",
    sub: "Visites, taux de retour, nouveaux clients, heures de pointe : chaque scan les remplit.",
    secondary: "Voir tous les graphiques",
    alt: "Une carte de chiffres clés du tableau de bord Stampeo : visites, taux de retour, nouveaux clients et un graphique des visites dans le temps.",
  },
  numbers: {
    title: "Les trois derniers mois",
    visits: { label: "Visites", line: "de {customers} clients" },
    returnRate: { label: "Taux de retour", line: "des nouveaux clients sont revenus dans le mois" },
    newCustomers: { label: "Nouveaux clients", line: "inscrits" },
    chart: { label: "Visites dans le temps", legend: ["Déjà venus", "Première visite"] },
  },
  blindSpots: {
    eyebrow: "Avec des cartes en carton",
    title: "Ce que vous ne savez pas aujourd'hui.",
    lead: "Avec des cartes en carton, vous fidélisez à l'aveugle, sans données pour progresser.",
    questions: [
      "Combien de clients réguliers ?",
      "À quelle fréquence reviennent-ils ?",
      "Combien ont arrêté de venir ?",
      "Quel jour est le plus calme ?",
      "Combien de récompenses ce mois-ci ?",
      "Votre programme fonctionne-t-il ?",
    ],
    noAnswer: "???",
  },
  charts: {
    eyebrow: "Tous les graphiques",
    title: "Vos statistiques, graphique par graphique.",
    lead: "Chaque graphique répond à une question sur vos clients. Chaque scan le remplit.",
    rows: [
      {
        key: "visits",
        title: "Visites dans le temps",
        line: "Chaque visite, semaine par semaine, entre premières visites et clients déjà venus.",
      },
      { key: "returnRate", title: "Taux de retour", line: "Combien de nouveaux clients sont revenus dans le mois." },
      { key: "newCustomers", title: "Nouveaux clients", line: "Combien de personnes ont rejoint votre carte." },
      {
        key: "busiest",
        title: "Heures de pointe",
        line: "Vos visites par jour et par heure, avec le créneau le plus chargé et l'heure d'ouverture la plus calme.",
      },
      {
        key: "habits",
        title: "À quel rythme ils viennent",
        line: "Qui vient chaque semaine, toutes les deux semaines, environ une fois par mois, ou une seule fois.",
      },
      {
        key: "rewards",
        title: "Progression des cartes",
        line: "Où en est chaque client avant sa récompense, et qui en a une à utiliser.",
      },
      {
        key: "cohorts",
        title: "Cohortes mensuelles",
        line: "Parmi les nouveaux clients de chaque mois, combien sont revenus, et au bout de combien de temps.",
      },
      { key: "levels", title: "Niveaux", line: "Combien de clients sur chaque niveau, et combien montent chaque mois." },
      {
        key: "spend",
        title: "Dépenses enregistrées",
        line: "Sur une carte à points : ce que votre équipe saisit au comptoir, et votre panier moyen.",
      },
      {
        key: "locations",
        title: "Par établissement",
        line: "Chaque graphique, établissement par établissement, quand vous en avez plusieurs.",
      },
    ],
  },
  customers: {
    eyebrow: "Vos clients",
    title: "Votre liste de clients, triée par segment.",
    lead: "Voyez qui est nouveau, qui est un habitué, et qui n'est pas revenu depuis un moment.",
    columns: ["Nom", "Tampons", "Segment", "Dernière visite"],
    segments: [
      { key: "new", label: "Nouveau", definition: "inscrit ces deux dernières semaines" },
      { key: "regular", label: "Régulier", definition: "continue de revenir" },
      { key: "vip", label: "VIP", definition: "a déjà utilisé trois récompenses ou plus" },
      { key: "rewardReady", label: "Récompense à utiliser", definition: "a une récompense à utiliser maintenant" },
      { key: "closeToReward", label: "Proche de la récompense", definition: "à deux tampons ou moins" },
      { key: "atRisk", label: "À risque", definition: "n'est pas revenu depuis plus d'un mois" },
      { key: "ghost", label: "Fantôme", definition: "a ajouté la carte sans jamais revenir" },
    ],
    fact: "Téléchargez votre liste de clients quand vous voulez, en fichier CSV.",
  },
  dashboard: {
    eyebrow: "Ordinateur et téléphone",
    title: "Vos chiffres sur ordinateur ou sur téléphone.",
    lead: "Le même tableau de bord sur les deux. Suivez vos chiffres où que vous soyez.",
  },
  band: {
    title: "Fini de deviner. Place aux chiffres.",
    accent: "Place aux chiffres.",
    sub: "Vos statistiques se remplissent dès la première carte scannée.",
  },
};
