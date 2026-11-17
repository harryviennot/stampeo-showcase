import type { LandingCopy } from "../../bundle";
import { LEVEL_UP_BANNER, REWARD_BANNER, SAMPLE_BUSINESS, STAMP_BANNER } from "../shared";

// The notifications preview in French; the banners and the editor follow the dashboard's French wording.

type Preview = LandingCopy["previews"]["pushNotifications"]["PUSH_NOTIFICATIONS_PREVIEW"];
type Banner = Preview["hero"]["banner"];

const REDEEMED_BANNER: Banner = { sender: SAMPLE_BUSINESS, body: "Récompense utilisée. Profitez-en !" };

const AUREVO_LEVEL_UP: Banner = { sender: SAMPLE_BUSINESS, body: LEVEL_UP_BANNER.body };

export const PUSH_NOTIFICATIONS_PREVIEW: Preview = {
  meta: {
    title: "Notifications push pour votre carte de fidélité | Stampeo",
    description:
      "Chaque tampon et chaque récompense envoient une notification sur l'écran de votre client, dans Apple Wallet et Google Wallet. Sans application. Essai gratuit.",
  },
  hero: {
    h1: "Notifications push pour votre carte de fidélité.",
    accent: "Notifications push",
    sub: "Chaque tampon et chaque récompense s'affichent sur l'écran de verrouillage de vos clients.",
    banner: STAMP_BANNER,
    alt: "Un écran de verrouillage d'iPhone avec une notification d'Aurevo : Tampon collecté ! Vous avez 5 sur 8 tampons.",
  },
  day: {
    eyebrow: "Les visites d'un client",
    title: "Une notification dès que leur carte change.",
    lead: "Suivez un client : la carte se met à jour, puis le message arrive.",
    nodes: [
      { key: "stamp", label: "Tampon ajouté", banner: STAMP_BANNER, cardAlt: "La carte d'Aurevo à 5 tampons sur 8" },
      { key: "reward", label: "Carte pleine", banner: REWARD_BANNER, cardAlt: "La carte d'Aurevo pleine, à 8 tampons sur 8" },
      {
        key: "redeemed",
        label: "Récompense utilisée",
        banner: REDEEMED_BANNER,
        cardAlt: "La carte d'Aurevo revenue à 0 sur 8 après la récompense",
      },
      { key: "level", label: "Nouveau niveau", banner: AUREVO_LEVEL_UP, cardAlt: "La carte d'Aurevo en Argent, à 1 tampon sur 8" },
    ],
  },
  wallets: {
    eyebrow: "iPhone et Android",
    title: "Notifications push sur iPhone et Android.",
    lead: "Apple Wallet et Google Wallet les affichent. Vos clients n'ont rien à télécharger.",
    iphone: "Sur iPhone",
    android: "Sur Android",
    icon: {
      title: "Votre propre icône",
      line: "Importez une icône, ou choisissez-en une tirée de votre logo.",
      alt: "Les icônes de notification de trois commerces d'exemple",
    },
    phoneAlts: {
      apple: "Un iPhone avec la carte de fidélité d'Aurevo ouverte dans Apple Wallet",
      google: "Un téléphone Android avec la même carte ouverte dans Google Wallet",
    },
  },
  editor: {
    eyebrow: "Vos mots",
    title: "Gardez notre texte ou écrivez le vôtre.",
    lead: "Chaque message est prêt à partir. Désactivez-en un, ou réécrivez-le avec vos mots.",
    toggle: { label: "Texte du message", ready: "Prêt à l'emploi", own: "Vos mots" },
    messageLabel: "Message",
    previewLabel: "Aperçu",
    ready: { text: STAMP_BANNER.body },
    own: {
      text: "Et un tampon de plus, {prénom} ! Encore {tampons restants} et c'est gagné.",
      preview: "Et un tampon de plus, Sophie ! Encore 3 et c'est gagné.",
    },
    switches: ["Tampon collecté", "Récompense débloquée", "Récompense utilisée"],
    sampleValues: [
      { name: "prénom", value: "Sophie" },
      { name: "tampons restants", value: "3" },
    ],
  },
  demo: {
    eyebrow: "Démo en direct",
    title: "Essayez-la sur votre téléphone.",
    lead: "Ajoutez une carte d'exemple, tamponnez-la, et recevez vous-même la notification.",
  },
  band: {
    title: "Chaque tampon, sur leur écran.",
    accent: "sur leur écran.",
    sub: "Les notifications partent dès votre premier tampon. Vos clients n'installent rien.",
  },
};
