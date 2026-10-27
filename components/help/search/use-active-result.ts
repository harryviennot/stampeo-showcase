"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { resultId } from "./HelpSearchResults";

/**
 * Which result the keyboard is on: the first while typing, moved by the arrow
 * keys, and followed by Enter or the keyboard's Search key. Rows are links, so
 * following one is clicking it.
 */
export function useActiveResult(count: number, listId: string) {
  const [index, setIndex] = useState(0);
  const active = count === 0 ? -1 : Math.min(index, count - 1);

  return {
    active,
    activeId: active >= 0 ? resultId(listId, active) : undefined,
    reset: () => setIndex(0),
    onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
      if (count === 0 || (event.key !== "ArrowDown" && event.key !== "ArrowUp")) return;
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setIndex((active + step + count) % count);
    },
    onSubmit(event: FormEvent) {
      event.preventDefault();
      if (active >= 0) document.getElementById(resultId(listId, active))?.click();
    },
  };
}
