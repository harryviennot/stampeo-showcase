import type { CompetitorFacts } from "../types";
import { factsReadOn } from "./build";

const HOME = { sourceUrl: "https://winstamp.com", sourceTitle: "WinStamp homepage" };
const PRICING = { sourceUrl: "https://winstamp.com/pricing", sourceTitle: "WinStamp pricing" };
const FAQ = { sourceUrl: "https://winstamp.com/faq", sourceTitle: "WinStamp FAQ" };
const TERMS = { sourceUrl: "https://winstamp.com/terms", sourceTitle: "WinStamp terms" };
const CUSTOMER_APP = {
  sourceUrl: "https://apps.apple.com/us/app/-/id1521626266",
  sourceTitle: "WinStamp customer app on the App Store",
};
const BUSINESS_APP = {
  sourceUrl: "https://apps.apple.com/us/app/id1520546750",
  sourceTitle: "WinStamp Business app on the App Store",
};

const fact = factsReadOn("2026-11-04");

/**
 * WinStamp on the US page, from the checked rows of `docs/compare/dossiers/winstamp.md`.
 * Whether its card can go into Apple Wallet or Google Wallet could not be
 * checked, and its pages disagree on removing a stamp given by mistake, so no
 * fact states either.
 */
export const WINSTAMP: CompetitorFacts = {
  id: "winstamp",
  name: "WinStamp",
  website: "https://winstamp.com",
  markets: {
    us: {
      pricingUrl: "https://winstamp.com/pricing",
      facts: [
        fact(
          CUSTOMER_APP,
          "card.where",
          "In the WinStamp app on the customer's phone, alongside cards from other businesses",
          '"All Your Cards in One Place: Easily join loyalty programs from different businesses."; "Track Rewards: Keep an eye on your collected stamps and rewards right within the app."',
          "WinStamp app",
        ),
        fact(
          CUSTOMER_APP,
          "customer.app_required",
          "Yes: customers install the free WinStamp app and show its QR code to collect stamps",
          '"Install the WinStamp app and create your free account."; "Simply show your QR code to participating businesses to receive stamps."',
          "App download",
        ),
        fact(
          BUSINESS_APP,
          "program.types",
          "Stamp cards, with several programs per business; the app's update notes also mention points. Levels: not published",
          '"Customizable Stamp Cards: Set the number of stamps, card color and your stamp image."; "Multi loyalty program support: Now you can add multiple loyalty programs for your company."; "Corrections: You can now remove stamps and points that were given by mistake."',
          "Stamps; levels not published",
        ),
        fact(
          BUSINESS_APP,
          "program.multiple",
          "several loyalty programs in one business",
          "Multi loyalty program support: Now you can add multiple loyalty programs for your company.",
        ),
        fact(
          BUSINESS_APP,
          "rewards.extras",
          "a welcome reward, birthday rewards and a validity period for each program",
          '"Welcome Reward: Greet every new customer with a special reward."; "birthday rewards for your customers"; "Validity Period: Define a validity period for your loyalty programs."',
        ),
        fact(BUSINESS_APP, "feedback", "feedback from customers", "Customer Feedback: You can now receive feedback from your customers."),
        fact(
          FAQ,
          "push.automatic",
          "Not published",
          "Not stated: no notification, notify or push wording on the homepage, the FAQ, the pricing page or either App Store listing",
          "Not published",
        ),
        fact(
          BUSINESS_APP,
          "push.broadcasts",
          "Bulk messages to your customers from the Business app",
          "Bulk Messaging: Easily send messages to your customers.",
          "Bulk messages from the Business app",
        ),
        fact(
          BUSINESS_APP,
          "staff.scanning",
          "The WinStamp Business app on a phone reads the customer's QR code, with no extra hardware. Offline use: not published",
          '"Secure System: Stamps are only added through the business app."; "Fully Mobile: No extra devices or hardware needed - just your phone."',
          "Business app; offline use not published",
        ),
        fact(
          HOME,
          "pos.integration",
          "Not published",
          "Not stated: no POS mention on the homepage, the pricing page or the FAQ",
          "Not published",
        ),
        fact(
          PRICING,
          "locations.multiple",
          "1 location on Basic, up to 5 on Plus, up to 20 on Premium, and a quote beyond 20",
          '"1 Location*", "Up to 5 Locations*", "Up to 20 Locations*"; "Get in touch with our team of experts and get a quote."',
          "Basic 1, Plus 5, Premium 20, then quote",
        ),
        fact(
          BUSINESS_APP,
          "languages",
          "English and 19 more languages in the apps, including Spanish, French, German, Japanese and Polish",
          '"English and 19 more" (the list includes French, German, Japanese, Polish and Spanish)',
          "Apps: English and 19 more",
        ),
        fact(
          PRICING,
          "price.entry",
          "Basic, $9.99 a month, for 1 location",
          '"Basic", "$9.99", "/ month", "1 Location*"',
          "Basic, $9.99/month, 1 location",
        ),
        fact(PRICING, "price.mid", "Plus, $19.99 a month, for up to 5 locations", '"Plus", "$19.99", "/ month", "Up to 5 Locations*"'),
        fact(
          PRICING,
          "price.top",
          "Premium, $29.99 a month, for up to 20 locations",
          '"Premium", "$29.99", "/ month", "Up to 20 Locations*"',
        ),
        fact(
          PRICING,
          "price.scope",
          "the prices shown are for Apple devices in the United States",
          "The prices on this page are valid for Apple devices in the United States.",
        ),
        fact(PRICING, "customers.cap", "unlimited customers and stampings", '"Unlimited Customers", "Unlimited Stampings"'),
        fact(PRICING, "team.users", "unlimited employees and devices", '"Unlimited Employees", "Unlimited Devices"'),
        fact(
          PRICING,
          "trial",
          "7-day free trial, on every plan",
          "All our plans offer a 7-day free trial.",
          "7-day free trial",
        ),
        fact(
          HOME,
          "commitment",
          "None: cancel any time",
          "Cancel anytime without any hidden fees.",
          "None, cancel anytime",
        ),
        fact(
          TERMS,
          "billing.channel",
          "a monthly subscription, managed through Apple or Google in-app purchase",
          "WinStamp requires a monthly subscription, which is managed through in-app purchases.",
        ),
        fact(
          TERMS,
          "refunds",
          "the refund policies of Apple and Google",
          "Refunds for subscriptions are subject to the refund policies of Google and Apple.",
        ),
        fact(
          FAQ,
          "export",
          "Not published",
          "Not stated: none of the FAQ questions covers a data export, and the terms are silent on it",
          "Not published",
        ),
        fact(
          BUSINESS_APP,
          "designer",
          "In the Business app: number of stamps, card color and stamp image",
          "Customizable Stamp Cards: Set the number of stamps, card color and your stamp image.",
          "Business app: stamp count, color, image",
        ),
        fact(
          FAQ,
          "stats.staff",
          "stamps tracked by date and by employee",
          "In the Statistics section of the application, you can track stamps by date and employee.",
        ),
      ],
    },
  },
};
