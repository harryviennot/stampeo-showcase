import type { BrowserContext, Page, Route } from "playwright-core";

/** Everything below changes only what this capture browser shows. Nothing is written to a database. */

const DEV_COOKIE_DOMAIN = ".dev.stampeo.app";

/** Requests a capture may send while signed in: sign-in token refresh and telemetry. */
const ALLOWED_WRITES = [/\/auth\/v1\//, /sentry\.io/, /posthog/, /google-analytics|googletagmanager|facebook|doubleclick|clarity/];

/** Fetches what the page asked for outside the browser, so a handler can edit the JSON before the page reads it. */
async function fetchUpstream(route: Route): Promise<{ status: number; headers: Record<string, string>; json: unknown }> {
  const request = route.request();
  const headers = await request.allHeaders();
  for (const name of ["host", "content-length", "accept-encoding", "connection"]) delete headers[name];
  const upstream = await fetch(request.url(), { method: request.method(), headers });
  const out: Record<string, string> = {};
  upstream.headers.forEach((value, key) => {
    if (!["content-encoding", "content-length", "transfer-encoding", "set-cookie"].includes(key)) out[key] = value;
  });
  return { status: upstream.status, headers: out, json: await upstream.json() };
}

/** Rewrites the JSON of GET responses matching `pattern`. */
export async function rewriteJson(ctx: BrowserContext, pattern: string | RegExp, mutate: (json: unknown, url: URL) => unknown) {
  await ctx.route(pattern, async (route) => {
    if (route.request().method() !== "GET") return route.continue();
    try {
      const { status, headers, json } = await fetchUpstream(route);
      await route.fulfill({ status, headers, json: mutate(json, new URL(route.request().url())) });
    } catch {
      await route.continue();
    }
  });
}

/** The dashboard in English: the locale cookie, and the profile the dashboard reads reporting locale "en". */
export async function english(ctx: BrowserContext) {
  await ctx.addCookies([{ name: "NEXT_LOCALE", value: "en", domain: DEV_COOKIE_DOMAIN, path: "/" }]);
  await rewriteJson(ctx, "**/profile/me", (json) => ({ ...(json as object), locale: "en" }));
}

export type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface MembershipsOverlay {
  /** Show the admin session as the owner of the business, so owner-only screens render. */
  asOwner?: boolean;
  /** Edits the business the dashboard reads (display data only). */
  business?: (business: Json) => Json;
}

/** Rewrites the viewer's memberships (role and business) as the dashboard reads them. */
export async function membershipsOverlay(ctx: BrowserContext, overlay: MembershipsOverlay) {
  await rewriteJson(ctx, "**/rest/v1/memberships*", (json) => {
    const edit = (m: Json): Json => ({
      ...m,
      role: overlay.asOwner ? "owner" : m.role,
      businesses: overlay.business && m.businesses ? overlay.business(m.businesses) : m.businesses,
    });
    return Array.isArray(json) ? json.map(edit) : edit(json as Json);
  });
}

/** Replaces a day name or an hours line a French fixture holds with its English reading. */
const ENGLISH_DAYS: Record<string, string> = { "Lun – Ven": "Mon – Fri", Samedi: "Saturday", Dimanche: "Sunday" };

/** The fixture shows an English-speaking business: English main language and English opening-hours days. */
export function englishBusiness(business: Json): Json {
  const settings = business.settings ?? {};
  const info = (settings.business_info ?? []).map((entry: Json) =>
    entry.type === "hours"
      ? {
          ...entry,
          data: { ...entry.data, schedule: entry.data.schedule.map((row: Json) => ({ ...row, days: ENGLISH_DAYS[row.days] ?? row.days })) },
        }
      : entry,
  );
  return { ...business, primary_locale: "en", settings: { ...settings, business_info: info } };
}

/** Edits the active card design the dashboard reads (display data only). */
export async function designOverlay(ctx: BrowserContext, edit: (design: Json) => Json) {
  await rewriteJson(ctx, "**/designs/*/active", (json) => (json ? edit(json as Json) : json));
}

/** Shows the card's back title in English: the fixture's is French. */
export function englishDesign(design: Json): Json {
  return { ...design, description: `${design.organization_name} loyalty card` };
}

/** Shows the business's logo on its dark chip: the seeded logo is white lettering that vanishes on a white card. */
export function visibleLogo(business: Json): Json {
  return business.logo_chip?.image_url ? { ...business, logo_url: business.logo_chip.image_url } : business;
}

export interface RosterOverlay {
  /** Per member email: scans and last-scan time to show in the member's panel. */
  activity?: Record<string, { scans: number; hoursAgo: number }>;
}

/** The owner shown to dashboards under a made-up name, so the real owner's name and address never reach a capture. */
const FICTIONAL_OWNER = { name: "Mathilde Garnier", email: "mathilde@seed.stampeo.app" };

/** Rewrites the team list: the owner row under a fictional name, and invented scan figures (the dev backend sends none). */
export async function rosterOverlay(ctx: BrowserContext, overlay: RosterOverlay = {}) {
  await rewriteJson(ctx, "**/memberships/business/**", (json) => {
    if (!Array.isArray(json)) return json;
    return json.map((m: Json) => {
      const user = m.role === "owner" ? { ...m.user, ...FICTIONAL_OWNER, phone: null } : m.user;
      const activity = overlay.activity?.[user?.email];
      if (!activity) return { ...m, user };
      const lastScan = new Date(Date.now() - activity.hoursAgo * 3_600_000).toISOString();
      return { ...m, user, activity: { last_scan_at: lastScan, scans_total: activity.scans } };
    });
  });
}

/** Aborts every write the dashboard attempts (sign-in and telemetry excepted), so a capture can't change data. */
export async function blockWrites(ctx: BrowserContext, log: (line: string) => void) {
  await ctx.route("**/*", async (route) => {
    const request = route.request();
    const method = request.method();
    if (method === "GET" || method === "HEAD" || method === "OPTIONS") return route.fallback();
    const url = request.url();
    if (ALLOWED_WRITES.some((re) => re.test(url))) return route.fallback();
    log(`blocked ${method} ${new URL(url).pathname}`);
    await route.abort("blockedbyclient");
  });
}

/** Hides the Next.js dev indicator on every page of the context. */
export async function hideDevIndicator(ctx: BrowserContext) {
  await ctx.addInitScript(() => {
    const style = document.createElement("style");
    style.textContent = "nextjs-portal{display:none!important}";
    document.addEventListener("DOMContentLoaded", () => document.head.appendChild(style));
  });
}

/** Waits until the dashboard has stopped showing a loading state. */
export async function settle(page: Page, ms = 1500) {
  await page.waitForFunction(() => !/Loading|Chargement/.test(document.body.innerText), null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(ms);
}
