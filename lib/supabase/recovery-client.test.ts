import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { createClient } from "@supabase/supabase-js";
import { createRecoveryClient, saveNewPassword } from "./recovery-client";

const URL = "https://abcdefghijklmnop.supabase.co";
const KEY = "anon-key";
const APP_SESSION_LOCK = "lock:sb-abcdefghijklmnop-auth-token";

describe("createRecoveryClient in a browser", () => {
  // supabase-js treats `window` + `document` as a browser and takes Web Locks
  // through `navigator.locks`; this records every lock a client asks for.
  let requested: string[];
  beforeEach(() => {
    requested = [];
    const noop = () => {};
    Object.assign(globalThis, {
      window: { location: { href: "https://stampeo.app/reset-password", hash: "", search: "" }, addEventListener: noop, removeEventListener: noop },
      document: { addEventListener: noop, removeEventListener: noop, visibilityState: "visible" },
    });
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: {
        request: (name: string, _options: unknown, run: (lock: unknown) => unknown) => {
          requested.push(name);
          return Promise.resolve(run({ name }));
        },
      },
    });
  });
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).window;
    delete (globalThis as Record<string, unknown>).document;
    delete (navigator as unknown as Record<string, unknown>).locks;
  });

  it("takes no Web Lock, so it cannot steal the app session's", async () => {
    // A persisted session is what makes supabase-js lock; no refresh timer, so
    // nothing fires after the browser stubs are gone.
    const app = createClient(URL, KEY, { auth: { autoRefreshToken: false } });
    await app.auth.initialize();
    await app.auth.stopAutoRefresh();
    expect(requested).toContain(APP_SESSION_LOCK);

    requested = [];
    const recovery = createRecoveryClient(URL, KEY);
    await recovery.auth.initialize();
    await recovery.auth.getSession();
    expect(requested).toEqual([]);
  });
});

describe("saveNewPassword", () => {
  const user = { email: "ines@example.com" };
  const lockStolen = "Lock broken by another request with the 'steal' option.";

  it("returns the account email once the password is saved", async () => {
    const client = { auth: { updateUser: async () => ({ data: { user }, error: null }) } };
    expect(await saveNewPassword(client, "Lumiere!2026")).toEqual({ email: user.email });
  });

  it.each([
    ["a thrown abort", () => Promise.reject(new DOMException(lockStolen, "AbortError")), lockStolen, 1],
    ["an error answer", async () => ({ data: { user: null }, error: { message: "Auth session missing!" } }), "Auth session missing!", 0],
  ])("%s comes back as its message, not a thrown exception", async (_label, updateUser, message, reported) => {
    const report = mock(() => {});
    const result = await saveNewPassword({ auth: { updateUser } } as never, "Lumiere!2026", report);
    expect(result).toEqual({ error: message });
    // Only the unexpected (thrown) failure is reported, and never with the password.
    expect(report).toHaveBeenCalledTimes(reported);
    expect(JSON.stringify(report.mock.calls)).not.toContain("Lumiere!2026");
  });
});
