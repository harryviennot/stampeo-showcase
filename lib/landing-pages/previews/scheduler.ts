/** The browser's clock, timers and frames as the preview controllers take them, so a test can drive them by hand. */
export interface Scheduler {
  now(): number;
  after(run: () => void, ms: number): number;
  cancelAfter(id: number): void;
  frame(run: (now: number) => void): number;
  cancelFrame(id: number): void;
}

export const browserScheduler: Scheduler = {
  now: () => performance.now(),
  after: (run, ms) => window.setTimeout(run, ms),
  cancelAfter: (id) => window.clearTimeout(id),
  frame: (run) => requestAnimationFrame(run),
  cancelFrame: (id) => cancelAnimationFrame(id),
};
