import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";

const ROOT = join(import.meta.dir, "..", "..");

// Every sample business on the site is invented: no real shop's name.
const REAL_BRANDS = [/gar[cç]ons\s+barbiers/i];

const SITE_DIRS = ["app", "components", "lib", "messages", "content", "hooks", "i18n", "legal", "public", "scripts"];
const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".md", ".mdx", ".css", ".svg", ".txt", ".html", ".snap"]);

function* siteFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* siteFiles(path);
    else yield path;
  }
}

describe("sample businesses are invented", () => {
  it("no site file, snapshots included, names a real shop", () => {
    const offenders: string[] = [];
    for (const dir of SITE_DIRS) {
      for (const file of siteFiles(join(ROOT, dir))) {
        if (file === import.meta.path || !TEXT_EXTENSIONS.has(extname(file))) continue;
        const text = readFileSync(file, "utf-8");
        if (REAL_BRANDS.some((brand) => brand.test(text))) offenders.push(file.slice(ROOT.length + 1));
      }
    }
    expect(offenders).toEqual([]);
  });
});
