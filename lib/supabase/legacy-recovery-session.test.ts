/**
 * A recovery session in localStorage under supabase-js's default key is a
 * working refresh token on a shared computer. The cleanup revokes it and
 * deletes the key, without ever touching the signed-in session the app keeps
 * in cookies.
 */

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { createClient } from "@supabase/supabase-js";
import { fakeStorage } from "../testing/fake-storage";
import { restoreGlobalsAfterEach } from "../testing/restore-globals";
import { clearLegacyRecoverySession } from "./legacy-recovery-session";

const URL = "https://abcdefghijklmnop.supabase.co";
const ANON_KEY = "anon-key";
const LEGACY_KEY = "sb-abcdefghijklmnop-auth-token";
const APP_SESSION_LOCK = `lock:${LEGACY_KEY}`;

const user = { id: "user-1", aud: "authenticated", email: "ines@example.com", app_metadata: {}, user_metadata: {}, created_at: "2026-01-01T00:00:00Z" };

/** A session as supabase-js stored it; `expiresIn` is negative once the access token has lapsed. */
const storedSession = (expiresIn = 3600) =>
  JSON.stringify({
    access_token: "old.access.token",
    refresh_token: "old-refresh-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
    user,
  });

type Storage = ReturnType<typeof fakeStorage>;

function run(options: { storage: Storage | Parameters<typeof clearLegacyRecoverySession>[0]["storage"]; signOut?: () => Promise<unknown>; createClient?: () => unknown }) {
  const signOut = mock(options.signOut ?? (async () => ({ error: null })));
  const createClientMock = mock(options.createClient ?? (() => ({ auth: { signOut, stopAutoRefresh: async () => {} } })));
  const done = clearLegacyRecoverySession({
    storage: options.storage,
    url: URL,
    anonKey: ANON_KEY,
    loadCreateClient: async () => createClientMock as never,
  });
  return { done, signOut, createClientMock };
}

describe("clearLegacyRecoverySession", () => {
  const otherEntries = { stampeo_onboarding: "{}", [`${LEGACY_KEY}-code-verifier`]: "pkce" };

  it("does nothing, and downloads nothing, when the browser holds no old session", async () => {
    const storage = fakeStorage(otherEntries);
    const loadCreateClient = mock(async () => createClient);
    await clearLegacyRecoverySession({ storage, url: URL, anonKey: ANON_KEY, loadCreateClient });
    expect(loadCreateClient).not.toHaveBeenCalled();
    expect(Object.fromEntries(storage.data)).toEqual(otherEntries);
  });

  it("signs the old session out of this browser only, then deletes it", async () => {
    const storage = fakeStorage({ ...otherEntries, [LEGACY_KEY]: storedSession() });
    const { done, signOut } = run({ storage });
    await done;
    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(Object.fromEntries(storage.data)).toEqual(otherEntries);
  });

  it.each([
    ["Supabase refuses the sign-out", { signOut: async () => ({ error: { message: "Invalid Refresh Token" } }) }],
    ["the sign-out request throws", { signOut: async () => Promise.reject(new TypeError("Failed to fetch")) }],
    [
      "the client cannot be built",
      {
        createClient: () => {
          throw new Error("no fetch");
        },
      },
    ],
  ])("still deletes the old session when %s", async (_label, failure) => {
    const storage = fakeStorage({ [LEGACY_KEY]: storedSession() });
    await run({ storage, ...failure }).done;
    expect(storage.data.has(LEGACY_KEY)).toBe(false);
  });

  it("skips quietly when the browser's storage is blocked", async () => {
    const denied = () => {
      throw new DOMException("denied", "SecurityError");
    };
    const { done, createClientMock } = run({ storage: { getItem: denied, setItem: () => {}, removeItem: denied } });
    await done;
    expect(createClientMock).not.toHaveBeenCalled();
  });
});

describe("clearLegacyRecoverySession with the real supabase-js in a browser", () => {
  restoreGlobalsAfterEach("window", "document");

  // supabase-js treats `window` + `document` as a browser: it takes Web Locks
  // through `navigator.locks` and opens a BroadcastChannel named after its
  // storage key. A channel named like the app's tells the app it signed out.
  let requestedLocks: string[];
  let appChannel: BroadcastChannel;
  let appChannelMessages: unknown[];
  beforeEach(() => {
    requestedLocks = [];
    appChannelMessages = [];
    const noop = () => {};
    Object.assign(globalThis, {
      window: { location: { href: "https://stampeo.app/en", hash: "", search: "" }, addEventListener: noop, removeEventListener: noop },
      document: { addEventListener: noop, removeEventListener: noop, visibilityState: "visible" },
    });
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: {
        request: (name: string, _options: unknown, work: (lock: unknown) => unknown) => {
          requestedLocks.push(name);
          return Promise.resolve(work({ name }));
        },
      },
    });
    appChannel = new BroadcastChannel(LEGACY_KEY);
    appChannel.onmessage = (event) => appChannelMessages.push(event.data);
  });
  afterEach(() => {
    appChannel.close();
    delete (navigator as unknown as Record<string, unknown>).locks;
  });

  const refreshed = { access_token: "new.access.token", refresh_token: "new-refresh-token", token_type: "bearer", expires_in: 3600, user };
  const refreshRefused = { code: "refresh_token_not_found", message: "Invalid Refresh Token: Refresh Token Not Found" };

  it.each([
    [
      "a live session is revoked with its own access token",
      3600,
      undefined,
      [{ path: "/auth/v1/logout?scope=local", authorization: "Bearer old.access.token" }],
    ],
    [
      "a session whose access token lapsed is refreshed, then revoked",
      -3600,
      { status: 200, body: refreshed },
      [
        { path: "/auth/v1/token?grant_type=refresh_token", authorization: "Bearer anon-key" },
        { path: "/auth/v1/logout?scope=local", authorization: "Bearer new.access.token" },
      ],
    ],
    [
      "a session whose refresh token is already dead is only deleted",
      -3600,
      { status: 400, body: refreshRefused },
      [{ path: "/auth/v1/token?grant_type=refresh_token", authorization: "Bearer anon-key" }],
    ],
  ])("%s, without disturbing the app's own session", async (_label, expiresIn, refreshAnswer, expectedRequests) => {
    const storage = fakeStorage({ [LEGACY_KEY]: storedSession(expiresIn) });
    const requests: Array<{ path: string; authorization: string | null }> = [];
    const fetchMock = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      requests.push({ path: url.slice(URL.length), authorization: new Headers(init?.headers).get("Authorization") });
      if (url.includes("/token") && refreshAnswer) {
        return Response.json(refreshAnswer.body, { status: refreshAnswer.status });
      }
      return new Response(null, { status: 204 });
    };

    await clearLegacyRecoverySession({
      storage,
      url: URL,
      anonKey: ANON_KEY,
      loadCreateClient: async () =>
        ((url: string, key: string, options: object) =>
          createClient(url, key, { ...options, global: { fetch: fetchMock } })) as never,
    });
    // Give a stray broadcast the chance to arrive.
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(requests).toEqual(expectedRequests);
    expect(storage.data.has(LEGACY_KEY)).toBe(false);
    expect(requestedLocks).not.toContain(APP_SESSION_LOCK);
    expect(appChannelMessages).toEqual([]);
  });
});
