import { describe, expect, it } from "bun:test";
import { MARKETS } from "../../markets";
import { pageOpenGraph } from "../../og/metadata";
import { FIXTURES } from "../__fixtures__";
import { allComparisonPages } from "../content";
import { comparisonMetadata } from "./metadata";

const pages = allComparisonPages(FIXTURES);
const pageFor = (slug: string) => pages.find((page) => page.slug === slug)!;
const metadata = (slug: string) => {
  const page = pageFor(slug);
  const url = (page.market === "us" ? "https://stampeo.app/us/vs/" : "https://stampeo.app/comparatif/") + slug;
  return comparisonMetadata(page, pageOpenGraph({ title: page.title, description: page.description, url, locale: page.locale }));
};

describe.each([
  ["a US page", "acme-loyalty", "https://stampeo.app/us/vs/acme-loyalty"],
  ["a FR page", "acme-fidelite", "https://stampeo.app/comparatif/acme-fidelite"],
])("the metadata of %s", (_name, slug, canonical) => {
  it("takes its title and description from the frontmatter, title unchanged by the site's brand suffix", () => {
    expect(metadata(slug).title).toEqual({ absolute: pageFor(slug).title });
    expect(metadata(slug).description).toBe(pageFor(slug).description);
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

  it("carries OpenGraph for its own URL", () => {
    expect(metadata(slug).openGraph).toMatchObject({ title: pageFor(slug).title, url: canonical, siteName: "Stampeo" });
  });
});

describe("a draft", () => {
  it("is noindex and nofollow, whichever market it is in", () => {
    expect(metadata("acme-loyalty-draft").robots).toEqual({ index: false, follow: false });
  });

  it("still names its own canonical, so opening it by URL does not look like a duplicate", () => {
    expect(metadata("acme-loyalty-draft").alternates?.canonical).toBe("https://stampeo.app/us/vs/acme-loyalty-draft");
  });
});

describe("the US market decides whether US pages are indexable", () => {
  it("follows MARKETS.us.indexable, as /us/pricing does", () => {
    expect(metadata("acme-loyalty").robots).toEqual({ index: MARKETS.us.indexable, follow: true });
  });
});
