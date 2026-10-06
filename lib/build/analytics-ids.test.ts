/**
 * The production build's guard on the public analytics ids.
 *
 * `NEXT_PUBLIC_*` values are baked into the bundle at build time, so a missing
 * or mistyped id does not fail anything: the site ships and tracking is quietly
 * dead, or pointed at the wrong property. The Docker build runs this guard
 * before `next build` (the env is well-formed) and after it (the bundle really
 * carries the ids). These cases start from the env a deploy would pass.
 */

import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { readMeasurementId } from "../google-analytics";
import { readMetaPixelId } from "../meta-pixel";
import { checkBuiltChunks, checkPublicIds } from "../../scripts/analytics-ids.mjs";

const SCRIPT = join(import.meta.dir, "..", "..", "scripts", "analytics-ids.mjs");

const VALID = {
  NEXT_PUBLIC_META_PIXEL_ID: "1088158323750710",
  NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-ZFZ6JLPFXN",
  NEXT_PUBLIC_COOKIE_DOMAIN: ".stampeo.app",
  NEXT_PUBLIC_SHOWCASE_URL: "https://stampeo.app",
  NEXT_PUBLIC_API_URL: "https://api.stampeo.app",
};

const without = (name: string) => {
  const env: Record<string, string> = { ...VALID };
  delete env[name];
  return env;
};

describe("the env a production build is given", () => {
  test("production's own values pass", () => {
    expect(checkPublicIds(VALID)).toEqual([]);
  });

  test("a URL may carry a path or a trailing slash", () => {
    expect(
      checkPublicIds({ ...VALID, NEXT_PUBLIC_API_URL: "https://api.stampeo.app/", NEXT_PUBLIC_SHOWCASE_URL: "https://stampeo.app/en" }),
    ).toEqual([]);
  });

  test.each([
    ["a missing pixel id", "NEXT_PUBLIC_META_PIXEL_ID", undefined],
    ["a blank pixel id (an empty build arg)", "NEXT_PUBLIC_META_PIXEL_ID", "  "],
    ["the GA id pasted into the pixel var", "NEXT_PUBLIC_META_PIXEL_ID", "G-ZFZ6JLPFXN"],
    ["a pixel id with a stray character", "NEXT_PUBLIC_META_PIXEL_ID", "1088158323750710x"],
    ["a pixel id that is too short", "NEXT_PUBLIC_META_PIXEL_ID", "1234"],
    ["a missing GA id", "NEXT_PUBLIC_GA_MEASUREMENT_ID", undefined],
    ["the pixel id pasted into the GA var", "NEXT_PUBLIC_GA_MEASUREMENT_ID", "1088158323750710"],
    ["a GTM container id in the GA var", "NEXT_PUBLIC_GA_MEASUREMENT_ID", "GTM-ABC1234"],
    ["a lowercase GA id", "NEXT_PUBLIC_GA_MEASUREMENT_ID", "g-zfz6jlpfxn"],
    ["a cookie domain without its leading dot", "NEXT_PUBLIC_COOKIE_DOMAIN", "stampeo.app"],
    ["a missing cookie domain", "NEXT_PUBLIC_COOKIE_DOMAIN", undefined],
    ["a cookie domain that is only a dot", "NEXT_PUBLIC_COOKIE_DOMAIN", "."],
    ["a cookie domain with a scheme", "NEXT_PUBLIC_COOKIE_DOMAIN", "https://.stampeo.app"],
    ["a showcase URL over http", "NEXT_PUBLIC_SHOWCASE_URL", "http://stampeo.app"],
    ["a showcase URL with no scheme", "NEXT_PUBLIC_SHOWCASE_URL", "stampeo.app"],
    ["a missing showcase URL", "NEXT_PUBLIC_SHOWCASE_URL", undefined],
    ["an API URL pointing at localhost over http", "NEXT_PUBLIC_API_URL", "http://localhost:8000"],
    ["an API URL that is not a URL", "NEXT_PUBLIC_API_URL", "not a url"],
    ["a missing API URL", "NEXT_PUBLIC_API_URL", undefined],
  ] as const)("%s fails, naming the variable", (_case, name, value) => {
    const env = value === undefined ? without(name) : { ...VALID, [name]: value };
    const errors = checkPublicIds(env);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain(name);
  });

  test("every problem is reported at once, so one deploy attempt is enough to fix them", () => {
    const errors = checkPublicIds({});
    expect(errors).toHaveLength(5);
    for (const name of Object.keys(VALID)) {
      expect(errors.filter((message) => message.includes(name))).toHaveLength(1);
    }
  });

  test("a bad value is never echoed back", () => {
    const errors = checkPublicIds({ ...VALID, NEXT_PUBLIC_META_PIXEL_ID: "G-SOMETHING-ELSE" });
    expect(errors.join("\n")).not.toContain("G-SOMETHING-ELSE");
  });

  test.each(["1088158323750710", " 1088158323750710 ", "12345", "1234", "G-ZFZ6JLPFXN", "", "  ", "12 34 56"])(
    "agrees with the runtime's pixel id rule for %p",
    (raw) => {
      const accepted = checkPublicIds({ ...VALID, NEXT_PUBLIC_META_PIXEL_ID: raw }).length === 0;
      expect(accepted).toBe(readMetaPixelId(raw) !== null);
    },
  );

  test.each(["G-ZFZ6JLPFXN", " G-ZFZ6JLPFXN ", "G-", "GTM-ABC1234", "1088158323750710", ""])(
    "agrees with the runtime's GA id rule for %p",
    (raw) => {
      const accepted = checkPublicIds({ ...VALID, NEXT_PUBLIC_GA_MEASUREMENT_ID: raw }).length === 0;
      expect(accepted).toBe(readMeasurementId(raw) !== null);
    },
  );
});

