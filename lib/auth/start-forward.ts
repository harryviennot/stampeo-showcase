import { cookieValue } from "../attribution/codec";
import { SOURCE_COOKIE } from "../attribution/cookie-names";
import { parseSourceCookie } from "../attribution/source";

/** The longest the /start page waits for the landing to be recorded. */
export const START_FORWARD_CEILING_MS = 1500;

const POLL_MS = 100;

/**
 * This visit's landing is recorded (a source cookie whose landing time is no
 * earlier than the page load, give or take the second the time is rounded to)
 * or the ceiling is reached. A cookie from an earlier visit does not count.
 */
export function shouldForwardFromStart(input: {
  cookieHeader: string | null | undefined;
  elapsedMs: number;
  /** Epoch seconds at which the page loaded. */
  pageLoadedAt: number;
}): boolean {
  if (input.elapsedMs >= START_FORWARD_CEILING_MS) return true;
  const source = parseSourceCookie(cookieValue(input.cookieHeader, SOURCE_COOKIE));
  return source !== null && source.at >= input.pageLoadedAt - 1;
}

export interface ForwardTimers {
  setInterval(fn: () => void, ms: number): unknown;
  clearInterval(id: unknown): void;
}

/**
 * Checks every 100 ms, never at once, so the attribution capture that runs
 * right after the page mounts has written before the first look. Calls
 * `forward` once and stops; the returned function cancels it. It reads only
 * cookies and the clock, so where the visitor goes is the caller's alone.
 */
export function forwardWhenRecorded(input: {
  readCookies: () => string;
  now: () => number;
  /** Epoch seconds at which the page loaded. */
  pageLoadedAt: number;
  forward: () => void;
  timers?: ForwardTimers;
}): () => void {
  const timers: ForwardTimers = input.timers ?? {
    setInterval: (fn, ms) => setInterval(fn, ms),
    clearInterval: (id) => clearInterval(id as ReturnType<typeof setInterval>),
  };
  const startedAt = input.now();
  const id = timers.setInterval(() => {
    const elapsedMs = input.now() - startedAt;
    const cookieHeader = input.readCookies();
    if (!shouldForwardFromStart({ cookieHeader, elapsedMs, pageLoadedAt: input.pageLoadedAt })) return;
    timers.clearInterval(id);
    input.forward();
  }, POLL_MS);
  return () => timers.clearInterval(id);
}
