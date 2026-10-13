/**
 * A visitor who fetches the sign-up code from their mail app comes back to a
 * page that may have been reloaded or closed. The wizard reopens on the code
 * screen for up to an hour, and the record that makes that possible holds the
 * email, the code type and the send time, and nothing else.
 */

import { describe, expect, test } from "bun:test";
import {
  RESUME_STORAGE_KEY,
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
};

describe("a visitor returning to the code screen", () => {
  test("59 minutes after the code was sent, the code screen reopens for the same email", () => {
    const storage = memoryStorage();
    writeResume(storage, { ...CODE_SCREEN, sentAt: NOW });

    expect(readResume(storage, NOW + 59 * MIN)).toEqual({
      v: 1,
      step: 2,
      phase: "verify",
      email: "ines@example.com",
      verifyMode: "signup",
      sentAt: NOW,
    });
  });

  test("exactly 60:00 after the send still resumes; one millisecond later the code is dead and the record is removed", () => {
    const storage = memoryStorage();
    writeResume(storage, { ...CODE_SCREEN, sentAt: NOW });

    expect(readResume(storage, NOW + 60 * MIN)?.email).toBe("ines@example.com");
    expect(readResume(storage, NOW + 60 * MIN + 1)).toBeNull();
    expect(storage.data.has(RESUME_STORAGE_KEY)).toBe(false);
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
  test("holds only the email, the code type and the send time, even when more is handed in", () => {
    const storage = memoryStorage();
    const extras = { password: "hunter2hunter2", name: "Inès Martin", phone: "+33612345678" };

    writeResume(storage, { ...CODE_SCREEN, sentAt: NOW, ...extras } as never);

    const stored = storage.data.get(RESUME_STORAGE_KEY) ?? "";
    for (const secret of ["hunter2", "Inès", "+33612345678"]) expect(stored).not.toContain(secret);
    expect(Object.keys(JSON.parse(stored)).sort()).toEqual(
      ["email", "phase", "sentAt", "step", "v", "verifyMode"],
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
    ["no send time", JSON.stringify({ ...valid, sentAt: undefined })],
    ["a send time in the future", JSON.stringify({ ...valid, sentAt: NOW + 10 * MIN })],
  ])("%s is ignored and removed", (_label, raw) => {
    const storage = memoryStorage({ [RESUME_STORAGE_KEY]: raw });

    expect(readResume(storage, NOW + MIN)).toBeNull();
    expect(storage.data.has(RESUME_STORAGE_KEY)).toBe(false);
  });

  test("storage that refuses every call (private mode) still lets the visitor sign up, without resume", () => {
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
