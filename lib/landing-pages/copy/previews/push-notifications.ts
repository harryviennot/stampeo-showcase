import { LEVEL_UP_BANNER, REWARD_BANNER, SAMPLE_BUSINESS, STAMP_BANNER } from "../shared";
import type { Banner, BandCopy, Fact, PageMeta, PreviewHeroCopy, TabCopy, Tile } from "../types";

/** What a customer sees when they claim a reward: the English default of `reward_redeemed` in the backend's notification defaults. */
const REDEEMED_BANNER: Banner = { sender: SAMPLE_BUSINESS, body: "Reward redeemed. Enjoy!" };

/** The level-up message the default wording sends, as it reaches Aurevo's customer (the sample card keeps its own look). */
const AUREVO_LEVEL_UP: Banner = { sender: SAMPLE_BUSINESS, body: LEVEL_UP_BANNER.body };

/** The notifications preview: every stamp and reward reaches the lock screen on its own, with no app and no phone number. */
export const PUSH_NOTIFICATIONS_PREVIEW = {
  meta: {
    title: "Lock-screen notifications for loyalty cards | Stampeo",
    description:
      "Every stamp and every reward lands on your customer's lock screen, in Apple Wallet and Google Wallet. No app, no phone number. Free trial, cancel anytime.",
  } satisfies PageMeta,
  hero: {
    eyebrow: "Notifications",
    h1: "Every stamp lands on their lock screen.",
    accent: "their lock screen.",
    sub: "Automatic notifications in Apple Wallet and Google Wallet. No app, no phone number.",
  } satisfies PreviewHeroCopy,
  how: {
    eyebrow: "How it works",
    title: "You scan. Their phone lights up.",
    lead: "Notifications go out on their own. There's nothing to send or schedule.",
    cells: [
      { title: "You scan", body: "Add a stamp from the Scanner app, as you always do." },
      { title: "Their card updates", body: "The card in their wallet changes in seconds, no app to open." },
      { title: "They get the message", body: "A notification from your shop lands on their lock screen." },
    ] satisfies Tile[],
  },
  /** One customer's card over several visits: each step sends its own default message. */
  day: {
    eyebrow: "On their lock screen",
    title: "A message for every step of the card.",
    lead: "From their first stamp to their next level, each one sends itself.",
    nodes: [
      { key: "stamp", label: "5th visit", banner: STAMP_BANNER },
      { key: "reward", label: "Card full", banner: REWARD_BANNER },
      { key: "redeemed", label: "Reward claimed", banner: REDEEMED_BANNER },
      { key: "level", label: "Next level", banner: AUREVO_LEVEL_UP },
    ] satisfies Array<{ key: "stamp" | "reward" | "redeemed" | "level"; label: string; banner: Banner }>,
  },
  moments: {
    eyebrow: "Automatic messages",
    title: "The right message at every step.",
    lead: "A stamp, a full card, a reward claimed: each one sends its own message.",
    items: [
      { title: "Stamp collected", description: "Sent on every scan, in your customer's language.", banner: STAMP_BANNER },
      { title: "Reward unlocked", description: "Sent the moment their card is full.", banner: REWARD_BANNER },
      { title: "Reward redeemed", description: "Sent when they claim it.", banner: REDEEMED_BANNER },
    ],
  },
  wallets: {
    eyebrow: "iPhone and Android",
    title: "Apple Wallet and Google Wallet, both.",
    lead: "Customers get the notification whichever phone they carry.",
    iphone: "On iPhone",
    android: "On Android",
    icon: {
      title: "Your own icon",
      line: "Upload an icon, or use one made from your logo.",
    },
  },
  wording: {
    eyebrow: "Your words",
    title: "Use our wording, or write your own.",
    lead: "Ready-made messages on every plan. Growth and Pro let you rewrite them.",
    tabs: {
      ready: {
        label: "Ready-made",
        title: "On from your first stamp",
        facts: [
          { text: "Stamps, rewards and level-ups covered" },
          { text: "Switch each message on or off" },
          { text: "Customers can turn them off in their wallet" },
        ] satisfies Fact[],
      },
      words: {
        label: "Your own words",
        title: "Say it like you would",
        banner: { sender: SAMPLE_BUSINESS, body: "You got stamped! 3 more to go, Sophie." } satisfies Banner,
        facts: [
          { text: "Rewrite any message, with their first name", plan: "Growth and Pro" },
          { text: 'Milestones like "Halfway there!"', plan: "Growth and Pro" },
          { text: "Translated for each language", plan: "Growth and Pro" },
        ] satisfies Fact[],
      },
    } satisfies { ready: TabCopy; words: TabCopy & { banner: Banner } },
  },
  /**
   * The dashboard's message editor, in its words (web's `notifications.editor` and `triggers`): the ready-made
   * text, or your own with variables shown as chips. `{first name}` and `{stamps left}` are the editor's
   * "Customer first name" and "Stamps remaining".
   */
  editor: {
    eyebrow: "Your words",
    title: "Use our wording, or write your own.",
    lead: "Ready-made messages on every plan. Growth and Pro let you rewrite them.",
    /** The two-way control over the message; "Your words" is the one that comes with Growth and Pro. */
    toggle: { label: "Message wording", ready: "Ready-made", own: "Your words", plan: "Growth and Pro" },
    messageLabel: "Message",
    previewLabel: "Preview",
    ready: { text: STAMP_BANNER.body },
    own: { text: "You got stamped, {first name}! {stamps left} more to go.", preview: "You got stamped, Sophie! 3 more to go." },
    /** The messages that can be switched on or off, as the editor names them; the first is the one on screen. */
    switches: ["Stamp collected", "Reward unlocked", "Reward redeemed"],
  },
  demo: {
    eyebrow: "Live demo",
  },
  band: {
    title: "Keep every customer in the loop.",
    accent: "in the loop.",
    sub: "Notifications start with your first stamp, on every plan.",
  } satisfies BandCopy,
} as const;
