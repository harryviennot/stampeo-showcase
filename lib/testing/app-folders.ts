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

/** Every `page.tsx` under an absolute folder, at any depth. */
export function pagesUnder(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? pagesUnder(join(dir, entry.name))
      : entry.name === "page.tsx"
        ? [join(dir, entry.name)]
        : [],
  );
}
