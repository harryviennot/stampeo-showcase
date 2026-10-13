import { cookieValue } from "../attribution/codec";
import { SOURCE_COOKIE } from "../attribution/cookie-names";
import { parseSourceCookie } from "../attribution/source";

/** The longest the /start page waits for the landing to be recorded. */
export const START_FORWARD_CEILING_MS = 1500;

const POLL_MS = 100;

/** The landing is recorded (a readable source cookie) or the ceiling is reached. */
export function shouldForwardFromStart(input: {
  cookieHeader: string | null | undefined;
  elapsedMs: number;
}): boolean {
  if (input.elapsedMs >= START_FORWARD_CEILING_MS) return true;
  return parseSourceCookie(cookieValue(input.cookieHeader, SOURCE_COOKIE)) !== null;
}

export interface ForwardTimers {
  setInterval(fn: () => void, ms: number): unknown;
  clearInterval(id: unknown): void;
}

/**
 * Checks every 100 ms, never at once, so the attribution capture that runs
 * right after the page mounts has written before the first look. Calls
 * `forward` once and stops; the returned function cancels it.
 */
export function forwardWhenRecorded(input: {
  readCookies: () => string;
  now: () => number;
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
    if (!shouldForwardFromStart({ cookieHeader: input.readCookies(), elapsedMs })) return;
    timers.clearInterval(id);
    input.forward();
  }, POLL_MS);
  return () => timers.clearInterval(id);
}
