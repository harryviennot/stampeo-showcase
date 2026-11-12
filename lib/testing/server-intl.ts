import { mock } from "bun:test";
import { createTranslator } from "next-intl";
import { loadCatalog } from "./catalogs";

/**
 * Lets a test file call an async server component: `getTranslations` and
 * `getLocale` of `next-intl/server` answer from the English catalogs instead of
 * asking a Next request, and everything else of the module stays the real one.
 * Call it once at the top, then import the component with `await import(...)`.
 *
 * It is not undone after the file: putting the real module back makes the next
 * file's own `mock.module("next-intl/server", …)` (the comparison route test's)
 * stop taking effect.
 */
export async function mockEnglishServerTranslations(): Promise<void> {
  const real = await import("next-intl/server");
  const messages = loadCatalog("en");
  mock.module("next-intl/server", () => ({
    ...real,
    getLocale: async () => "en",
    getTranslations: async (namespace?: string) =>
      createTranslator({ locale: "en", messages, namespace: namespace as never }),
  }));
}
