/**
 * The help routes: English only, marked by the indexing switch, an article per
 * published page.
 */

import { afterAll, describe, expect, mock, test } from "bun:test";
import { createTranslator } from "next-intl";
import { loadCatalog } from "@/lib/testing/catalogs";
import { restoreEnvAfterEach } from "@/lib/testing/restore-env";
import { helpRobots } from "./config";
import { getAllHelpPages } from "./index";
import HelpArticlePage, {
  generateMetadata as articleMetadata,
  generateStaticParams as articleParams,
} from "../../app/[locale]/help/[slug]/page";
import HelpHomePage, {
  generateMetadata as homeMetadata,
  generateStaticParams as homeParams,
} from "../../app/[locale]/help/page";
import { GET as searchIndex, generateStaticParams as searchIndexParams } from "../../app/[locale]/help/search-index/route";
import HelpTopicPage, {
  generateMetadata as topicMetadata,
  generateStaticParams as topicParams,
} from "../../app/[locale]/help/topics/[category]/page";
import { groupTopics } from "./home/topics";

// The home's title comes from the server-side translator, which needs a Next
// request; this one reads the real catalog and is put back after the file.
const realIntl = { ...(await import("next-intl/server")) };
mock.module("next-intl/server", () => ({
  ...realIntl,
  getTranslations: async ({ locale, namespace }: { locale: string; namespace: string }) =>
    createTranslator({ locale, messages: loadCatalog(locale), namespace }),
}));
afterAll(() => mock.module("next-intl/server", () => realIntl));

/** Next's `notFound()` throws an error whose digest names the 404. */
const isNotFound = (error: unknown) =>
  String((error as { digest?: unknown }).digest).includes("404");

describe("the help home", () => {
  test("is generated for English only", () => {
    expect(homeParams()).toEqual([{ locale: "en" }]);
  });

  test.each(["fr", "es", "pl"])("answers 404 under the %s locale", async (locale) => {
    const error = await HelpHomePage({ params: Promise.resolve({ locale }) }).catch((e: unknown) => e);

    expect(isNotFound(error)).toBe(true);
  });
});

describe("the help home's metadata", () => {
  test("is titled, marked as the indexing switch says, and names no canonical or alternates", async () => {
    const metadata = await homeMetadata({ params: Promise.resolve({ locale: "en" }) });

    expect(metadata.title).toBe("Help center");
    expect(metadata.robots).toEqual(helpRobots());
    expect(metadata.alternates).toBeUndefined();
  });
});

describe("a help article", () => {
  const params = (locale: string, slug: string) => ({ params: Promise.resolve({ locale, slug }) });

  restoreEnvAfterEach("NODE_ENV");

  test("is generated in English for every published page, and for nothing else", () => {
    process.env.NODE_ENV = "production";
    const expected = getAllHelpPages({ includeDrafts: false }).map((page) => ({ locale: "en", slug: page.slug }));

    expect(articleParams()).toEqual(expected);
    expect(expected.length).toBeGreaterThan(0);
    expect(articleParams()).toContainEqual({ locale: "en", slug: "roles" });
  });

  test.each(["fr", "es", "pl"])("answers 404 under the %s locale", async (locale) => {
    const error = await HelpArticlePage(params(locale, "roles")).catch((e: unknown) => e);

    expect(isNotFound(error)).toBe(true);
  });

  test("answers 404 for a slug with no page", async () => {
    const error = await HelpArticlePage(params("en", "nope")).catch((e: unknown) => e);

    expect(isNotFound(error)).toBe(true);
  });

  test("is titled by its own page, marked noindex, and names no canonical or alternates", async () => {
    const metadata = await articleMetadata(params("en", "roles"));

    expect(metadata.title).toBe("Roles and what each one can do");
    expect(metadata.description).toContain("owner");
    expect(metadata.robots).toEqual(helpRobots());
    expect(metadata.alternates).toBeUndefined();
  });

  test("a slug with no page is still marked noindex", async () => {
    expect((await articleMetadata(params("en", "nope"))).robots).toEqual(helpRobots());
  });
});

describe("a topic page", () => {
  const params = (locale: string, category: string) => ({ params: Promise.resolve({ locale, category }) });

  test("is generated in English for every category that has a page, and for nothing else", () => {
    const expected = groupTopics(getAllHelpPages()).map((topic) => ({ locale: "en", category: topic.category.slug }));

    expect(topicParams()).toEqual(expected);
    expect(topicParams()).toContainEqual({ locale: "en", category: "team" });
    expect(topicParams()).not.toContainEqual({ locale: "en", category: "guides" });
  });

  test.each(["fr", "es", "pl"])("answers 404 under the %s locale", async (locale) => {
    const error = await HelpTopicPage(params(locale, "team")).catch((e: unknown) => e);

    expect(isNotFound(error)).toBe(true);
  });

  test.each(["guides", "nope"])("answers 404 for %s, a category with no page", async (category) => {
    const error = await HelpTopicPage(params("en", category)).catch((e: unknown) => e);

    expect(isNotFound(error)).toBe(true);
  });

  test("is titled by its topic, marked noindex, and names no canonical or alternates", async () => {
    const metadata = await topicMetadata(params("en", "team"));

    expect(metadata.title).toBe("Your team");
    expect(metadata.description).toBe("Adding people, roles and access.");
    expect(metadata.robots).toEqual(helpRobots());
    expect(metadata.alternates).toBeUndefined();
  });

  test("a category with no page is still marked noindex", async () => {
    expect((await topicMetadata(params("en", "guides"))).robots).toEqual(helpRobots());
  });
});

describe("the search index route", () => {
  test("is generated for English only", () => {
    expect(searchIndexParams()).toEqual([{ locale: "en" }]);
  });

  test("serves every published page, and the pages offered before a reader types", async () => {
    const response = await searchIndex(new Request("http://localhost/help/search-index"), {
      params: Promise.resolve({ locale: "en" }),
    });
    const index = await response.json();

    expect(response.status).toBe(200);
    expect(index.entries.map((entry: { slug: string }) => entry.slug)).toContain("roles");
    expect(index.popular.length).toBeGreaterThanOrEqual(6);
  });

  test("answers 404 under another locale", async () => {
    const response = await searchIndex(new Request("http://localhost/fr/help/search-index"), {
      params: Promise.resolve({ locale: "fr" }),
    });

    expect(response.status).toBe(404);
  });
});
