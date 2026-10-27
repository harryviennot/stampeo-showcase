import { describe, expect, it } from "bun:test";
import { routing } from "@/i18n/routing";
import { PLAN_NAMES } from "../plans/plan-facts";
import { loadCatalog } from "../testing/catalogs";

/**
 * Pro has everything Growth has, so a feature badge that names Growth names Pro
 * too ("Growth and Pro"): a lone "Growth" reads as "not on Pro".
 */
function badges(node: unknown, path = ""): [string, string][] {
  if (Array.isArray(node)) return node.flatMap((item, i) => badges(item, `${path}[${i}]`));
  if (!node || typeof node !== "object") return [];
  return Object.entries(node).flatMap(([key, value]) =>
    typeof value === "string" ? (/badge$/i.test(key) ? [[`${path}.${key}`, value]] : []) : badges(value, `${path}.${key}`),
  );
}

describe("feature badges", () => {
  it.each(routing.locales)("%s: every badge that names Growth names Pro too", (locale) => {
    const growthOnly = badges(loadCatalog(locale, "features.json"))
      .filter(([, text]) => text.includes(PLAN_NAMES.growth) && !text.includes(PLAN_NAMES.pro))
      .map(([path, text]) => `${path}: ${text}`);
    expect(growthOnly).toEqual([]);
  });
});
