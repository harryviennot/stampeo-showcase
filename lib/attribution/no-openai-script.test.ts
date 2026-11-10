/**
 * OpenAI hears about a ChatGPT-ad sign-up from our server and never from the
 * browser: no OpenAI pixel, so no third-party script, no `__oppref` or
 * `__obref` cookie on our domain, and no automatic matching reading our forms.
 * The pixel's host names and its global function are how a browser tag would
 * sneak in, so the code and config are scanned for them.
 */

import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dir, "..", "..");

// Not source: dependencies, build output, notes, test data and other checkouts.
// Prose (policy, messages, articles) is never loaded as code.
const SKIPPED_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  ".claude",
  "docs",
  "__fixtures__",
  "legal",
  "messages",
  "content",
]);
const TEXT_FILE = /(\.(tsx?|jsx?|mjs|cjs|json|css|md|mdx|ya?ml|sh|toml|svg|txt|html)|^Dockerfile|^\.env.*|^\.dockerignore)$/;

// Built from parts so this file does not match its own patterns.
const OPENAI_PIXEL = new RegExp(`${"bzrcdn"}\\.openai\\.com|${"bzr"}\\.openai\\.com|${"oa"}${"iq"}\\b`, "i");

function repoFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return SKIPPED_DIRS.has(name) ? [] : repoFiles(path);
    return TEXT_FILE.test(name) ? [path] : [];
  });
}

describe("no OpenAI pixel in the repository", () => {
  const files = repoFiles(ROOT);
  const relativePaths = files.map((file) => relative(ROOT, file));

  test("scans the app, the components, the lib, the hooks and the root config", () => {
    expect(files.length).toBeGreaterThan(300);
    for (const path of ["next.config.ts", "proxy.ts", "instrumentation.ts", "Dockerfile", ".github/workflows/ci.yml"]) {
      expect(relativePaths).toContain(path);
    }
    for (const dir of ["app/", "components/", "lib/", "hooks/", "public/"]) {
      expect(relativePaths.some((path) => path.startsWith(dir))).toBe(true);
    }
  });

  test("no file names an OpenAI pixel host or calls its tag", () => {
    const offenders = files
      .filter((file) => OPENAI_PIXEL.test(readFileSync(file, "utf8")))
      .map((file) => relative(ROOT, file));

    expect(offenders).toEqual([]);
  });

  test.each([`https://${"bzrcdn"}.openai.com/sdk/oai.js`, `fetch("https://${"bzr"}.openai.com/v1/events")`, `${"oa"}${"iq"}('init', 'x')`])(
    "the pattern catches %s",
    (text) => {
      expect(OPENAI_PIXEL.test(text)).toBe(true);
    },
  );

  test.each(["https://openai.com/policies/privacy-policy", "OpenAI (ChatGPT ads)", "chatgpt.com", "oaiqa"])(
    "the pattern lets %s through",
    (text) => {
      expect(OPENAI_PIXEL.test(text)).toBe(false);
    },
  );
});
