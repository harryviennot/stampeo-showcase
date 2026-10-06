/**
 * A browser for `bun test lib`: a cookie jar that stores, expires and logs, a
 * timezone, GPC, and a `fetch` that can answer like the real privacy route.
 *
 * The jar models Max-Age, so a test can age it by days and ask what a visitor
 * still carries. `events` is an ordered log across cookie writes, requests and
 * consent-change signals, which is how the tests pin "this happened before
 * that".
 */

import {
  CONSENT_CHANGED_EVENT,
  CONSENT_COOKIE,
  CONSENT_VERSION,
  serializeConsentCookie,
} from "../../consent";
import { handlePrivacyCookies } from "../cookie-route";

export const SITE = "https://stampeo.app";
export const SUBJECT = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
export const OTHER_SUBJECT = "9b2f0d6e-1c3a-4e5b-8a7d-0f1e2d3c4b5a";
const DAY = 86_400;

/** `Cookie:` pairs for a visitor who accepted everything, and one who refused everything, in the opt-in row. */
const choiceCookie = (granted: boolean) =>
  `${CONSENT_COOKIE}=${serializeConsentCookie({
    v: CONSENT_VERSION,
    analytics: granted,
    marketing: granted,
    at: 1_791_240_000,
    regime: "opt-in",
    regionRow: "EEA_UK_CH",
  })}`;
export const GRANTED_COOKIE = choiceCookie(true);
export const REFUSED_COOKIE = choiceCookie(false);

export interface FetchCall {
  url: string;
  init: RequestInit;
  body: Record<string, unknown>;
}

export type CookieMode = "stores" | "silent" | "throws";
export type FetchMode = "ignore" | "reject" | "throw" | "route" | "hang";

export interface FakeBrowserOptions {
  /** Cookies present before the page loads, as a `Cookie:` header. */
  cookie?: string;
  gpc?: boolean;
  /** An IANA zone; null makes `Intl` throw; undefined leaves the real one. */
  timezone?: string | null;
  hostname?: string;
  /** `silent` accepts a write and drops it; `throws` refuses it. */
  cookies?: CookieMode;
  /** `route` answers with the real route handler and applies its cookies; `hang` never answers. */
  fetch?: FetchMode;
}

export interface FakeBrowser {
  /** Every value assigned to `document.cookie`. */
  writes: string[];
  fetches: FetchCall[];
  /** `cookie:<name>`, `fetch`, `server-set:<name>`, `consent-change`, `reload`, in order. */
  events: string[];
  /** The `src` of every `<script>` appended to the document head. */
  scripts: string[];
  /** The jar as a `Cookie:` header. */
  jar(): string;
  setJar(header: string): void;
  /** The tab is shown or hidden: sets `document.visibilityState` and fires `visibilitychange`. */
  setVisibility(state: "visible" | "hidden"): void;
  /** Cookies whose Max-Age has run out are gone; the rest age by that much. */
  advanceDays(days: number): void;
  /** Resolves once every request in flight has been answered and applied. */
  settled(): Promise<void>;
  restore(): void;
}

interface Entry {
  value: string;
  maxAge?: number;
}

const RealDateTimeFormat = Intl.DateTimeFormat;
const realFetch = globalThis.fetch;