describe("the built bundle", () => {
  let root: string;
  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), "analytics-ids-"));
  });
  afterAll(() => rmSync(root, { recursive: true, force: true }));

  const chunks = (name: string, files: Record<string, string>) => {
    const dir = join(root, name);
    for (const [path, body] of Object.entries(files)) {
      mkdirSync(join(dir, path, ".."), { recursive: true });
      writeFileSync(join(dir, path), body);
    }
    mkdirSync(dir, { recursive: true });
    return dir;
  };

  test("passes when the chunks carry both ids, wherever they sit", () => {
    const dir = chunks("both", {
      "0abc.js": `x.init("${VALID.NEXT_PUBLIC_META_PIXEL_ID}")`,
      "app/layout-1.js": `gtag("config","${VALID.NEXT_PUBLIC_GA_MEASUREMENT_ID}")`,
    });
    expect(checkBuiltChunks(dir, VALID)).toEqual([]);
  });

  test("names the id a build left out", () => {
    const dir = chunks("no-pixel", { "a.js": `gtag("config","${VALID.NEXT_PUBLIC_GA_MEASUREMENT_ID}")` });
    const errors = checkBuiltChunks(dir, VALID);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("NEXT_PUBLIC_META_PIXEL_ID");
  });

  test("a build with neither id names both", () => {
    const dir = chunks("neither", { "a.js": "console.log(1)" });
    expect(checkBuiltChunks(dir, VALID)).toHaveLength(2);
  });

  test("an id that only appears outside a script does not count", () => {
    const dir = chunks("notes", {
      "a.js": "console.log(1)",
      "notes.txt": `${VALID.NEXT_PUBLIC_META_PIXEL_ID} ${VALID.NEXT_PUBLIC_GA_MEASUREMENT_ID}`,
    });
    expect(checkBuiltChunks(dir, VALID)).toHaveLength(2);
  });

  test("a directory with no build in it is reported, not passed", () => {
    expect(checkBuiltChunks(join(root, "never-built"), VALID)).toHaveLength(1);
  });
});

describe("running it the way the Dockerfile does", () => {
  const run = (mode: string | null, env: Record<string, string>, cwd?: string) =>
    spawnSync(process.execPath, [SCRIPT, ...(mode ? [mode] : [])], {
      env: { PATH: process.env.PATH ?? "", ...env },
      cwd,
      encoding: "utf8",
    });

  test("pre passes quietly on a good env", () => {
    const result = run("pre", VALID);
    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
  });

  test("pre exits non-zero, naming every problem and echoing no value", () => {
    const result = run("pre", { ...VALID, NEXT_PUBLIC_META_PIXEL_ID: "G-NOTAPIXEL", NEXT_PUBLIC_COOKIE_DOMAIN: "stampeo.app" });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("NEXT_PUBLIC_META_PIXEL_ID");
    expect(result.stderr).toContain("NEXT_PUBLIC_COOKIE_DOMAIN");
    expect(result.stdout + result.stderr).not.toContain("G-NOTAPIXEL");
  });

  test("post reads .next/static/chunks under the working directory", () => {
    const project = mkdtempSync(join(tmpdir(), "analytics-ids-cli-"));
    try {
      const dir = join(project, ".next", "static", "chunks");
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "a.js"), `"${VALID.NEXT_PUBLIC_META_PIXEL_ID}"`);

      const missing = run("post", VALID, project);
      expect(missing.status).toBe(1);
      expect(missing.stderr).toContain("NEXT_PUBLIC_GA_MEASUREMENT_ID");

      writeFileSync(join(dir, "b.js"), `"${VALID.NEXT_PUBLIC_GA_MEASUREMENT_ID}"`);
      expect(run("post", VALID, project).status).toBe(0);
    } finally {
      rmSync(project, { recursive: true, force: true });
    }
  });

  test.each([null, "build"])("an unknown mode %p is a usage error", (mode) => {
    expect(run(mode, VALID).status).toBe(2);
  });
});
