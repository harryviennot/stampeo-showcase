import type { BandCopy, FaqItem, PageMeta, PreviewHeroCopy, RowCopy, SectionCopy, Tile } from "../types";

/** The card design preview: can the card look like my shop, and can I try the designer before I sign up. */
export const CARD_DESIGN_PREVIEW = {
  meta: {
    title: "A loyalty card that looks like your shop | Stampeo",
    description:
      "Design a loyalty card with your logo, your colors and your own stamps, in Apple Wallet and Google Wallet. Try the designer first. Free trial, cancel anytime.",
  } satisfies PageMeta,
  hero: {
    eyebrow: "Card design",
    h1: "A loyalty card that looks like your shop.",
    accent: "your shop.",
    sub: "Your logo, your colors and your own stamps, in Apple Wallet and Google Wallet.",
  } satisfies PreviewHeroCopy,
  /** The hero's second button, and the one under the figures: both jump to the designer. */
  designerLink: "Try the designer",
  icons: {
    label: "An icon for every trade",
    /** What the two drifting rows of icon tiles are, for a screen reader. */
    alt: "The designer's stamp icons, in two rows that drift past",
  },
  playground: {
    eyebrow: "Try the designer",
    title: "Design it your way.",
    lead: "Stamps or points, colors and icons: change them and watch the card update.",
  } satisfies SectionCopy & { eyebrow: string },
  anatomy: {
    eyebrow: "Every detail",
    title: "Every part of the card is yours.",
    lead: "Logo, stamps, fields and reward, laid out to read at a glance in any wallet.",
  } satisfies SectionCopy & { eyebrow: string },
  numbers: {
    eyebrow: "In the designer",
    title: "Everything you need to make it yours.",
    /** 98 is the icon library (`stampIcons`), 4 the languages a card speaks, 5 the palettes made from a logo. */
    figures: [
      { value: "98", label: "stamp icons" },
      { value: "5", label: "color palettes from your logo" },
      { value: "4", label: "languages, set by their phone" },
    ],
  },
  stamps: {
    eyebrow: "Stamp styles",
    title: "Stamps that look like what you sell.",
    lead: "Pick from the library, upload your own, and lay them out your way.",
    rows: [
      {
        key: "library",
        eyebrow: "Ready in a click",
        title: "Icon library",
        body: "Ready-made stamp icons for every trade, searchable by name in the designer.",
      },
      {
        key: "own",
        eyebrow: "Your croissant, your logo",
        title: "Your own icons",
        body: "Upload any image. We remove the background and it becomes a stamp.",
      },
      {
        key: "layout",
        eyebrow: "Down to the last stamp",
        title: "Your layout",
        body: "In a row, staggered or overlapping, with a special stamp for the reward.",
      },
    ] satisfies RowCopy<"library" | "own" | "layout">[],
    /** What each row's card is, for a screen reader. */
    cardAlts: {
      library: "A pet groomer's loyalty card with paw stamps from the icon library",
      own: "A bubble tea shop's loyalty card with its own boba stamps",
      layout: "A gelato shop's loyalty card with ice cream cones piled up as stamps",
    },
  },
  wallets: {
    eyebrow: "Both wallets",
    title: "One card, ready for every phone.",
    lead: "The same card in Apple Wallet and Google Wallet, from one QR code.",
    cells: [
      { title: "One QR code", body: "Customers scan it and get the right card for their phone." },
      { title: "Live preview", body: "The designer shows both wallets while you work." },
      { title: "Always up to date", body: "Change your style and every card already in a wallet updates." },
    ] satisfies Tile[],
    /** What each phone is, for a screen reader. */
    phoneAlts: {
      apple: "An iPhone with the loyalty card open in Apple Wallet",
      google: "An Android phone with the same loyalty card open in Google Wallet",
    },
  },
  faq: {
    title: "Card styles, answered",
    items: [
      {
        question: "Can I use my own stamp icons?",
        answer:
          "Yes. Import any image (your croissant, your mascot, your logo): the background is removed automatically and it becomes a stamp. You can even use a different icon for each stamp.",
      },
      {
        question: "What if I don't have a logo or brand colors?",
        answer:
          "The library has 98 ready-made icons, and the editor comes with a full color palette. Pick an icon, choose your colors, and the preview shows the result right away.",
      },
      {
        question: "Does the card work on iPhone and Android?",
        answer:
          "Yes. The same card lives in Apple Wallet and Google Wallet, and the editor previews both while you build. Your customers scan one QR code, whatever their phone.",
      },
      {
        question: "Can I change the style later?",
        answer:
          "Anytime. Edit your card style and the cards already in your customers' wallets update automatically.",
      },
      {
        question: "Can you create the card for me?",
        answer:
          "Yes. Send us your logo and your colors, and we design the card for you. Most cards are ready within 48 hours.",
      },
    ] satisfies FaqItem[],
  },
  band: {
    title: "Make a card that looks like you.",
    accent: "looks like you.",
    sub: "Design it yourself, or send us your logo and we'll make it for you, free.",
  } satisfies BandCopy,
} as const;
