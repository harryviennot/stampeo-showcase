import type { LandingCopy } from "../../bundle";

// The loyalty programs preview in French. The product word is "niveaux"; "paliers" is the search word, used in the
// head and in the one question that defines it. Level names follow the dashboard's French defaults.

const HEAD_START_SOURCE = "Nunes & Drèze, Journal of Consumer Research, 2006 (cartes de fidélité d'un lavage auto, 9 mois)";

export const LOYALTY_PROGRAMS_PREVIEW: LandingCopy["previews"]["loyaltyPrograms"]["LOYALTY_PROGRAMS_PREVIEW"] = {
  meta: {
    title: "Programme de fidélité : tampons, points et paliers | Stampeo",
    description:
      "Votre programme de fidélité dans Apple Wallet et Google Wallet : carte à tampons ou à points, avec des paliers de fidélité comme Bronze, Argent et Or. Essai gratuit.",
  },
  hero: {
    h1: "Programmes de fidélité : tampons, points et niveaux.",
    accent: "tampons, points et niveaux.",
    sub: "Tampons ou points dans Apple Wallet et Google Wallet, et des niveaux pour vos habitués.",
    secondary: "Découvrir les niveaux",
    alt: "Trois cartes de fidélité : la carte à tampons d'un bar à jus, la carte à points d'une librairie, et la carte d'un barbier au niveau Or avec la notification « Vous avez atteint le niveau Or ! »",
    labels: ["Tampons", "Niveaux", "Points"],
    banner: { sender: "Gaspard & Gus", body: "Vous avez atteint le niveau Or ! Votre carte a un nouveau style." },
  },
  programs: {
    eyebrow: "Tampons ou points",
    title: "Les visites en tampons, la dépense en points.",
    lead: "Même carte, même mise en place. Changez plus tard, vos clients gardent leur carte.",
    stamps: {
      title: "Tampons",
      line: "Une carte à tampons digitale : un tampon par visite, et une récompense quand elle est pleine.",
      facts: [
        { text: "Un scan au comptoir, aucun montant à saisir" },
        { text: "Vous choisissez la taille de la carte et la récompense" },
        { text: "Les tampons en trop peuvent passer sur la carte suivante" },
      ],
      bestFor: "Chaque visite coûte à peu près pareil : cafés, coupes, lavages auto, boulangeries.",
      alt: "La carte à tampons d'un café, à 5 tampons sur 8",
    },
    points: {
      title: "Points",
      line: "Des points sur ce que vos clients dépensent, et un menu de récompenses au choix.",
      facts: [
        { text: "Votre équipe saisit le montant, et les points s'additionnent" },
        { text: "Vos clients choisissent toute récompense à leur portée" },
        { text: "Les points n'expirent jamais" },
      ],
      bestFor: "Le panier varie : restaurants, boutiques, épiceries, commerces spécialisés.",
      alt: "La carte à points d'un salon de beauté, son anneau se remplissant vers la prochaine récompense",
    },
    bestForLabel: "Idéal quand",
  },
  levels: {
    eyebrow: "Niveaux de fidélité",
    title: "Ajoutez des niveaux : Bronze, Argent, Or.",
    lead: "Vos habitués montent en revenant. À chaque niveau, son style, ses avantages, son cadeau.",
    ladder: [
      {
        name: "Bronze",
        reach: "Le point de départ de chaque client",
        card: "6 tampons pour une coupe offerte",
        perks: [],
        rewardName: "Coupe offerte",
      },
      {
        name: "Argent",
        reach: "Remplir 1 carte en Bronze",
        card: "5 tampons pour une coupe offerte",
        perks: ["Finition serviette chaude offerte"],
        gift: "Un flacon d'huile à barbe",
        rewardName: "Coupe offerte",
      },
      {
        name: "Or",
        reach: "Remplir 2 cartes en Argent",
        card: "4 tampons pour une coupe et une taille de barbe",
        perks: ["Taille de barbe offerte", "Réservation prioritaire"],
        gift: "Un rasage à la serviette chaude offert",
        rewardName: "Coupe et taille de barbe",
      },
    ],
    member: { label: "Membre", value: "Sophie" },
    labels: {
      card: "Carte",
      perks: "Avantages",
      gift: "Cadeau",
      noPerks: "Pas encore d'avantages",
      top: "Niveau maximal : acquis pour de bon",
    },
    alt: "La carte de fidélité d'un barbier en Bronze, Argent et Or : la carte change de couleur et se remplit plus vite à chaque niveau.",
    facts: [
      { title: "Jusqu'à 5 niveaux", body: "Nommez-les comme vous voulez. On vous en propose trois pour commencer." },
      { title: "Une carte par niveau", body: "Gardez votre carte, ou donnez à un niveau le style Bronze, Argent, Or, Platine ou Noir." },
      {
        title: "Jusqu'à 3 avantages par niveau",
        body: "Comme une taille de barbe offerte ou une réservation prioritaire. Votre équipe les voit dans l'application scanner.",
      },
      { title: "Un cadeau à l'arrivée", body: "Une récompense unique, offerte dès qu'un client atteint un niveau." },
    ],
    tip: "Notre conseil : commencez avec trois niveaux, et rendez Argent facile à atteindre. Une première montée rapide fait revenir vos habitués.",
  },
  moveUp: {
    eyebrow: "Monter de niveau",
    title: "Comment vos clients montent d'un niveau.",
    lead: "On monte selon ce qu'on gagne, pas ce qu'on dépense, et on ne redescend jamais.",
    stamps: {
      title: "Sur une carte à tampons",
      body: "Chaque carte pleine compte pour le niveau suivant. Une carte pleine par défaut, ou autant que vous voulez.",
      level: "Argent",
      next: "Or",
      filled: 1,
      needed: 2,
      progress: "1 carte pleine sur 2",
      caption: "Plus qu'une carte avant Or",
      alt: "La progression d'un client Argent : 1 carte pleine sur 2 vers Or",
    },
    points: {
      title: "Sur une carte à points",
      body: "Chaque point gagné sur un niveau compte pour le suivant, même ceux dépensés en récompenses.",
      level: "Argent",
      next: "Or",
      earned: 320,
      needed: 500,
      progress: "320 points gagnés sur 500",
      caption: "Plus que 180 points avant Or",
      spent: "Les points dépensés en récompenses comptent aussi",
      alt: "La progression d'un client Argent : 320 points gagnés sur 500 vers Or",
    },
    facts: [
      {
        title: "Personne ne redescend",
        body: "Un niveau atteint est acquis. Vous pouvez toujours changer le niveau d'un client à la main.",
      },
      {
        title: "Les cadeaux de bienvenue comptent",
        body: "Les tampons ou points offerts à l'inscription comptent pour la première montée.",
      },
      {
        title: "De meilleures récompenses en haut",
        body: "Avec les tampons, un niveau peut se remplir plus vite ou offrir plus. Avec les points, chaque niveau peut avoir son menu de récompenses.",
      },
    ],
  },
  moments: {
    eyebrow: "Ce que chacun voit",
    title: "Où clients et équipe voient les niveaux.",
    lead: "Les niveaux apparaissent là où ils comptent, sans rien à faire de plus.",
    signup: {
      title: "Sur votre page d'inscription",
      body: "Les nouveaux clients voient les niveaux avant de s'inscrire.",
    },
    lockScreen: {
      title: "Sur leur écran de verrouillage",
      body: "Une notification quand ils montent, avec leur cadeau.",
      banner: {
        sender: "Gaspard & Gus",
        body: "Vous avez atteint le niveau Argent ! Votre carte a un nouveau style. Votre cadeau : Un flacon d'huile à barbe.",
      },
    },
    scanner: {
      title: "Dans l'application scanner",
      body: "Votre équipe voit le niveau du client et ses avantages avant d'encaisser.",
    },
    alts: [
      "Le bandeau des niveaux de la page d'inscription : Bronze, Argent et Or, et comment atteindre Argent",
      "Une notification de Gaspard & Gus sur l'écran de verrouillage : Vous avez atteint le niveau Argent !",
      "L'application scanner affichant un client Argent et l'avantage à appliquer avant d'encaisser",
    ],
  },
  settings: {
    eyebrow: "Réglages",
    title: "Les réglages qui font un bon programme.",
    lead: "Vous les retrouverez à la création. Voici les quatre qui comptent, avec notre conseil.",
    tipLabel: "Notre conseil :",
    items: [
      {
        title: "Un cadeau de bienvenue",
        body: "Offrez une longueur d'avance aux nouveaux clients : quelques tampons ou points à l'inscription, ou un petit cadeau.",
        tip: "L'élan compte. Une carte qui démarre avec 2 tampons offerts est bien plus souvent terminée.",
      },
      {
        title: "Des récompenses qui s'accumulent",
        body: "Une carte pleine garde sa récompense et une nouvelle carte démarre aussitôt. Vous choisissez combien un client peut en garder.",
        tip: "Autorisez-en au moins deux : personne ne doit s'arrêter parce qu'une récompense l'attend déjà.",
      },
      {
        title: "Une première récompense à portée",
        body: "Vous fixez le nombre de tampons sur la carte, ou le prix en points de chaque récompense.",
        tip: "Rendez la première récompense facile à atteindre. Une victoire rapide transforme une première visite en habitude.",
      },
      {
        title: "Changez quand vous voulez",
        body: "Passez des tampons aux points, ou l'inverse. Vos clients gardent leur carte, et leur solde est converti.",
        tip: "Commencez par l'option évidente, et ajustez avec de vraies données.",
      },
    ],
    figure: {
      value: "34 %",
      text: "ont terminé une carte qui démarrait avec 2 tampons offerts, contre 19 % pour une carte vide au départ",
      source: HEAD_START_SOURCE,
    },
  },
  picker: {
    eyebrow: "Tampons ou points ?",
    title: "Vous hésitez ? Répondez à quatre questions.",
    lead: "On vous suggère un programme. Aucun e-mail demandé.",
    progress: "Question {current} sur {total}",
    questions: [
      {
        question: "Vos prix changent-ils beaucoup d'un achat à l'autre ?",
        options: ["Non, la plupart des achats coûtent à peu près pareil", "Oui, le panier varie beaucoup"],
      },
      {
        question: "Comment reviennent vos meilleurs clients ?",
        options: ["Souvent, pour de petits achats", "De temps en temps, pour des montants plus élevés"],
      },
      {
        question: "Quelle récompense plairait le plus à vos clients ?",
        options: ["Un cadeau après quelques visites", "Leur choix parmi plusieurs récompenses", "Je ne sais pas encore"],
      },
      {
        question: "Avez-vous des habitués qui reviennent chaque semaine ?",
        options: ["Oui, un bon nombre", "Pas encore beaucoup"],
      },
    ],
    resultLabel: "Notre suggestion",
    results: {
      stamps: {
        title: "Optez pour les tampons.",
        body: "Vos visites sont régulières et à prix proche : la carte à tampons est le choix le plus clair.",
      },
      points: {
        title: "Optez pour les points.",
        body: "Vos paniers varient : récompenser ce que le client dépense est plus juste et fait revenir les plus gros paniers.",
      },
      either: {
        title: "Les deux peuvent convenir.",
        body: "Vous êtes pile entre les deux. Les tampons sont le plus simple pour démarrer, et les points se mettent en place tout aussi vite.",
      },
    },
    levels: {
      yes: "Ajoutez aussi des niveaux : vos habitués auront un objectif à atteindre.",
      no: "Ajoutez des niveaux plus tard, quand vous aurez des habitués.",
    },
    restart: "Recommencer",
  },
  sectors: {
    eyebrow: "Par commerce",
    title: "Ce que choisissent la plupart des commerces.",
    lead: "Un point de départ, pas une règle.",
    items: [
      { label: "Cafés", reason: "La même boisson, presque tous les jours", program: "stamps" },
      { label: "Boulangeries", reason: "Des achats petits et fréquents", program: "stamps" },
      { label: "Coiffure & beauté", reason: "Récompense à la visite", program: "stamps" },
      { label: "Lavages auto", reason: "Un service, répété", program: "stamps" },
      { label: "Restaurants", reason: "L'addition change à chaque fois", program: "points" },
      { label: "Boutiques", reason: "Des paniers très variables", program: "points" },
      { label: "Épiceries & primeurs", reason: "Récompense la dépense totale", program: "points" },
      { label: "Cavistes & spécialistes", reason: "Des tickets élevés et irréguliers", program: "points" },
    ],
    programLabels: { stamps: "Tampons", points: "Points" },
  },
  faq: {
    title: "Les programmes de fidélité, en questions",
    items: [
      {
        question: "Quelle différence entre tampons et points ?",
        answer:
          "Les tampons comptent les visites : chaque scan ajoute un tampon, et une carte pleine donne la récompense. Les points comptent la dépense : votre équipe saisit le montant, et vos clients échangent leurs points contre les récompenses que vous fixez. Les tampons conviennent aux visites à prix proche ; les points, aux paniers qui varient.",
      },
      {
        question: "Qu'est-ce qu'un programme de fidélité à paliers ?",
        answer:
          "Un programme où les clients gravissent des niveaux, qu'on appelle aussi paliers, comme Bronze, Argent et Or, à mesure qu'ils reviennent, et reçoivent un peu plus à chaque étape. Sur Stampeo, les niveaux s'ajoutent à vos tampons ou à vos points : jusqu'à 5, chacun avec son style de carte, jusqu'à 3 avantages et un cadeau à l'arrivée.",
      },
      {
        question: "Comment les clients montent-ils de niveau ?",
        answer:
          "Selon ce qu'ils gagnent sur leur niveau actuel : des cartes pleines sur une carte à tampons (une par défaut), ou des points gagnés sur une carte à points. Dépenser des points en récompenses ne les freine jamais, et les tampons ou points de leur cadeau de bienvenue comptent aussi.",
      },
      {
        question: "Un client peut-il perdre son niveau ?",
        answer:
          "Non. Personne ne redescend tout seul. Vous pouvez toujours changer le niveau d'un client à la main, depuis sa fiche.",
      },
      {
        question: "Puis-je créer une carte à tampons digitale ?",
        answer:
          "Oui. Elle fonctionne comme une carte papier, avec un tampon par visite, mais elle vit dans Apple Wallet ou Google Wallet et ne se perd jamais.",
      },
      {
        question: "Puis-je passer des tampons aux points plus tard ?",
        answer:
          "Oui, quand vous voulez. Vos clients gardent la carte qu'ils ont déjà, et ce qu'ils ont cumulé est converti dans le nouveau programme.",
      },
      {
        question: "Mes clients doivent-ils installer une application ?",
        answer:
          "Non. La carte va dans Apple Wallet ou Google Wallet, déjà présents sur leur téléphone. Ils scannent votre QR code une fois, et elle s'ajoute.",
      },
    ],
  },
  band: {
    title: "Donnez-leur une raison de revenir.",
    accent: "une raison de revenir.",
    sub: "Commencez avec les tampons ou les points, et ajoutez des niveaux quand vous voulez.",
  },
};
