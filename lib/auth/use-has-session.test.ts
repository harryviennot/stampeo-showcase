/**
 * The Header's Log in / Dashboard switch, from the Supabase cookie alone.
 *
 * The hook is a `useSyncExternalStore`: the server HTML always says "signed
 * out", and the browser re-reads the cookie when the tab regains focus or this
 * tab signs out. These tests run it against a fake `document` the way React
 * drives it, without downloading or starting supabase-js.
 */

import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test";
import { createElement, type ReactNode } from "react";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { restoreEnvAfterEach } from "../testing/restore-env";
import { restoreGlobalsAfterEach } from "../testing/restore-globals";

const REF = "ysdpjxzldqwlmhlwzdaq";
const SESSION_COOKIE = `sb-${REF}-auth-token`;

restoreEnvAfterEach("NEXT_PUBLIC_SUPABASE_URL");
restoreGlobalsAfterEach("document", "window", "sessionStorage", "localStorage");

// The project ref is read once, when the module loads.
process.env.NEXT_PUBLIC_SUPABASE_URL = `https://${REF}.supabase.co`;
const { useHasSession, signOut } = await import("./use-has-session");
// Kept so the file can put the real client back after it stands in for supabase-js.
const realClient = await import("@/lib/supabase/client");

/** A `document.cookie` that behaves like a browser's: assignments add one cookie or expire it. */
function fakeDocument() {
  const jar = new Map<string, string>();
  return {
    get cookie() {
      return [...jar].map(([name, value]) => `${name}=${value}`).join("; ");
    },
    set cookie(assignment: string) {
      const [pair, ...attributes] = assignment.split(";").map((part) => part.trim());
      const [name, ...value] = pair.split("=");
      const expired = attributes.some((attribute) => /^max-age=0$/i.test(attribute));
      if (expired || value.join("=") === "") jar.delete(name);
      else jar.set(name, value.join("="));
    },
  };
}

function fakeStorage(initial: Record<string, string>) {
  const items = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => items.get(key) ?? null,
    removeItem: (key: string) => void items.delete(key),
    setItem: (key: string, value: string) => void items.set(key, value),
  };
}

let document: ReturnType<typeof fakeDocument>;
let window: EventTarget;

beforeEach(() => {
  document = fakeDocument();
  window = new EventTarget();
  Object.assign(globalThis, { document, window });
});

/**
 * Mounts the Header's hook under a stand-in React dispatcher and returns the
 * store it subscribed to, so a test can drive it as React does: subscribe, then
 * re-read the snapshot whenever the listener fires. Named `use…` because it
 * calls the hook.
 */
function useHeaderStore() {
  const internals = (React as unknown as Record<string, { H: unknown }>)
    .__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  let store!: { subscribe: (listener: () => void) => () => void; getSnapshot: () => boolean };
  const previous = internals.H;
  internals.H = {
    useSyncExternalStore: (subscribe: typeof store.subscribe, getSnapshot: typeof store.getSnapshot) => {
      store = { subscribe, getSnapshot };
      return getSnapshot();
    },
  };
  try {
    useHasSession();
  } finally {
    internals.H = previous;
  }
  const seen: boolean[] = [];
  const unsubscribe = store.subscribe(() => seen.push(store.getSnapshot()));
  return { seen, unsubscribe, read: store.getSnapshot };
}

describe("the server HTML", () => {
  test("shows a visitor as signed out even when the request carries a session cookie", () => {
    document.cookie = `${SESSION_COOKIE}=base64-eyJ9`;
    const Probe = (): ReactNode => (useHasSession() ? "Dashboard" : "Log in");

    expect(renderToStaticMarkup(createElement(Probe))).toBe("Log in");
  });
});

describe("a visitor in the browser", () => {
  test("with a session cookie reads as signed in, and without one as signed out", () => {
    expect(useHeaderStore().read()).toBe(false);

    document.cookie = `${SESSION_COOKIE}=base64-eyJ9`;
    expect(useHeaderStore().read()).toBe(true);
  });

  test("who signed out in the dashboard tab reads as signed out when this tab regains focus", () => {
    document.cookie = `${SESSION_COOKIE}=base64-eyJ9`;
    const header = useHeaderStore();
    expect(header.read()).toBe(true);

    document.cookie = `${SESSION_COOKIE}=; Max-Age=0`;
    window.dispatchEvent(new Event("focus"));

    expect(header.seen).toEqual([false]);
  });

  test("stops being told once the Header unmounts", () => {
    const header = useHeaderStore();
    header.unsubscribe();

    window.dispatchEvent(new Event("focus"));

    expect(header.seen).toEqual([]);
  });
});

describe("Sign out in the Header", () => {
  afterAll(() => mock.module("@/lib/supabase/client", () => realClient));

  test("clears the onboarding draft, signs out of Supabase and flips the Header without a reload", async () => {
    document.cookie = `${SESSION_COOKIE}=base64-eyJ9`;
    const sessionStorage = fakeStorage({ stampeo_onboarding_session: "draft" });
    const localStorage = fakeStorage({ stampeo_onboarding: "draft", theme: "dark" });
    Object.assign(globalThis, { sessionStorage, localStorage });
    const supabaseSignOut = mock(async () => {
      document.cookie = `${SESSION_COOKIE}=; Max-Age=0`;
    });
    mock.module("@/lib/supabase/client", () => ({ createClient: () => ({ auth: { signOut: supabaseSignOut } }) }));
    const header = useHeaderStore();

    await signOut();

    expect(supabaseSignOut).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem("stampeo_onboarding_session")).toBeNull();
    expect(localStorage.getItem("stampeo_onboarding")).toBeNull();
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(header.seen).toEqual([false]);
  });
});
