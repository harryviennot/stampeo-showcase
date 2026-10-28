/**
 * Re-takes help-center screenshots.
 *
 *   bun scripts/help-shots/run.ts <slug>... [--shot 02] [--out DIR] [--app URL] [--headed]
 *   bun scripts/help-shots/run.ts --all
 *   bun scripts/help-shots/run.ts --list
 *
 * Reads the fixture password from the env file named in README.md, never prints it,
 * and writes only PNGs (to public/help by default). Nothing is written to a database.
 */
import path from "node:path";
import { parseArgs } from "node:util";
import { chromium } from "playwright-core";
import { runShots } from "./lib/capture";
import { DEFAULT_APP_URL, openDashboard, openPublic } from "./lib/session";
import { RECIPES } from "./recipes";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    all: { type: "boolean", default: false },
    list: { type: "boolean", default: false },
    shot: { type: "string" },
    out: { type: "string" },
    app: { type: "string" },
    headed: { type: "boolean", default: false },
  },
});

const log = (line: string) => console.log(line);

if (values.list) {
  for (const recipe of RECIPES) {
    log(`${recipe.slug}  (${recipe.session.account ?? "public showcase"}, ${recipe.session.device}${recipe.session.asOwner ? ", owner view" : ""})`);
    for (const shot of recipe.shots) log(`  ${shot.n}  ${shot.shows}`);
  }
  process.exit(0);
}

const chosen = values.all ? RECIPES : RECIPES.filter((r) => positionals.includes(r.slug));
const unknown = positionals.filter((slug) => !RECIPES.some((r) => r.slug === slug));
if (unknown.length > 0 || chosen.length === 0) {
  console.error(`${unknown.length > 0 ? `Unknown slug: ${unknown.join(", ")}. ` : ""}Pass a page slug, --all or --list.`);
  process.exit(2);
}

const outDir = path.resolve(values.out ?? path.join(import.meta.dir, "../../public/help"));
const appUrl = values.app ?? process.env.HELP_SHOTS_APP_URL ?? DEFAULT_APP_URL;

const browser = await chromium.launch({ headless: !values.headed });
try {
  for (const recipe of chosen) {
    log(recipe.slug);
    const shots = values.shot ? recipe.shots.filter((s) => s.n === values.shot) : recipe.shots;
    if (shots.length === 0) {
      log(`  no shot ${values.shot}`);
      continue;
    }
    // One signed-in session per owner/admin view the chosen shots need.
    const views = [...new Set(shots.map((s) => s.asOwner ?? recipe.session.asOwner ?? false))];
    for (const asOwner of views) {
      const group = shots.filter((s) => (s.asOwner ?? recipe.session.asOwner ?? false) === asOwner);
      const spec = { ...recipe.session, asOwner, appUrl, log: (line: string) => log(`  ${line}`) };
      const { ctx, page, appUrl: base } = await (recipe.session.account ? openDashboard(browser, spec) : openPublic(browser, spec));
      try {
        await runShots(page, base, recipe, group, outDir, log);
      } finally {
        await ctx.close();
      }
    }
  }
} finally {
  await browser.close();
}
