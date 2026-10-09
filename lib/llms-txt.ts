import { getAllPosts } from "@/lib/blog";
import { BLOG_LOCALES } from "@/lib/blog/locales";
import { FEATURE_SLUGS, getLocalizedSlug } from "@/lib/feature-slugs";
import { LOYALTY_SLUGS } from "@/lib/loyalty-routes";
import { localePath } from "@/lib/hreflang";
import { routing } from "@/i18n/routing";
import { BENCHMARK, sourceLine } from "./benchmark";
import { MARKETS, type Market } from "./markets";
import { PLAN_FACTS, PLAN_NAMES, TIERS, availability, planSummary } from "./plan-facts";
import {
  FALLBACK_PRICING,
  FOUNDING_PRICING,
  formatMoney,
  monthlyEquivalent,
  type Pricing,
} from "./pricing";

/**
 * The `/llms.txt` body.
 *
 * Everything that can drift is derived: pages and articles from the constants
 * the router and the sitemap read (`routing.locales`, `FEATURE_SLUGS`,
 * `LOYALTY_SLUGS`, `BLOG_LOCALES`, the MDX files on disk), plan facts from
 * `lib/plan-facts.ts`, prices from the plan catalog, trial lengths from
 * `MARKETS`, and figures from `lib/benchmark.ts`. The positioning and product
 * prose around them is hand-written.
 */

const BASE_URL = "https://stampeo.app";

/** English names for the locales we serve, for the section headings. */
const LOCALE_NAMES: Record<string, string> = {
  fr: "French",
  en: "English",
  es: "Spanish",
  pl: "Polish",
};

const localeName = (locale: string) =>
  `${LOCALE_NAMES[locale] ?? locale}${locale === routing.defaultLocale ? " (default)" : ""}`;

interface CorePage {
  label: string;
  path: string;
  /** Locales whose slug differs from `path`. */
  paths?: Partial<Record<string, string>>;
  /** Shown once, in the default-locale block. */
  description?: string;
}

/**
 * Mirrors `app/sitemap.ts`. `/programme-fondateur` and `/founding-partner` are
 * deliberately absent from both: the founding program closed and those routes
 * now 308 to `/pricing`.
 */
const CORE_PAGES: CorePage[] = [
  { label: "Homepage", path: "/", description: "product overview and call to action." },
  { label: "Pricing", path: "/pricing", description: "Starter, Growth and Pro tiers." },
  {
    label: "Loyalty programs",
    path: LOYALTY_SLUGS.fr,
    paths: LOYALTY_SLUGS,
    description: "stamp cards vs points programs, and how to choose.",
  },
  { label: "Changelog", path: "/changelog", description: "what shipped, release by release." },
  { label: "About", path: "/about", description: "team, mission, story." },
  { label: "Contact", path: "/contact", description: "email, social, contact form." },
  { label: "Terms of service", path: "/terms" },
  { label: "Privacy policy", path: "/privacy" },
];

/** One line per feature, written once in English; the URL is per locale. */
const FEATURE_DESCRIPTIONS: Record<string, string> = {
  "design-de-carte":
    "card design editor — colors, logo, stamp count, reward messaging.",
  "scanner-mobile":
    "employee QR scanner app (iOS + Android) for adding stamps at the counter.",
  "notifications-push":
    "wallet push notifications triggered at every stamp, reward, or customer return.",
  analytiques: "customer insights — retention, visit frequency, top customers.",
  geolocalisation: `surface the loyalty card on the lock screen when the customer is near the shop${
    PLAN_FACTS.pro.geofencing === "coming_soon" ? " (coming soon)" : ""
  }.`,
  "campagnes-promotionnelles":
    "broadcasts to every cardholder's lock screen, the SMS alternative.",
};

const url = (locale: string, path: string) =>
  `${BASE_URL}${localePath(locale, path === "/" ? "/" : path)}`;

function coreSection(locale: string): string {
  const lines = CORE_PAGES.map((page) => {
    const href = url(locale, page.paths?.[locale] ?? page.path);
    const suffix =
      locale === routing.defaultLocale && page.description
        ? `: ${page.description}`
        : "";
    return `- [${page.label}](${href})${suffix}`;
  });
  return [`### Core — ${localeName(locale)}`, ...lines].join("\n");
}

