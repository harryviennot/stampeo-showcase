import type { EyebrowSection, Fact, FinalCtaCopy, PageMeta, Tile } from "./types";

/** The platform page: a tour of the product. Every section header is an eyebrow, a centred h2 and a lead. */
export const PLATFORM = {
  meta: {
    title: "Digital punch cards for Apple & Google Wallet | Stampeo",
    description:
      "Create, share and stamp a digital punch card in Apple Wallet and Google Wallet, run from a dashboard and a free Scanner app. Free trial, cancel anytime.",
  } satisfies PageMeta,
  hero: {
    h1: "Digital punch cards for Apple & Google Wallet.",
    accent: "Apple & Google Wallet.",
  },
  marquee: {
    label: "Built for",
    types: [
      "Coffee shops",
      "Bakeries",
      "Barbershops",
      "Nail salons",
      "Restaurants",
      "Bookstores",
      "Food trucks",
      "Spas",
      "Lash studios",
      "Juice bars",
      "Car washes",
      "Pet groomers",
    ],
  },
  deliver: {
    eyebrow: "In their wallet",
    title: "Straight to Apple Wallet and Google Wallet.",
    lead: "No app to download. Their card sits right next to their payment cards.",
    analyticsLabel: "Analytics",
    notificationsLabel: "Lock-screen notifications",
    updatesLabel: "Real-time updates",
    updatesFrom: "5/8",
    updatesTo: "6/8",
  } satisfies EyebrowSection & Record<string, string>,
  numbers: {
    eyebrow: "By the numbers",
    title: "Where Stampeo stands today.",
  },
  how: {
    eyebrow: "How it works",
    title: "Create it, share it, stamp it.",
    lead: "Build your card, put it on your counter, and stamp it from any phone.",
    cells: [
      { title: "Create", body: "Design a card that looks like your shop: your logo, your colors, your reward." },
      { title: "Share", body: "Customers scan your counter QR code or tap your link. No app, no account." },
      { title: "Stamp", body: "Scan their card from any phone. It updates in seconds and lands on their lock screen." },
    ] satisfies Tile[],
    link: "Try the stamp step yourself",
  },
  demo: {
    eyebrow: "Live demo",
  },
  programTypes: {
    eyebrow: "Program types",
    title: "Stamps, points or levels.",
    lead: "Reward visits, reward spending, or let your regulars climb.",
    closer: "How to choose between stamps and points",
  } satisfies EyebrowSection & { closer: string },
  platform: {
    eyebrow: "The Stampeo platform",
    title: "Run it from your computer or your phone.",
    lead: "A dashboard for you, and a free Scanner app for your team.",
    tabs: { dashboard: "Dashboard", scanner: "Scanner app" },
    dashboard: {
      title: "Everything in one place",
      facts: [
        { text: "Design your card and see it live" },
        { text: "Every customer, their progress and their rewards" },
        { text: "Broadcasts to every card" },
        { text: "Your numbers, updated with every scan" },
      ] satisfies Fact[],
      link: "See the analytics",
    },
    scanner: {
      title: "Free for your whole team",
      facts: [
        { text: "iPhone, Android or any phone's browser" },
        { text: "Staff join with a code and see only the scanner" },
        { text: "Unlimited team members", plan: "Growth and Pro" },
      ] satisfies Fact[],
      link: "See the scanner",
    },
  },
  share: {
    eyebrow: "Share it everywhere",
    title: "Put your card where customers already are.",
    lead: "One QR code and one link: on your counter, and everywhere online.",
    channels: [
      { title: "Counter flyer", body: "Printable, with your QR code" },
      { title: "Scanner app", body: "Shows your QR code at the register" },
      { title: "Instagram", body: "Your link in your bio or stories" },
      { title: "Facebook", body: "Your link on your page" },
      { title: "Your website", body: "A button or a QR code" },
      { title: "Google Business Profile", body: "Your link where people find you" },
    ] satisfies Tile[],
  } satisfies EyebrowSection & { channels: Tile[] },
  band: {
    title: "Launch your loyalty card today.",
    accent: "today.",
    sub: "Design it, test it on your own phone, then choose a plan.",
  } satisfies FinalCtaCopy & { sub: string },
  blog: {
    eyebrow: "Blog",
    title: "Guides for shop owners.",
    lead: "Practical reads on running a loyalty card that brings people back.",
    viewAll: "View all",
  } satisfies EyebrowSection & { viewAll: string },
} as const;
