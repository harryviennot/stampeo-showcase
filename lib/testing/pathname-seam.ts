import { mock } from "bun:test";

/**
 * A server render has no router: `usePathname` answers null and `useRouter` throws. This stands in for both with
 * the path a test sets (the real answer when it sets none) and a router that records what it is asked to do.
 * Importing this module installs it for the whole test run.
 */
const realNavigation = await import("next/navigation");
// Taken before the module is mocked: afterwards the namespace answers with the stand-in.
const realPathname = realNavigation.usePathname;

export const page: { pathname: string | null } = { pathname: null };

/** The calls the stand-in router has received, as `[method, ...arguments]`. */
export const routed: unknown[][] = [];

const router = Object.fromEntries(
  ["push", "replace", "prefetch", "back", "forward", "refresh"].map((method) => [method, (...args: unknown[]) => routed.push([method, ...args])]),
);

mock.module("next/navigation", () => ({
  ...realNavigation,
  usePathname: () => page.pathname ?? realPathname(),
  useRouter: () => router,
}));

/** Runs `render` as the page at `pathname` (with its locale, as the browser has it), and puts the seam back. */
export function renderAtPath<T>(pathname: string, render: () => T): T {
  page.pathname = pathname;
  try {
    return render();
  } finally {
    page.pathname = null;
  }
}

/** `renderAtPath` for a render that resolves async server components. */
export async function renderAtPathAsync<T>(pathname: string, render: () => Promise<T>): Promise<T> {
  page.pathname = pathname;
  try {
    return await render();
  } finally {
    page.pathname = null;
  }
}
