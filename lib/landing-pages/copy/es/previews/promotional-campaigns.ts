import type { LandingCopy } from "../../bundle";
import { SAMPLE_BUSINESS } from "../shared";

type Copy = LandingCopy["previews"]["promotionalCampaigns"]["PROMOTIONAL_CAMPAIGNS_PREVIEW"];

/** The quiet-afternoon broadcast the hero's lock screen and the first idea show. */
const HAPPY_HOUR: Copy["heroBanner"] = {
  sender: SAMPLE_BUSINESS,
  body: "¿Tarde tranquila? Tu segundo café, a mitad de precio hasta las 17 h.",
};

/** The broadcasts preview in Spanish ("Difusiones promocionales"): one message written once, on every customer's card. */
export const PROMOTIONAL_CAMPAIGNS_PREVIEW: Copy = {
  meta: {
    title: "Envía promociones a tus clientes sin coste de SMS | Stampeo",
    description:
      "Envía una promoción al teléfono de cada cliente con un aviso en su tarjeta de fidelidad. Una alternativa al marketing por SMS, sin coste por mensaje.",
  },
  hero: {
    h1: "Envía una promoción al teléfono de cada cliente.",
    accent: "teléfono de cada cliente.",
    sub: "Escribe un mensaje y aparece en la pantalla de bloqueo de cada cliente. Sin coste de SMS.",
    secondary: "Ver cómo funciona",
    alt: "La pantalla de bloqueo de un iPhone con una notificación de Aurevo: ¿Tarde tranquila? Tu segundo café, a mitad de precio hasta las 17 h.",
  },
  heroBanner: HAPPY_HOUR,
  how: {
    eyebrow: "Cómo funciona",
    title: "Un mensaje en la pantalla de cada cliente.",
    lead: "Una difusión es un mensaje que escribes una vez. Llega a la tarjeta de cada cliente.",
    steps: [
      { title: "Escribe tu mensaje", body: "Lo escribes una vez en tu panel, con tus palabras." },
      { title: "Envíalo", body: "Llega a todos los clientes que tienen tu tarjeta en su teléfono." },
      { title: "Lo ven en su pantalla de bloqueo", body: "Un aviso de tu comercio, en Apple Wallet o Google Wallet." },
    ],
    visual: {
      messageLabel: "Tu mensaje",
      phones: ["iPhone de Sophie", "Android de Marc", "iPhone de Ana"],
    },
    alt: "Un mensaje escrito una vez en el panel, y el mismo aviso de Aurevo en la pantalla de bloqueo de tres clientes.",
  },
  texting: {
    eyebrow: "En lugar de SMS",
    title: "Envía promociones sin pagar por cada SMS.",
    lead: "Sin coste por mensaje y sin límite de clientes a los que llega cada uno.",
    sms: {
      title: "SMS",
      facts: [
        { text: "Pagas cada SMS que envías" },
        { text: "Cuantos más clientes, más alta la factura" },
        { text: "Necesitas el número de teléfono de cada cliente" },
      ],
    },
    stampeo: {
      title: "Difusiones de Stampeo",
      facts: [
        { text: "Sin coste por mensaje" },
        { text: "Sin límite de clientes a los que llega" },
        { text: "Llega a la tarjeta que ya tienen en su teléfono" },
      ],
    },
  },
  ideas: {
    eyebrow: "Ideas para enviar",
    title: "Dales un motivo para venir hoy.",
    lead: "Cuatro mensajes que una cafetería podría enviar esta semana. Escribe los tuyos igual.",
    rows: [
      { key: "slow-afternoon", name: "Tarde floja", body: "Enviado a todos.", banner: HAPPY_HOUR },
      {
        key: "something-new",
        name: "Una novedad",
        body: "Enviado a todos.",
        banner: { sender: SAMPLE_BUSINESS, body: "El bizcocho de calabaza vuelve hoy." },
      },
      {
        key: "tonight-only",
        name: "Solo esta noche",
        body: "Enviado a todos.",
        banner: { sender: SAMPLE_BUSINESS, body: "Música en directo esta noche desde las 19 h. ¡Pásate a saludar!" },
      },
      {
        key: "new-customers",
        name: "Clientes nuevos",
        body: "Enviado solo a los clientes que se unieron el último mes.",
        banner: { sender: SAMPLE_BUSINESS, body: "¡Gracias por unirte! Tu próximo café viene con una galleta gratis." },
      },
    ],
  },
  delivery: {
    eyebrow: "Después del envío",
    title: "Mira a cuántos clientes ha llegado.",
    lead: "Cada difusión muestra a cuántos clientes llegó en Apple Wallet y en Google Wallet.",
    report: {
      status: "Enviada",
      sentAt: "Enviada a las",
      time: "14:30",
      stats: "Entrega",
      deliveryRate: "{rate}% entregados",
      rateLabel: "entregados",
      reachable: "localizables",
      sendAgain: "Reenviar",
      alt: "{name}. {status}, {sentAt} {time}. {sender}: {message} {stats}: {rate}, {reached} / {reachable} {reachableLabel}. {counts}.",
    },
    delivered: [
      { label: "Apple Wallet", value: 412 },
      { label: "Google Wallet", value: 268 },
    ],
    missed: [
      { label: "Límite diario de Google", value: 14 },
      { label: "Tarjeta eliminada", value: 22 },
    ],
    after: {
      title: "Después de cada difusión",
      facts: [
        { text: "A cuántos llegó, en Apple Wallet y en Google Wallet" },
        { text: "Los clientes que eliminaron la tarjeta, contados aparte" },
        { text: "Reenvíala cuando quieras" },
      ],
    },
  },
  faq: {
    title: "Preguntas sobre las difusiones",
    pricingLink: "consulta los precios",
    items: [
      {
        question: "¿Cuánto cuesta enviar una difusión?",
        answer:
          "Nada por mensaje. Las difusiones vienen con tu suscripción a Stampeo, así que nunca pagas cada mensaje como con los SMS.",
      },
      {
        question: "¿Hay un límite de difusiones?",
        answer:
          "No hay límite de clientes por difusión: llega a todos los clientes que tienen tu tarjeta en su teléfono. Tu plan fija cuántas difusiones puedes enviar al mes (consulta los precios).",
      },
      {
        question: "¿Mis clientes necesitan una aplicación o un número de teléfono?",
        answer:
          "No. El mensaje llega a la tarjeta de fidelidad que tienen en Apple Wallet o Google Wallet. No descargan ninguna aplicación, y no necesitas ni su número de teléfono ni su correo.",
      },
      {
        question: "¿Es una alternativa al marketing por SMS?",
        answer:
          "Sí, para todos los clientes que tienen tu tarjeta. El mensaje aparece en su pantalla de bloqueo como un SMS, sin coste por mensaje y sin números de teléfono que recoger.",
      },
      {
        question: "¿Funciona en iPhone y Android?",
        answer:
          "Sí. Cada difusión llega a Apple Wallet y a Google Wallet. Google muestra hasta tres notificaciones por tarjeta al día, así que un cliente que ya ha recibido tres ese día no verá esta.",
      },
      {
        question: "¿Puedo escribirla en varios idiomas?",
        answer:
          "Sí. Añade una traducción en español, inglés, francés o polaco, y cada cliente ve la que corresponde al idioma de su teléfono.",
      },
    ],
  },
  band: {
    title: "Llena tu próxima tarde floja.",
    accent: "tarde floja.",
    sub: "Empieza tu prueba gratis y envía tu primera difusión esta semana.",
  },
};
