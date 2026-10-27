/**
 * The help routes: English only, noindex, an article per published page.
 */

import { describe, expect, test } from "bun:test";
import { restoreEnvAfterEach } from "@/lib/testing/restore-env";
import { getAllHelpPages } from "./index";
import HelpArticlePage, {
  generateMetadata as articleMetadata,
  generateStaticParams as articleParams,
} from "../../app/[locale]/help/[slug]/page";
import HelpHomePage, { generateStaticParams as homeParams } from "../../app/[locale]/help/page";

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
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.alternates).toBeUndefined();
  });

  test("a slug with no page is still marked noindex", async () => {
    expect((await articleMetadata(params("en", "nope"))).robots).toEqual({ index: false, follow: true });
  });
});