function featureSection(locale: string): string {
  const isDefault = locale === routing.defaultLocale;
  const lines = FEATURE_SLUGS.map((frSlug) => {
    const slug = getLocalizedSlug(frSlug, locale);
    const href = url(locale, `/features/${slug}`);
    const suffix = isDefault ? `: ${FEATURE_DESCRIPTIONS[frSlug]}` : "";
    return `- [${slug}](${href})${suffix}`;
  });
  return [`### Features — ${localeName(locale)}`, ...lines].join("\n");
}

function blogSection(locale: string): string {
  const posts = [...getAllPosts(locale)].sort((a, b) =>
    a.title.localeCompare(b.title, locale)
  );
  const lines = [
    `- [Blog index](${url(locale, "/blog")})`,
    ...posts.map((post) => `- [${post.title}](${url(locale, `/blog/${post.slug}`)})`),
  ];
  return [`### Blog — ${localeName(locale)}`, ...lines].join("\n");
}

function keyPages(): string {
  const locales = routing.locales;
  return [
    "## Key pages",
    "",
    locales.map(coreSection).join("\n\n"),
    "",
    locales.map(featureSection).join("\n\n"),
    "",
    BLOG_LOCALES.map(blogSection).join("\n\n"),
  ].join("\n");
}

function languages(): string {
  return [
    "## Languages",
    "",
    ...routing.locales.map((locale) => `- ${localeName(locale)}: ${url(locale, "/")}`),
    "",
    "Locales without a blog (currently Polish) have no `/blog` route; their",
    "navigation links to the localized home page instead.",
  ].join("\n");
}

const SOURCE = `(${sourceLine("en")})`;
const pct = (key: keyof typeof BENCHMARK) => `${BENCHMARK[key].value}%`;
const GEOFENCING =
  PLAN_FACTS.pro.geofencing === "coming_soon"
    ? "coming soon"
    : availability((f) => f.geofencing === true);

const INTRO = `# Stampeo

> Digital loyalty cards for Apple Wallet and Google Wallet. No app to download, no card to lose. Built for local businesses — bakeries, cafés, restaurants, hair salons, beauty institutes.

Stampeo is a SaaS platform that helps local businesses create and manage digital loyalty cards. Customers add their card to Apple Wallet or Google Wallet — no app download, no signup, no password. Employees scan QR codes to add stamps, and passes update live via push notifications delivered through the wallet.

## Positioning

- **Who it's for**: independent businesses that want a modern loyalty program without asking customers to download an app.
- **Problem it solves**: paper cards get lost or forgotten, and customers rarely install a dedicated loyalty app for one shop.
- **How it's different**: the card lives in Apple Wallet / Google Wallet, which are already installed on every modern smartphone. No app build, no app store, no account creation.
- **What we see**: ${pct("walletAddRate")} of customers who join add the card to their wallet, ${pct("installedDay30")} of cards are still there 30 days later, and ${pct("return30")} of customers come back within 30 days ${SOURCE}.`;

