import fs from "node:fs";
import path from "node:path";
import type { Page } from "playwright-core";
import { DEVICES } from "./devices";
import { settle } from "./overlays";
import type { Recipe, Shot, ShotHelpers } from "./types";

/** Builds the helpers one shot runs with; `out` is the PNG to write. */
export function shotHelpers(page: Page, appUrl: string, recipe: Recipe, out: string): ShotHelpers {
  const base = DEVICES[recipe.session.device].viewport!;
  const write = async (clip: { x: number; y: number; width: number; height: number }) => {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await page.screenshot({ path: out, clip, animations: "disabled", caret: "hide" });
  };
  return {
    page,
    async open(route) {
      await page.goto(appUrl + route, { waitUntil: "domcontentloaded" });
      await settle(page);
    },
    settle: (ms) => settle(page, ms),
    async tall(height) {
      await page.setViewportSize({ width: base.width, height });
      await page.waitForTimeout(600);
    },
    async snap(target, opts) {
      const pad = opts?.pad ?? 0;
      await target.scrollIntoViewIfNeeded();
      const box = await target.boundingBox();
      if (!box) throw new Error("the element to capture has no box");
      const viewport = page.viewportSize()!;
      const x = Math.max(0, box.x - pad);
      const y = Math.max(0, box.y - pad);
      const width = Math.min(viewport.width - x, box.width + 2 * pad);
      const height = box.height + 2 * pad;
      if (y + height > viewport.height + 0.5) throw new Error(`the element is ${Math.round(y + height)}px down, past the ${viewport.height}px viewport: call h.tall()`);
      await write({ x, y, width, height });
    },
    async snapBand(container, band) {
      await container.scrollIntoViewIfNeeded();
      const [box, top, bottom] = await Promise.all([container.boundingBox(), band.from.boundingBox(), band.to.boundingBox()]);
      if (!box || !top || !bottom) throw new Error("an element to capture has no box");
      const viewport = page.viewportSize()!;
      const y = Math.max(0, top.y - (band.padTop ?? 0));
      const height = bottom.y + bottom.height + (band.padBottom ?? 0) - y;
      if (y + height > viewport.height + 0.5) throw new Error(`the band reaches ${Math.round(y + height)}px, past the ${viewport.height}px viewport: call h.tall()`);
      await write({ x: Math.max(0, box.x), y, width: Math.min(viewport.width - box.x, box.width), height });
    },
    snapClip: write,
  };
}

/** Runs the chosen shots of a recipe, resetting the viewport after each. Returns the files written. */
export async function runShots(page: Page, appUrl: string, recipe: Recipe, shots: Shot[], outDir: string, log: (line: string) => void): Promise<string[]> {
  const written: string[] = [];
  for (const shot of shots) {
    const file = `${recipe.slug}-${shot.n}.png`;
    const out = path.join(outDir, file);
    try {
      await shot.run(shotHelpers(page, appUrl, recipe, out));
      written.push(out);
      log(`  ${file}: ${shot.shows}`);
    } catch (error) {
      log(`  ${file}: FAILED ${(error as Error).message.split("\n")[0]}`);
      process.exitCode = 1;
    } finally {
      await page.setViewportSize(DEVICES[recipe.session.device].viewport!);
    }
  }
  return written;
}
