import { afterAll, describe, expect, it, mock } from "bun:test";
import { FIXTURES } from "../__fixtures__";

// setRequestLocale needs a Next request; the route's own decisions are what is under test.
const realIntl = await import("next-intl/server");
mock.module("next-intl/server", () => ({ ...realIntl, setRequestLocale: () => {} }));
afterAll(() => mock.module("next-intl/server", () => realIntl));
const { comparisonRoute } = await import("./route");

const NOT_FOUND = { digest: expect.stringContaining("404") };
const params = (locale: string, competitor: string) => ({ params: Promise.resolve({ locale, competitor }) });

describe("the US route /us/vs/<competitor>", () => {
  const route = comparisonRoute("us", FIXTURES);

  it("prerenders every US page in English, drafts included, and no French page", async () => {
    const staticParams = await route.generateStaticParams();
    expect(staticParams.map((entry) => entry.locale)).toEqual(["en", "en", "en"]);
    expect(staticParams.map((entry) => entry.competitor).sort()).toEqual(["acme-loyalty", "acme-loyalty-draft", "globex-stamps"]);
  });

  it("renders a published page", async () => {
    expect(await route.Page(params("en", "acme-loyalty"))).toBeTruthy();
  });

  it("heads a published page with its own title, and a missing one with nothing", async () => {
    const parent = Promise.resolve({}) as never;
    expect((await route.generateMetadata(params("en", "acme-loyalty"), parent)).title).toEqual({
      absolute: "Acme Loyalty vs Stampeo: prices, pros and cons",
    });
    expect(await route.generateMetadata(params("en", "nobody"), parent)).toEqual({});
  });

  it.each([
    ["an unknown slug", "en", "nobody"],
    ["a French page's slug", "en", "acme-fidelite"],
    ["a page asked for in French", "fr", "acme-loyalty"],
    ["a page asked for in Spanish", "es", "acme-loyalty"],
  ])("is a 404 for %s", async (_name, locale, slug) => {
    await expect(route.Page(params(locale, slug))).rejects.toMatchObject(NOT_FOUND);
  });
});

describe("the French route /comparatif/<competitor>", () => {
  const route = comparisonRoute("fr", FIXTURES);

  it("prerenders every French page in French, and no US page", async () => {
    const staticParams = await route.generateStaticParams();
    expect(staticParams.map((entry) => entry.locale)).toEqual(["fr", "fr", "fr"]);
    expect(staticParams.map((entry) => entry.competitor).sort()).toEqual(["acme-fidelite", "acme-fidelite-brouillon", "bravo-carte"]);
  });

  it("renders a French page", async () => {
    expect(await route.Page(params("fr", "acme-fidelite"))).toBeTruthy();
  });

  it.each([
    ["an unknown slug", "fr", "nobody"],
    ["a US page's slug", "fr", "acme-loyalty"],
    ["a page asked for in English", "en", "acme-fidelite"],
  ])("is a 404 for %s", async (_name, locale, slug) => {
    await expect(route.Page(params(locale, slug))).rejects.toMatchObject(NOT_FOUND);
  });
});
