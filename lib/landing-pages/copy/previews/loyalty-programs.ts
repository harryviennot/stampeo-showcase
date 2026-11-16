import type { BandCopy, FaqItem, PageMeta, SourcedFigure, Tile } from "../types";

/** The study behind the head-start tip, as the outcomes page cites it. */
const HEAD_START_SOURCE = "Nunes & Drèze, Journal of Consumer Research, 2006 (car wash loyalty cards, 9 months)";

/** One level of the dry cleaner's ladder, as the levels section shows it. */
export interface LadderLevel {
  name: string;
  /** How a customer gets here. */
  reach: string;
  /** What the level's stamp card gives. */
  card: string;
  perks: readonly string[];
  /** The one-time gift for reaching the level. */
  gift?: string;
}

/** A program the picker can suggest. */
export type PickerProgram = "stamps" | "points" | "either";

/**
 * The loyalty programs preview: what a loyalty program is on Stampeo (stamps
 * or points, with levels on top), how to choose, and how levels work. The
 * product word is "levels"; "tiers" is the search word, used in the head and
 * in the one question that defines it.
 */
export const LOYALTY_PROGRAMS_PREVIEW = {
  meta: {
    title: "Loyalty program with stamps, points and tiers | Stampeo",
    description:
      "Run your loyalty program in Apple Wallet and Google Wallet: a digital stamp card or points, plus loyalty tiers like Bronze, Silver and Gold. Free trial.",
  } satisfies PageMeta,
  hero: {
    h1: "Loyalty programs: stamps, points and levels.",
    accent: "stamps, points and levels.",
    sub: "A stamp card or points in Apple Wallet and Google Wallet, with levels for your regulars.",
    /** The hero's second button: it jumps to the levels. */
    secondary: "See how levels work",
    /** What the hero picture is, for a screen reader. */
    alt: "Three loyalty cards: a juice bar's stamp card, a bookstore's points card, and a dry cleaner's card at Gold level with the notification \"You've reached Gold!\"",
    /** The small label under each card of the hero, in the cards' order (left, front, right). */
    labels: ["Stamps", "Levels", "Points"],
    banner: { sender: "Wrenfold", body: "You've reached Gold! Your card has a new look." },
  },
  programs: {
    eyebrow: "Stamps or points",
    title: "Stamps for visits, points for spending.",
    lead: "Same card, same setup. Switch later, and customers keep their card.",
    stamps: {
      title: "Stamps",
      line: "A digital stamp card: one stamp for each visit, and a reward when the card is full.",
      facts: [
        { text: "One scan at the counter, no amount to type" },
        { text: "You choose the card size and the reward" },
        { text: "Extra stamps can roll over to the next card" },
      ],
      bestFor: "Every visit costs about the same: coffee, haircuts, car washes, bakeries.",
      alt: "A café's stamp card with 5 of 8 stamps",
    },
    points: {
      title: "Points",
      line: "Points on what customers spend, and a menu of rewards they choose from.",
      facts: [
        { text: "Staff type in the amount, and the points add up" },
        { text: "Customers pick any reward their points cover" },
        { text: "Points never expire" },
      ],
      bestFor: "Baskets vary: restaurants, boutiques, grocery and specialty shops.",
      alt: "A beauty salon's points card, its ring filling toward the next reward",
    },
    bestForLabel: "Best when",
  },
  levels: {
    eyebrow: "Loyalty levels",
    title: "Add levels, like Bronze, Silver and Gold.",
    lead: "Regulars move up as they come back. Each level can have its own look, perks and gift.",
    /** The dry cleaner's three levels, from the bottom. */
    ladder: [
      {
        name: "Bronze",
        reach: "Where every customer starts",
        card: "8 stamps for a free shirt press",
        perks: [],
      },
      {
        name: "Silver",
        reach: "Fill 1 card on Bronze",
        card: "6 stamps for a free shirt press",
        perks: ["Free hanger return", "Priority pickup"],
        gift: "A free tote bag",
      },
      {
        name: "Gold",
        reach: "Fill 2 cards on Silver",
        card: "5 stamps for a free duvet clean",
        perks: ["Free pickup and delivery", "Same-day service"],
        gift: "A free coat clean",
      },
    ] satisfies LadderLevel[],
    labels: { card: "Card", perks: "Perks", gift: "Gift", noPerks: "No perks yet", top: "Top level: theirs for good" },
    /** What each card of the ladder is, for a screen reader. */
    alt: "A dry cleaner's loyalty card at Bronze, Silver and Gold: the card changes color and fills faster at each level.",
    facts: [
      { title: "Up to 5 levels", body: "Name them as you like. A new ladder starts with three." },
      { title: "A card for each level", body: "Keep your own card, or give a level a Bronze, Silver, Gold, Platinum or Noir look." },
      { title: "Up to 3 perks per level", body: "Like free delivery or priority pickup. Your staff see them in the Scanner app." },
      { title: "A gift when they arrive", body: "A one-time reward the moment a customer reaches a level." },
    ] satisfies Tile[],
    tip: "Our tip: start with three levels, and make Silver easy to reach. A first move up within a month or two keeps regulars coming.",
  },
  moveUp: {
    eyebrow: "Moving up",
    title: "How customers move up a level.",
    lead: "They move up on what they earn, not what they spend, and never move down.",
    stamps: {
      title: "On a stamp card",
      body: "Each full card counts toward the next level. One full card by default, or as many as you choose.",
      level: "Silver",
      next: "Gold",
      filled: 1,
      needed: 2,
      progress: "1 of 2 cards filled",
      caption: "1 more card to Gold",
      alt: "A Silver customer's progress: 1 of 2 full cards toward Gold",
    },
    points: {
      title: "On a points card",
      body: "Every point earned on a level counts toward the next one, even the points they spend on rewards.",
      level: "Silver",
      next: "Gold",
      earned: 320,
      needed: 500,
      progress: "320 of 500 points earned",
      caption: "180 more points to Gold",
      spent: "Points spent on rewards still count",
      alt: "A Silver customer's progress: 320 of 500 points earned toward Gold",
    },
    facts: [
      { title: "They never move down", body: "A level they reach is theirs. You can still change a customer's level by hand." },
      { title: "Welcome gifts count", body: "The stamps or points you give at sign-up count toward the first move up." },
      { title: "Better rewards higher up", body: "On stamps, a level can fill faster or give a bigger reward. On points, each level can have its own reward menu." },
    ] satisfies Tile[],
  },
  moments: {
    eyebrow: "What people see",
    title: "Where customers and staff see levels.",
    lead: "Levels show up where they matter, with nothing extra for you to do.",
    signup: {
      title: "On your sign-up page",
      body: "New customers see the levels before they join.",
    },
    lockScreen: {
      title: "On their lock screen",
      body: "A notification when they move up, with their gift.",
      banner: { sender: "Wrenfold", body: "You've reached Silver! Your card has a new look. Your gift: A free tote bag." },
    },
    /** The picture is the scanner preview's `LevelScreen`: Sophie at Silver, with the Scanner app's own wording. */
    scanner: {
      title: "In the Scanner app",
      body: "Your staff see the customer's level and perks before they charge.",
    },
    /** What each picture is, for a screen reader, in the tiles' order. */
    alts: [
      "The sign-up page's levels strip: Bronze, Silver and Gold, and how to reach Silver",
      "A lock-screen notification from Wrenfold: You've reached Silver!",
      "The Scanner app showing a Silver customer and the perks to apply before charging",
    ],
  },
  settings: {
    eyebrow: "Settings",
    title: "Settings that make a loyalty program work.",
    lead: "You'll meet these in setup. Here are the four that matter most, with our advice.",
    tipLabel: "Our tip:",
    items: [
      {
        title: "A welcome gift",
        body: "Give new customers a head start: a few stamps or points when they join, or a free item.",
        tip: "Start them off. A card that comes with 2 free stamps gets finished far more often.",
      },
      {
        title: "Rewards that stack",
        body: "A full card keeps its reward and a new card starts right away. You choose how many rewards a customer can hold.",
        tip: "Allow at least two, so nobody stops coming because a reward is already waiting.",
      },
      {
        title: "A first reward within reach",
        body: "You set the number of stamps on the card, or the points price of each reward.",
        tip: "Make the first reward easy to reach. A quick win turns a first visit into a habit.",
      },
      {
        title: "Switch whenever you like",
        body: "Move from stamps to points, or back. Customers keep their card, and their balance is converted.",
        tip: "Start with the obvious choice, and adjust once real numbers come in.",
      },
    ],
    figure: {
      value: "34%",
      text: "finished a card that came with 2 free stamps, against 19% for a card that started empty",
      source: HEAD_START_SOURCE,
    } satisfies SourcedFigure,
  },
  picker: {
    eyebrow: "Stamps or points?",
    title: "Not sure which one? Answer four questions.",
    lead: "We'll suggest a program. No email needed.",
    progress: "Question {current} of {total}",
    /** The first three choose stamps or points (`lib/loyalty-picker.ts` scores them); the last one decides on levels. */
    questions: [
      {
        question: "Do your prices change much from one purchase to the next?",
        options: ["No, most purchases cost about the same", "Yes, the basket varies a lot"],
      },
      {
        question: "How do your best customers come back?",
        options: ["Often, for small purchases", "Now and then, for bigger ones"],
      },
      {
        question: "Which reward would your customers love most?",
        options: ["A free item after a few visits", "Their pick from several rewards", "Not sure yet"],
      },
      {
        question: "Do you have regulars who come back every week?",
        options: ["Yes, quite a few", "Not many yet"],
      },
    ],
    resultLabel: "Our suggestion",
    results: {
      stamps: {
        title: "Go with stamps.",
        body: "Your visits are steady and similar in price, so a stamp card is the clearest choice.",
      },
      points: {
        title: "Go with points.",
        body: "Your baskets vary, so rewarding what customers spend feels fairer and keeps big spenders coming back.",
      },
      either: {
        title: "Either one works.",
        body: "You're right in the middle. Stamps are the simplest start, and points are just as quick to set up.",
      },
    } satisfies Record<PickerProgram, { title: string; body: string }>,
    levels: {
      yes: "Add levels too: your regulars will have something to reach.",
      no: "Add levels later, once you have regulars.",
    },
    restart: "Start over",
  },
  sectors: {
    eyebrow: "By business",
    title: "What most businesses choose.",
    lead: "A starting point, not a rule.",
    items: [
      { label: "Cafés and coffee shops", reason: "Same drink, most days", program: "stamps" },
      { label: "Bakeries", reason: "Small, frequent purchases", program: "stamps" },
      { label: "Hair and beauty", reason: "Rewarded per visit", program: "stamps" },
      { label: "Car washes", reason: "One service, repeated", program: "stamps" },
      { label: "Restaurants", reason: "The bill changes every time", program: "points" },
      { label: "Boutiques", reason: "Baskets vary widely", program: "points" },
      { label: "Grocery and food shops", reason: "Reward the total spend", program: "points" },
      { label: "Wine and specialty shops", reason: "Higher, uneven tickets", program: "points" },
    ] as ReadonlyArray<{ label: string; reason: string; program: "stamps" | "points" }>,
    programLabels: { stamps: "Stamps", points: "Points" },
  },
  faq: {
    title: "Questions about loyalty programs",
    items: [
      {
        question: "What's the difference between stamps and points?",
        answer:
          "Stamps count visits: each scan adds a stamp, and a full card earns the reward. Points count spending: staff type in the amount, and customers spend their points on rewards you set. Stamps suit visits that cost about the same; points suit baskets that vary.",
      },
      {
        question: "What is a tiered loyalty program?",
        answer:
          "A program where customers move up levels, also called tiers, like Bronze, Silver and Gold, as they keep coming back, and get a little more at each one. On Stampeo, levels sit on top of your stamps or points: up to 5, each with its own card look, up to 3 perks and a gift when they reach it.",
      },
      {
        question: "How do customers move up a level?",
        answer:
          "On what they earn on their current level: full cards on a stamp card (one by default), or points earned on a points card. Spending points on rewards never holds them back, and the stamps or points from their welcome gift count too.",
      },
      {
        question: "Can customers lose their level?",
        answer:
          "No. Customers never move down on their own. You can still change a customer's level by hand from their profile.",
      },
      {
        question: "Can I make a digital punch card?",
        answer:
          "Yes. A stamp card works like a paper punch card, with a stamp for each visit, but it lives in Apple Wallet or Google Wallet and can't be lost.",
      },
      {
        question: "Can I switch from stamps to points later?",
        answer:
          "Yes, whenever you like. Customers keep the card they already have, and what they've collected is converted to the new program.",
      },
      {
        question: "Do my customers need an app?",
        answer:
          "No. The card goes into Apple Wallet or Google Wallet, already on their phone. They scan your QR code once, and it's added.",
      },
    ] satisfies FaqItem[],
  },
  band: {
    title: "Give regulars a reason to come back.",
    accent: "a reason to come back.",
    sub: "Start with stamps or points, and add levels whenever you're ready.",
  } satisfies BandCopy,
} as const;
