import type { LandingCopy } from "../../bundle";

/** The scanner preview in Spanish: the team scans a card with the free app or the web scanner in a browser. */
export const MOBILE_SCANNER_PREVIEW: LandingCopy["previews"]["mobileScanner"]["MOBILE_SCANNER_PREVIEW"] = {
  meta: {
    title: "App para escanear tarjetas de fidelidad en iPhone y Android | Stampeo",
    description:
      "Escanea tarjetas de fidelidad con la app de escaneo gratuita de Stampeo para iPhone y Android, o con el escáner web en cualquier navegador. Sin equipos nuevos. Prueba gratis.",
  },
  hero: {
    h1: "La app de escaneo de tarjetas para tu equipo.",
    accent: "app de escaneo",
    sub: "La app gratuita para iPhone y Android, o el escáner web en el navegador. Sin equipos nuevos.",
    secondary: "Verla en el mostrador",
  },
  counter: {
    eyebrow: "En el mostrador",
    title: "Sellos, puntos o recompensas en un escaneo.",
    lead: "Escanea la tarjeta del cliente y pulsa una vez. Su tarjeta se actualiza en segundos.",
    options: [
      { key: "stamps", title: "Sellos", line: "Añade uno, o varios a la vez" },
      { key: "points", title: "Puntos", line: "Introduce lo que ha gastado" },
      { key: "rewards", title: "Recompensas", line: "Canjéala ya, o guárdala para su próxima visita" },
      { key: "levels", title: "Niveles", line: "Mira su nivel y sus ventajas" },
    ],
    fact: "Justo después, recibe un aviso en su pantalla de bloqueo.",
    panes: [
      {
        screenAlt: "La app de escaneo añadiendo tres sellos a la tarjeta de Sophie en un solo escaneo: el selector en 3 y el botón Añadir 3 sellos.",
        cardAlt: "La tarjeta Aurevo de Sophie, completa con 8 de 8 sellos.",
        result: "5 → 8 sellos",
      },
      {
        screenAlt: "La app de escaneo con un importe de 12,50 tecleado y los puntos que suma, unos 12, antes de confirmar.",
        cardAlt: "La tarjeta de Sophie de Marginalia, una librería, ahora con 252 puntos.",
        result: "240 → 252 pts",
      },
      {
        screenAlt: "La lista de recompensas por canjear de la app de escaneo: tres recompensas, cada una con un botón Canjear.",
        cardAlt: "La tarjeta Aurevo de Sophie, de vuelta a 2 de 8 sellos tras canjear su recompensa.",
        result: "Café gratis canjeado",
      },
      {
        screenAlt: "La app de escaneo con las ventajas de un cliente Plata, para aplicar en caja antes de cobrar.",
        cardAlt: "La tarjeta de Sophie de Wrenfold, una tintorería, con su nivel Plata.",
        result: "Nivel: Plata",
      },
    ],
  },
  screens: {
    customer: "Sophie",
    stamps: { detail: "5 / 8", added: "+3 sellos", completes: "Con esto la tarjeta se completa", button: "Añadir 3 sellos" },
    points: { detail: "240 pts", amount: "12,50", earns: "≈ +12 pts", button: "Añadir puntos" },
    rewards: {
      detail: "8 / 8",
      title: "Recompensas por canjear",
      redeem: "Canjear",
      gift: "Regalo",
      expiresToday: "Caduca hoy",
      expiresLater: "Caduca en 5 días",
      held: ["Café gratis", "Bollo gratis", "Café gratis"],
    },
    levels: {
      detail: "4 / 6",
      perks: ["Entrega en percha gratis", "Recogida prioritaria"],
      perkOne: "Ventaja {level}: {perk}",
      perkMany: "Ventajas {level}:",
      applyOne: "Aplícala en caja antes de cobrar.",
      applyMany: "Aplícalas en caja antes de cobrar.",
      button: "Añadir sello",
    },
  },
  ways: {
    eyebrow: "App o navegador",
    title: "La app de escaneo, o solo un navegador.",
    lead: "La app escanea con más fluidez. ¿Sin descargas? El escáner web funciona siempre.",
    cells: [
      {
        title: "App de escaneo Stampeo",
        body: "Gratis en la App Store y Google Play. Entra con tu cuenta de Google o Apple.",
        devices: ["iPhone", "Android"],
      },
      {
        title: "Escáner web",
        body: "Abre scan.stampeo.app en cualquier navegador. Nada que instalar.",
        devices: ["Teléfono", "Tablet", "Portátil"],
      },
    ],
    fact: "Los dos hacen lo mismo: escanear la tarjeta, añadir sellos o puntos y canjear recompensas.",
  },
  band: {
    title: "Sella tu primera tarjeta hoy.",
    accent: "hoy.",
    sub: "Prepara tu tarjeta y escanea a tu primer cliente desde cualquier teléfono.",
  },
};
