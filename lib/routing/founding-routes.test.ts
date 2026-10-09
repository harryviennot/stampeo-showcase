/**
 * The founding programme is closed. Its two pages, in any locale no legacy
 * redirect covers, send the visitor to that locale's pricing page in one
 * permanent hop.
 */

import { describe, expect, test } from "bun:test";
import FoundingPartnerPage from "../../app/[locale]/founding-partner/page";
import ProgrammeFondateurPage from "../../app/[locale]/programme-fondateur/page";

const PRICING: Record<string, string> = {
  fr: "/pricing",
  en: "/en/pricing",
  es: "/es/pricing",
  pl: "/pl/pricing",
};

async function redirectDigest(page: typeof FoundingPartnerPage, locale: string): Promise<string> {
  try {
    await page({ params: Promise.resolve({ locale }) });
  } catch (error) {
    return (error as { digest?: string }).digest ?? "";
  }
  return "";
}

describe("the closed founding pages", () => {
  test.each([
    ["founding-partner", FoundingPartnerPage],
    ["programme-fondateur", ProgrammeFondateurPage],
  ] as const)("/%s sends every locale to its pricing page with a 308", async (_name, page) => {
    for (const [locale, pricing] of Object.entries(PRICING)) {
      expect(await redirectDigest(page, locale)).toBe(`NEXT_REDIRECT;replace;${pricing};308;`);
    }
  });
});
