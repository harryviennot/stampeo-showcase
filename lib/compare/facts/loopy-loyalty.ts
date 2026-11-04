import type { CompetitorFacts, SourcedFact } from "../types";

const HOME = { sourceUrl: "https://loopyloyalty.com", sourceTitle: "Loopy Loyalty homepage" };
const PRICING = { sourceUrl: "https://loopyloyalty.com/pricing", sourceTitle: "Loopy Loyalty pricing" };
const HELP = {
  sourceUrl: "https://docs.loopyloyalty.com/en/articles/11142679-loopy-loyalty-your-digital-stamp-card-solution",
  sourceTitle: "Loopy Loyalty help center: your digital stamp card solution",
};
const STAMPER = {
  sourceUrl: "https://loopyloyalty.com/features/stamper-app/",
  sourceTitle: "Loopy Loyalty Stamper app",
};
const POS_BLOG = {
  sourceUrl: "https://loopyloyalty.com/blog/cost-effective-pos-linked-loyalty-programs-for-cafes-1f0254f334cc/",
  sourceTitle: "Loopy Loyalty blog: POS-linked loyalty programs for cafes",
};
const APP_STORE = { sourceUrl: "https://apps.apple.com/app/id945301614", sourceTitle: "Stamper app on the App Store" };

const READ_ON = "2026-11-04";

const fact = (source: { sourceUrl: string; sourceTitle: string }, id: string, value: string, quote: string): SourcedFact => ({
  id,
  value,
  ...source,
  quote,
  checkedAt: READ_ON,
});

/** Loopy Loyalty on the US page, from the checked rows of `docs/compare/dossiers/loopy-loyalty.md`. */
export const LOOPY_LOYALTY: CompetitorFacts = {
  id: "loopy-loyalty",
  name: "Loopy Loyalty",
  website: "https://loopyloyalty.com",
  markets: {
    us: {
      pricingUrl: "https://loopyloyalty.com/pricing",
      facts: [
        fact(
          HOME,
          "card.where",
          "Apple Wallet and Google Wallet, on the customer's phone",
          '"Digital stamp cards for Apple & Google Wallet"; FAQ: "customers can add the card to Apple Wallet or Google Wallet"',
        ),
        fact(
          HOME,
          "customer.app_required",
          "None: no app to download",
          "Reward repeat visits, capture data, and message customers — no app required.",
        ),
        fact(
          HELP,
          "program.types",
          "Stamp cards. For points-based programs with advanced features, Loopy's help center refers to a separate, more advanced product. Levels: not published",
          "Loopy Loyalty offers digital stamp cards; for points-based systems with advanced features, visit PassKit.",
        ),
        fact(
          HOME,
          "push.automatic",
          "Yes: reward notifications and expiry reminders can be automated, and every stamp or reward updates the card",
          '"Automate customer messages, expiry reminders and reward notifications"; "Every stamp or reward updates the card in your customer\'s wallet"',
        ),
        fact(
          PRICING,
          "push.broadcasts",
          "Unlimited push messages, on every plan",
          '"Unlimited Push Messages" row: ticked on Starter, Growth and Ultimate',
        ),
        fact(
          HELP,
          "push.targeting",
          "messages to all customers, a segment or a single customer",
          "You can target all customers, specific segments, or even individuals.",
        ),
        fact(
          PRICING,
          "geofence",
          "location-based messages (geo-fencing), on every plan",
          '"Location-Based Messages (Geo-Fencing)" row: ticked on Starter, Growth and Ultimate',
        ),
        fact(
          STAMPER,
          "staff.scanning",
          "The Stamper app on iOS and Android scans the card with the phone's camera. Offline use: not published",
          '"Scan digital stamp cards using your phone\'s camera"; "Works online with changes synced instantly"; "Works on iOS and Android with no POS integration."',
        ),
        fact(
          PRICING,
          "remote.issue",
          "remote stamping from a web stamper, on every plan",
          '"Remote Stamping / Web Stamper" row: ticked on Starter, Growth and Ultimate',
        ),
        fact(
          PRICING,
          "team.users",
          "up to 3 Stamper app users on Starter, 10 on Growth and 50 on Ultimate",
          '"Number of Stamper App Users": "Up to 3" / "Up to 10" / "Up to 50"',
        ),
        fact(
          POS_BLOG,
          "pos.integration",
          "Can be linked to till (POS) workflows through Square, Zapier, Make or the API, per Loopy's blog",
          "linked to POS workflows through Square, Zapier, Make, or the API",
        ),
        fact(
          PRICING,
          "integrations",
          "Zapier and Make, plus developer API access, on every plan",
          '"No-Code Integration (via Zapier/Make)" and "Developer API Access" rows: ticked on Starter, Growth and Ultimate',
        ),
        fact(HOME, "customers.import", "importing existing customers through Make", "Use Make to import existing customers and issue their cards"),
        fact(
          PRICING,
          "locations.multiple",
          "1 location on Starter, 3 on Growth, 10 on Ultimate",
          '"Maximum Locations Supported": "1 Location" / "3 Locations" / "10 Locations"',
        ),
        fact(
          PRICING,
          "languages",
          "Not published for the card or the dashboard",
          "Not stated: no mention of languages or translation on the pricing page or the homepage",
        ),
        fact(
          APP_STORE,
          "languages.staff_app",
          "14 languages, including English, Spanish and French",
          "Languages: English, Arabic, Cambodian, Dutch, Filipino, French, German, Italian, Japanese, Korean, Portuguese, Spanish, Thai, Traditional Chinese",
        ),
        fact(PRICING, "price.entry", "Starter, $25 a month", 'Starter "$ 25 / mo"'),
        fact(PRICING, "price.mid", "Growth, $69 a month", 'Growth "$ 69 / mo"'),
        fact(PRICING, "price.top", "Ultimate, $95 a month", 'Ultimate "$ 95 / mo"'),
        fact(PRICING, "customers.cap", "unlimited customers on every plan", '"Number of Customers": "Unlimited"'),
        fact(
          PRICING,
          "trial",
          "15-day free trial",
          "Try Loopy Loyalty free for 15 days. If you cancel within the trial, your card will not be charged.",
        ),
        fact(
          PRICING,
          "commitment",
          "None: cancel any time from your account settings; the plan stays active until the end of the billing period",
          "You can cancel your subscription at any time from your account settings. Your plan will remain active until the end of the current billing period.",
        ),
        fact(
          PRICING,
          "refunds",
          "no refunds for subscriptions or renewal charges",
          "Loopy Loyalty does not offer refunds for subscriptions or renewal charges.",
        ),
        fact(
          PRICING,
          "cancel.data",
          "the account and all its loyalty cards are scheduled for deletion",
          "your account and all associated loyalty cards are scheduled for deletion",
        ),
        fact(
          PRICING,
          "export",
          "On Ultimate only: data export as CSV or spreadsheet",
          '"Data Export (CSV/Spreadsheet)" row and "Data export" on the plan cards: crossed out on Starter and Growth, ticked on Ultimate',
        ),
        fact(
          HOME,
          "designer",
          "Self-service web designer: your logo, colors and rewards, with a preview in Apple Wallet and Google Wallet",
          "add your logo, colours, and rewards, and preview it in Apple and Google Wallet",
        ),
      ],
    },
  },
};
