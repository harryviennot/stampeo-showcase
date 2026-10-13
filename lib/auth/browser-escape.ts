/**
 * Tries to hand the page to the phone's real browser and reports whether the
 * visitor actually left. The page going hidden or being unloaded within the
 * wait means it worked; a page still in front of the visitor when the wait ends
 * means it did not. The document, window and timers are injected.
 */

export interface EscapeDocument {
  readonly visibilityState: string;
  addEventListener(type: "visibilitychange", listener: () => void): void;
  removeEventListener(type: "visibilitychange", listener: () => void): void;
}

export interface EscapeWindow {
  addEventListener(type: "pagehide", listener: () => void): void;
  removeEventListener(type: "pagehide", listener: () => void): void;
}

export interface EscapeTimers {
  setTimeout(fn: () => void, ms: number): unknown;
  clearTimeout(id: unknown): void;
}

export type EscapeOutcome = "left" | "stayed";

export const ESCAPE_WAIT_MS = 1500;

export function attemptBrowserEscape(input: {
  url: string;
  navigate: (url: string) => void;
  doc: EscapeDocument;
  win: EscapeWindow;
  timers?: EscapeTimers;
  timeoutMs?: number;
}): Promise<EscapeOutcome> {
  const { url, navigate, doc, win, timeoutMs = ESCAPE_WAIT_MS } = input;
  const timers: EscapeTimers = input.timers ?? {
    setTimeout: (fn, ms) => setTimeout(fn, ms),
    clearTimeout: (id) => clearTimeout(id as ReturnType<typeof setTimeout>),
  };

  return new Promise((resolve) => {
    const settle = (outcome: EscapeOutcome) => {
      doc.removeEventListener("visibilitychange", onVisibility);
      win.removeEventListener("pagehide", onPageHide);
      timers.clearTimeout(timer);
      resolve(outcome);
    };
    const onVisibility = () => {
      if (doc.visibilityState === "hidden") settle("left");
    };
    const onPageHide = () => settle("left");

    const timer = timers.setTimeout(() => settle("stayed"), timeoutMs);
    doc.addEventListener("visibilitychange", onVisibility);
    win.addEventListener("pagehide", onPageHide);

    try {
      navigate(url);
    } catch {
      settle("stayed");
    }
  });
}
