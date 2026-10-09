import { routing } from "@/i18n/routing";
import { interpolatePricing, type Pricing } from "./pricing";
import { PLAN_NAMES, TIERS, planSummary } from "./plans/plan-facts";

const BASE_URL = "https://stampeo.app";
const ORGANIZATION_ID = `${BASE_URL}/#organization`;

/** The default locale is unprefixed, every other locale is `/{locale}`. */
const localePrefix = (locale: string) =>
  locale === routing.defaultLocale ? "" : `/${locale}`;

const FOUNDER = {
  "@type": "Person",
  name: "Harry Viennot",
  url: `${BASE_URL}/about`,
} as const;

/** Profiles the site already links to (Footer, contact page, scanner store badges). */
const SAME_AS = [
  "https://x.com/stampeo_app",
  "https://linkedin.com/company/stampeo",
  "https://instagram.com/stampeo.app",
  "https://apps.apple.com/app/id6761758382",
  "https://play.google.com/store/apps/details?id=com.hryvnt.stampeo",
];

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: "Stampeo",
    url: BASE_URL,
    logo: `${BASE_URL}/icon-512.png`,
    description:
      "Digital loyalty cards for Apple Wallet and Google Wallet. Empowering local businesses with modern customer retention tools.",
    founder: FOUNDER,
    sameAs: SAME_AS,
    contactPoint: {
      "@type": "ContactPoint",
      email: "contact@stampeo.app",
      contactType: "customer support",
      availableLanguage: ["French", "English", "Spanish", "Polish"],
    },
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    name: "Stampeo",
    url: BASE_URL,
    inLanguage: [...routing.locales],
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/** What a plan includes, from the plan facts. */
const offerDescription = (tier: (typeof TIERS)[number]) =>
  `Unlimited customers and scans, ${planSummary(tier)}.`;

export function softwareApplicationJsonLd(pricing: Pricing) {
  // No Offer block when the amounts are the baked fallback: structured data is
  // machine-read and indexed, so a stale price there outlives the outage. A
  // SoftwareApplication with no offers is valid; a wrong price is not.
  const offers = pricing.isFallback
    ? undefined
    : TIERS.flatMap((tier) =>
        (["month", "year"] as const).map((interval) => ({
          "@type": "Offer",
          name: interval === "year" ? `${PLAN_NAMES[tier]} (annual)` : PLAN_NAMES[tier],
          price: String(pricing.tiers[tier][interval]),
          priceCurrency: pricing.currency.toUpperCase(),
          description:
            interval === "year"
              ? `${PLAN_NAMES[tier]} billed yearly: ${offerDescription(tier)}`
              : offerDescription(tier),
        })),
      );

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${BASE_URL}/#software`,
    name: "Stampeo",
    url: BASE_URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    ...(offers ? { offers } : {}),
    description:
      "Digital loyalty card platform for local businesses. Create Apple Wallet and Google Wallet passes in minutes.",
  };
}

export function faqPageJsonLd(
  items: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/**
 * The pricing page FAQ for one market, price and trial tokens resolved with
 * that market's ladder. Structured data is read per URL, so it never follows
 * the visitor's region the way the visible FAQ does.
 */
export function pricingFaqJsonLd(
  items: Array<{ question: string; answer: string }>,
  pricing: Pricing,
  locale: string,
  trialDays: number,
) {
  const resolve = (text: string) => interpolatePricing(text, pricing, locale, trialDays);
  return faqPageJsonLd(
    items.map((item) => ({ question: resolve(item.question), answer: resolve(item.answer) })),
  );
}

export function articleJsonLd(article: {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  /** The display byline. The structured-data author is always the founder. */
  author?: string;
  coverImage?: string;
  slug: string;
  locale: string;
}) {
  const url = `${BASE_URL}${localePrefix(article.locale)}/blog/${article.slug}`;
  // The post's opengraph-image route: one share image per post, in every locale.
  const shareImage = `${url}/opengraph-image`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: article.coverImage ? [shareImage, `${BASE_URL}${article.coverImage}`] : shareImage,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: FOUNDER,
    publisher: { "@id": ORGANIZATION_ID },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}

export function collectionPageJsonLd(collection: {
  name: string;
  description: string;
  locale: string;
  posts: Array<{
    title: string;
    description: string;
    slug: string;
    publishedAt: string;
  }>;
}) {
  const prefix = localePrefix(collection.locale);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.name,
    description: collection.description,
    url: `${BASE_URL}${prefix}/blog`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: collection.posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${BASE_URL}${prefix}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}
