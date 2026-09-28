import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { routing } from "../i18n/routing";

/**
 * How long setup takes, as the landing and the card-designer teaser promise it.
 * The dashboard's onboarding names no number of minutes, so these lines don't
 * either: a visitor who reads "10 minutes" here and meets a longer wizard there
 * has been told two different things.
 *
 * Scoped to these lines. The feature pages' "5 minutes to design your card" is
 * about the design editor alone and is left as it is.
 */

const MESSAGES = join(import.meta.dir, "..", "messages");

const PROMISES: ReadonlyArray<[file: string, path: string]> = [
  ["landing.json", "variant.howItWorks.title"],
  ["landing.json", "variant.howItWorks.steps.0.description"],
  ["landing.json", "variant.finalCta.subtitle"],
  ["loyalty.json", "loyalty.designTeaser.annotation"],
];

function read(locale: string, file: string, path: string): string {
  let node: unknown = JSON.parse(readFileSync(join(MESSAGES, locale, file), "utf8"));
  for (const part of path.split(".")) node = (node as Record<string, unknown>)[part];
  if (typeof node !== "string") throw new Error(`${locale}/${file}: ${path} is not a string`);
  return node;
}

describe("the setup time promise", () => {
  for (const locale of routing.locales) {
    test.each(PROMISES)(`${locale}: %s %s names no number of minutes`, (file, path) => {
      // Placeholders like {trialDays} are prices and trial lengths, not setup time.
      const prose = read(locale, file, path).replace(/\{[^}]*\}/g, "");
      expect(prose).not.toMatch(/\d/);
      expect(prose).not.toMatch(/minut/i);
    });
  }
});
