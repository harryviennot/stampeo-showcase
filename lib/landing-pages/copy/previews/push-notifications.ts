import { LEVEL_UP_BANNER, REWARD_BANNER, SAMPLE_BUSINESS, STAMP_BANNER } from "../shared";
import type { Banner, BandCopy, HeroCopy, PageMeta } from "../types";

/** What a customer sees when they claim a reward: the English default of `reward_redeemed` in the backend's notification defaults. */
const REDEEMED_BANNER: Banner = { sender: SAMPLE_BUSINESS, body: "Reward redeemed. Enjoy!" };

/** The level-up message the default wording sends, as it reaches Aurevo's customer (the sample card keeps its own look). */
const AUREVO_LEVEL_UP: Banner = { sender: SAMPLE_BUSINESS, body: LEVEL_UP_BANNER.body };

/** The notifications preview: every stamp and reward reaches the lock screen on its own, with no app and no phone number. */
export const PUSH_NOTIFICATIONS_PREVIEW = {
  meta: {
    title: "Push notifications for your loyalty card | Stampeo",
    description:
      "Every stamp and reward sends a push notification to your customer's lock screen, in Apple Wallet and Google Wallet. No app to download. Free trial.",
  } satisfies PageMeta,
  hero: {
    h1: "Push notifications for your loyalty card.",
    accent: "Push notifications",
    sub: "Each stamp and reward sends an automatic notification to your customer's lock screen.",
    /** The one notification on the hero's lock screen. */
    banner: STAMP_BANNER,
    alt: "An iPhone lock screen with a notification from Aurevo: Stamp collected! You have 5 of 8 stamps.",
  } satisfies HeroCopy & { banner: Banner; alt: string },
  /** One customer's visits: each step shows the card as it stands, then the default message it sends. */
  day: {
    eyebrow: "One customer's visits",
    title: "A notification each time their card changes.",
    lead: "Follow one customer: the card updates first, then the message arrives.",
    nodes: [
      { key: "stamp", label: "Stamp added", banner: STAMP_BANNER, cardAlt: "Aurevo's card at 5 of 8 stamps" },
      { key: "reward", label: "Card full", banner: REWARD_BANNER, cardAlt: "Aurevo's card full, at 8 of 8 stamps" },
      { key: "redeemed", label: "Reward claimed", banner: REDEEMED_BANNER, cardAlt: "Aurevo's card back to 0 of 8 after the reward" },
      { key: "level", label: "New level", banner: AUREVO_LEVEL_UP, cardAlt: "Aurevo's card at Silver, 1 of 8 stamps" },
    ] satisfies Array<{
      key: "stamp" | "reward" | "redeemed" | "level";
      label: string;
      banner: Banner;
      cardAlt: string;
    }>,
  },
  wallets: {
    eyebrow: "iPhone and Android",
    title: "Push notifications on iPhone and Android.",
    lead: "Apple Wallet and Google Wallet both show them. Your customers download nothing.",
    iphone: "On iPhone",
    android: "On Android",
    icon: {
      title: "Your own icon",
      line: "Upload an icon, or pick one made from your logo.",
    },
    phoneAlts: {
      apple: "An iPhone with Aurevo's loyalty card open in Apple Wallet",
      google: "An Android phone with the same card open in Google Wallet",
    },
  },
  /**
   * The dashboard's message editor, in its words (web's `notifications.editor` and `triggers`): the ready-made
   * text, or your own with variables shown as chips. `{first name}` and `{stamps left}` are the editor's
   * "Customer first name" and "Stamps remaining".
   */
  editor: {
    eyebrow: "Your wording",
    title: "Use our wording or write your own.",
    lead: "Every message comes ready to send. Switch any off, or rewrite it in your words.",
    /** The two-way control over the message. */
    toggle: { label: "Message wording", ready: "Ready-made", own: "Your words" },
    messageLabel: "Message",
    previewLabel: "Preview",
    ready: { text: STAMP_BANNER.body },
    own: { text: "You got stamped, {first name}! {stamps left} more to go.", preview: "You got stamped, Sophie! 3 more to go." },
    /** The messages that can be switched on or off, as the editor names them; the first is the one on screen. */
    switches: ["Stamp collected", "Reward unlocked", "Reward redeemed"],
  },
  demo: {
    eyebrow: "Live demo",
    title: "Try it on your own phone.",
    lead: "Add a sample card to your wallet, add a stamp, and get the notification yourself.",
  },
  band: {
    title: "Every stamp, on their lock screen.",
    accent: "on their lock screen.",
    sub: "Notifications start with your first stamp. Your customers install nothing.",
  } satisfies BandCopy,
} as const;
