import type { LandingCopy } from "../../bundle";

/** The analytics preview in Spanish: a loyalty program's numbers, in the dashboard's own words. */
export const ANALYTICS_PREVIEW: LandingCopy["previews"]["analytics"]["ANALYTICS_PREVIEW"] = {
  meta: {
    title: "Estadísticas de fidelización: visitas y tasa de retorno | Stampeo",
    description:
      "Estadísticas de fidelización para pequeños comercios: visitas, tasa de retorno, clientes nuevos y horas punta, al día con cada escaneo. Prueba gratis.",
  },
  hero: {
    h1: "Estadísticas de fidelidad para tu comercio.",
    accent: "Estadísticas",
    sub: "Visitas, tasa de retorno, clientes nuevos y horas punta. Cada escaneo lo rellena solo.",
    secondary: "Ver todos los gráficos",
    alt: "Una tarjeta de cifras clave del panel de Stampeo: visitas, tasa de retorno, clientes nuevos y un gráfico de visitas a lo largo del tiempo.",
  },
  numbers: {
    title: "Últimos tres meses",
    visits: { label: "Visitas", line: "de {customers} clientes" },
    returnRate: { label: "Tasa de retorno", line: "de los clientes nuevos volvieron en menos de un mes" },
    newCustomers: { label: "Clientes nuevos", line: "registrados" },
    chart: { label: "Visitas a lo largo del tiempo", legend: ["Ya habían venido", "Primera visita"] },
  },
  blindSpots: {
    eyebrow: "Con tarjetas de papel",
    title: "Lo que hoy no sabes.",
    lead: "Con tarjetas de papel, fidelizas a ciegas: sin datos ni forma de mejorar.",
    questions: [
      "¿Cuántos clientes habituales?",
      "¿Cada cuánto vuelven?",
      "¿Cuántos dejaron de venir?",
      "¿Qué día es el más tranquilo?",
      "¿Cuántas recompensas este mes?",
      "¿Funciona tu programa?",
    ],
    noAnswer: "???",
  },
  charts: {
    eyebrow: "Cada gráfico",
    title: "Estadísticas de fidelidad, gráfico a gráfico.",
    lead: "Cada gráfico responde a una pregunta sobre tus clientes. Cada escaneo lo rellena.",
    rows: [
      { key: "visits", title: "Visitas a lo largo del tiempo", line: "Cada visita, semana a semana, separando primeras visitas y clientes que vuelven." },
      { key: "returnRate", title: "Tasa de retorno", line: "Cuántos clientes nuevos volvieron en menos de un mes." },
      { key: "newCustomers", title: "Clientes nuevos", line: "Cuántas personas se han unido a tu tarjeta." },
      { key: "busiest", title: "Horas punta", line: "Tus visitas por día y hora, con tu franja más concurrida y tu hora abierta más tranquila." },
      { key: "habits", title: "Cada cuánto vienen", line: "Quién viene cada semana, cada dos semanas, más o menos una vez al mes, o vino una sola vez." },
      { key: "rewards", title: "Progreso hacia la recompensa", line: "Lo cerca que está cada cliente de una recompensa, y quién tiene una lista." },
      { key: "cohorts", title: "Cohortes mensuales", line: "De los clientes nuevos de cada mes, cuántos volvieron y cuándo." },
      { key: "levels", title: "Niveles", line: "Cuántos clientes hay en cada nivel y cuántos suben cada mes." },
      { key: "spend", title: "Gasto registrado", line: "En una tarjeta de puntos: lo que tu equipo introduce en caja, y tu ticket medio." },
      { key: "locations", title: "Por establecimiento", line: "Cada gráfico, un establecimiento a la vez, si tienes más de uno." },
    ],
  },
  customers: {
    eyebrow: "Tus clientes",
    title: "Tu lista de clientes, ordenada por grupos.",
    lead: "Mira quién es nuevo, quién es habitual y quién lleva tiempo sin volver.",
    columns: ["Nombre", "Sellos", "Segmento", "Última visita"],
    segments: [
      { key: "new", label: "Nuevo", definition: "se unió en las dos últimas semanas" },
      { key: "regular", label: "Habitual", definition: "sigue volviendo" },
      { key: "vip", label: "VIP", definition: "ha canjeado tres recompensas o más" },
      { key: "rewardReady", label: "Recompensa lista", definition: "tiene una recompensa por canjear ahora" },
      { key: "closeToReward", label: "Cerca de la recompensa", definition: "le faltan dos sellos o menos" },
      { key: "atRisk", label: "En riesgo", definition: "no ha vuelto en más de un mes" },
      { key: "ghost", label: "Fantasma", definition: "añadió la tarjeta y nunca volvió" },
    ],
    fact: "Descarga tu lista de clientes cuando quieras, en un archivo CSV.",
  },
  dashboard: {
    eyebrow: "Ordenador y teléfono",
    title: "Tus cifras en el ordenador o en el teléfono.",
    lead: "El mismo panel en los dos. Consulta tus cifras desde donde estés.",
  },
  band: {
    title: "Deja de adivinar. Empieza a saber.",
    accent: "Empieza a saber.",
    sub: "Tus estadísticas se rellenan desde la primera tarjeta que escaneas.",
  },
};
