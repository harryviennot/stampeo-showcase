// Resizes the backend's demo card art (backend/pass_assets/demo: the 8 stickers with grey twins and the points wallpaper) into public/demo/stickers/.
// Run from the showcase root: bun scripts/demo/build-demo-stickers.ts [path to backend/pass_assets/demo]
import { existsSync } from "node:fs";
import { mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { DEMO_STICKER_SLOTS } from "../../lib/demo/card";

const STICKER_PX = 192;
const WALLPAPER_SIZE = { width: 750, height: 288 };
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(ROOT, "public", "demo", "stickers");

/** The art folder: the argument, else the first backend/pass_assets/demo found above this repo (the workspace layout). */
function findArtDir(arg?: string): string {
  if (arg) return resolve(arg);
  for (let dir = ROOT; dirname(dir) !== dir; dir = dirname(dir)) {
    const candidate = join(dir, "backend", "pass_assets", "demo");
    if (existsSync(candidate)) return candidate;
  }
  throw new Error("backend/pass_assets/demo not found: pass its path as the first argument");
}

async function main() {
  const art = findArtDir(process.argv[2]);
  await mkdir(OUT, { recursive: true });
  for (const file of await readdir(OUT)) await rm(join(OUT, file));

  const png = { compressionLevel: 9 } as const;
  for (const slug of DEMO_STICKER_SLOTS) {
    for (const name of [`${slug}.png`, `${slug}-grey.png`]) {
      await sharp(join(art, "stickers", name)).resize(STICKER_PX, STICKER_PX).png(png).toFile(join(OUT, name));
    }
  }
  await sharp(join(art, "wallpaper.png")).resize(WALLPAPER_SIZE.width, WALLPAPER_SIZE.height).png(png).toFile(join(OUT, "wallpaper.png"));
  console.log(`demo stickers: ${DEMO_STICKER_SLOTS.length * 2 + 1} files from ${art} into ${OUT}`);
}

if (import.meta.main) await main();
