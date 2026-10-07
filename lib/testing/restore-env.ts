import { afterEach } from "bun:test";

/** Puts the named environment variables back to what they are now, after each test. */
export function restoreEnvAfterEach(...keys: string[]): void {
  const original = keys.map((key) => [key, process.env[key]] as const);
  afterEach(() => {
    for (const [key, value] of original) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}
