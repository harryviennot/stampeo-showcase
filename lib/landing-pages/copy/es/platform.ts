import type { LandingCopy } from "../bundle";

/** The platform page in Spanish, for a shop owner in Spain: a tour of the product. */
export const PLATFORM: LandingCopy["platform"]["PLATFORM"] = {
  meta: {
    title: "Tarjetas de fidelidad en Apple y Google Wallet | Stampeo",
    description:
      "Crea, comparte y sella una tarjeta de fidelidad digital en Apple Wallet y Google Wallet, desde un panel y una app de escaneo gratuita. Prueba gratis.",
  },
  hero: {
    h1: "Tarjetas de fidelidad en Apple y Google Wallet.",
    accent: "Apple y Google Wallet.",
  },
  heroCards: {
    stackAlt:
      "Tarjetas de fidelidad apiladas como en la cartera de un teléfono: delante, la tarjeta de sellos de una cafetería, y detrás, la parte superior de la tarjeta de puntos de un salón, la tarjeta de niveles de una peluquería canina y la tarjeta de sellos de una panadería.",
  },
  marquee: {
    label: "Pensado para",
    types: [
      "Cafeterías",
      "Panaderías",
      "Barberías",
      "Salones de manicura",
      "Restaurantes",
      "Librerías",
      "Food trucks",
      "Spas",
      "Estudios de pestañas",
      "Bares de zumos",
      "Lavaderos de coches",
      "Peluquerías caninas",
    ],
  },
  deliver: {
    eyebrow: "En su teléfono",
    title: "Directamente en Apple Wallet y Google Wallet.",
    lead: "Sin aplicación que descargar. Su tarjeta queda junto a sus tarjetas de pago.",
    analyticsLabel: "Estadísticas",
    notificationsLabel: "Avisos en pantalla de bloqueo",
    updatesLabel: "Actualizaciones en tiempo real",
    updatesFrom: "5/8",
    updatesTo: "6/8",
  },
  analyticsCard: {
    visits: "Visitas",
    returnRate: "Retorno a 30 días",
    overTime: "Visitas a lo largo del tiempo",
    returning: "Ya habían venido",
    first: "Primera visita",
    points: "pts",
    alt: "Estadísticas: {visits} visitas, un {visitsChange}% más; {returnRate}: {returnRatePercent}%, {returnRateChange} puntos más; y las visitas a lo largo del tiempo, semana a semana.",
  },
  numbers: {
    eyebrow: "En cifras",
    title: "Dónde está Stampeo hoy.",
    figures: [
      {
        value: "95 %",
        text: "tasa de retención de tarjetas",
        source: "Datos de Stampeo: 2786 tarjetas de 73 comercios, añadidas de junio a agosto de 2026",
      },
    ],
  },
  how: {
    eyebrow: "Cómo funciona",
    title: "Créala, compártela, séllala.",
    lead: "Crea tu tarjeta, ponla en tu mostrador y séllala desde cualquier teléfono.",
    cells: [
      { title: "Crea", body: "Monta una tarjeta a tu imagen: tu logo, tus colores, tu recompensa." },
      { title: "Comparte", body: "Tus clientes escanean el código QR de tu mostrador o abren tu enlace. Sin aplicación ni cuenta." },
      { title: "Sella", body: "Escanea su tarjeta desde cualquier teléfono. Se actualiza en segundos y llega a su pantalla de bloqueo." },
    ],
    link: "Prueba a añadir un sello",
  },
  demo: {
    eyebrow: "Demo en directo",
  },
  programTypes: {
    eyebrow: "Tipos de programa",
    title: "Sellos, puntos o niveles.",
    lead: "Recompensa las visitas, el gasto, o deja que tus habituales suban de nivel.",
    closer: "Cómo elegir entre sellos y puntos",
  },
  platform: {
    eyebrow: "La plataforma Stampeo",
    title: "Gestiónalo desde el ordenador o el teléfono.",
    lead: "Un panel para ti y una app de escaneo gratuita para tu equipo.",
    tabs: { dashboard: "Panel", scanner: "App de escaneo" },
    dashboard: {
      title: "Todo en un solo sitio",
      facts: [
        { text: "Crea tu tarjeta y mírala en directo" },
        { text: "Cada cliente, su progreso y sus recompensas" },
        { text: "Difusiones a todas las tarjetas" },
        { text: "Tus cifras, al día con cada escaneo" },
      ],
      link: "Ver las estadísticas",
    },
    scanner: {
      title: "Gratis para todo tu equipo",
      facts: [
        { text: "iPhone, Android o el navegador de cualquier teléfono" },
        { text: "Tu equipo entra con un código y solo ve el escáner" },
      ],
      link: "Ver el escáner",
    },
  },
  share: {
    eyebrow: "Compártela en todas partes",
    title: "Pon tu tarjeta donde ya están tus clientes.",
    lead: "Un código QR y un enlace: en tu mostrador y en todo internet.",
    channels: [
      { title: "Folleto de mostrador", body: "Para imprimir, con tu código QR" },
      { title: "App de escaneo", body: "Muestra tu código QR en caja" },
      { title: "Instagram", body: "Tu enlace en tu biografía o tus historias" },
      { title: "Facebook", body: "Tu enlace en tu página" },
      { title: "Tu web", body: "Un botón o un código QR" },
      { title: "Perfil de Empresa de Google", body: "Tu enlace donde te buscan" },
    ],
  },
  band: {
    title: "Lanza tu tarjeta de fidelidad hoy.",
    accent: "hoy.",
    sub: "Créala, pruébala en tu propio teléfono y luego elige un plan.",
  },
  blog: {
    eyebrow: "Blog",
    title: "Guías para tu comercio.",
    lead: "Consejos prácticos para que tu tarjeta de fidelidad haga volver a tus clientes.",
    viewAll: "Ver todo",
  },
};
