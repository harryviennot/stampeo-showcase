import { describe, expect, it } from "bun:test";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

import { SECTOR_THEMES } from "../components/landing-variant/sector-themes";
import { HALLOWEEN_STAMP_SAMPLES } from "./halloween-samples";
import { STAMP_SAMPLES } from "./loyalty-samples";

const ROOT = join(import.meta.dir, "..");
const PUBLIC = join(ROOT, "public");

// Every sample business on the site is fictional: no real shop's name or logo.
const REAL_BRAND = /gar[cç]ons\s+barbiers/i;
const REAL_BRAND_LOGO = /themes\/barber\//;

const SITE_DIRS = ["app", "components", "lib", "messages", "content", "hooks", "i18n", "legal", "public", "scripts"];
const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".md", ".mdx", ".css", ".svg", ".txt", ".snap"]);

function* siteFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* siteFiles(path);
    else yield path;
  }
}

describe("sample businesses are fictional", () => {
  it("no site file names the real barbershop or points at its logo", () => {
    const offenders: string[] = [];
    for (const dir of SITE_DIRS) {
      for (const file of siteFiles(join(ROOT, dir))) {
        if (file === import.meta.path || !TEXT_EXTENSIONS.has(extname(file))) continue;
        const text = readFileSync(file, "utf-8");
        if (REAL_BRAND.test(text) || REAL_BRAND_LOGO.test(text)) offenders.push(file.slice(ROOT.length + 1));
      }
    }
    expect(offenders).toEqual([]);
  });

  it("the old logo file is gone from public/themes", () => {
    expect(existsSync(join(PUBLIC, "themes", "barber"))).toBe(false);
  });
});

describe("the barbershop sample brand", () => {
  const sample = STAMP_SAMPLES.find((s) => s.id === "barber");
  const pumpkinNight = HALLOWEEN_STAMP_SAMPLES.find((s) => s.id === "halloween-pumpkin-night");
  const slide = SECTOR_THEMES.find((t) => t.id === "barber");

  it("wears one logo on the gallery card, the sector slide and the Halloween card", () => {
    const logo = sample?.design.logo_url;
    expect(logo).toBeTruthy();
    expect(slide?.walletLogoUrl).toBe(logo);
    expect(pumpkinNight?.design.logo_url).toBe(logo);
  });

  it("serves a logo that fits the card header and stays light", () => {
    const file = join(PUBLIC, sample?.design.logo_url ?? "missing");
    expect(existsSync(file)).toBe(true);
    expect(statSync(file).size).toBeLessThanOrEqual(60 * 1024);
  });
});
