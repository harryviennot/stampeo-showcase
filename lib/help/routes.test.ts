/**
 * The placeholder routes: English only, noindex, and no article pages yet.
 */

import { describe, expect, test } from "bun:test";
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
  test("has no page yet: every slug answers 404", () => {
    let error: unknown;
    try {
      HelpArticlePage();
    } catch (thrown) {
      error = thrown;
    }

    expect(articleParams()).toEqual([]);
    expect(isNotFound(error)).toBe(true);
  });

  test("is marked noindex all the same", () => {
    expect(articleMetadata().robots).toEqual({ index: false, follow: true });
  });
});
