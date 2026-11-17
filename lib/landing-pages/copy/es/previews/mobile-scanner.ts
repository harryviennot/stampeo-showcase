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
