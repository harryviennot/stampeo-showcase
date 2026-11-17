/**
 * A demo session token lets whoever holds it stamp that demo card, so no PostHog event of the site carries one.
 * This reads the source of everything that calls `posthog.capture` and fails on a call whose properties name the
 * session token (`demo_started` used to send it).
 */

import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..", "..");
const SCANNED = ["app", "components", "hooks", "lib"];

/** Every source file under `dir` that is not a test. */
function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) return entry.name === "node_modules" ? [] : sources(path);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

/** The text of each `posthog.capture(` call: from its name to the `);` that ends it. */
function captureCalls(source: string): string[] {
  return [...source.matchAll(/posthog\.capture\(/g)].map(({ index }) => source.slice(index, source.indexOf(");", index) + 2));
}

describe("PostHog events and the demo session token", () => {
  const calls = SCANNED.flatMap((dir) => sources(join(ROOT, dir))).flatMap((file) => captureCalls(readFileSync(file, "utf8")).map((call) => ({ file, call })));

  test("the scan finds the site's capture calls, the demo's among them", () => {
    expect(calls.length).toBeGreaterThan(5);
    expect(calls.some(({ call }) => call.includes("demo_started"))).toBe(true);
  });

  test("none of them sends the session token", () => {
    expect(calls.filter(({ call }) => /session_?token/i.test(call)).map(({ file, call }) => `${file}: ${call}`)).toEqual([]);
  });
});
