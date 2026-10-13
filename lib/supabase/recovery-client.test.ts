import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { createClient } from "@supabase/supabase-js";
import { catalogLocales, loadCatalog } from "../testing/catalogs";
import { restoreGlobalsAfterEach } from "../testing/restore-globals";
import {
  createRecoveryClient,
  passwordRefusalKeys,
  saveNewPassword,
  verifyRecoveryLink,
} from "./recovery-client";

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

describe("saveNewPassword refusals", () => {
  const refuse = (error: Record<string, unknown>) => ({
    auth: { updateUser: async () => ({ data: { user: null }, error }) },
  });

  it("carries Supabase's error code so the page can say why", async () => {
    const result = await saveNewPassword(
      refuse({ message: "New password should be different from the old password.", code: "same_password" }),
      "Lumiere!2026"
    );
    expect(result).toEqual({
      error: "New password should be different from the old password.",
      code: "same_password",
    });
  });

  it("carries the reasons a password was judged weak", async () => {
    const result = await saveNewPassword(
      refuse({ message: "Password is known to be weak", code: "weak_password", reasons: ["length", "pwned"] }),
      "Lumiere!2026"
    );
    expect(result.code).toBe("weak_password");
    expect(result.reasons).toEqual(["length", "pwned"]);
  });
});

describe("passwordRefusalKeys", () => {
  it.each([
    ["the same password", "same_password", undefined, ["samePassword"]],
    ["a too-short password", "weak_password", ["length"], ["weakPasswordLength"]],
    ["a symbol that does not count", "weak_password", ["characters"], ["weakPasswordCharacters"]],
    ["a leaked password", "weak_password", ["pwned"], ["weakPasswordPwned"]],
    [
      "every reason, always in the same order",
      "weak_password",
      ["pwned", "characters", "length"],
      ["weakPasswordLength", "weakPasswordCharacters", "weakPasswordPwned"],
    ],
    ["a repeated reason", "weak_password", ["length", "length"], ["weakPasswordLength"]],
    ["an unknown reason beside a known one", "weak_password", ["entropy", "length"], ["weakPasswordLength"]],
    ["only unknown reasons", "weak_password", ["entropy"], ["weakPassword"]],
    ["no reasons given", "weak_password", [], ["weakPassword"]],
    ["reasons missing", "weak_password", undefined, ["weakPassword"]],
    ["any other error code", "over_request_rate_limit", undefined, []],
    ["no error code", undefined, undefined, []],
    ["reasons on an unrelated error", "session_not_found", ["length"], []],
  ])("%s", (_label, code, reasons, expected) => {
    expect(passwordRefusalKeys(code, reasons)).toEqual(expected);
  });

  it("only names lines the catalog has, in every locale", () => {
    const keys = [
      ...passwordRefusalKeys("same_password", undefined),
      ...passwordRefusalKeys("weak_password", ["length", "characters", "pwned"]),
      ...passwordRefusalKeys("weak_password", undefined),
    ];
    expect(keys).toHaveLength(5);
    for (const locale of catalogLocales()) {
      const block = loadCatalog(locale, "auth.json").auth.resetPassword;
      for (const key of keys) expect(typeof block[key]).toBe("string");
    }
  });
});

describe("verifyRecoveryLink", () => {
  const verifying = (answer: () => Promise<unknown>) => ({ auth: { verifyOtp: answer } }) as never;
  const answer = (data: unknown, error: unknown = null) => async () => ({ data, error });

  it("hands the token to Supabase as a recovery link and names the account", async () => {
    const verifyOtp = mock(answer({ user: { email: "ines@example.com" } }));
    const state = await verifyRecoveryLink({ auth: { verifyOtp } } as never, "hash-123");
    expect(verifyOtp).toHaveBeenCalledWith({ token_hash: "hash-123", type: "recovery" });
    expect(state).toEqual({ status: "verified", email: "ines@example.com" });
  });

  it.each([
    ["no user", { user: null }],
    ["a user with no email", { user: {} }],
    ["a blank email", { user: { email: "  " } }],
  ])("a verified link with %s has no email to show", async (_label, data) => {
    const state = await verifyRecoveryLink(verifying(answer(data)), "hash-123");
    expect(state).toEqual({ status: "verified" });
  });

  it.each([
    ["an expired link", { name: "AuthApiError", status: 403, code: "otp_expired", message: "Email link is invalid or has expired" }, "linkExpired"],
    ["an unknown token", { name: "AuthApiError", status: 400, message: "Token has expired or is invalid" }, "linkExpired"],
    ["any error it does not recognise", { name: "AuthApiError", status: 500, message: "boom" }, "linkExpired"],
    ["a lost connection", { name: "AuthRetryableFetchError", status: 0, message: "Load failed" }, "network"],
    ["a gateway error", { name: "AuthRetryableFetchError", status: 503, message: "upstream" }, "network"],
    ["a connection failure the SDK did not classify", { name: "AuthUnknownError", message: "NetworkError when attempting to fetch resource." }, "network"],
    ["a 429 with no error code", { name: "AuthApiError", status: 429, message: "Too many requests" }, "rateLimited"],
    ["a rate-limit code on another status", { name: "AuthApiError", status: 400, code: "over_request_rate_limit", message: "rate" }, "rateLimited"],
  ])("%s fails the link with its reason, never Supabase's text", async (_label, error, reason) => {
    const state = await verifyRecoveryLink(verifying(answer({ user: null }, error)), "hash-123");
    expect(state).toEqual({ status: "failed", reason });
  });

  it("a request that throws instead of answering counts as a connection failure", async () => {
    const state = await verifyRecoveryLink(
      verifying(() => Promise.reject(new TypeError("Failed to fetch"))),
      "hash-123"
    );
    expect(state).toEqual({ status: "failed", reason: "network" });
  });
});

describe("the recovery client against Supabase's own answers", () => {
  restoreGlobalsAfterEach("fetch");

  const session = {
    access_token: "recovery.access.token",
    refresh_token: "recovery-refresh-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: { id: "user-1", aud: "authenticated", email: "ines@example.com", app_metadata: {}, user_metadata: {}, created_at: "2026-01-01T00:00:00Z" },
  };

  /** Supabase verifying the link, then refusing the new password with `refusal` (a 422). */
  function supabaseRefusing(refusal: Record<string, unknown>) {
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/auth/v1/verify")) return Response.json(session);
      if (url.includes("/auth/v1/user")) {
        return Response.json(refusal, { status: 422, headers: { "x-supabase-api-version": "2024-01-01" } });
      }
      return new Response(null, { status: 404 });
    }) as typeof fetch;
  }

  it.each([
    [
      "the current password",
      { code: "same_password", message: "New password should be different from the old password." },
      ["samePassword"],
    ],
    [
      "a weak password",
      { code: "weak_password", message: "Password is known to be weak and easy to guess, please choose a different one.", weak_password: { reasons: ["pwned", "length"] } },
      ["weakPasswordLength", "weakPasswordPwned"],
    ],
  ])("%s, refused after the link verified, names its lines", async (_label, refusal, lines) => {
    supabaseRefusing(refusal);
    const client = createRecoveryClient(URL, KEY);

    expect(await verifyRecoveryLink(client, "hash-123")).toEqual({ status: "verified", email: "ines@example.com" });
    const { code, reasons } = await saveNewPassword(client, "Lumiere!2026", () => {});
    expect(passwordRefusalKeys(code, reasons)).toEqual(lines);
  });
});
