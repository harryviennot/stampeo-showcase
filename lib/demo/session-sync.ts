/**
 * How the landing demo keeps its page in step with the server session.
 *
 * Wallet registers the pass with the backend on its own, so the page can learn
 * of it through the event stream, by re-reading the session when the tab comes
 * back, or by polling while the install is still unconfirmed. Every status read
 * (including the hook's SSE-fallback poll) feeds `receive`, which captures
 * `demo_step_reached` once per real change.
 *
 * Browser handles (fetch, timers, visibility, PostHog) are injected so the
 * decisions run under `bun test`; `hooks/useDemoSession.ts` wires them.
 */

export const PASS_POLL_INTERVAL_MS = 3000;
export const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;

// The pass was opened on the phone; Wallet's registration has not been seen yet.
const AWAITING_INSTALL = "pass_downloaded";
const INSTALLED = "pass_installed";

export interface SessionSnapshot {
  status: string;
  stamps: number;
  points?: number;
}

export interface SessionSyncDeps {
  cardType: "stamp" | "points";
  /** Reads the session from the server; null on a network error or a 404 (both retried until idle). */
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
  /**
   * The visitor tapped Add on this phone: poll until the card is installed, even while the page still shows it
   * pending. iOS opens the Wallet sheet over the page without hiding it, so nothing else would start the poll.
   */
  expectInstall: () => void;
  /** The tab is visible again: restart the poll and re-read the session once. */
  pageVisible: () => Promise<void>;
  pageHidden: () => void;
  /** Forget the session (reset or unmount). */
  stop: () => void;
  /** No status change or return to the page within INACTIVITY_TIMEOUT_MS. */
  isIdle: () => boolean;
}

export function createSessionSync(deps: SessionSyncDeps): SessionSync {
  let token: string | null = null;
  let status = "loading";
  let lastChangeAt = deps.now();
  // Bumped on every adopt, receive and stop, so a slower read can tell it is out of date.
  let version = 0;
  let timer: unknown = null;
  let pollInFlight = false;
  let addTapped = false;

  function stopPolling() {
    if (timer === null) return;
    deps.stopTimer(timer);
    timer = null;
  }

  function syncPolling() {
    const awaiting = status === AWAITING_INSTALL || (addTapped && status !== INSTALLED);
    const wanted = token !== null && awaiting && !deps.isHidden();
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
    // A null read (network error or 404) changes nothing; the next tick tries again until idle.
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
      addTapped = false;
      token = newToken;
      status = snapshot.status;
      lastChangeAt = deps.now();
      stopPolling();
      syncPolling();
    },
    receive,
    expectInstall() {
      addTapped = true;
      lastChangeAt = deps.now();
      syncPolling();
    },
    async pageVisible() {
      lastChangeAt = deps.now();
      syncPolling();
      await refresh();
    },
    pageHidden: stopPolling,
    stop() {
      version++;
      addTapped = false;
      token = null;
      status = "loading";
      stopPolling();
    },
    isIdle,
  };
}
