import type { LandingCopy } from "../../bundle";

/**
 * The loyalty programs preview in Spanish. The product word is "niveles"; "programa de fidelización por niveles"
 * (and "escalonado") is the search phrase, used in the head and in the one question that defines it.
 */
export const LOYALTY_PROGRAMS_PREVIEW: LandingCopy["previews"]["loyaltyPrograms"]["LOYALTY_PROGRAMS_PREVIEW"] = {
  meta: {
    title: "Programa de fidelización por niveles, sellos o puntos | Stampeo",
    description:
      "Tu programa de fidelización en Apple Wallet y Google Wallet: tarjeta de sellos digital o puntos, y un programa por niveles como Bronce, Plata y Oro. Prueba gratis.",
  },
  hero: {
    h1: "Programas de fidelidad: sellos, puntos y niveles.",
    accent: "sellos, puntos y niveles.",
    sub: "Sellos o puntos en Apple Wallet y Google Wallet, con niveles para tus habituales.",
    secondary: "Ver cómo funcionan los niveles",
    alt: "Tres tarjetas de fidelidad: la tarjeta de sellos de un bar de zumos, la tarjeta de puntos de una librería y la tarjeta de una barbería en el nivel Oro, con la notificación «¡Has alcanzado el nivel Oro!»",
    labels: ["Sellos", "Niveles", "Puntos"],
    banner: { sender: "Gaspard & Gus", body: "¡Has alcanzado el nivel Oro! Tu tarjeta tiene un nuevo estilo." },
  },
  programs: {
    eyebrow: "Sellos o puntos",
    title: "Sellos para las visitas, puntos para el gasto.",
    lead: "Misma tarjeta, misma puesta en marcha. Si cambias, tus clientes conservan su tarjeta.",
    stamps: {
      title: "Sellos",
      line: "Una tarjeta de sellos digital: un sello por visita y una recompensa con la tarjeta llena.",
      facts: [
        { text: "Un escaneo en el mostrador, sin importe que teclear" },
        { text: "Tú eliges el tamaño de la tarjeta y la recompensa" },
        { text: "Los sellos de más pueden pasar a la siguiente tarjeta" },
      ],
      bestFor: "Cada visita cuesta más o menos lo mismo: cafés, peluquerías, lavados de coche, panaderías.",
      alt: "La tarjeta de sellos de una cafetería con 5 de 8 sellos",
    },
    points: {
      title: "Puntos",
      line: "Puntos según lo que gastan tus clientes y un menú de recompensas para elegir.",
      facts: [
        { text: "Tu equipo introduce el importe y los puntos se suman" },
        { text: "Tus clientes eligen cualquier recompensa que cubran sus puntos" },
        { text: "Los puntos no caducan nunca" },
      ],
      bestFor: "La cesta varía: restaurantes, tiendas, ultramarinos y comercios especializados.",
      alt: "La tarjeta de puntos de un salón de belleza, con su anillo llenándose hacia la próxima recompensa",
    },
    bestForLabel: "Mejor cuando",
  },
  levels: {
    eyebrow: "Niveles de fidelidad",
    title: "Añade niveles, como Bronce, Plata y Oro.",
    lead: "Tus habituales suben al volver. Cada nivel, con su estilo, ventajas y regalo.",
    ladder: [
      {
        name: "Bronce",
        reach: "Donde empieza cada cliente",
        card: "6 sellos para un corte gratis",
        perks: [],
      },
      {
        name: "Plata",
        reach: "Completa 1 tarjeta en Bronce",
        card: "5 sellos para un corte gratis",
        perks: ["Acabado con toalla caliente gratis"],
        gift: "Un frasco de aceite para barba",
      },
      {
        name: "Oro",
        reach: "Completa 2 tarjetas en Plata",
        card: "4 sellos para un corte y arreglo de barba",
        perks: ["Arreglo de barba gratis", "Reserva prioritaria"],
        gift: "Un afeitado con toalla caliente gratis",
      },
    ],
    labels: { card: "Tarjeta", perks: "Ventajas", gift: "Regalo", noPerks: "Aún sin ventajas", top: "Nivel máximo: suyo para siempre" },
    alt: "La tarjeta de fidelidad de una barbería en Bronce, Plata y Oro: la tarjeta cambia de color y se llena más rápido en cada nivel.",
    facts: [
      { title: "Hasta 5 niveles", body: "Ponles el nombre que quieras. Una escala nueva empieza con tres." },
      { title: "Una tarjeta por nivel", body: "Conserva tu tarjeta o da a un nivel el estilo Bronce, Plata, Oro, Platino o Negro." },
      { title: "Hasta 3 ventajas por nivel", body: "Como un arreglo de barba gratis o reserva prioritaria. Tu equipo las ve en la app de escaneo." },
      { title: "Un regalo al llegar", body: "Una recompensa única en cuanto un cliente alcanza un nivel." },
    ],
    tip: "Nuestro consejo: empieza con tres niveles y haz que Plata sea fácil de alcanzar. Una primera subida rápida hace que tus habituales sigan volviendo.",
  },
  moveUp: {
    eyebrow: "Subir de nivel",
    title: "Cómo suben de nivel tus clientes.",
    lead: "Suben por lo que ganan, no por lo que gastan, y nunca bajan.",
    stamps: {
      title: "En una tarjeta de sellos",
      body: "Cada tarjeta completa cuenta para el siguiente nivel. Una tarjeta completa por defecto, o las que tú elijas.",
      level: "Plata",
      next: "Oro",
      filled: 1,
      needed: 2,
      progress: "1 de 2 tarjetas completas",
      caption: "1 tarjeta más para Oro",
      alt: "El progreso de un cliente Plata: 1 de 2 tarjetas completas para Oro",
    },
    points: {
      title: "En una tarjeta de puntos",
      body: "Cada punto ganado en un nivel cuenta para el siguiente, incluso los que gastan en recompensas.",
      level: "Plata",
      next: "Oro",
      earned: 320,
      needed: 500,
      progress: "320 de 500 puntos ganados",
      caption: "180 puntos más para Oro",
      spent: "Los puntos gastados en recompensas también cuentan",
      alt: "El progreso de un cliente Plata: 320 de 500 puntos ganados para Oro",
    },
    facts: [
      { title: "Nunca bajan", body: "Un nivel alcanzado es suyo. Aun así, puedes cambiar el nivel de un cliente a mano." },
      { title: "El regalo de bienvenida cuenta", body: "Los sellos o puntos que regalas en el registro cuentan para la primera subida." },
      {
        title: "Mejores recompensas más arriba",
        body: "Con sellos, un nivel puede llenarse más rápido o dar una recompensa mayor. Con puntos, cada nivel puede tener su propio menú de recompensas.",
      },
    ],
  },
  moments: {
    eyebrow: "Lo que ven",
    title: "Dónde ven los niveles clientes y equipo.",
    lead: "Los niveles aparecen donde importan, sin que tengas que hacer nada más.",
    signup: {
      title: "En tu página de registro",
      body: "Los clientes nuevos ven los niveles antes de unirse.",
    },
    lockScreen: {
      title: "En su pantalla de bloqueo",
      body: "Un aviso cuando suben, con su regalo.",
      banner: {
        sender: "Gaspard & Gus",
        body: "¡Has alcanzado el nivel Plata! Tu tarjeta tiene un nuevo estilo. Tu regalo: Un frasco de aceite para barba.",
      },
    },
    scanner: {
      title: "En la app de escaneo",
      body: "Tu equipo ve el nivel del cliente y sus ventajas antes de cobrar.",
    },
    alts: [
      "La franja de niveles de la página de registro: Bronce, Plata y Oro, y cómo llegar a Plata",
      "Un aviso de Gaspard & Gus en la pantalla de bloqueo: ¡Has alcanzado el nivel Plata!",
      "La app de escaneo con un cliente Plata y la ventaja que aplicar antes de cobrar",
    ],
  },
  settings: {
    eyebrow: "Ajustes",
    title: "Los ajustes que hacen un buen programa.",
    lead: "Los verás al crear tu programa. Aquí van los cuatro clave, con nuestro consejo.",
    tipLabel: "Nuestro consejo:",
    items: [
      {
        title: "Un regalo de bienvenida",
        body: "Da ventaja a los clientes nuevos: unos sellos o puntos al unirse, o un producto gratis.",
        tip: "Dales un empujón. Una tarjeta que empieza con 2 sellos de regalo se completa mucho más a menudo.",
      },
      {
        title: "Recompensas acumulables",
        body: "Una tarjeta llena guarda su recompensa y empieza otra al momento. Tú decides cuántas recompensas puede tener un cliente.",
        tip: "Permite al menos dos: que nadie deje de venir porque ya le espera una recompensa.",
      },
      {
        title: "Una primera recompensa al alcance",
        body: "Tú fijas el número de sellos de la tarjeta, o el precio en puntos de cada recompensa.",
        tip: "Haz que la primera recompensa esté cerca. Una victoria rápida convierte una primera visita en un hábito.",
      },
      {
        title: "Cambia cuando quieras",
        body: "Pasa de sellos a puntos, o al revés. Tus clientes conservan su tarjeta y su saldo se convierte.",
        tip: "Empieza por lo evidente y ajusta cuando lleguen datos reales.",
      },
    ],
    figure: {
      value: "34 %",
      text: "completaron una tarjeta que empezaba con 2 sellos de regalo, frente al 19 % con una tarjeta vacía",
      source: "Nunes y Drèze, Journal of Consumer Research, 2006 (tarjetas de fidelidad de un lavado de coches, 9 meses)",
    },
  },
  picker: {
    eyebrow: "¿Sellos o puntos?",
    title: "¿No sabes cuál? Responde a cuatro preguntas.",
    lead: "Te sugerimos un programa. Sin pedir correo.",
    progress: "Pregunta {current} de {total}",
    questions: [
      {
        question: "¿Tus precios cambian mucho de una compra a otra?",
        options: ["No, casi todas las compras cuestan lo mismo", "Sí, la cesta varía bastante"],
      },
      {
        question: "¿Cómo vuelven tus mejores clientes?",
        options: ["A menudo, para compras pequeñas", "De vez en cuando, para importes mayores"],
      },
      {
        question: "¿Qué recompensa gustaría más a tus clientes?",
        options: ["Un regalo tras unas visitas", "Elegir entre varias recompensas", "Aún no lo sé"],
      },
      {
        question: "¿Tienes clientes habituales que vuelven cada semana?",
        options: ["Sí, bastantes", "Todavía pocos"],
      },
    ],
    resultLabel: "Nuestra sugerencia",
    results: {
      stamps: {
        title: "Elige los sellos.",
        body: "Tus visitas son constantes y de precio parecido, así que la tarjeta de sellos es la opción más clara.",
      },
      points: {
        title: "Elige los puntos.",
        body: "Tus cestas varían, así que recompensar lo que gastan es más justo y hace volver a los que más gastan.",
      },
      either: {
        title: "Cualquiera de los dos sirve.",
        body: "Estás justo en medio. Los sellos son lo más sencillo para empezar, y los puntos se configuran igual de rápido.",
      },
    },
    levels: {
      yes: "Añade también niveles: tus habituales tendrán algo que alcanzar.",
      no: "Añade niveles más adelante, cuando tengas habituales.",
    },
    restart: "Empezar de nuevo",
  },
  sectors: {
    eyebrow: "Por comercio",
    title: "Lo que eligen la mayoría de comercios.",
    lead: "Un punto de partida, no una regla.",
    items: [
      { label: "Cafeterías", reason: "La misma bebida, casi cada día", program: "stamps" },
      { label: "Panaderías", reason: "Compras pequeñas y frecuentes", program: "stamps" },
      { label: "Peluquería y belleza", reason: "Recompensa por visita", program: "stamps" },
      { label: "Lavado de coches", reason: "Un servicio, repetido", program: "stamps" },
      { label: "Restaurantes", reason: "La cuenta cambia cada vez", program: "points" },
      { label: "Tiendas", reason: "Cestas muy variables", program: "points" },
      { label: "Ultramarinos y fruterías", reason: "Recompensa el gasto total", program: "points" },
      { label: "Vinotecas y especializados", reason: "Tickets altos e irregulares", program: "points" },
    ],
    programLabels: { stamps: "Sellos", points: "Puntos" },
  },
  faq: {
    title: "Preguntas sobre los programas de fidelidad",
    items: [
      {
        question: "¿Qué diferencia hay entre sellos y puntos?",
        answer:
          "Los sellos cuentan visitas: cada escaneo añade un sello y una tarjeta llena da la recompensa. Los puntos cuentan el gasto: tu equipo introduce el importe y tus clientes canjean sus puntos por las recompensas que tú fijas. Los sellos encajan con visitas que cuestan más o menos lo mismo; los puntos, con cestas que varían.",
      },
      {
        question: "¿Qué es un programa de fidelización por niveles?",
        answer:
          "Un programa, también llamado escalonado, en el que los clientes suben de nivel, como Bronce, Plata y Oro, a medida que vuelven, y reciben un poco más en cada uno. En Stampeo, los niveles se suman a tus sellos o puntos: hasta 5, cada uno con su propio estilo de tarjeta, hasta 3 ventajas y un regalo al alcanzarlo.",
      },
      {
        question: "¿Cómo suben de nivel los clientes?",
        answer:
          "Por lo que ganan en su nivel actual: tarjetas completas en una tarjeta de sellos (una por defecto), o puntos ganados en una tarjeta de puntos. Gastar puntos en recompensas nunca los frena, y los sellos o puntos de su regalo de bienvenida también cuentan.",
      },
      {
        question: "¿Pueden los clientes perder su nivel?",
        answer:
          "No. Los clientes nunca bajan de nivel por sí solos. Aun así, puedes cambiar el nivel de un cliente a mano desde su perfil.",
      },
      {
        question: "¿Puedo crear una tarjeta de sellos digital?",
        answer:
          "Sí. Una tarjeta de sellos funciona como la de cartón de siempre, con un sello por visita, pero vive en Apple Wallet o Google Wallet y no se puede perder.",
      },
      {
        question: "¿Puedo pasar de sellos a puntos más adelante?",
        answer:
          "Sí, cuando quieras. Tus clientes conservan la tarjeta que ya tienen, y lo que han acumulado se convierte al nuevo programa.",
      },
      {
        question: "¿Mis clientes necesitan una aplicación?",
        answer:
          "No. La tarjeta va a Apple Wallet o Google Wallet, que ya están en su teléfono. Escanean tu código QR una vez y queda añadida.",
      },
    ],
  },
  band: {
    title: "Dales un motivo para volver.",
    accent: "un motivo para volver.",
    sub: "Empieza con sellos o puntos, y añade niveles cuando quieras.",
  },
};
