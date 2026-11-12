import * as features from "../landing-pages/copy/features";
import * as howItWorks from "../landing-pages/copy/how-it-works";
import * as outcomes from "../landing-pages/copy/outcomes";
import * as platform from "../landing-pages/copy/platform";
import * as programTypes from "../landing-pages/copy/program-types";
import * as shared from "../landing-pages/copy/shared";

/**
 * The copy of the `/us/landing-pages/*` pages as the tests walk it: every
 * string with its path (`OUTCOMES.regulars.example.text`), so a failure names
 * the line, not just the file.
 */

export interface Line {
  path: string;
  value: string;
}

/** Every string under `value`, with its path (`FAQ.items[0].answer`). Functions are not copy. */
export function lines(value: unknown, path: string): Line[] {
  if (typeof value === "string") return [{ path, value }];
  if (Array.isArray(value)) return value.flatMap((item, index) => lines(item, `${path}[${index}]`));
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, child]) => lines(child, `${path}.${key}`));
  }
  return [];
}

export interface Located {
  path: string;
  object: Record<string, unknown>;
}

/** Every plain object under `value` that has all of `keys`, with its path. */
export function objectsWith(value: unknown, keys: string[], path: string): Located[] {
  if (Array.isArray(value)) return value.flatMap((item, index) => objectsWith(item, keys, `${path}[${index}]`));
  if (typeof value !== "object" || value === null) return [];
  const object = value as Record<string, unknown>;
  const here = keys.every((key) => key in object) ? [{ path, object }] : [];
  return [...here, ...Object.entries(object).flatMap(([key, child]) => objectsWith(child, keys, `${path}.${key}`))];
}

export const MODULES = {
  ...howItWorks,
  ...features,
  ...outcomes,
  ...platform,
  ...programTypes,
  ...shared,
} as Record<string, unknown>;

/** Every string of every copy module. */
export const ALL: Line[] = Object.entries(MODULES).flatMap(([name, value]) => lines(value, name));

/** The four pages' own copy objects, by name. */
export const PAGES = {
  HOW_IT_WORKS: howItWorks.HOW_IT_WORKS,
  FEATURES: features.FEATURES,
  OUTCOMES: outcomes.OUTCOMES,
  PLATFORM: platform.PLATFORM,
};

/** The paths whose lines match `pattern`. */
export const offenders = (pattern: RegExp) => ALL.filter((line) => pattern.test(line.value)).map((line) => line.path);

export interface Mention {
  path: string;
  /** The plan label of the nearest object above the line that names one. */
  plan: string | undefined;
}

/**
 * Every string under `value` that matches `pattern`, with the plan label of
 * the nearest object above it that has a `plan` (a Moment, Fact, Tile or
 * program type). A mention inside a labelled object inherits its label.
 */
export function mentions(value: unknown, pattern: RegExp, path: string, plan?: string): Mention[] {
  if (typeof value === "string") return pattern.test(value) ? [{ path, plan }] : [];
  if (Array.isArray(value)) return value.flatMap((item, index) => mentions(item, pattern, `${path}[${index}]`, plan));
  if (typeof value !== "object" || value === null) return [];
  const own = (value as { plan?: unknown }).plan;
  const here = typeof own === "string" ? own : plan;
  return Object.entries(value).flatMap(([key, child]) => mentions(child, pattern, `${path}.${key}`, here));
}
