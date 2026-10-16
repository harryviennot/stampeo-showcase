/**
 * Google Ads hears about a sign-up from our server and never from the
 * browser: no Ads tag and no conversion id. A Google tag id in any file is how
 * a browser tag would sneak in, so the whole repository is scanned for one.
 * The site loads gtag.js by its `G-` measurement id only; a `GT-` container
 * could bundle an Ads destination, and an `AW-` id is one.
 */

import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dir, "..", "..");

// Not source: dependencies, build output, notes, test data and other checkouts.
const SKIPPED_DIRS = new Set(["node_modules", ".next", ".git", ".claude", "docs", "__fixtures__"]);
const TEXT_FILE = /(\.(tsx?|jsx?|mjs|cjs|json|css|md|mdx|ya?ml|sh|toml|svg|txt|html)|^Dockerfile|^\.env.*|^\.dockerignore)$/;

// Built from parts so this file does not match its own patterns.
const GOOGLE_TAG_ID = new RegExp(`\\b(${"AW"}-\\d|${"GT"}-[A-Z0-9]{5,})`);

function repoFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return SKIPPED_DIRS.has(name) ? [] : repoFiles(path);
    return TEXT_FILE.test(name) ? [path] : [];
  });
}

describe("no Google Ads tag in the repository", () => {
  const files = repoFiles(ROOT);
  const relativePaths = files.map((file) => relative(ROOT, file));

  test("scans the root config, the hooks, the routing, the public files and the workflows", () => {
    expect(files.length).toBeGreaterThan(300);
    for (const path of ["next.config.ts", "proxy.ts", "instrumentation.ts", "Dockerfile", ".github/workflows/ci.yml"]) {
      expect(relativePaths).toContain(path);
    }
    for (const dir of ["hooks/", "i18n/", "public/", "messages/", "legal/"]) {
      expect(relativePaths.some((path) => path.startsWith(dir))).toBe(true);
    }
  });

  test("no file carries a Google Ads or Google tag container id", () => {
    const offenders = files
      .filter((file) => GOOGLE_TAG_ID.test(readFileSync(file, "utf8")))
      .map((file) => relative(ROOT, file));

    expect(offenders).toEqual([]);
  });

  test.each([`${"AW"}-123456789`, `${"GT"}-M63DLGMC`, `loads ${"AW"}-1 from the page`])(
    "the pattern catches %s",
    (text) => {
      expect(GOOGLE_TAG_ID.test(text)).toBe(true);
    },
  );

  test.each(["G-ZFZ6JLPFXN", "GTM-ABC1234", "LAW-firm", `${"GT"}-R`])("the pattern lets %s through", (text) => {
    expect(GOOGLE_TAG_ID.test(text)).toBe(false);
  });
});
