/**
 * Which paths the middleware runs on.
 *
 * A shop's enrollment URL is `/{slug}`, printed on its counter QR code, and it
 * only renders because the middleware rewrites it to `/{locale}/{slug}`. The
 * matcher skips the non-localized route handlers (`/go/app`, `/join/{code}`…),
 * and a skip that matches on a prefix rather than the whole first segment
 * takes every shop whose slug starts with the same letters down with it.
 *
 * Runs the real `config` through Next's own matcher, so the regex is tested as
 * Next compiles it, not as we read it.
 */

import { describe, expect, test } from "bun:test";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config } from "../middleware";

const runsMiddleware = (url: string) => unstable_doesMiddlewareMatch({ config, url });

describe("middleware matcher", () => {
  test.each([
    // Real slugs: an active prod shop and a dev fixture.
    "/good-vibe-lemonade-and-more",
    "/golden-hour-coffee",
    // One per excluded handler, as a shop could name itself.
    "/apiculteur-du-marais",
    "/authentic-cafe",
    "/joint-burger",
    "/internal-affairs-bar",
    // The per-store enrollment shape.
    "/good-vibe-lemonade-and-more/l/rue-de-rivoli",
  ])("a shop whose slug starts like a handler still enrolls: %s", (path) => {
    expect(runsMiddleware(path)).toBe(true);
  });

  test.each(["/", "/kippa", "/pricing", "/en/pricing", "/us"])(
    "marketing pages and ordinary shops run it: %s",
    (path) => {
      expect(runsMiddleware(path)).toBe(true);
    }
  );

  test.each([
    "/api/markdown",
    "/auth/callback",
    "/go/app",
    "/join/ABC123",
    "/internal/changelog-graphics",
    "/_next/static/chunks/main.js",
    "/favicon.ico",
    "/sitemap.xml",
  ])("route handlers and files skip it: %s", (path) => {
    expect(runsMiddleware(path)).toBe(false);
  });
});
