/**
 * The one network call in the acquisition locale path.
 *
 * It sits in the middleware, in front of every QR scan, so the things worth
 * pinning are the ones that keep it off the hot path: it is cached, it fails
 * open, and a bot walking made-up slugs cannot turn it into a request amplifier.
 */

import { describe, expect, test } from "bun:test";

import { createBusinessLocaleLookup } from "./business-locale";

function stubFetch(handler: (url: string) => Response | Promise<Response>) {
  const calls: string[] = [];
  const fn = async (input: string | URL | Request) => {
    calls.push(String(input));
    return handler(String(input));
  };
  return { fn: fn as unknown as typeof fetch, calls };
}

const ok = (locale: string) =>
  new Response(JSON.stringify({ primary_locale: locale }), { status: 200 });

describe("createBusinessLocaleLookup", () => {
  test("reads primary_locale from the public business endpoint", async () => {
    const { fn, calls } = stubFetch(() => ok("pl"));
    const lookup = createBusinessLocaleLookup({
      apiUrl: "https://api.example.com",
      fetchImpl: fn,
    });

    expect(await lookup("usual-cafe")).toBe("pl");
    expect(calls).toEqual(["https://api.example.com/businesses/slug/usual-cafe"]);
  });

  test("trims a trailing slash off the API base", async () => {
    const { fn, calls } = stubFetch(() => ok("es"));
    const lookup = createBusinessLocaleLookup({
      apiUrl: "https://api.example.com/",
      fetchImpl: fn,
    });

    await lookup("usual-cafe");
    expect(calls).toEqual(["https://api.example.com/businesses/slug/usual-cafe"]);
  });

  test("percent-encodes the slug", async () => {
    const { fn, calls } = stubFetch(() => ok("fr"));
    const lookup = createBusinessLocaleLookup({
      apiUrl: "https://api.example.com",
      fetchImpl: fn,
    });

    await lookup("café d’angle");
    expect(calls[0]).toBe(
      "https://api.example.com/businesses/slug/caf%C3%A9%20d%E2%80%99angle"
    );
  });

  test("serves a repeat scan from cache", async () => {
    let hits = 0;
    const { fn } = stubFetch(() => {
      hits += 1;
      return ok("pl");
    });
    const lookup = createBusinessLocaleLookup({
      apiUrl: "https://api.example.com",
      fetchImpl: fn,
    });

    expect(await lookup("usual-cafe")).toBe("pl");
    expect(await lookup("usual-cafe")).toBe("pl");
    expect(hits).toBe(1);
  });

  test("re-reads once the cached answer has aged out", async () => {
    let now = 0;
    let locale = "pl";
    const { fn } = stubFetch(() => ok(locale));
    const lookup = createBusinessLocaleLookup({
      apiUrl: "https://api.example.com",
      fetchImpl: fn,
      ttlMs: 1000,
      now: () => now,
    });

    expect(await lookup("usual-cafe")).toBe("pl");
    locale = "en";
    now = 999;
    expect(await lookup("usual-cafe")).toBe("pl");
    now = 1001;
    expect(await lookup("usual-cafe")).toBe("en");
  });

  test("caches a 404 so a bot walking slugs cannot amplify into the API", async () => {
    let hits = 0;
    const { fn } = stubFetch(() => {
      hits += 1;
      return new Response("", { status: 404 });
    });
    const lookup = createBusinessLocaleLookup({
      apiUrl: "https://api.example.com",
      fetchImpl: fn,
    });

    expect(await lookup("wp-admin")).toBeNull();
    expect(await lookup("wp-admin")).toBeNull();
    expect(hits).toBe(1);
  });

  test("evicts oldest entries instead of growing without bound", async () => {
    const { fn, calls } = stubFetch(() => ok("pl"));
    const lookup = createBusinessLocaleLookup({
      apiUrl: "https://api.example.com",
      fetchImpl: fn,
      maxEntries: 2,
    });

    await lookup("a");
    await lookup("b");
    await lookup("c"); // evicts "a"
    await lookup("b"); // still cached
    await lookup("a"); // refetched
    expect(calls.map((u) => u.split("/").pop())).toEqual(["a", "b", "c", "a"]);
  });

  test("fails open when the API errors, so the page still renders", async () => {
    const { fn } = stubFetch(() => {
      throw new Error("connect ECONNREFUSED");
    });
    const lookup = createBusinessLocaleLookup({
      apiUrl: "https://api.example.com",
      fetchImpl: fn,
    });

    expect(await lookup("usual-cafe")).toBeNull();
  });

  test("fails open on a 5xx and does not cache it", async () => {
    let hits = 0;
    const { fn } = stubFetch(() => {
      hits += 1;
      return hits === 1 ? new Response("", { status: 503 }) : ok("pl");
    });
    const lookup = createBusinessLocaleLookup({
      apiUrl: "https://api.example.com",
      fetchImpl: fn,
    });

    expect(await lookup("usual-cafe")).toBeNull();
    expect(await lookup("usual-cafe")).toBe("pl");
  });

  test("fails open on a body that is not the JSON we expect", async () => {
    const { fn } = stubFetch(() => new Response("<html>nope</html>", { status: 200 }));
    const lookup = createBusinessLocaleLookup({
      apiUrl: "https://api.example.com",
      fetchImpl: fn,
    });

    expect(await lookup("usual-cafe")).toBeNull();
  });

  test("does nothing at all without an API URL", async () => {
    const { fn, calls } = stubFetch(() => ok("pl"));
    const lookup = createBusinessLocaleLookup({ apiUrl: undefined, fetchImpl: fn });

    expect(await lookup("usual-cafe")).toBeNull();
    expect(calls).toEqual([]);
  });
});
