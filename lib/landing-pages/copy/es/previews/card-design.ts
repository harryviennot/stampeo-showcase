import type { LandingCopy } from "../../bundle";

/** The card design preview in Spanish: can the card look like my shop, and what can I change on it. */
export const CARD_DESIGN_PREVIEW: LandingCopy["previews"]["cardDesign"]["CARD_DESIGN_PREVIEW"] = {
  meta: {
    title: "Crea tu tarjeta de fidelidad digital | Stampeo",
    description:
      "Crea una tarjeta de fidelidad digital con tu logo, tus colores y tus iconos de sello, para Apple Wallet y Google Wallet. Sellos, puntos o niveles. Prueba gratis.",
  },
  hero: {
    h1: "Crea tu tarjeta de fidelidad digital.",
    accent: "tarjeta de fidelidad digital.",
    sub: "Tu logo, tus colores y tus propios iconos de sello, en Apple Wallet y Google Wallet.",
    secondary: "Ver cada parte de la tarjeta",
  },
  reskin: {
    captions: ["Lavado de coches", "Panadería", "Bar de vinos", "Estudio de pestañas", "Librería", "Food truck de pizzas"],
    previous: "Comercio anterior",
    next: "Comercio siguiente",
    dot: "Ver la tarjeta: {shop}",
    alt: "Una tarjeta de fidelidad que adopta el estilo de seis comercios: un lavado de coches, una panadería, un bar de vinos, un estudio de pestañas, una librería y un food truck de pizzas.",
  },
  anatomy: {
    eyebrow: "Cada parte",
    title: "Cada parte de la tarjeta es tuya.",
    lead: "Cambia logo, colores, sellos, recompensa y datos. El código QR lo añadimos nosotros.",
    labels: ["Logo", "Número de sellos", "Sellos", "Nombre del cliente", "Recompensa", "Código QR para escanear"],
    mobileLabels: ["Logo", "Contador", "Sellos", "Nombre", "Recompensa", "Código QR"],
    pointsLabels: ["Logo", "Saldo de puntos", "Banda de puntos", "Nombre del cliente", "Próxima recompensa", "Código QR para escanear"],
    pointsMobileLabels: ["Logo", "Saldo", "Puntos", "Nombre", "Recompensa", "Código QR"],
  },
  programs: {
    eyebrow: "Sellos, puntos o niveles",
    title: "Tarjeta de sellos, de puntos o con niveles.",
    lead: "Los sellos premian las visitas, los puntos el gasto y los niveles a tus habituales.",
    cards: [
      { title: "Tarjeta de sellos", line: "Un sello por visita y una recompensa con la tarjeta llena." },
      { title: "Tarjeta de puntos", line: "Puntos según lo que gastan y un menú de recompensas para elegir." },
      { title: "Niveles", line: "Hasta cinco niveles. Tus habituales suben y su tarjeta cambia de estilo." },
    ],
    alts: [
      "La tarjeta de sellos de una hamburguesería",
      "La tarjeta de puntos de un gimnasio",
      "La tarjeta de una tintorería en Bronce, Plata y Oro",
    ],
  },
  icons: {
    eyebrow: "Iconos de sello",
    title: "Usa nuestros iconos de sello o sube los tuyos.",
    lead: "Elige entre 98 iconos listos para usar o sube tu logo. Quitamos el fondo por ti.",
    facts: [
      "98 iconos de sello listos para usar, con búsqueda por nombre",
      "Sube cualquier imagen: el fondo se quita automáticamente",
      "Un icono distinto para cada sello, y uno especial para la recompensa",
      "Alineados, al tresbolillo o superpuestos",
      "¿Sin logo? La tarjeta muestra tus iniciales",
    ],
    cards: [
      "Pulp: sus propios iconos de cítricos",
      "Gelo: sus propios cucuruchos",
      "Una peluquería canina: huellas de la biblioteca",
    ],
  },
  wallets: {
    eyebrow: "iPhone y Android",
    title: "Tu tarjeta de fidelidad en cualquier teléfono.",
    lead: "La misma tarjeta en Apple Wallet y Google Wallet, con un solo código QR.",
    cells: [
      { title: "Un solo código QR", body: "Tus clientes lo escanean y reciben la tarjeta para su teléfono." },
      { title: "Vista previa en directo", body: "Ves las dos versiones mientras creas tu tarjeta." },
      { title: "Siempre al día", body: "Cambia tu tarjeta y todas las que ya están en los teléfonos se actualizan." },
    ],
    phoneAlts: {
      apple: "Un iPhone con la tarjeta de fidelidad abierta en Apple Wallet",
      google: "Un teléfono Android con la misma tarjeta de fidelidad abierta en Google Wallet",
    },
  },
  faq: {
    title: "Preguntas sobre tu tarjeta",
    items: [
      {
        question: "¿Puedo usar mis propios iconos de sello?",
        answer:
          "Sí. Sube cualquier imagen, como tu cruasán, tu mascota o tu logo. El fondo se quita automáticamente y se convierte en un sello. Incluso puedes usar un icono distinto para cada sello.",
      },
      {
        question: "¿Y si no tengo logo?",
        answer:
          "Tu tarjeta funciona igual. Sin logo, muestra tus iniciales en tus colores, y puedes elegir entre 98 iconos de sello listos para usar.",
      },
      {
        question: "¿Puedo crear una tarjeta de sellos digital o una tarjeta de puntos?",
        answer:
          "Las dos. Una tarjeta de sellos funciona como la de cartón de siempre, con un sello por visita. Una tarjeta de puntos premia lo que gastan. Añade niveles a cualquiera de las dos, y cambia más adelante sin que tus clientes pierdan su tarjeta.",
      },
      {
        question: "¿La tarjeta funciona en iPhone y Android?",
        answer:
          "Sí. La misma tarjeta va a Apple Wallet y a Google Wallet, y el editor muestra las dos mientras trabajas. Tus clientes escanean un solo código QR, sea cual sea su teléfono.",
      },
      {
        question: "¿Puedo cambiar la tarjeta más adelante?",
        answer: "Cuando quieras. Edita tu tarjeta y las que ya están en los teléfonos de tus clientes se actualizan solas.",
      },
      {
        question: "¿Stampeo puede crear la tarjeta por mí?",
        answer:
          "Sí, gratis. Envíanos tu logo y tus datos, y te devolvemos una tarjeta lista para usar. Después puedes cambiarla cuando quieras.",
      },
    ],
  },
  band: {
    title: "Crea una tarjeta a tu imagen.",
    accent: "a tu imagen.",
    sub: "Créala tú, o envíanos tu logo y la creamos por ti, gratis.",
  },
};
