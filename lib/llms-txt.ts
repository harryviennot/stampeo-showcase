import { getAllPosts } from "@/lib/blog";
import { BLOG_LOCALES } from "@/lib/blog/locales";
import { FEATURE_SLUGS, getLocalizedSlug } from "@/lib/feature-slugs";
import { LOYALTY_SLUGS } from "@/lib/loyalty-routes";
import { localePath } from "@/lib/hreflang";
import { routing } from "@/i18n/routing";

/**
 * The `/llms.txt` body.
 *
 * This used to be a hand-maintained `public/llms.txt`. It rotted: it still
 * claimed the site spoke "French (default) and English" long after Spanish
 * shipped, listed 12 of French's 16 articles and 5 of English's 10, and had no
 * Spanish or Polish URLs at all.
 *
 * So everything that can drift is derived from the same constants the router
 * and the sitemap already read (`routing.locales`, `FEATURE_SLUGS`,
 * `LOYALTY_SLUGS`, `BLOG_LOCALES`, the MDX files on disk). A new locale or a
 * new article now shows up here on its own. The prose below (positioning,
 * product, pricing, FAQ) is genuinely hand-written and stays hand-written.
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
 * now 307 to `/pricing`.
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
  geolocalisation:
    "surface the loyalty card on the lock screen when the customer is near the shop.",
  "campagnes-promotionnelles":
    "targeted broadcasts — the SMS alternative with ~85% read-through.",
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

const INTRO = `# Stampeo

> Digital loyalty cards for Apple Wallet and Google Wallet. No app to download, no card to lose. Built for local businesses — bakeries, cafés, restaurants, hair salons, beauty institutes.

Stampeo is a SaaS platform that helps local businesses create and manage digital loyalty cards. Customers add their card to Apple Wallet or Google Wallet — no app download, no signup, no password. Employees scan QR codes to add stamps, and passes update live via push notifications delivered through the wallet.

## Positioning

- **Who it's for**: independent businesses that want a modern loyalty program without asking customers to download an app.
- **Problem it solves**: paper cards get lost or forgotten (~45% of paper-card holders don't present them); dedicated loyalty apps fail — 95% of users abandon a new app within a month.
- **How it's different**: the card lives in Apple Wallet / Google Wallet, which are already installed on every modern smartphone. Retention on wallet passes is above 90%. No app build, no app store, no account creation.`;

const PRODUCT = `## Product

### How it works
1. Business signs up and designs a card in the dashboard (colors, logo, stamp count, reward).
2. The business prints or displays a QR code at the counter.
3. Customers scan the QR code — the card is added to Apple Wallet / Google Wallet in about ten seconds. No app download, no account, no password.
4. Employees use the Stampeo scanner app (iOS / Android) to scan the customer's pass and add a stamp.
5. The pass updates live via push notification ("+1 stamp", "reward earned"). Customers see the updated card on their lock screen.
6. After N stamps, the customer earns a reward, claimed at the counter on their next visit.

### Loyalty mechanics
- **Stamps** (classic stamp card) or **points** (spend-based) — choose one per program on Growth and above.
- **Milestone rewards**: trigger a reward at arbitrary stamp counts (e.g. welcome bonus at 1, surprise gift at 5, main reward at 10). 3 custom milestones per program on Growth, unlimited on Pro.
- **Automatic notifications** on every stamp, milestone, and reward unlock — delivered through Apple Wallet / Google Wallet push, no app required.
- **Geofencing notifications** (Pro): surface the card on the lock screen when the customer is near the shop.

### Promotional campaigns (broadcasts) — Growth / Pro
Promotional campaigns are one-off push notifications sent straight to customers' Apple Wallet and Google Wallet — the marketing-channel alternative to SMS and email.

- **Reach**: broadcast to all loyalty-card holders, or segment.
- **Open rate**: ~85% (lock-screen banner), vs ~20% for email and ~35% click-through for SMS.
- **Cost**: included in the plan — €0 per message. No SMS carrier fees (€0.04–€0.10 per SMS in France).
- **Quotas**: Growth = 8 campaigns / month. Pro = unlimited.
- **Segmentation**:
  - Growth: basic (enrollment date).
  - Pro: advanced — by stamp count, last redemption, inactivity window, recent signups.
- **Scheduling** (Pro): pick a local send time with timezone awareness — Thursday 5pm, Saturday noon, etc. Growth sends immediately.
- **Multilingual delivery**: write the copy once per language you serve; each customer receives the language their device is set to. Single send, not one per language.
- **Delivery transparency**: per-campaign breakdown showing Apple-delivered vs Google-delivered vs throttled vs uninstalled. No inflated rates.
- **Consent**: handled at pass install — no double opt-in flow like SMS / email.
- **Use cases**: flash promos, new-product launches, happy hours, seasonal offers, weekend openings, "first 30 buyers get a free pastry" style drops.

### Analytics — all plans; advanced on Growth / Pro
The dashboard answers the questions paper cards can't: who comes back, how often, what works.

**Starter (basic dashboard — every plan)**:
- Total registered customers.
- Scans this week / this month.
- Rewards claimed.
- Instant customer search by name or email with full visit history.
- Live activity feed (stamps, rewards, signups in real time).

**Growth (trends & retention layer)**:
- Scans per week with trend (e.g. "+23% WoW").
- Peak-hours heatmap (day × hour of the week) to spot slow periods and staffing needs.
- 30-day retention rate.
- Customer segments (New / Occasional / Regular / VIP).
- At-risk customers (inactive 30+ days) — surface before they churn.
- Most-active days of the week.
- Average time to complete a card, completion rate, post-reward return rate (did they start a second card).

**Pro (everything in Growth, plus)**:
- Per-location analytics (multi-location accounts).
- Employee scan tracking.
- Advanced segmentation (same filters that drive broadcast targeting).

### Integrations & platforms
- **Apple Wallet** (iOS, via signed .pkpass files and Apple Push Notification service).
- **Google Wallet** (Android).
- **Scanner app**: Expo / React Native, runs on any iPhone or Android device. Supports offline scanning.
- **Business dashboard**: web app, works on desktop and mobile.

### Team & multi-location
- Starter: 2 team members (owner + 1), single location, 1 active card template.
- Growth: unlimited team members, single location, 1 active card template (unlimited saved templates).
- Pro: unlimited team members, multi-location with per-location analytics, multiple active card templates.

### Compliance
- GDPR-compliant (data hosted in the EU, minimal customer data collected — typically just a phone number or email, never required).
- Customers can be anonymous: a loyalty card can work with nothing more than a device token.`;

const PRICING = `## Pricing

Three tiers. Unlimited customers and unlimited scans on every plan. 30-day free trial; a card is required to start the trial but is not charged until the 30 days are up.

- **Starter — €20 / month**: 1 active card template, unlimited customers & scans, 2 team members (owner + 1), automatic push notifications (predefined text), basic dashboard & stats, email support.
- **Growth — €40 / month**: everything in Starter, plus stamps or points (choose one), unlimited team members, custom notification messages, 8 broadcast campaigns per month, 3 custom milestones per program, basic segmentation (date-based), trends & analytics.
- **Pro — €60 / month**: everything in Growth, plus multiple active card templates, multi-location with per-location analytics, geofencing notifications, unlimited broadcast campaigns, advanced segmentation (by stamps, inactivity, redemptions), unlimited custom milestones, advanced analytics & retention, priority email support.

Yearly billing is 20% off (€16 / €32 / €48 per month, billed for the year).`;

const FAQ = `## FAQ (condensed)

- **Is there a free trial?** Yes — 30-day free trial on every plan. A card is required to start the trial, but nothing is charged until the 30 days are up. Cancel anytime.
- **Can I switch plans?** Yes, at any time. Upgrades take effect immediately; downgrades at the end of the billing cycle.
- **Are there per-customer charges?** No. Every plan includes unlimited customers and unlimited scans.
- **Do customers need to download an app?** No. Apple Wallet and Google Wallet are pre-installed on every modern smartphone. Customers scan a QR code and the card is saved in about ten seconds.
- **What if a customer loses their phone?** Stamps are stored on the server, not only on the device. The customer restores the card on their new phone and keeps their progress.
- **Can customers cheat by adding their own stamps?** No. Only the business's scanner app can write stamps to a pass. Customers can't modify their own card.
- **Does it work offline?** Yes. The scanner app supports offline stamping, and installed passes stay accessible without a network connection.
- **Does it work on Android?** Yes, via Google Wallet. Stampeo auto-detects the device and serves the right format from a single QR code.
- **Stamps or points?** Either. Starter is stamps-only; Growth lets you pick stamps or points per program; Pro supports both and multiple programs in parallel.
- **How is this different from paper cards?** Paper cards get lost or forgotten; digital wallet passes stay on the phone, update live, and give the business real customer data (visit frequency, retention, top customers).
- **How is this different from a dedicated loyalty app?** Dedicated apps fail — 95% of users abandon a new app within a month. Wallet passes don't require a download, so adoption and retention are much higher.`;

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

/** The full `/llms.txt` body, ending with a newline. */
export function buildLlmsTxt(): string {
  const localeList = routing.locales.map(localeName).join(", ");
  const intro = `${INTRO}\n- **Languages**: ${localeList}.`;

  return (
    [intro, keyPages(), PRODUCT, PRICING, FAQ, MACHINE_READABLE, languages(), CONTACT].join(
      "\n\n"
    ) + "\n"
  );
}
