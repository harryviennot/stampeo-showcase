import type { Scheduler } from "../landing-pages/previews/scheduler";

/** A frame is this long on the fake clock, in ms. */
const FRAME_MS = 16;

/**
 * A `Scheduler` that runs on a clock a test moves with `advance`: timers fire at their time, frames every 16ms,
 * in order. `pending` is how many timers and frames are waiting.
 */
export function fakeScheduler(): Scheduler & { advance(ms: number): void; readonly pending: number } {
  let time = 0;
  let next = 1;
  const timers = new Map<number, { at: number; run: () => void }>();
  const frames = new Map<number, (now: number) => void>();
  let frameAt = FRAME_MS;

  return {
    now: () => time,
    after(run, ms) {
      timers.set(next, { at: time + ms, run });
      return next++;
    },
    cancelAfter: (id) => void timers.delete(id),
    frame(run) {
      if (frames.size === 0) frameAt = Math.max(frameAt, Math.ceil((time + 1) / FRAME_MS) * FRAME_MS);
      frames.set(next, run);
      return next++;
    },
    cancelFrame: (id) => void frames.delete(id),
    get pending() {
      return timers.size + frames.size;
    },
    advance(ms) {
      const end = time + ms;

      for (;;) {
        const due = [...timers.entries()].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        const frameDue = frames.size > 0 && frameAt <= end;

        if (!due && !frameDue) break;
        if (due && (!frameDue || due[1].at <= frameAt)) {
          time = Math.max(time, due[1].at);
          timers.delete(due[0]);
          due[1].run();
        } else {
          time = frameAt;
          frameAt += FRAME_MS;
          const batch = [...frames.entries()];
          frames.clear();
          for (const [, run] of batch) run(time);
        }
      }
      time = end;
    },
  };
}
