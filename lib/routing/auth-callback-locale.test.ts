/**
 * A new owner who signs in with Google before creating a business lands on
 * onboarding in their language. Only the LanguageSwitcher writes `NEXT_LOCALE`,
 * so most visitors arrive with no cookie and the phone's language decides.
 */

import { beforeEach, describe, expect, test } from "bun:test";
import { GET } from "../../app/auth/callback/route";
import { restoreEnvAfterEach } from "../testing/restore-env";

const SHOWCASE = "https://stampeo.app";

restoreEnvAfterEach("NEXT_PUBLIC_SHOWCASE_URL");
beforeEach(() => {
  process.env.NEXT_PUBLIC_SHOWCASE_URL = SHOWCASE;
});

async function landing(headers: Record<string, string>): Promise<string | null> {
  const response = await GET(new Request(`${SHOWCASE}/auth/callback`, { headers }));
  return response.headers.get("location");
}

describe("the auth callback's onboarding language", () => {
  test.each([
    [{ "accept-language": "en-US,en;q=0.9" }, "/en/onboarding"],
    [{ "accept-language": "pl-PL,pl;q=0.9" }, "/pl/onboarding"],
    [{ "accept-language": "en-US,en;q=0.9", cookie: "NEXT_LOCALE=es" }, "/es/onboarding"],
    [{ "accept-language": "de-DE,de;q=0.9" }, "/fr/onboarding"],
    [{}, "/fr/onboarding"],
  ])("%o lands on %s", async (headers, path) => {
    expect(await landing(headers)).toBe(`${SHOWCASE}${path}?just_authed=oauth`);
  });
});