const PRODUCT = `## Product

### How it works
1. Business signs up and designs a card in the dashboard (colors, logo, stamp count, reward).
2. The business prints or displays a QR code at the counter.
3. Customers scan the QR code — the card is added to Apple Wallet / Google Wallet in about ten seconds. No app download, no account, no password.
4. Employees use the Stampeo scanner app (iOS / Android) to scan the customer's pass and add a stamp.
5. The pass updates live via push notification ("+1 stamp", "reward earned"). Customers see the updated card on their lock screen.
6. After N stamps, the customer earns a reward, claimed at the counter on their next visit.

### Loyalty mechanics
- **Stamps** (classic stamp card) or **points** (spend-based): each business runs one program, stamps or points, on ${availability((f) => f.loyaltyTypes.length > 1)}.
- **Milestone rewards**: trigger a reward at arbitrary stamp counts (e.g. welcome bonus at 1, surprise gift at 5, main reward at 10). ${PLAN_FACTS.growth.milestoneNotifications} custom milestones per program on Growth, unlimited on Pro.
- **Automatic notifications** on every stamp, milestone, and reward unlock — delivered through Apple Wallet / Google Wallet push, no app required.
- **Geofencing notifications** (${GEOFENCING}): surface the card on the lock screen when the customer is near the shop.

### Promotional campaigns (broadcasts): ${availability((f) => f.broadcastsPerMonth !== 0)}
Promotional campaigns are one-off push notifications sent straight to customers' Apple Wallet and Google Wallet — the marketing-channel alternative to SMS and email.

- **Reach**: broadcast to all loyalty-card holders, or segment.
- **Cost**: included in the plan, with no per-message fee and no SMS carrier fees.
- **Quotas**: Growth = ${PLAN_FACTS.growth.broadcastsPerMonth} campaigns / month. Pro = unlimited.
- **Segmentation**:
  - Growth: basic (enrollment date).
  - Pro: advanced — by stamp count, last redemption, inactivity window, recent signups.
- **Scheduling** (${availability((f) => f.scheduledBroadcasts)}): pick a local send time with timezone awareness — Thursday 5pm, Saturday noon, etc. Other plans send immediately.
- **Multilingual delivery**: write the copy once per language you serve; each customer receives the language their device is set to. Single send, not one per language.
- **Delivery transparency**: per-campaign breakdown showing Apple-delivered vs Google-delivered vs throttled vs uninstalled. No inflated rates.
- **Consent**: handled at pass install — no double opt-in flow like SMS / email.
- **Use cases**: flash promos, new-product launches, happy hours, seasonal offers, weekend openings, "first 30 buyers get a free pastry" style drops.

### Analytics
The dashboard answers the questions paper cards can't: who comes back, how often, what works.

**Basic analytics (every plan)**:
- Total registered customers.
- Scans this week / this month.
- Rewards claimed.
- Instant customer search by name or email with full visit history.
- Live activity feed (stamps, rewards, signups in real time).

**${availability((f) => f.employeeTracking)} add**:
- Peak hours and weekly trends.
- Employee scan tracking: which team member made each scan.

**Advanced analytics (${availability((f) => f.analytics === "advanced")})**:
- 30-day retention rate, visit frequency and redemption stats.
- Customer segments (New / Occasional / Regular / VIP) and at-risk customers (inactive 30+ days).
- Average time to complete a card, completion rate, post-reward return rate.
- Per-location analytics (${availability((f) => f.locationAnalytics)}).

### Integrations & platforms
- **Apple Wallet** (iOS, via signed .pkpass files and Apple Push Notification service).
- **Google Wallet** (Android).
- **Scanner app**: Expo / React Native, runs on any iPhone or Android device. Needs a connection to add stamps; offline scanning is coming soon.
- **Business dashboard**: web app, works on desktop and mobile.

### Compliance
- GDPR-compliant (data hosted in the EU, minimal customer data collected — typically just a phone number or email, never required).
- Customers can be anonymous: a loyalty card can work with nothing more than a device token.`;

/** Every plan's facts, from `lib/plan-facts.ts`. */
function plans(): string {
  return [
    "## Plans",
    "",
    "Three plans. Unlimited customers and unlimited scans on every plan.",
    "",
    ...TIERS.map((tier) => `- **${PLAN_NAMES[tier]}**: ${planSummary(tier)}.`),
  ].join("\n");
}

interface PriceBlock {
  heading: string;
  market: Market;
  pricing: Pricing;
  links: string[];
}

/** One market's ladder, in its own currency, with its own trial length. */
function priceBlock({ heading, market, pricing, links }: PriceBlock): string {
  const money = (amount: number) => formatMoney(amount, pricing.currency, "en");
  const trialDays = MARKETS[market].trialDays;
  const monthly = TIERS.map(
    (tier) => `- **${PLAN_NAMES[tier]}**: ${money(pricing.tiers[tier].month)} / month`
  );
  const perMonth = TIERS.map((tier) => money(monthlyEquivalent(pricing.tiers[tier].year)));
  const perYear = TIERS.map((tier) => money(pricing.tiers[tier].year));
  return [
    `### ${heading}`,
    "",
    ...monthly,
    `- Yearly billing is ${FOUNDING_PRICING.yearlyDiscountPercent}% off: ${perMonth.join(" / ")} per month, billed ${perYear.join(" / ")} a year.`,
    `- ${trialDays}-day free trial on every plan. A card is required to start the trial but is not charged until the ${trialDays} days are up.`,
    ...links.map((link) => `- ${link}`),
  ].join("\n");
}

