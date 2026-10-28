import type { Browser, BrowserContext, Page } from "playwright-core";
import { DEVICES, type Device } from "./devices";
import { readEnvKey } from "./env";
import { blockWrites, english, hideDevIndicator, membershipsOverlay, type Json } from "./overlays";

export const DEFAULT_APP_URL = "https://app.dev.stampeo.app";
export const SHOWCASE_URL = "https://showcase.dev.stampeo.app";

/** The dev fixtures' staff logins (see the stampeo-help-docs skill). All share FIXTURE_PASSWORD. */
export const ACCOUNTS = {
  patoune: { email: "lea@patoune.seed.stampeo.app", business: "Patoune" },
  vanity: { email: "ines@vanity.seed.stampeo.app", business: "Vanity" },
  aurevo: { email: "camille@aurevo.seed.stampeo.app", business: "Aurevo" },
  marginalia: { email: "theo@marginalia.seed.stampeo.app", business: "Marginalia" },
  lustre: { email: "driss@lustre.seed.stampeo.app", business: "Lustre" },
  xenika: { email: "elena@xenika.seed.stampeo.app", business: "Xeniká" },
} as const;
export type AccountKey = keyof typeof ACCOUNTS;

export interface SessionSpec {
  /** The fixture login to sign in as. Omit it for a public showcase page (no sign-in). */
  account?: AccountKey;
  device: Device;
  /** Show the admin session as the owner of the business (owner-only screens). */
  asOwner?: boolean;
  /** Edits the business the dashboard reads, for display only. */
  business?: (business: Json) => Json;
  /** Extra overlays for this recipe (rewritten API responses), registered before sign-in. */
  setup?: (ctx: BrowserContext) => Promise<void>;
  /** Dashboard base URL: the deployed dev dashboard, or a local build of the web repo's dev branch. */
  appUrl?: string;
  log?: (line: string) => void;
}

export interface Session {
  ctx: BrowserContext;
  page: Page;
  appUrl: string;
}

/** A fresh phone or desktop browser context with the overlays every capture gets. */
async function newContext(browser: Browser, spec: SessionSpec) {
  const ctx = await browser.newContext(DEVICES[spec.device]);
  await english(ctx);
  if (spec.asOwner || spec.business) await membershipsOverlay(ctx, { asOwner: spec.asOwner, business: spec.business });
  await spec.setup?.(ctx);
  await hideDevIndicator(ctx);
  return ctx;
}

/** A public showcase page: no sign-in, writes blocked. */
export async function openPublic(browser: Browser, spec: SessionSpec): Promise<Session> {
  const ctx = await newContext(browser, spec);
  await blockWrites(ctx, spec.log ?? (() => {}));
  return { ctx, page: await ctx.newPage(), appUrl: SHOWCASE_URL };
}

/** Signs in through the dev showcase's login page and returns a dashboard-ready page with the overlays on. */
export async function openDashboard(browser: Browser, spec: SessionSpec): Promise<Session> {
  if (!spec.account) throw new Error("openDashboard needs an account");
  const appUrl = spec.appUrl ?? DEFAULT_APP_URL;
  const ctx = await newContext(browser, spec);
  const page = await ctx.newPage();

  await page.goto(`${SHOWCASE_URL}/en/login`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Continue with email/i }).click();
  await page.getByLabel(/^Email$/i).fill(ACCOUNTS[spec.account].email);
  await page.getByLabel(/^Password$/i).fill(readEnvKey("FIXTURE_PASSWORD"));
  await page.getByRole("button", { name: /^Sign in$/i }).click();
  await page.waitForURL(/app\.dev\.stampeo\.app/, { timeout: 30000 });

  if (appUrl !== DEFAULT_APP_URL) {
    // A local build can't read the shared cookie domain: hand it the session and the language cookie.
    const cookies = (await ctx.cookies()).filter((c) => c.name.startsWith("sb-") || c.name === "NEXT_LOCALE");
    await ctx.addCookies(cookies.map((c) => ({ name: c.name, value: c.value, url: appUrl })));
  }
  await blockWrites(ctx, spec.log ?? (() => {}));
  return { ctx, page, appUrl };
}
