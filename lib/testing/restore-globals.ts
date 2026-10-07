import { afterEach } from "bun:test";

/**
 * Puts the named globals back to what they are now, after each test: removed
 * if absent, restored if the runtime ships one (Bun has its own `navigator`).
 */
export function restoreGlobalsAfterEach(...names: string[]): void {
  const original = names.map(
    (name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)] as const
  );
  afterEach(() => {
    for (const [name, descriptor] of original) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    }
  });
}
