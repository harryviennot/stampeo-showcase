import type { CompetitorFacts, SourcedFact } from "../types";

const PRICING = {
  sourceUrl: "https://www.stampme.com/punch-card-app/pricing-plans/",
  sourceTitle: "Stamp Me pricing",
};
const HOME = { sourceUrl: "https://www.stampme.com", sourceTitle: "Stamp Me homepage" };
const HOW = { sourceUrl: "https://www.stampme.com/how-it-works", sourceTitle: "Stamp Me: how it works" };
const PUNCH_CARD_APP = { sourceUrl: "https://www.stampme.com/punch-card-app", sourceTitle: "Stamp Me punch card app" };
const WALLET_BLOG = {
  sourceUrl: "https://www.stampme.com/blog/does-stamp-me-work-with-apple-google-wallet",
  sourceTitle: "Stamp Me blog: does Stamp Me work with Apple and Google Wallet?",
};
const VS_SQUARE = {
  sourceUrl: "https://www.stampme.com/blog/stamp-me-vs-square-loyalty-alternative-usa",
  sourceTitle: "Stamp Me blog: Stamp Me vs Square Loyalty",
};
const help = (path: string, title: string) => ({
  sourceUrl: `https://help.stampme.com/en/articles/${path}`,
  sourceTitle: `Stamp Me help center: ${title}`,
});
const HELP_JOIN = help("6140987-how-do-members-join-a-stamp-card", "how members join a stamp card");
const HELP_PUSH_USES = help("11548094-what-are-the-stamp-me-push-notifications", "push notifications");
const HELP_PUSH_PLANS = help(
  "11548060-which-plans-include-push-notifications-and-sms-messaging",
  "plans with push notifications and SMS",
);
const HELP_BULK_PUSH = help("6192701-how-to-send-bulk-push-notifications", "bulk push notifications");
const HELP_SINGLE_PUSH = help(
  "6192713-how-to-send-a-push-notification-to-a-single-member",
  "a push notification to a single member",
);
const HELP_EXPORT = help("6219913-how-to-view-and-download-member-data", "member data");
const HELP_IMPORT = help("6211233-how-to-bulk-import-contacts-to-stamp-me", "bulk import");
const HELP_INVITE = help("10998921-how-do-i-invite-up-to-500-members", "inviting members");
const HELP_SEARCH = help("6151198-why-can-t-my-business-be-found-via-the-in-app-search", "in-app search");

const READ_ON = "2026-11-04";

const fact = (source: { sourceUrl: string; sourceTitle: string }, id: string, value: string, quote: string): SourcedFact => ({
  id,
  value,
  ...source,
  quote,
  checkedAt: READ_ON,
});

/**
 * Stamp Me on the US page, from the checked rows of `docs/compare/dossiers/stamp-me.md`.
 * Its pages disagree on whether customers can use the card in a browser today,
 * so no fact states it. Its site and its US App Store listing name different
 * languages for the customer app, so `languages` quotes the site, attributed.
 */
