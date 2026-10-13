/**
 * A visitor who fetches the sign-up code from their mail app comes back to a
 * page that may have been reloaded or closed. The wizard reopens on the code
 * screen for up to an hour, and the record that makes that possible never holds
 * a password.
 */

import { describe, expect, test } from "bun:test";
import {
  RESUME_STORAGE_KEY,
  RESUME_TTL_MS,
  clearResume,
  readResume,
  writeResume,
  type ResumeStorage,
} from "./onboarding-resume";

const MIN = 60 * 1000;
const NOW = 1_760_000_000_000;

function memoryStorage(initial: Record<string, string> = {}): ResumeStorage & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

/** Storage that refuses every call, as in a browser's private mode. */
const blockedStorage: ResumeStorage = {
  getItem: () => {
    throw new Error("SecurityError");
  },
  setItem: () => {
    throw new Error("QuotaExceededError");
  },
  removeItem: () => {
    throw new Error("SecurityError");
  },
};

const CODE_SCREEN = {
  email: "ines@example.com",
  verifyMode: "signup" as const,
  name: "Inès Martin",
  phone: "+33612345678",
};

describe("a visitor returning to the code screen", () => {
  test("59 minutes after the code was sent, the code screen reopens with everything they typed", () => {
    const storage = memoryStorage();
    writeResume(storage, { ...CODE_SCREEN, sentAt: NOW });

    expect(readResume(storage, NOW + 59 * MIN)).toEqual({
      v: 1,
      step: 2,
      phase: "verify",
      email: "ines@example.com",
      verifyMode: "signup",
      name: "Inès Martin",
      phone: "+33612345678",
      sentAt: NOW,
    });
  });

  test("61 minutes after, the code is dead: they start over, and the stale record is removed", () => {
    const storage = memoryStorage();
    writeResume(storage, { ...CODE_SCREEN, sentAt: NOW });

    expect(readResume(storage, NOW + 61 * MIN)).toBeNull();
    expect(storage.data.has(RESUME_STORAGE_KEY)).toBe(false);
  });

  test("the lifetime is the sign-up code's own, one hour", () => {
    expect(RESUME_TTL_MS).toBe(60 * MIN);
  });

  test("an existing account's sign-in code reopens as a sign-in code", () => {
    const storage = memoryStorage();
    writeResume(storage, { ...CODE_SCREEN, verifyMode: "signin", sentAt: NOW });

    expect(readResume(storage, NOW + MIN)?.verifyMode).toBe("signin");
  });

  test("resending the code starts the hour again", () => {
    const storage = memoryStorage();
    writeResume(storage, { ...CODE_SCREEN, sentAt: NOW });
    writeResume(storage, { ...CODE_SCREEN, sentAt: NOW + 50 * MIN });

    expect(readResume(storage, NOW + 100 * MIN)?.sentAt).toBe(NOW + 50 * MIN);
  });

  test("after finishing or choosing another email, nothing is left to resume", () => {
    const storage = memoryStorage();
    writeResume(storage, { ...CODE_SCREEN, sentAt: NOW });

    clearResume(storage);

    expect(readResume(storage, NOW + MIN)).toBeNull();
    expect(storage.data.size).toBe(0);
  });

  test("a visitor who never reached the code screen has nothing to resume", () => {
    expect(readResume(memoryStorage(), NOW)).toBeNull();
  });
});

describe("the stored record", () => {
  test("never holds a password, even when one is handed in", () => {
    const storage = memoryStorage();
    const withPassword = { ...CODE_SCREEN, sentAt: NOW, password: "hunter2hunter2", newPassword: "x" };

    writeResume(storage, withPassword as never);

    const stored = storage.data.get(RESUME_STORAGE_KEY) ?? "";
    expect(stored).not.toContain("hunter2");
    expect(Object.keys(JSON.parse(stored)).sort()).toEqual(
      ["email", "name", "phase", "phone", "sentAt", "step", "v", "verifyMode"],
    );
  });
});

describe("a damaged or unusable record", () => {
  const valid = { v: 1, step: 2, phase: "verify", ...CODE_SCREEN, sentAt: NOW };

  test.each([
    ["not JSON", "{broken"],
    ["not an object", "42"],
    ["null", "null"],
    ["another version", JSON.stringify({ ...valid, v: 2 })],
    ["another step", JSON.stringify({ ...valid, step: 1 })],
    ["another phase", JSON.stringify({ ...valid, phase: "form" })],
    ["an unknown code type", JSON.stringify({ ...valid, verifyMode: "magic" })],
    ["no email", JSON.stringify({ ...valid, email: "" })],
    ["an email that is not text", JSON.stringify({ ...valid, email: 12 })],
    ["a name that is not text", JSON.stringify({ ...valid, name: null })],
    ["no send time", JSON.stringify({ ...valid, sentAt: undefined })],
    ["a send time in the future", JSON.stringify({ ...valid, sentAt: NOW + 10 * MIN })],
  ])("%s is ignored and removed", (_label, raw) => {
    const storage = memoryStorage({ [RESUME_STORAGE_KEY]: raw });

    expect(readResume(storage, NOW + MIN)).toBeNull();
    expect(storage.data.has(RESUME_STORAGE_KEY)).toBe(false);
  });

  test("storage that refuses every call (private mode) leaves the flow as it is today", () => {
    expect(readResume(blockedStorage, NOW)).toBeNull();
    expect(() => writeResume(blockedStorage, { ...CODE_SCREEN, sentAt: NOW })).not.toThrow();
    expect(() => clearResume(blockedStorage)).not.toThrow();
  });

  test("no storage at all behaves the same", () => {
    expect(readResume(null, NOW)).toBeNull();
    expect(() => writeResume(null, { ...CODE_SCREEN, sentAt: NOW })).not.toThrow();
    expect(() => clearResume(null)).not.toThrow();
  });
});
