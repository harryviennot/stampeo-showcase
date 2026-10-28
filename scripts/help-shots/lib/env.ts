import fs from "node:fs";
import path from "node:path";

/** Env file holding the fixture credentials: HELP_SHOTS_ENV, else promo-videos/.env.tools in an ancestor folder. */
export function findEnvFile(): string {
  if (process.env.HELP_SHOTS_ENV) return process.env.HELP_SHOTS_ENV;
  let dir = import.meta.dir;
  for (;;) {
    const candidate = path.join(dir, "promo-videos", ".env.tools");
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error("fixture env file not found: set HELP_SHOTS_ENV to the path of promo-videos/.env.tools");
    }
    dir = parent;
  }
}

/** Reads one key from the env file. The value is returned to the caller and never logged. */
export function readEnvKey(key: string): string {
  const file = findEnvFile();
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && match[1] === key) return match[2].replace(/^["']|["']$/g, "");
  }
  throw new Error(`${key} is not set in ${file}`);
}