export function installFakeBrowser(options: FakeBrowserOptions = {}): FakeBrowser {
  const jar = new Map<string, Entry>();
  const writes: string[] = [];
  const fetches: FetchCall[] = [];
  const events: string[] = [];
  const scripts: string[] = [];
  const pending: Promise<unknown>[] = [];
  const cookieMode = options.cookies ?? "stores";
  const hostname = options.hostname ?? "stampeo.app";

  const setJar = (header: string) => {
    jar.clear();
    for (const part of header.split(";")) {
      const trimmed = part.trim();
      const split = trimmed.indexOf("=");
      if (split > 0) jar.set(trimmed.slice(0, split), { value: trimmed.slice(split + 1) });
    }
  };
  const header = () => [...jar].map(([name, e]) => `${name}=${e.value}`).join("; ");

  const store = (setCookie: string, log: string) => {
    const [pair, ...attributes] = setCookie.split(";");
    const split = pair.indexOf("=");
    const name = pair.slice(0, split).trim();
    const maxAge = attributes
      .map((a) => a.trim())
      .find((a) => a.toLowerCase().startsWith("max-age="));
    events.push(`${log}:${name}`);
    if (maxAge?.toLowerCase() === "max-age=0") jar.delete(name);
    else {
      jar.set(name, {
        value: pair.slice(split + 1),
        maxAge: maxAge ? Number(maxAge.slice("max-age=".length)) : undefined,
      });
    }
  };

  setJar(options.cookie ?? "");

  const document = new EventTarget() as EventTarget & { cookie: string; visibilityState: string };
  Object.assign(document, {
    title: "Stampeo",
    body: { dataset: {} },
    createElement: (): { src?: string } => ({}),
    head: { appendChild: (el: { src?: string }) => void scripts.push(el.src ?? "") },
  });
  Object.defineProperties(document, {
    cookie: {
      get: () => header(),
      set: (value: string) => {
        writes.push(value);
        if (cookieMode === "throws") throw new Error("storage refused");
        if (cookieMode === "silent") return;
        store(value, "cookie");
      },
    },
    visibilityState: { value: "visible", writable: true },
  });

  const window = Object.assign(new EventTarget(), {
    location: { hostname, href: `${SITE}/us/pricing`, search: "", reload: () => void events.push("reload") },
  });
  window.addEventListener(CONSENT_CHANGED_EVENT, () => events.push("consent-change"));

  const navigator = { globalPrivacyControl: options.gpc };

  const fetchMode = options.fetch ?? "ignore";
  const fakeFetch = (url: string, init: RequestInit = {}) => {
    events.push("fetch");
    if (fetchMode === "throw") throw new Error("fetch refused synchronously");
    const body = JSON.parse(String(init.body ?? "{}")) as Record<string, unknown>;
    fetches.push({ url, init, body });
    if (fetchMode === "reject") return Promise.reject(new Error("offline"));
    if (fetchMode === "hang") return new Promise<Response>(() => {});
    if (fetchMode === "ignore") return Promise.resolve(new Response(null, { status: 204 }));

    const request = new Request(`${SITE}${url}`, {
      method: "POST",
      headers: {
        origin: SITE,
        host: hostname,
        "content-type": "application/json",
        cookie: header(),
      },
      body: String(init.body ?? "{}"),
    });
    const answered = handlePrivacyCookies(request).then((result) => {
      for (const setCookie of result.setCookies) store(setCookie, "server-set");
      return new Response(null, { status: result.status });
    });
    pending.push(answered);
    return answered;
  };

  for (const [name, value] of Object.entries({
    document,
    window,
    navigator,
    fetch: fakeFetch,
  })) {
    Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  }

  if (options.timezone !== undefined) {
    const timeZone = options.timezone;
    // @ts-expect-error replacing the constructor for the length of one test
    Intl.DateTimeFormat = function FakeDateTimeFormat() {
      if (timeZone === null) throw new Error("Intl unavailable");
      return { resolvedOptions: () => ({ timeZone }) };
    };
  }

  return {
    writes,
    fetches,
    events,
    scripts,
    jar: header,
    setJar,
    setVisibility(state) {
      document.visibilityState = state;
      document.dispatchEvent(new Event("visibilitychange"));
    },
    advanceDays(days: number) {
      for (const [name, entry] of [...jar]) {
        if (entry.maxAge === undefined) continue;
        if (entry.maxAge <= days * DAY) jar.delete(name);
        else entry.maxAge -= days * DAY;
      }
    },
    async settled() {
      await Promise.all(pending.splice(0));
    },
    restore() {
      for (const name of ["document", "window", "navigator"]) {
        Reflect.deleteProperty(globalThis, name);
      }
      globalThis.fetch = realFetch;
      Intl.DateTimeFormat = RealDateTimeFormat;
    },
  };
}
