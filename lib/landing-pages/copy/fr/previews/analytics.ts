import type { LandingCopy } from "../../bundle";

// The analytics preview in French; chart and segment names follow the dashboard's French catalogs.

export const ANALYTICS_PREVIEW: LandingCopy["previews"]["analytics"]["ANALYTICS_PREVIEW"] = {
  meta: {
    title: "Statistiques de fidélité\u00a0: visites et retours | Stampeo",
    description:
      "Les statistiques de votre programme de fidélité\u00a0: visites, taux de retour, nouveaux clients et heures de pointe, remplies à chaque scan. Essai gratuit.",
  },
  hero: {
    h1: "Les statistiques fidélité de votre commerce.",
    accent: "statistiques",
    sub: "Visites, taux de retour, nouveaux clients, heures de pointe\u00a0: chaque scan les remplit.",
    secondary: "Voir tous les graphiques",
    alt: "Une carte de chiffres clés du tableau de bord Stampeo\u00a0: visites, taux de retour, nouveaux clients et un graphique des visites dans le temps.",
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
      "Combien de clients réguliers\u00a0?",
      "À quelle fréquence reviennent-ils\u00a0?",
      "Combien ont arrêté de venir\u00a0?",
      "Quel jour est le plus calme\u00a0?",
      "Combien de récompenses ce mois-ci\u00a0?",
      "Votre programme fonctionne-t-il\u00a0?",
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
        line: "Sur une carte à points\u00a0: ce que votre équipe saisit au comptoir, et votre panier moyen.",
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
    people: [
      { name: "Camille Martin", lastVisit: "Aujourd'hui" },
      { name: "Lucas Bernard", lastVisit: "Hier" },
      { name: "Inès Moreau", lastVisit: "il y a 2j" },
      { name: "Thomas Petit", lastVisit: "il y a 3j" },
      { name: "Léa Dubois", lastVisit: "il y a 1 sem." },
      { name: "Hugo Laurent", lastVisit: "il y a 7 sem." },
      { name: "Chloé Girard", lastVisit: "il y a 3 mois" },
    ],
  },
  sample: {
    weekLabels: ["28 juil.", "10 août", "24 août", "7 sept.", "21 sept.", "5 oct.", "19 oct."],
    days: ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."],
    fullDays: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"],
    hours: ["7\u00a0h", "8\u00a0h", "9\u00a0h", "10\u00a0h", "11\u00a0h", "12\u00a0h"],
    lastHourEnd: "13\u00a0h",
    habits: ["Environ chaque semaine", "Toutes les 2 semaines", "Environ une fois par mois", "Plus rarement", "Venus une seule fois"],
    cohortMonths: ["sept.", "août", "juil.", "juin", "mai", "avr."],
    moveMonths: ["mai", "juin", "juil.", "août", "sept.", "oct."],
    locations: ["Grande Rue", "Quai du Port"],
    and: "et",
  },
  chartWords: {
    visits: { alt: "{label}\u00a0: {total} visites sur {weeks} semaines, dont {share} % de clients déjà venus." },
    returnRate: { alt: "Taux de retour\u00a0: {percent} % des nouveaux clients sont revenus dans le mois." },
    newCustomers: { alt: "Nouveaux clients\u00a0: {total} inscrits." },
    busiest: {
      busiest: "Le plus fréquenté",
      quietest: "Heure creuse",
      fewer: "Moins de visites",
      more: "Plus de visites",
      slot: "{day}, de {from} à {to}",
      alt: "Heures de pointe\u00a0: les visites par jour et par heure sur une semaine type. Le plus fréquenté\u00a0: {busiest}. Heure creuse\u00a0: {quietest}.",
    },
    habits: {
      alt: "À quel rythme ils viennent\u00a0: {list}.",
      note: "Chaque client compte une seule fois, selon son propre rythme habituel entre deux visites.",
    },
    rewards: {
      alt: "Progression des cartes\u00a0: les clients selon les tampons sur leur carte, dont {ready} avec une récompense à utiliser.",
      ready: "Prête",
      stamps: "Tampons sur une carte de {count}",
      stillComing: "Toujours là",
      notBack: "Absents depuis plus de 30 jours",
      rewardReady: "Récompense à utiliser",
    },
    cohorts: {
      alt: "Cohortes mensuelles\u00a0: pour chaque mois, la part des nouveaux clients revenus dans les {days} jours.",
      window: "{days}\u00a0j",
      note: "Un tiret signifie que cette durée n'est pas encore écoulée.",
    },
    levels: {
      alt: "Niveaux\u00a0: {levels}, et les clients montés de niveau chaque mois.",
      on: "{customers} clients au niveau {level}",
      moves: "Montées de niveau par mois",
    },
    spend: {
      alt: "Dépenses enregistrées\u00a0: {total}, {ticket}.",
      ticket: "ticket moyen {amount}",
    },
    locations: {
      all: "Tous les établissements",
      alt: "Par établissement\u00a0: un sélecteur entre {locations}.",
      item: "{name}, {visits} visites",
    },
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
