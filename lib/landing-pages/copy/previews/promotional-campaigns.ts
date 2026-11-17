import { SAMPLE_BUSINESS } from "../shared";
import type { Banner, BandCopy, FaqItem, Fact, HeroCopy, PageMeta } from "../types";

/** The campaign the hero's lock screen and the first idea show. */
const HAPPY_HOUR: Banner = {
  sender: SAMPLE_BUSINESS,
  body: "Quiet afternoon? Your second coffee is half price until 5pm.",
};

/** A campaign a café could send: its name, its sample message on the lock screen, and who gets it. */
interface IdeaCopy {
  key: string;
  name: string;
  body: string;
  banner: Banner;
}

/** The campaigns preview: one message written once, on every customer's card. */
export const PROMOTIONAL_CAMPAIGNS_PREVIEW = {
  meta: {
    title: "Send promotions to customers, no texting fees | Stampeo",
    description:
      "Send a promotion to every customer's phone as a push notification on their loyalty card. An SMS marketing alternative with no fee per message.",
  } satisfies PageMeta,
  hero: {
    h1: "Send a promotion to every customer's phone.",
    accent: "every customer's phone.",
    sub: "Write one message and it appears on every customer's lock screen. No texting fees.",
    /** The second action, to the "how it works" section. */
    secondary: "See how it works",
    alt: "An iPhone lock screen with a notification from Aurevo: Quiet afternoon? Your second coffee is half price until 5pm.",
  } satisfies HeroCopy & { secondary: string; alt: string },
  /** The notification on the hero's lock screen, and the message the "how it works" picture starts from. */
  heroBanner: HAPPY_HOUR,
  /** One message written once, then the same notification on several customers' lock screens. */
  how: {
    eyebrow: "How it works",
    title: "One message on every customer's lock screen.",
    lead: "A campaign is one message you write once. It lands on every customer's card.",
    steps: [
      { title: "Write your message", body: "Type it once in your dashboard, in your own words." },
      { title: "Send it", body: "It goes to every customer who has your card in their wallet." },
      { title: "They see it on their lock screen", body: "A notification from your shop, in Apple Wallet or Google Wallet." },
    ],
    visual: {
      /** The label over the message as the owner wrote it. */
      messageLabel: "Your message",
      /** The label under each customer's lock screen, left to right. */
      phones: ["Sophie's iPhone", "Marc's Android", "Ana's iPhone"],
    },
    alt: "One message written once in the dashboard, and the same notification from Aurevo on three customers' lock screens.",
  },
  texting: {
    eyebrow: "Instead of texting",
    title: "Send promotions without paying per text.",
    lead: "No fee per message, and no limit on how many customers each one reaches.",
    sms: {
      title: "Text messages",
      facts: [
        { text: "A fee for every text you send" },
        { text: "A bigger customer list means a bigger bill" },
        { text: "You need every customer's phone number" },
      ] satisfies Fact[],
    },
    stampeo: {
      title: "Stampeo campaigns",
      facts: [
        { text: "No fee per message" },
        { text: "No limit on how many customers it reaches" },
        { text: "It goes to the card already in their wallet" },
      ] satisfies Fact[],
    },
  },
  ideas: {
    eyebrow: "Ideas to send",
    title: "Give them a reason to come in today.",
    lead: "Four messages a café could send this week. Write your own the same way.",
    rows: [
      { key: "slow-afternoon", name: "Slow afternoon", body: "Sent to everyone.", banner: HAPPY_HOUR },
      {
        key: "something-new",
        name: "Something new",
        body: "Sent to everyone.",
        banner: { sender: SAMPLE_BUSINESS, body: "Pumpkin bread is back today." },
      },
      {
        key: "tonight-only",
        name: "Tonight only",
        body: "Sent to everyone.",
        banner: { sender: SAMPLE_BUSINESS, body: "Live music tonight from 7pm. Come say hi." },
      },
      {
        key: "new-customers",
        name: "New customers",
        body: "Sent only to customers who joined in the last month.",
        banner: { sender: SAMPLE_BUSINESS, body: "Thanks for joining! Your next coffee comes with a free cookie." },
      },
    ] satisfies IdeaCopy[],
  },
  delivery: {
    eyebrow: "After you send",
    title: "See how many customers got it.",
    lead: "Each campaign shows how many customers got it in Apple Wallet and Google Wallet.",
    /**
     * The report of the last campaign, the first idea, in the dashboard's own words (its campaign detail sheet).
     * `deliveryRate` is filled with the share of reachable customers the two wallets reached.
     */
    report: {
      status: "Sent",
      sentAt: "Sent at",
      time: "2:30 PM",
      stats: "Delivery",
      deliveryRate: "{rate}% delivered",
      /** The word under the share inside the ring. */
      rateLabel: "delivered",
      reachable: "reachable",
      sendAgain: "Send again",
      /**
       * What the report is, for a screen reader. It fills `{name}` (the campaign), `{status}`, `{sentAt}`, `{time}`,
       * `{sender}` and `{message}` (the notification), `{stats}`, `{rate}` (the delivery rate line),
       * `{reached}`, `{reachable}` (the count), `{reachableLabel}` and `{counts}` (each wallet's and each miss's count).
       */
      alt: "{name}. {status}, {sentAt} {time}. {sender}: {message} {stats}: {rate}, {reached} / {reachable} {reachableLabel}. {counts}.",
    },
    /** Where it landed, in each wallet; with the two counts it missed, the customers it could reach. */
    delivered: [
      { label: "Apple Wallet", value: 412 },
      { label: "Google Wallet", value: 268 },
    ],
    missed: [
      { label: "Over Google's daily limit", value: 14 },
      { label: "Card removed", value: 22 },
    ],
    after: {
      title: "After every campaign",
      facts: [
        { text: "How many got it, in Apple Wallet and in Google Wallet" },
        { text: "Customers who removed the card, counted apart" },
        { text: "Send it again anytime" },
      ] satisfies Fact[],
    },
  },
  faq: {
    title: "Questions about campaigns",
    /** The words of the second answer that link to the pricing page. */
    pricingLink: "see pricing",
    items: [
      {
        question: "How much does it cost to send a campaign?",
        answer:
          "Nothing per message. Campaigns come with your Stampeo subscription, so you never pay for each message the way you do with texting.",
      },
      {
        question: "Is there a limit on campaigns?",
        answer:
          "No limit on how many customers a campaign reaches: it goes to every customer with your card in their wallet. Your plan sets how many campaigns you can send each month (see pricing).",
      },
      {
        question: "Do my customers need an app or a phone number?",
        answer:
          "No. The message goes to the loyalty card in their Apple Wallet or Google Wallet. They download no app, and you don't need their phone number or email.",
      },
      {
        question: "Is this an alternative to SMS marketing?",
        answer:
          "Yes, for every customer who has your card. The message shows on their lock screen like a text, with no fee per message and no phone numbers to collect.",
      },
      {
        question: "Does it work on iPhone and Android?",
        answer:
          "Yes. Every campaign goes to Apple Wallet and Google Wallet. Google shows up to three notifications per card a day, so a customer who already got three that day won't see this one.",
      },
      {
        question: "Can I write it in more than one language?",
        answer:
          "Yes. Add a translation in English, Spanish, French or Polish, and each customer sees the one that matches their phone.",
      },
    ] satisfies FaqItem[],
  },
  band: {
    title: "Fill your next slow afternoon.",
    accent: "slow afternoon.",
    sub: "Start your free trial and send your first campaign this week.",
  } satisfies BandCopy,
} as const;
