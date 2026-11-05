import { describe, expect, it } from "bun:test";
import { MARKETS } from "../../markets";
import { pageOpenGraph } from "../../og/metadata";
import { fixturePage } from "../__fixtures__";
import { comparisonMetadata, comparisonOpenGraphPage } from "./metadata";

const metadata = (slug: string) => {
  const page = fixturePage(slug);
  return comparisonMetadata(page, pageOpenGraph(comparisonOpenGraphPage(page)));
};

describe.each([
  ["a US page", "acme-loyalty", "https://stampeo.app/us/vs/acme-loyalty", "en_US"],
  ["a FR page", "acme-fidelite", "https://stampeo.app/comparatif/acme-fidelite", "fr_FR"],
])("the metadata of %s", (_name, slug, canonical, ogLocale) => {
  it("takes its title and description from the frontmatter, title unchanged by the site's brand suffix", () => {
    expect(metadata(slug).title).toEqual({ absolute: fixturePage(slug).title });
    expect(metadata(slug).description).toBe(fixturePage(slug).description);
  });

  it("is its own canonical, as an absolute URL", () => {
    expect(metadata(slug).alternates?.canonical).toBe(canonical);
  });

  it("links to no other language: the page exists in one market only", () => {
    expect(metadata(slug).alternates?.languages).toBeUndefined();
    expect(Object.keys(metadata(slug).alternates ?? {})).toEqual(["canonical"]);
  });

  it("is indexable and followed once published", () => {
    expect(metadata(slug).robots).toEqual({ index: true, follow: true });
  });

  it("carries OpenGraph for its own URL, in the page's locale", () => {
    expect(metadata(slug).openGraph).toMatchObject({
      title: fixturePage(slug).title,
      url: canonical,
      locale: ogLocale,
      siteName: "Stampeo",
    });
  });
});

describe.each([
  ["US", "acme-loyalty-draft", "https://stampeo.app/us/vs/acme-loyalty-draft"],
  ["FR", "acme-fidelite-brouillon", "https://stampeo.app/comparatif/acme-fidelite-brouillon"],
])("a %s draft", (_market, slug, canonical) => {
  it("is noindex and nofollow", () => {
    expect(metadata(slug).robots).toEqual({ index: false, follow: false });
  });

  it("still names its own canonical, so opening it by URL does not look like a duplicate", () => {
    expect(metadata(slug).alternates?.canonical).toBe(canonical);
  });
});

describe("the US market decides whether US pages are indexable", () => {
  it("follows MARKETS.us.indexable, as /us/pricing does", () => {
    expect(metadata("acme-loyalty").robots).toEqual({ index: MARKETS.us.indexable, follow: true });
  });
});
