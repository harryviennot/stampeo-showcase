/** `/qr`, the code printed on Stampeo's business cards, and where it lands. */

import { describe, expect, test } from "bun:test";
import { getRedirectUrl } from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import middleware from "../../middleware";
import { cardQrRedirect } from "./card-qr";

const TAGS = "utm_source=card&utm_medium=qr&utm_campaign=business-cards-2026-10";

describe("the business-card QR redirect", () => {
  test("sends the scan to the homepage with the card's campaign tags, uncached", () => {
    const response = cardQrRedirect();

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(`/?${TAGS}`);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  // The analytics read the tags on the page the visitor ends on, so they must
  // survive the homepage's own language redirect.
  test.each([
    ["en-US,en;q=0.9", `https://stampeo.app/en?${TAGS}`],
    ["pl-PL,pl;q=0.9", `https://stampeo.app/pl?${TAGS}`],
    ["fr-FR,fr;q=0.9", null],
  ])("a phone set to %s lands with every tag", async (acceptLanguage, redirect) => {
    const location = cardQrRedirect().headers.get("location") ?? "";
    const landing = new NextRequest(new URL(location, "https://stampeo.app"), {
      headers: { "accept-language": acceptLanguage },
    });

    expect(getRedirectUrl(await middleware(landing))).toBe(redirect);
  });
});
