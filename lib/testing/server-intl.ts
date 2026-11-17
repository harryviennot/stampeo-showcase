import { mock } from "bun:test";
import { createTranslator } from "next-intl";
import { loadCatalog } from "./catalogs";

/** The language the mocked server answers in: English unless a test renders another language with `inServerLocale`. */
const server = { locale: "en" };

/**
 * Lets a test file call an async server component: `getTranslations` and
 * `getLocale` of `next-intl/server` answer from the catalogs of the request's
 * language (English unless `inServerLocale` says otherwise) instead of asking a
 * Next request, `setRequestLocale` does nothing, and everything else of the
 * module stays the real one.
 * Call it once at the top, then import the component with `await import(...)`.
 *
 * It is not undone after the file: putting the real module back makes the next
 * file's own `mock.module("next-intl/server", …)` (the comparison route test's)
 * stop taking effect.
 */
export async function mockEnglishServerTranslations(): Promise<void> {
  const real = await import("next-intl/server");
  mock.module("next-intl/server", () => ({
    ...real,
    getLocale: async () => server.locale,
    setRequestLocale: () => {},
    getTranslations: async (arg?: string | { locale?: string; namespace?: string }) => {
      const { locale = server.locale, namespace } = typeof arg === "string" ? { namespace: arg } : (arg ?? {});
      return createTranslator({ locale, messages: loadCatalog(locale), namespace: namespace as never });
    },
  }));
}

/** Runs `render` as a request in `locale`, and puts the server back in English. */
export async function inServerLocale<T>(locale: string, render: () => Promise<T>): Promise<T> {
  server.locale = locale;
  try {
    return await render();
  } finally {
    server.locale = "en";
  }
}
