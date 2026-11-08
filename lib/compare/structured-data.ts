import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webSiteJsonLd } from "../structured-data";
import { comparisonPath } from "./content";
import type { ComparisonPage, Market } from "./types";

const HOME: Record<Market, { name: string; path: string; inLanguage: string }> = {
  us: { name: "Home", path: "/us", inLanguage: "en-US" },
  fr: { name: "Accueil", path: "/", inLanguage: "fr" },
};

/**
 * The structured data of a comparison page, as separate JSON-LD nodes: the
 * page itself (a WebPage dated by the check date, written and published by
 * Stampeo), its breadcrumb, the FAQ from the frontmatter, and Stampeo's
 * organization so the page's author resolves on the page. It never describes
 * the competitor: no Product, Review, AggregateRating or organization of theirs.
 */
export function comparisonJsonLd(page: ComparisonPage, checkedAt: string): Array<Record<string, unknown>> {
  const organization = organizationJsonLd();
  const url = `${organization.url}${comparisonPath(page)}`;
  const home = HOME[page.market];

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": url,
      url,
      name: page.title,
      description: page.description,
      inLanguage: home.inLanguage,
      dateModified: checkedAt,
      isPartOf: { "@id": webSiteJsonLd()["@id"] },
      author: { "@id": organization["@id"] },
      publisher: { "@id": organization["@id"] },
    },
    breadcrumbJsonLd([
      { name: home.name, url: home.path },
      { name: page.title, url: comparisonPath(page) },
    ]),
    faqPageJsonLd(page.faqs),
    organization,
  ];
}
