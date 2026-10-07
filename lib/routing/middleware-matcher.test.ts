/**
 * `/{slug}` enrollment URLs only render through the middleware rewrite, so the
 * matcher's skips must match a whole first segment, never a prefix (`/go` vs
 * `/good-vibe`). Runs the real `config` through Next's own matcher.
 */

import { describe, expect, test } from "bun:test";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config } from "../../middleware";
import { staticSegments } from "../testing/app-folders";

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
    "/qrious-cafe",
    // The per-store enrollment shape.
    "/good-vibe-lemonade-and-more/l/rue-de-rivoli",
    "/qrious-cafe/l/rue-de-rivoli",
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
    "/qr",
    "/qr/",
    "/_next/static/chunks/main.js",
    "/favicon.ico",
    "/sitemap.xml",
  ])("non-localized routes and files skip it: %s", (path) => {
    expect(runsMiddleware(path)).toBe(false);
  });

  test("every static route folder at the top of app/ skips it", () => {
    // A folder the middleware does not skip is taken for a shop slug and
    // rewritten to the enrollment page, which 404s.
    const segments = staticSegments();
    expect(segments.length).toBeGreaterThan(0);
    for (const segment of segments) {
      expect(runsMiddleware(`/${segment}`)).toBe(false);
    }
  });
});
