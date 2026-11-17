import type { LandingCopy } from "../../bundle";
import { SAMPLE_BUSINESS } from "../shared";

// The campaigns preview in French: the feature is "Campagnes promotionnelles", each message a "diffusion".

type Preview = LandingCopy["previews"]["promotionalCampaigns"]["PROMOTIONAL_CAMPAIGNS_PREVIEW"];

const HAPPY_HOUR: Preview["heroBanner"] = {
  sender: SAMPLE_BUSINESS,
  body: "Après-midi calme\u00a0? Votre deuxième café est à moitié prix jusqu'à 17 h.",
};

export const PROMOTIONAL_CAMPAIGNS_PREVIEW: Preview = {
  meta: {
    title: "Envoyez vos promotions sans frais de SMS | Stampeo",
    description:
      "Envoyez une promotion sur le téléphone de chaque client, en notification sur sa carte de fidélité. L'alternative aux SMS, sans coût par message.",
  },
  hero: {
    h1: "Vos promotions sur le téléphone de chaque client.",
    accent: "le téléphone de chaque client.",
    sub: "Écrivez un message\u00a0: il s'affiche sur l'écran de tous vos clients. Sans la facture SMS.",
    secondary: "Voir comment ça marche",
    alt: "Un écran de verrouillage d'iPhone avec une notification d'Aurevo\u00a0: Après-midi calme\u00a0? Votre deuxième café est à moitié prix jusqu'à 17 h.",
  },
  heroBanner: HAPPY_HOUR,
  how: {
    eyebrow: "Comment ça marche",
    title: "Un message sur l'écran de tous vos clients.",
    lead: "Une diffusion\u00a0: un message écrit une fois, sur la carte de chaque client.",
    steps: [
      { title: "Rédigez votre message", body: "Écrivez-le une fois dans votre tableau de bord, avec vos mots." },
      { title: "Envoyez-le", body: "Il part vers chaque client qui a votre carte dans son téléphone." },
      { title: "Ils le voient sur leur écran de verrouillage", body: "Une notification de votre commerce, dans Apple Wallet ou Google Wallet." },
    ],
    visual: {
      messageLabel: "Votre message",
      phones: ["iPhone de Sophie", "Android de Marc", "iPhone d'Ana"],
    },
    alt: "Un message écrit une fois dans le tableau de bord, et la même notification d'Aurevo sur l'écran de trois clients.",
  },
  texting: {
    eyebrow: "Au lieu des SMS",
    title: "Vos promotions, sans payer chaque SMS.",
    lead: "Aucun coût par message, et aucune limite au nombre de clients touchés.",
    sms: {
      title: "SMS",
      facts: [
        { text: "Chaque SMS envoyé est facturé" },
        { text: "Plus vous avez de clients, plus la facture monte" },
        { text: "Il vous faut le numéro de chaque client" },
      ],
    },
    stampeo: {
      title: "Diffusions Stampeo",
      facts: [
        { text: "Aucun coût par message" },
        { text: "Aucune limite au nombre de clients touchés" },
        { text: "Elle arrive sur la carte déjà dans leur téléphone" },
      ],
    },
  },
  ideas: {
    eyebrow: "Des idées à envoyer",
    title: "Une raison de passer aujourd'hui.",
    lead: "Quatre messages qu'un café pourrait envoyer cette semaine. À vous d'écrire les vôtres.",
    rows: [
      { key: "slow-afternoon", name: "Après-midi calme", body: "Envoyé à tous.", banner: HAPPY_HOUR },
      {
        key: "something-new",
        name: "Une nouveauté",
        body: "Envoyé à tous.",
        banner: { sender: SAMPLE_BUSINESS, body: "Le cake à la châtaigne est de retour aujourd'hui." },
      },
      {
        key: "tonight-only",
        name: "Ce soir seulement",
        body: "Envoyé à tous.",
        banner: { sender: SAMPLE_BUSINESS, body: "Concert ce soir dès 19 h. Passez nous voir." },
      },
      {
        key: "new-customers",
        name: "Nouveaux clients",
        body: "Envoyé seulement aux clients inscrits depuis moins d'un mois.",
        banner: { sender: SAMPLE_BUSINESS, body: "Merci de nous avoir rejoints\u00a0! Votre prochain café vient avec un cookie offert." },
      },
    ],
  },
  delivery: {
    eyebrow: "Après l'envoi",
    title: "Voyez combien de clients l'ont reçue.",
    lead: "Pour chaque diffusion, le nombre de clients touchés dans Apple Wallet et Google Wallet.",
    report: {
      status: "Envoyée",
      sentAt: "Envoyée à",
      time: "14:30",
      stats: "Livraison",
      deliveryRate: "{rate} % livrés",
      rateLabel: "livrés",
      reachable: "joignables",
      sendAgain: "Renvoyer",
      alt: "{name}. {status}, {sentAt} {time}. {sender}\u00a0: {message} {stats}\u00a0: {rate}, {reached} / {reachable} {reachableLabel}. {counts}.",
    },
    delivered: [
      { label: "Apple Wallet", value: 412 },
      { label: "Google Wallet", value: 268 },
    ],
    missed: [
      { label: "Limite quotidienne de Google", value: 14 },
      { label: "Carte supprimée", value: 22 },
    ],
    after: {
      title: "Après chaque diffusion",
      facts: [
        { text: "Combien l'ont reçue, dans Apple Wallet et dans Google Wallet" },
        { text: "Les clients qui ont supprimé la carte, comptés à part" },
        { text: "Renvoyez-la quand vous voulez" },
      ],
    },
  },
  faq: {
    title: "Les diffusions, en questions",
    pricingLink: "voir les tarifs",
    items: [
      {
        question: "Combien coûte une diffusion\u00a0?",
        answer:
          "Rien par message. Les diffusions sont comprises dans votre abonnement Stampeo\u00a0: vous ne payez jamais chaque envoi, comme avec les SMS.",
      },
      {
        question: "Y a-t-il une limite de diffusions\u00a0?",
        answer:
          "Aucune limite au nombre de clients touchés\u00a0: chaque diffusion part vers tous les clients qui ont votre carte dans leur téléphone. Votre plan fixe le nombre de diffusions par mois (voir les tarifs).",
      },
      {
        question: "Mes clients ont-ils besoin d'une application ou d'un numéro de téléphone\u00a0?",
        answer:
          "Non. Le message arrive sur leur carte de fidélité, dans Apple Wallet ou Google Wallet. Ils ne téléchargent aucune application, et vous n'avez besoin ni de leur numéro ni de leur e-mail.",
      },
      {
        question: "Est-ce une alternative au marketing par SMS\u00a0?",
        answer:
          "Oui, pour chaque client qui a votre carte. Le message s'affiche sur son écran de verrouillage comme un SMS, sans coût par message et sans numéros à collecter.",
      },
      {
        question: "Est-ce que ça marche sur iPhone et Android\u00a0?",
        answer:
          "Oui. Chaque diffusion part vers Apple Wallet et Google Wallet. Google affiche jusqu'à trois notifications par carte et par jour\u00a0: un client qui en a déjà reçu trois ce jour-là ne verra pas celle-ci.",
      },
      {
        question: "Puis-je l'écrire en plusieurs langues\u00a0?",
        answer:
          "Oui. Ajoutez une traduction en français, en anglais, en espagnol ou en polonais, et chaque client voit celle qui correspond à son téléphone.",
      },
    ],
  },
  band: {
    title: "Remplissez vos heures creuses.",
    accent: "heures creuses.",
    sub: "Commencez votre essai gratuit et envoyez votre première diffusion cette semaine.",
  },
};