export const STAMP_ME: CompetitorFacts = {
  id: "stamp-me",
  name: "Stamp Me",
  website: "https://www.stampme.com",
  markets: {
    us: {
      pricingUrl: "https://www.stampme.com/pricing",
      facts: [
        fact(
          WALLET_BLOG,
          "card.where",
          "In the Stamp Me app. When the business uses Stamp Business, Apple Wallet or Google Wallet can hold the customer's Member Code to show at checkout",
          '"They can then save their unique Member Code to their phone\'s Wallet and show it at checkout."; "Limited — Wallet is used for Member Code access"',
        ),
        fact(
          PRICING,
          "card.wallet_roadmap",
          "wallet-only options as launching soon, making the app download optional",
          "Web app & wallet-only solutions launching soon – making app downloads optional!",
        ),
        fact(
          HELP_JOIN,
          "customer.app_required",
          "Yes: customers download the Stamp Me app and create an account with a few personal details",
          '"Members will first need to download the Stamp Me App."; "Once they have created an account on the App by registering a few basic personal details"',
        ),
        fact(
          VS_SQUARE,
          "program.types",
          "Stamp cards; Stamp Me's blog says it also supports points. Levels: not published",
          "Stamp Me supports both digital punch cards and points.",
        ),
        fact(
          PRICING,
          "program.stamp_cards",
          "two stamp card programs on every plan, with a one-time $15 USD fee for each extra one",
          "Two stamp card programs included. Extras are $15 USD each (one-time) — unlimited customers can join at no extra cost.",
        ),
        fact(
          HELP_PUSH_USES,
          "push.automatic",
          "Not published for each stamp. Its help center lists reward expiry reminders among push message uses (Pro and Elite)",
          "Reward expiry reminders",
        ),
        fact(
          HELP_PUSH_PLANS,
          "push.broadcasts",
          "Push messages and SMS on Pro and Elite, not on Lite. Push messages are free and unlimited; SMS has a small charge per message",
          '"Stamp Me\'s Push Notification and SMS messaging features are available for all Pro and Elite plans."; "They are free and unlimited."; "small charge per message"',
        ),
        fact(
          HELP_BULK_PUSH,
          "push.targeting",
          "members filtered by location and stamp card",
          "select the location and Stamp Card desired then click Show members",
        ),
        fact(
          HELP_SINGLE_PUSH,
          "push.single",
          "a single member",
          "How to send a Push Notification through the Stamp Me App to only one member.",
        ),
        fact(
          PRICING,
          "staff.scanning",
          "StampPod tap device (Pro and Elite), StampTag, OneStamps codes, a Stamp Code, the Stamp Business app or the web Loyalty Portal",
          '"Stamp methods: Merchant Console/Loyalty Portal, Stamp Code, Onestamps, StampTag, StampPod"; "StampPod™" row: crossed out on Lite, ticked on Pro and Elite',
        ),
        fact(
          HOME,
          "staff.pod",
          "a StampPod that sits on the counter and works by tap and go",
          "Our smart StampPod sits on your countertop and works using 'tap & go' technology.",
        ),
        fact(
          HOW,
          "pos.integration",
          "None required: Stamp Me runs without a till connection",
          "There is no software, hardware or point-of-sale integration required.",
        ),
        fact(
          PRICING,
          "integrations",
          "Zapier integrations to mailing and CRM tools, on Pro and Elite",
          '"Integrations" row: crossed out on Lite, ticked on Pro and Elite; tooltip: "Push member data through to your mailing or CRM platforms with a wide range of integrations available through Zapier."',
        ),
        fact(
          PRICING,
          "locations.multiple",
          "One location included on every plan, then $30 USD a month for each extra location",
          "1 included. $30 USD per month fee for each additional location",
        ),
        fact(
          PRICING,
          "price.extra_location",
          "$30 USD a month for each extra location",
          "1 included. $30 USD per month fee for each additional location",
        ),
        fact(
          PUNCH_CARD_APP,
          "languages",
          "The customer app in English, French, Spanish, Portuguese, Swedish and more, per Stamp Me's site",
          "The Stamp Me loyalty app is available in multiple languages, including English, French, Spanish, Portuguese, Swedish & more!",
        ),
        fact(PRICING, "price.entry", "Lite, $49 USD a month", "$49 USD / Month"),
        fact(PRICING, "price.mid", "Pro, $79 USD a month", "$79 USD / Month"),
        fact(PRICING, "price.top", "Elite, $199 USD a month", "$199 USD / Month"),
        fact(PRICING, "price.setup", "no setup costs", "there are no set up costs at all!"),
        fact(
          PRICING,
          "trial",
          "30-day free trial, starting when you publish your first stamp card",
          "Once you publish your first Stamp Card, your 30-day free trial begins",
        ),
        fact(PRICING, "commitment", "None: no lock-in contract, cancel any time", '"No Lock-In Contract" and "Cancel Any Time"'),
        fact(
          HELP_EXPORT,
          "export",
          "Member list download from the Loyalty Portal, with names, email, phone, join date, active stamps and total redemptions",
          "Press purple download icon to the top right hand side of the table to export all data.",
        ),
        fact(
          HOW,
          "designer",
          "Self-service: logo, business details, a custom stamp icon and terms. Stamp Me says a simple card takes about 5 minutes",
          "it can take only 5 minutes to set up and publish a simple Stamp Card program.",
        ),
        fact(PRICING, "team.users", "unlimited users", '"Unlimited users" row: ticked on Lite, Pro and Elite'),
        fact(
          PRICING,
          "games",
          "Scratch & Win games, plus Birthday Club and Lapsed Customers features",
          '"Scratch & Win games", "Birthday Club", "Lapsed Customers" rows: crossed out on Lite, ticked on Pro and Elite',
        ),
        fact(
          PRICING,
          "support",
          "phone support on Pro and Elite, and a dedicated account manager on Elite",
          'Lite: "Support (webchat + email)"; Pro and Elite: "Support (webchat, email + phone)"; "Dedicated account manager" row: ticked on Elite only',
        ),
        fact(
          HELP_IMPORT,
          "customers.import",
          "a bulk import of your contacts by request, without their stamps",
          "we cannot transition stamps",
        ),
        fact(
          HELP_INVITE,
          "customers.invite",
          "email invitations for up to 500 members at a time",
          "How Do I Invite Up to 500 Members?",
        ),
        fact(
          HELP_SEARCH,
          "discovery.in_app",
          "businesses within 100 km of where they are",
          "Users can only find businesses within a 100km radius of their current location.",
        ),
      ],
    },
  },
};
