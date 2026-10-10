/**
 * The founding programme is closed. Its two pages send the visitor to that
 * locale's pricing page in one permanent hop; a locale the site does not
 * serve falls back to the default one.
 */

import { describe, expect, test } from "bun:test";
import {
  getRedirectStatusCodeFromError,
  getURLFromRedirectError,
} from "next/dist/client/components/redirect";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import FoundingPartnerPage from "../../app/[locale]/founding-partner/page";
import ProgrammeFondateurPage from "../../app/[locale]/programme-fondateur/page";

const PRICING: Array<[locale: string, pricing: string]> = [
  ["fr", "/pricing"],
  ["en", "/en/pricing"],
  ["es", "/es/pricing"],
  ["pl", "/pl/pricing"],
  ["xx", "/pricing"],
  ["%5Cevil.com", "/pricing"],
];

/** The URL and status the page redirects to, or null when it renders. */
async function redirectOf(
  page: typeof FoundingPartnerPage,
  locale: string,
): Promise<{ url: string; status: number } | null> {
  try {
    await page({ params: Promise.resolve({ locale }) });
  } catch (error) {
    if (!isRedirectError(error)) throw error;
    return { url: getURLFromRedirectError(error), status: getRedirectStatusCodeFromError(error) };
  }
  return null;
}

describe("the closed founding pages", () => {
  test.each([
    ["founding-partner", FoundingPartnerPage],
    ["programme-fondateur", ProgrammeFondateurPage],
  ] as const)("/%s sends every locale to its pricing page with a 308", async (_name, page) => {
    for (const [locale, pricing] of PRICING) {
      expect(await redirectOf(page, locale)).toEqual({ url: pricing, status: 308 });
    }
  });
});