function pricingSection(ladders: { eur: Pricing; usd: Pricing }): string {
  return [
    "## Pricing",
    "",
    "Prices depend on where the business is: euros in Europe and the rest of the world, dollars in the United States.",
    "",
    priceBlock({
      heading: "Europe and rest of the world (EUR)",
      market: "int",
      pricing: ladders.eur,
      links: [`Pricing page: [/pricing](${BASE_URL}/pricing) (also /en/pricing, /es/pricing, /pl/pricing)`],
    }),
    "",
    priceBlock({
      heading: "United States (USD)",
      market: "us",
      pricing: ladders.usd,
      links: [
        `US landing page: [/us](${BASE_URL}/us)`,
        `US pricing page: [/us/pricing](${BASE_URL}/us/pricing)`,
      ],
    }),
  ].join("\n");
}

const FAQ = `## FAQ (condensed)

- **Is there a free trial?** Yes, on every plan: ${MARKETS.int.trialDays} days in Europe and the rest of the world, ${MARKETS.us.trialDays} days in the United States. A card is required to start the trial, but nothing is charged until the trial ends. Cancel anytime.
- **Can I switch plans?** Yes, at any time. Upgrades take effect immediately; downgrades at the end of the billing cycle.
- **Are there per-customer charges?** No. Every plan includes unlimited customers and unlimited scans.
- **Do customers need to download an app?** No. Apple Wallet and Google Wallet are pre-installed on every modern smartphone. Customers scan a QR code and the card is saved in about ten seconds.
- **What if a customer loses their phone?** Stamps are stored on the server, not only on the device. The customer restores the card on their new phone and keeps their progress.
- **Can customers cheat by adding their own stamps?** No. Only the business's scanner app can write stamps to a pass. Customers can't modify their own card.
- **Does it work offline?** Installed cards open without a network connection. The scanner app needs one to add stamps; offline scanning is coming soon.
- **Does it work on Android?** Yes, via Google Wallet. Stampeo auto-detects the device and serves the right format from a single QR code.
- **Stamps or points?** Either, on ${availability((f) => f.loyaltyTypes.length > 1)}. Each business runs one program and picks stamps or points for it.
- **How is this different from paper cards?** Paper cards get lost or forgotten; digital wallet passes stay on the phone, update live, and give the business real customer data (visit frequency, retention, top customers).
- **How is this different from a dedicated loyalty app?** Customers have nothing to download: ${pct("walletAddRate")} of customers who join add the card to their wallet, and ${pct("installedDay90")} of cards are still there after 90 days ${SOURCE}.`;

const MACHINE_READABLE = `## Machine-readable versions

Every page on stampeo.app supports markdown content negotiation.

- Send \`Accept: text/markdown\` to any eligible page URL to receive a markdown representation instead of HTML.
- Response headers include \`Content-Type: text/markdown; charset=utf-8\`, \`Vary: accept\` (to prevent cache poisoning), and \`x-markdown-tokens: <estimated token count>\`.
- Default browser requests (\`Accept: text/html\`) still return the full HTML page.
- AI content preferences are declared in [robots.txt](https://stampeo.app/robots.txt) via \`Content-Signal: ai-train=yes, search=yes, ai-input=yes\`.`;

const CONTACT = `## Contact

- Email: contact@stampeo.app
- X / Twitter: https://x.com/stampeo_app
- LinkedIn: https://linkedin.com/company/stampeo
- Instagram: https://instagram.com/stampeo.app`;

/**
 * The full `/llms.txt` body, ending with a newline. Prices come from the plan
 * catalog the route fetches; without one, the baked ladder.
 */
export function buildLlmsTxt(
  ladders: { eur: Pricing; usd: Pricing } = {
    eur: FALLBACK_PRICING.eur,
    usd: FALLBACK_PRICING.usd,
  }
): string {
  const localeList = routing.locales.map(localeName).join(", ");
  const intro = `${INTRO}\n- **Languages**: ${localeList}.`;

  return (
    [
      intro,
      keyPages(),
      PRODUCT,
      plans(),
      pricingSection(ladders),
      FAQ,
      MACHINE_READABLE,
      languages(),
      CONTACT,
    ].join("\n\n") + "\n"
  );
}
