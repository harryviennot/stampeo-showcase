/**
 * `/qr`, the code printed on the back of Stampeo's own business cards.
 *
 * The cards cannot be reprinted, so this redirect is the only part that can
 * change: a 302 nothing caches, to a destination on whichever host answered,
 * carrying the campaign tags the analytics read on landing.
 */

import { describe, expect, test } from "bun:test";
import { GET } from "../../app/qr/route";

describe("GET /qr", () => {
  test("sends the scan to the homepage with the card's campaign tags", async () => {
    const response = await GET();

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "/?utm_source=card&utm_medium=qr&utm_campaign=business-cards-2026-10"
    );
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.text()).toBe("");
  });
});
