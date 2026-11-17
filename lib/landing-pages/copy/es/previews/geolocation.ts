import type { LandingCopy } from "../../bundle";
import { SAMPLE_BUSINESS } from "../shared";

/** The geolocation preview in Spanish. It is not live: every claim is in the future or says "pronto", with no date, plan or wallet named. */
export const GEOLOCATION_PREVIEW: LandingCopy["previews"]["geolocation"]["GEOLOCATION_PREVIEW"] = {
  meta: {
    title: "Notificaciones por geolocalización, pronto | Stampeo",
    description:
      "Pronto: avisos por ubicación que pondrán tu tarjeta de fidelidad en la pantalla de bloqueo de tus clientes cuando pasen cerca de tu comercio.",
  },
  hero: {
    h1: "Notificaciones por geolocalización, pronto.",
    accent: "pronto.",
    sub: "Cuando un cliente pase cerca de tu comercio, tu tarjeta aparecerá en su pantalla de bloqueo.",
    secondary: "Ver cómo funcionará",
    alt: "Una pantalla de bloqueo con una notificación de Aurevo: Aurevo está a la vuelta de la esquina. Tu sexto café te espera. Solo 2 sellos más para uno gratis.",
  },
  banner: {
    sender: SAMPLE_BUSINESS,
    title: "Aurevo está a la vuelta de la esquina",
    body: "Tu sexto café te espera. Solo 2 sellos más para uno gratis.",
  },
  how: {
    eyebrow: "Cómo funcionará",
    title: "Así funcionarán los avisos por geolocalización.",
    lead: "Añadirás tu dirección una vez. Su teléfono hará el resto, sin aplicación.",
    cells: [
      { title: "Añade la dirección de tu comercio", body: "La escribirás una sola vez en tu panel." },
      { title: "Un cliente pasa cerca", body: "Su teléfono detectará que está cerca de tu comercio." },
      { title: "Su tarjeta aparece en su pantalla de bloqueo", body: "La abrirá al instante, lista para escanear en el mostrador." },
    ],
  },
  privacy: {
    eyebrow: "Privacidad",
    title: "Su ubicación se quedará en su teléfono.",
    lead: "La tarjeta llevará la dirección de tu comercio. Nunca sabremos dónde están.",
    facts: [
      { text: "Su teléfono calculará la distancia por sí solo" },
      { text: "Nunca recibiremos su ubicación" },
      { text: "Podrán desactivarla en los ajustes de su teléfono" },
    ],
    alt: "Un teléfono dentro de un anillo discontinuo alrededor de un comercio. La línea hacia la nube está cortada: ninguna ubicación saldrá del teléfono.",
  },
  faq: {
    title: "Preguntas sobre la geolocalización",
    items: [
      {
        question: "¿Cuándo llegará?",
        answer: "Aún no tenemos fecha. Cuando esté lista, la anunciaremos en nuestra página de Novedades.",
      },
      {
        question: "¿Mis clientes necesitarán una tarjeta nueva?",
        answer: "No. La tarjeta que ya tienen en su teléfono la recibirá con su próxima actualización.",
      },
      {
        question: "¿Mis clientes tendrán que configurar algo?",
        answer: "No. No habrá ninguna aplicación que instalar. Su teléfono se encargará de todo, y podrán desactivarla en sus ajustes.",
      },
      {
        question: "¿Puedo empezar antes de que llegue?",
        answer: "Sí. Tu tarjeta, los sellos, las recompensas y los avisos ya funcionan hoy, y la geolocalización se sumará cuando esté lista.",
      },
    ],
  },
  band: {
    title: "Prepara tu tarjeta hoy mismo.",
    accent: "hoy mismo.",
    sub: "Empieza ya con sellos o puntos. Tu tarjeta estará lista cuando llegue la geolocalización.",
  },
  related: {
    title: "Para que tus clientes vuelvan, desde hoy.",
  },
};
