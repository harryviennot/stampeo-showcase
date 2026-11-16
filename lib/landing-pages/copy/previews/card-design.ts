import type { BandCopy, FaqItem, HeroCopy, PageMeta, Tile } from "../types";

/** The card design preview: can the card look like my shop, and what can I change on it. */
export const CARD_DESIGN_PREVIEW = {
  meta: {
    title: "Design your digital loyalty card | Stampeo",
    description:
      "Design a digital loyalty card with your logo, colors and stamp icons, for Apple Wallet and Google Wallet. Stamps, points or levels. Free trial.",
  } satisfies PageMeta,
  hero: {
    h1: "Design your digital loyalty card.",
    accent: "digital loyalty card.",
    sub: "Your logo, your colors and your own stamp icons, in Apple Wallet and Google Wallet.",
    /** The hero's second button: it jumps to the anatomy of the card. */
    secondary: "See every part of the card",
  } satisfies HeroCopy & { secondary: string },
  /** The hero's card takes on the look of six shops; one caption names each, in the card's order. */
  reskin: {
    captions: ["Car wash", "Bakery", "Wine bar", "Lash studio", "Bookstore", "Pizza truck"],
    previous: "Previous shop",
    next: "Next shop",
    /** The name of each dot; `{shop}` is the shop's caption. */
    dot: "Show the {shop} card",
    /** What the card is, for a screen reader: it is decoration that the captions and the headline already say. */
    alt: "One loyalty card taking on the look of six shops: a car wash, a bakery, a wine bar, a lash studio, a bookstore and a pizza truck.",
  },
  anatomy: {
    eyebrow: "Every part",
    title: "Every part of the card is yours.",
    lead: "Change the logo, colors, stamps, reward and details. We add the QR code for you.",
    /** The six labels of a stamp card, in the order of the card's parts (logo, count, stamps, name, reward, QR code). */
    labels: ["Logo", "Stamp count", "Stamps", "Customer's name", "Reward", "QR code to scan"],
    mobileLabels: ["Logo", "Count", "Stamps", "Name", "Reward", "QR code"],
    pointsLabels: ["Logo", "Points balance", "Points display", "Customer's name", "Next reward", "QR code to scan"],
    pointsMobileLabels: ["Logo", "Balance", "Points", "Name", "Reward", "QR code"],
  },
  programs: {
    eyebrow: "Stamps, points or levels",
    title: "A stamp card, a points card or levels.",
    lead: "Stamps reward visits, points reward spending, and levels reward your regulars.",
    cards: [
      { title: "Stamp card", line: "A stamp for each visit, and a reward when the card is full." },
      { title: "Points card", line: "Points on what they spend, and a menu of rewards to pick from." },
      { title: "Levels", line: "Up to five levels. Regulars move up, and their card changes look." },
    ],
    /** What each card is, for a screen reader, in the cards' order. */
    alts: ["A burger bar's stamp card", "A gym's points card", "A dry cleaner's card at Bronze, Silver and Gold"],
  },
  icons: {
    eyebrow: "Stamp icons",
    title: "Use our stamp icons, or upload your own.",
    lead: "Pick from 98 ready-made icons, or upload your logo. We remove the background.",
    facts: [
      "98 ready-made stamp icons, searchable by name",
      "Upload any image: the background is removed automatically",
      "A different icon for each stamp, and a special one for the reward",
      "In a row, staggered or overlapping",
      "No logo? The card shows your initials instead",
    ],
    /** What each of the three cards shows, in the cards' order: the caption under it and its name for a screen reader. */
    cards: ["Pulp: its own citrus icons", "Gelo: its own cones", "A pet groomer: paws from the library"],
  },
  wallets: {
    eyebrow: "iPhone and Android",
    title: "Your digital loyalty card on any phone.",
    lead: "The same card in Apple Wallet and Google Wallet. Customers scan one QR code.",
    cells: [
      { title: "One QR code", body: "Customers scan it and get the card for their phone." },
      { title: "Live preview", body: "See both wallets while you design." },
      { title: "Always up to date", body: "Change your card, and every card already in a wallet updates." },
    ] satisfies Tile[],
    /** What each phone is, for a screen reader. */
    phoneAlts: {
      apple: "An iPhone with the loyalty card open in Apple Wallet",
      google: "An Android phone with the same loyalty card open in Google Wallet",
    },
  },
  faq: {
    title: "Questions about your card",
    items: [
      {
        question: "Can I use my own stamp icons?",
        answer:
          "Yes. Upload any image, like your croissant, your mascot or your logo. The background is removed automatically and it becomes a stamp. You can even use a different icon for each stamp.",
      },
      {
        question: "What if I don't have a logo?",
        answer:
          "Your card still works. Without a logo it shows your initials in your accent color, and you can pick from 98 ready-made stamp icons.",
      },
      {
        question: "Can I make a digital punch card or a points card?",
        answer:
          "Both. A stamp card works like a paper punch card, with a stamp for each visit. A points card rewards what they spend. Add levels to either, and switch later without your customers losing their card.",
      },
      {
        question: "Does the card work on iPhone and Android?",
        answer:
          "Yes. The same card goes into Apple Wallet and Google Wallet, and the designer shows both while you work. Customers scan one QR code, whatever their phone.",
      },
      {
        question: "Can I change the card later?",
        answer: "Anytime. Edit your card, and the cards already in your customers' wallets update on their own.",
      },
      {
        question: "Can you design the card for me?",
        answer:
          "Yes, for free. Send us your logo and details, and we send back a card ready to use. You can still change it yourself afterwards.",
      },
    ] satisfies FaqItem[],
  },
  band: {
    title: "Make a card that looks like you.",
    accent: "looks like you.",
    sub: "Design it yourself, or send us your logo and we'll make it for you, free.",
  } satisfies BandCopy,
} as const;
