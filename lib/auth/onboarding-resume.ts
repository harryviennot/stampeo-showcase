/**
 * The record that reopens the code screen after a reload or a trip to the mail
 * app. It lives in localStorage for as long as the code does and holds the
 * email, the code type and the send time: no name, phone or password. Storage
 * and clock are injected, and every storage call tolerates a browser that
 * refuses it.
 */

export const RESUME_STORAGE_KEY = "stampeo_onboarding_resume_v1";

/** A sign-up code lives an hour, so the record does too. */
export const RESUME_TTL_MS = 60 * 60 * 1000;

/** "signup" verifies the sign-up confirmation code of a new account; "signin"
 *  verifies the sign-in code sent to an EXISTING account (wrong password,
 *  OAuth-only, unconfirmed email), so nobody is ever shown an "account exists" error. */
export type VerifyMode = "signup" | "signin";

export interface ResumeRecord {
  v: 1;
  step: 2;
  phase: "verify";
  email: string;
  verifyMode: VerifyMode;
  /** Epoch milliseconds when the code was last sent. */
  sentAt: number;
}

/** What the caller supplies; the version, step and phase are fixed. */
export type ResumeInput = Pick<ResumeRecord, "email" | "verifyMode" | "sentAt">;

export interface ResumeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** The browser's localStorage, or null when it is missing or refuses access. */
export function browserResumeStorage(): ResumeStorage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Fields are copied one by one, so nothing else (a password) can reach storage. */
export function writeResume(storage: ResumeStorage | null, input: ResumeInput): void {
  if (!storage) return;
  const record: ResumeRecord = {
    v: 1,
    step: 2,
    phase: "verify",
    email: input.email,
    verifyMode: input.verifyMode,
    sentAt: input.sentAt,
  };
  try {
    storage.setItem(RESUME_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Private mode or a full quota: the flow works without resume.
  }
}

export function clearResume(storage: ResumeStorage | null): void {
  if (!storage) return;
  try {
    storage.removeItem(RESUME_STORAGE_KEY);
  } catch {
    // Nothing to remove if storage is unavailable.
  }
}

/** The record to resume from, or null (removing the record) when it is missing, damaged or expired. */
export function readResume(storage: ResumeStorage | null, now: number): ResumeRecord | null {
  if (!storage) return null;
  let raw: string | null;
  try {
    raw = storage.getItem(RESUME_STORAGE_KEY);
  } catch {
    return null;
  }
  if (raw === null) return null;

  const record = parseRecord(raw);
  if (record === null || now < record.sentAt || now - record.sentAt > RESUME_TTL_MS) {
    clearResume(storage);
    return null;
  }
  return record;
}

function parseRecord(raw: string): ResumeRecord | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof value !== "object" || value === null) return null;
  const r = value as Record<string, unknown>;

  const verifyMode = r.verifyMode;
  if (
    r.v !== 1 ||
    r.step !== 2 ||
    r.phase !== "verify" ||
    (verifyMode !== "signup" && verifyMode !== "signin") ||
    typeof r.email !== "string" ||
    r.email === "" ||
    typeof r.sentAt !== "number" ||
    !Number.isFinite(r.sentAt)
  ) {
    return null;
  }
  return { v: 1, step: 2, phase: "verify", email: r.email, verifyMode, sentAt: r.sentAt };
}
