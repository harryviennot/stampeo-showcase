/**
 * The OAuth callback follows an absolute `next` only on the app's origin; any
 * other value falls through to the normal landing (onboarding for a new user).
 */

import { beforeEach, describe, expect, test } from "bun:test";
import { GET } from "../../app/auth/callback/route";
import { restoreEnvAfterEach } from "../testing/restore-env";

const SHOWCASE = "https://stampeo.app";
const APP = "https://app.stampeo.app";

restoreEnvAfterEach("NEXT_PUBLIC_SHOWCASE_URL", "NEXT_PUBLIC_APP_URL");
beforeEach(() => {
  process.env.NEXT_PUBLIC_SHOWCASE_URL = SHOWCASE;
  process.env.NEXT_PUBLIC_APP_URL = APP;
});

async function landing(next: string): Promise<string | null> {
  const url = `${SHOWCASE}/auth/callback?next=${encodeURIComponent(next)}`;
  const response = await GET(new Request(url, { headers: { "accept-language": "en" } }));
  return response.headers.get("location");
}

describe("the auth callback's absolute next", () => {
  test("an invite on the app is followed", async () => {
    expect(await landing(`${APP}/invite/abc123`)).toBe(`${APP}/invite/abc123`);
  });

  test.each([
    ["javascript://app.stampeo.app/%0Aalert(1)"],
    ["http://app.stampeo.app/invite/abc123"],
    ["blob:https://app.stampeo.app/3f2b"],
    ["https://evil.example/"],
  ])("%s falls through to onboarding", async (next) => {
    expect(await landing(next)).toBe(`${SHOWCASE}/en/onboarding?just_authed=oauth`);
  });
});
