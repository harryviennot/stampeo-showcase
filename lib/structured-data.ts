const BASE_URL = "https://stampeo.app";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Stampeo",
    url: BASE_URL,
    logo: `${BASE_URL}/icon-512.png`,
    description:
      "Digital loyalty cards for Apple Wallet and Google Wallet. Empowering local businesses with modern customer retention tools.",
    sameAs: [
      "https://x.com/stampeo_app",
      "https://linkedin.com/company/stampeo",
      "https://instagram.com/stampeo.app",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@stampeo.app",
      contactType: "customer support",
      availableLanguage: ["French", "English"],
    },
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Stampeo",
    url: BASE_URL,
    inLanguage: ["fr", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/blog?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "h2", "[data-speakable]"],
    },
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Stampeo",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: [
      {
        "@type": "Offer",
        name: "Pay",
        price: "14.99",
        priceCurrency: "EUR",
        description:
          "1 card template, unlimited customers & scans, up to 3 team members, push notifications.",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "29.99",
        priceCurrency: "EUR",
        description:
          "Multiple card templates, unlimited team members, multi-location support, advanced analytics, scheduled campaigns.",
      },
    ],
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

export function articleJsonLd(article: {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  coverImage?: string;
  slug: string;
  locale: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: article.coverImage
      ? `${BASE_URL}${article.coverImage}`
      : `${BASE_URL}/og-image.png`,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Stampeo",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/icon-512.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}${article.locale === "fr" ? "" : `/${article.locale}`}/blog/${article.slug}`,
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".article-summary", "[data-speakable]"],
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
