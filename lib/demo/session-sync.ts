/**
 * How the landing demo keeps its page in step with the server session.
 *
 * Wallet registers the pass with the backend on its own, so the page can learn
 * of it through the event stream, by re-reading the session when the tab comes
 * back, or by polling while the install is still unconfirmed. All three feed
 * `receive`, which captures `demo_step_reached` once per real change.
 *
 * Browser handles (fetch, timers, visibility, PostHog) are injected so the
 * decisions run under `bun test`; `hooks/useDemoSession.ts` wires them.
 */

export const PASS_POLL_INTERVAL_MS = 3000;
export const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;

// The pass was opened on the phone; Wallet's registration has not been seen yet.
const AWAITING_INSTALL = "pass_downloaded";

export interface SessionSnapshot {
  status: string;
  stamps: number;
  points?: number;
}

export interface SessionSyncDeps {
  cardType: "stamp" | "points";
  /** Reads the session from the server; null when it cannot be read right now. */
  fetchSession: (token: string) => Promise<SessionSnapshot | null>;
  /** Pushes a snapshot into the page's state. */
  apply: (snapshot: SessionSnapshot) => void;
  capture: (event: string, props: Record<string, unknown>) => void;
  isHidden: () => boolean;
  now: () => number;
  startTimer: (fn: () => Promise<void> | void, ms: number) => unknown;
  stopTimer: (timer: unknown) => void;
}

export interface SessionSync {
  /** Start tracking a session at the state the page already shows (no capture). */
  adopt: (token: string, snapshot: SessionSnapshot) => void;
  /** A state reported by the event stream, a poll or a re-read. */
  receive: (snapshot: SessionSnapshot) => void;
  /** The tab is visible again: restart the poll and re-read the session once. */
  pageVisible: () => Promise<void>;
  pageHidden: () => void;
  /** Forget the session (reset or unmount). */
  stop: () => void;
  /** No status change for the inactivity limit. */
  isIdle: () => boolean;
}

export function createSessionSync(deps: SessionSyncDeps): SessionSync {
  let token: string | null = null;
  let status = "loading";
  let lastChangeAt = deps.now();
  // Bumped on every state change so a slower read can tell it is out of date.
  let version = 0;
  let timer: unknown = null;
  let pollInFlight = false;

  function stopPolling() {
    if (timer === null) return;
    deps.stopTimer(timer);
    timer = null;
  }

  function syncPolling() {
    const wanted = token !== null && status === AWAITING_INSTALL && !deps.isHidden();
    if (!wanted) {
      stopPolling();
    } else if (timer === null) {
      timer = deps.startTimer(poll, PASS_POLL_INTERVAL_MS);
    }
  }

  async function refresh() {
    if (token === null) return;
    const seenVersion = version;
    const snapshot = await deps.fetchSession(token);
    // An unreadable session is retried on the next tick, never treated as gone.
    if (snapshot === null || version !== seenVersion) return;
    receive(snapshot);
  }

  async function poll() {
    if (isIdle()) {
      stopPolling();
      return;
    }
    if (pollInFlight) return;
    pollInFlight = true;
    try {
      await refresh();
    } finally {
      pollInFlight = false;
    }
  }

  function receive(snapshot: SessionSnapshot) {
    version++;
    if (snapshot.status !== status) {
      lastChangeAt = deps.now();
      deps.capture("demo_step_reached", {
        step: snapshot.status,
        previous_step: status,
        stamps: snapshot.stamps,
        points: snapshot.points,
        card_type: deps.cardType,
      });
      status = snapshot.status;
    }
    deps.apply(snapshot);
    syncPolling();
  }

  function isIdle() {
    return deps.now() - lastChangeAt > INACTIVITY_TIMEOUT_MS;
  }

  return {
    adopt(newToken, snapshot) {
      version++;
      token = newToken;
      status = snapshot.status;
      lastChangeAt = deps.now();
      stopPolling();
      syncPolling();
    },
    receive,
    async pageVisible() {
      lastChangeAt = deps.now();
      syncPolling();
      await refresh();
    },
    pageHidden: stopPolling,
    stop() {
      version++;
      token = null;
      status = "loading";
      stopPolling();
    },
    isIdle,
  };
}
