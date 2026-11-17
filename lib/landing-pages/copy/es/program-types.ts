import type { LandingCopy } from "../bundle";

type ProgramTypes = LandingCopy["programTypes"];

/** Stamps, points and levels in Spanish, as the Features tabs and the Platform rows describe them. */
export const PROGRAM_TYPES: ProgramTypes["PROGRAM_TYPES"] = [
  {
    key: "stamps",
    label: "Sellos",
    eyebrow: "Recompensa cada visita",
    title: "Sellos",
    body: "Cada visita suma un sello y una tarjeta llena da la recompensa. Tu equipo puede añadir varios sellos en un solo escaneo.",
    facts: [{ text: "Los sellos de más pueden pasar a la siguiente recompensa" }, { text: "Un regalo de bienvenida para empezar" }],
  },
  {
    key: "points",
    label: "Puntos",
    eyebrow: "Recompensa lo que gastan",
    title: "Puntos",
    body: "Tu equipo introduce lo que han gastado y los puntos se suman. Tus clientes eligen de tu menú de recompensas, en el orden que quieran.",
    facts: [{ text: "Los puntos no caducan nunca" }],
  },
  {
    key: "levels",
    label: "Niveles",
    eyebrow: "Premia más a tus habituales",
    title: "Niveles",
    body: "Hasta 5 niveles, como Bronce, Plata y Oro. Tus clientes suben a medida que vuelven, y su tarjeta cambia de estilo.",
    facts: [{ text: "Ventajas en cada nivel, que tu equipo ve en caja" }, { text: "Un regalo cuando suben" }],
  },
];

export const PROGRAM_TABS_LABEL: ProgramTypes["PROGRAM_TABS_LABEL"] = "Tipo de programa";

export const PROGRAM_SWITCH_LINE: ProgramTypes["PROGRAM_SWITCH_LINE"] =
  "Empieza con sellos o puntos y cambia más adelante. Tus clientes conservan la tarjeta que ya tienen.";
