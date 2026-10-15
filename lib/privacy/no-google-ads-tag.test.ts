/**
 * Google Ads hears about a sign-up from our server and never from the
 * browser: no Ads tag, no conversion id, no Consent Mode. A Google tag id in
 * any source file is how a browser tag would sneak in, so the tree is scanned
 * for one, and the one gtag.js the site loads is still the analytics tag.
 */

import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { shouldLoadGa } from "../google-analytics";

const ROOT = join(import.meta.dir, "..", "..");
const SCANNED_DIRS = ["app", "components", "lib", "scripts"];
const SCANNED_FILES = [".env.example", "Dockerfile"];
const TEXT_FILE = /\.(tsx?|jsx?|mjs|cjs|json|css|md|mdx|ya?ml|sh)$/;

// Built from parts so this file does not match its own pattern.
const GOOGLE_ADS_TAG_ID = new RegExp(`${"AW"}-\\d`);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (name === "node_modules" || name === ".next") return [];
    return statSync(path).isDirectory() ? sourceFiles(path) : TEXT_FILE.test(name) ? [path] : [];
  });
}

describe("no Google Ads tag in the build", () => {
  const files = [
    ...SCANNED_DIRS.flatMap((dir) => sourceFiles(join(ROOT, dir))),
    ...SCANNED_FILES.map((file) => join(ROOT, file)).filter((path) => existsSync(path)),
  ];

  test("scans the tree it is meant to", () => {
    expect(files.length).toBeGreaterThan(100);
    expect(files.some((file) => file.endsWith("Dockerfile"))).toBe(true);
  });

  test("no source file carries a Google Ads tag id", () => {
    const offenders = files
      .filter((file) => GOOGLE_ADS_TAG_ID.test(readFileSync(file, "utf8")))
      .map((file) => relative(ROOT, file));

    expect(offenders).toEqual([]);
  });

  test("gtag.js loads for audience measurement only, whatever was agreed for advertising", () => {
    const base = { measurementId: "G-ZFZ6JLPFXN", ready: true, trackable: true };

    expect(shouldLoadGa({ ...base, analytics: false })).toBe(false);
    expect(shouldLoadGa({ ...base, analytics: true })).toBe(true);
  });
});
