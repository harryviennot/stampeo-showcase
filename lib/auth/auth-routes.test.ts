/**
 * Supabase is the sign-in client. Only the pages where someone signs in load
 * it up front, and only through a layout that mounts AuthProvider, since
 * `useAuth()` throws anywhere else. Marketing pages read the session from the
 * cookie instead (`session-hint.ts`).
 *
 * Walks each page's static imports, and its layouts', from the source: a
 * dynamic `import()` is fetched on demand, so it does not count.
 */

import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const ROOT = join(import.meta.dir, "..", "..");
const APP = join(ROOT, "app");
const AUTH_ROUTES = ["login", "onboarding", "reset-password"].map((r) => `app/[locale]/${r}`);

const sources = new Map<string, string>();
const read = (file: string) => {
  if (!sources.has(file)) sources.set(file, readFileSync(file, "utf-8"));
  return sources.get(file)!;
};

const STATIC_IMPORT = /(?:^|\n)\s*(?:import|export)\s+(?!type\b)(?:[^;'"]*?\sfrom\s+)?["']([^"']+)["']/g;

function resolveLocal(from: string, specifier: string): string | undefined {
  const base = specifier.startsWith("@/") ? join(ROOT, specifier.slice(2)) : join(dirname(from), specifier);
  return [`${base}.tsx`, `${base}.ts`, join(base, "index.tsx"), join(base, "index.ts")].find(existsSync);
}

/** Every package specifier and local file a file pulls in through static imports. */
function staticGraph(start: string): { files: Set<string>; packages: Set<string> } {
  const files = new Set<string>();
  const packages = new Set<string>();
  const visit = (file: string) => {
    if (files.has(file)) return;
    files.add(file);
    for (const [, specifier] of read(file).matchAll(STATIC_IMPORT)) {
      if (specifier.startsWith("@/") || specifier.startsWith(".")) {
        const next = resolveLocal(file, specifier);
        if (next) visit(next);
      } else {
        packages.add(specifier);
      }
    }
  };
  visit(start);
  return { files, packages };
}

function pagesUnder(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? pagesUnder(join(dir, entry.name))
      : entry.name === "page.tsx"
        ? [join(dir, entry.name)]
        : [],
  );
}

function layoutsAbove(page: string): string[] {
  const layouts: string[] = [];
  for (let dir = dirname(page); dir.startsWith(APP); dir = dirname(dir)) {
    const layout = join(dir, "layout.tsx");
    if (existsSync(layout)) layouts.push(layout);
  }
  return layouts;
}

const routeOf = (page: string) => relative(ROOT, dirname(page));

const PAGES = pagesUnder(APP).map((page) => {
  const layouts = layoutsAbove(page);
  const graphs = [page, ...layouts].map(staticGraph);
  const files = graphs.flatMap((g) => [...g.files]);
  return {
    route: routeOf(page),
    loadsSupabase: graphs.some((g) => [...g.packages].some((p) => p.startsWith("@supabase/"))),
    callsUseAuth: files.some((f) => !f.endsWith("auth-provider.tsx") && /\buseAuth\(\)/.test(read(f))),
    providesAuth: layouts.some((layout) => read(layout).includes("<AuthProvider>")),
  };
});

describe("AuthProvider and supabase-js", () => {
  test("load up front only on the sign-in pages", () => {
    // Every other page, including the header on each of them, reads the
    // session hint and fetches the client only when someone signs out.
    expect(PAGES.length).toBeGreaterThan(20);
    expect(PAGES.filter((p) => p.loadsSupabase).map((p) => p.route).sort()).toEqual(AUTH_ROUTES);
  });

  test("every page that calls useAuth sits under a layout that provides it", () => {
    const consumers = PAGES.filter((p) => p.callsUseAuth);

    expect(consumers.map((p) => p.route).sort()).toEqual(AUTH_ROUTES);
    expect(consumers.filter((p) => !p.providesAuth).map((p) => p.route)).toEqual([]);
  });
});
