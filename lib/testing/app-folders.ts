import { readdirSync } from "node:fs";
import { join } from "node:path";

const APP_DIR = join(import.meta.dir, "..", "..", "app");

/**
 * The static URL segments directly under `app/<dir>`: its folders, minus
 * dynamic `[x]`, route groups `(x)`, private `_x`, and file routes (`feed.xml`).
 */
export function staticSegments(dir = ""): string[] {
  return readdirSync(join(APP_DIR, dir), { withFileTypes: true })
    .filter((e) => e.isDirectory() && !/^[[(_]/.test(e.name) && !e.name.includes("."))
    .map((e) => e.name);
}
