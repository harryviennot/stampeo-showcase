/**
 * Stops the page behind a full-screen layer from scrolling. Locks nest: the
 * page scrolls again, with whatever overflow it had before, only once every
 * lock has been released.
 */

interface ScrollableBody {
  style: { overflow: string };
}

const locks = new WeakMap<ScrollableBody, { count: number; previous: string }>();

/** Locks the page's scroll and returns the function that releases this lock; releasing twice is harmless. */
export function lockBodyScroll(body: ScrollableBody = document.body): () => void {
  const state = locks.get(body) ?? { count: 0, previous: body.style.overflow };
  if (state.count === 0) state.previous = body.style.overflow;
  state.count += 1;
  locks.set(body, state);
  body.style.overflow = "hidden";

  let released = false;
  return () => {
    if (released) return;
    released = true;
    state.count -= 1;
    if (state.count === 0) body.style.overflow = state.previous;
  };
}
