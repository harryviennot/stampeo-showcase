// Build-time guard on the public analytics ids, run by the Dockerfile.
//
//   node scripts/analytics-ids.mjs pre    before `next build`: the env is well-formed
//   node scripts/analytics-ids.mjs post   after it: the built chunks carry the ids
//
// `NEXT_PUBLIC_*` values are inlined into the bundle at build time, so a missing
// or mistyped one does not break the build: tracking ships dead. These are all
// public ids, but the messages still name a variable and the problem, never its value.
//
// Plain Node ESM, no dependencies: the Docker builder stage has node and no bun.

import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const CHUNKS_DIR = join(".next", "static", "chunks");

// The same shapes `lib/meta-pixel.ts` (`readMetaPixelId`) and
// `lib/google-analytics.ts` (`readMeasurementId`) accept at runtime; GA ids are
// required in capitals here.
const PIXEL_ID = /^[0-9]{5,20}$/;
const GA_ID = /^G-[A-Z0-9]+$/;
const COOKIE_DOMAIN = /^\.[^\s/:]+$/;

/** @param {string | undefined} value */
const clean = (value) => (value ?? "").trim();

/** @param {string} value */
function isHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname !== "";
  } catch {
    return false;
  }
}

/**
 * Every problem with the public ids in this env, as `NAME: problem` lines.
 *
 * @param {Record<string, string | undefined>} env
 * @returns {string[]}
 */
export function checkPublicIds(env) {
  const errors = [];
  const rules = [
    ["NEXT_PUBLIC_META_PIXEL_ID", (v) => PIXEL_ID.test(v), "must be 5 to 20 digits (a Meta pixel id)"],
    ["NEXT_PUBLIC_GA_MEASUREMENT_ID", (v) => GA_ID.test(v), "must look like G-XXXXXXXX (a GA4 measurement id)"],
    ["NEXT_PUBLIC_COOKIE_DOMAIN", (v) => COOKIE_DOMAIN.test(v), "must start with a dot, like .example.com"],
    ["NEXT_PUBLIC_SHOWCASE_URL", isHttpsUrl, "must be an absolute https URL"],
    ["NEXT_PUBLIC_API_URL", isHttpsUrl, "must be an absolute https URL"],
  ];
  for (const [name, valid, problem] of rules) {
    const value = clean(env[name]);
    if (value === "") errors.push(`${name}: is missing or empty; it ${problem}`);
    else if (!valid(value)) errors.push(`${name}: is malformed; it ${problem}`);
  }
  return errors;
}

/** @param {string} dir @returns {string[]} the .js files under dir */
function scriptFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) found.push(...scriptFiles(path));
    else if (entry.endsWith(".js")) found.push(path);
  }
  return found;
}

/** The id as an inlined string literal, so a number that merely contains it does not count. */
function literalPattern(value) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`["'\`]\\s*${escaped}\\s*["'\`]`);
}

/**
 * After a build: each of the pixel id and the GA id appears in at least one
 * script under `dir` (normally `.next/static/chunks`), as a string literal.
 *
 * @param {string} dir
 * @param {Record<string, string | undefined>} env
 * @returns {string[]}
 */
export function checkBuiltChunks(dir, env) {
  if (!existsSync(dir)) return [`${dir}: no build output found; run \`next build\` first`];
  const files = scriptFiles(dir);
  if (files.length === 0) return [`${dir}: contains no scripts; the build did not produce a bundle`];

  const bundle = files.map((file) => readFileSync(file, "utf8"));
  const errors = [];
  for (const name of ["NEXT_PUBLIC_META_PIXEL_ID", "NEXT_PUBLIC_GA_MEASUREMENT_ID"]) {
    const value = clean(env[name]);
    if (value === "") errors.push(`${name}: is empty, so the bundle cannot be checked for it`);
    else if (!bundle.some((source) => literalPattern(value).test(source))) {
      errors.push(`${name}: its value is not in any built chunk; the build did not inline it`);
    }
  }
  return errors;
}

function main(mode) {
  if (mode !== "pre" && mode !== "post") {
    console.error("usage: node scripts/analytics-ids.mjs pre|post");
    return 2;
  }
  const errors = mode === "pre" ? checkPublicIds(process.env) : checkBuiltChunks(CHUNKS_DIR, process.env);
  if (errors.length === 0) {
    console.log(`analytics-ids (${mode}): ok`);
    return 0;
  }
  console.error(`analytics-ids (${mode}): ${errors.length} problem(s)`);
  for (const error of errors) console.error(`  - ${error}`);
  console.error(
    "Set the NEXT_PUBLIC_* build args, or build with --build-arg REQUIRE_ANALYTICS_IDS=0 to skip this check on purpose.",
  );
  return 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  process.exitCode = main(process.argv[2]);
}
