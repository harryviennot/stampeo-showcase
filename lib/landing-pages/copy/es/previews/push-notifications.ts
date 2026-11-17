import type { LandingCopy } from "../../bundle";
import { LEVEL_UP_BANNER, REWARD_BANNER, SAMPLE_BUSINESS, STAMP_BANNER } from "../shared";

type Banner = LandingCopy["shared"]["STAMP_BANNER"];

/** The Spanish default of `reward_redeemed` in the backend's notification defaults. */
const REDEEMED_BANNER: Banner = { sender: SAMPLE_BUSINESS, body: "Recompensa canjeada. ¡Que la disfrutes!" };

const AUREVO_LEVEL_UP: Banner = { sender: SAMPLE_BUSINESS, body: LEVEL_UP_BANNER.body };

/** The notifications preview in Spanish: every stamp and reward reaches the lock screen on its own, in the editor's words. */
export const PUSH_NOTIFICATIONS_PREVIEW: LandingCopy["previews"]["pushNotifications"]["PUSH_NOTIFICATIONS_PREVIEW"] = {
  meta: {
    title: "Notificaciones para tu tarjeta de fidelidad | Stampeo",
    description:
      "Cada sello y cada recompensa envía un aviso a la pantalla de bloqueo de tu cliente, en Apple Wallet y Google Wallet. Sin aplicación que descargar. Prueba gratis.",
  },
  hero: {
    h1: "Notificaciones para tu tarjeta de fidelidad.",
    accent: "Notificaciones",
    sub: "Cada sello y recompensa envía un aviso automático a la pantalla de bloqueo de tu cliente.",
    banner: STAMP_BANNER,
    alt: "La pantalla de bloqueo de un iPhone con una notificación de Aurevo: ¡Sello conseguido! Tienes 5 de 8 sellos.",
  },
  day: {
    eyebrow: "Las visitas de un cliente",
    title: "Un aviso cada vez que cambia su tarjeta.",
    lead: "Sigue a un cliente: primero se actualiza la tarjeta y después llega el mensaje.",
    nodes: [
      { key: "stamp", label: "Sello añadido", banner: STAMP_BANNER, cardAlt: "La tarjeta de Aurevo con 5 de 8 sellos" },
      { key: "reward", label: "Tarjeta llena", banner: REWARD_BANNER, cardAlt: "La tarjeta de Aurevo llena, con 8 de 8 sellos" },
      { key: "redeemed", label: "Recompensa canjeada", banner: REDEEMED_BANNER, cardAlt: "La tarjeta de Aurevo de vuelta a 0 de 8 tras la recompensa" },
      { key: "level", label: "Nuevo nivel", banner: AUREVO_LEVEL_UP, cardAlt: "La tarjeta de Aurevo en Plata, con 1 de 8 sellos" },
    ],
  },
  wallets: {
    eyebrow: "iPhone y Android",
    title: "Notificaciones en iPhone y Android.",
    lead: "Apple Wallet y Google Wallet las muestran. Tus clientes no descargan nada.",
    iphone: "En iPhone",
    android: "En Android",
    icon: {
      title: "Tu propio icono",
      line: "Sube un icono o elige uno creado a partir de tu logo.",
      alt: "Iconos de notificación de tres comercios de ejemplo",
    },
    phoneAlts: {
      apple: "Un iPhone con la tarjeta de fidelidad de Aurevo abierta en Apple Wallet",
      google: "Un teléfono Android con la misma tarjeta abierta en Google Wallet",
    },
  },
  editor: {
    eyebrow: "Tu texto",
    title: "Usa nuestro texto o escribe el tuyo.",
    lead: "Cada mensaje viene listo para enviar. Desactiva el que quieras o reescríbelo.",
    toggle: { label: "Texto del mensaje", ready: "Predefinido", own: "Personalizado" },
    messageLabel: "Mensaje",
    previewLabel: "Vista previa",
    ready: { text: STAMP_BANNER.body },
    own: { text: "¡Otro sello, {nombre}! Ya solo te faltan {sellos restantes}.", preview: "¡Otro sello, Sophie! Ya solo te faltan 3." },
    switches: ["Sello conseguido", "Recompensa desbloqueada", "Recompensa canjeada"],
    sampleValues: [
      { name: "nombre", value: "Sophie" },
      { name: "sellos restantes", value: "3" },
    ],
  },
  demo: {
    eyebrow: "Demo en directo",
    title: "Pruébalo en tu propio teléfono.",
    lead: "Añade una tarjeta de ejemplo, ponle un sello y recibe el aviso en tu pantalla.",
  },
  band: {
    title: "Cada sello, en su pantalla de bloqueo.",
    accent: "en su pantalla de bloqueo.",
    sub: "Los avisos empiezan con tu primer sello. Tus clientes no instalan nada.",
  },
};
