/**
 * Runs the attribution chain for one set of inputs, with this repo's real
 * functions: a visitor lands, the carriers are written, and the account
 * sign-up call is built from the cookie jar they left. What it returns is what
 * `attribution-chain.v2.json` holds as the showcase's expected outputs, and
 * what the test recomputes to prove the file still says what the code does.
 */

import { installFakeBrowser } from "../../privacy/__fixtures__/fake-browser";
import { readConsentSnapshot } from "../../privacy/snapshot";
import { capturePass, readStoredCarriers } from "../capture";
import { AD_COOKIE, GA_COOKIE, SOURCE_COOKIE } from "../cookie-names";
import { consentEvidence } from "../evidence";
import { landingFromUrl } from "../landing";
import { wireOf } from "./visitors";
import { recordAccountSignup } from "../signup-call";

export interface ChainInputs {
  landing_url: string;
  referrer: string;
  timezone: string;
  gpc: boolean;
  /** What the visitor chose: `none` is a US visitor who never touched the notice. */
  consent: "none";
  cookies: Record<string, string>;
  ga_measurement_id: string;
  times: { landed_at: number; captured_at: number };
}

export interface ChainOutputs {
  carriers: { src: unknown; ga: unknown; ad: unknown };
  cookie_values: Record<string, string>;
  route_request: { path: string; body: unknown };
  signup_request: { path: string; body: unknown };
}

const CARRIER_COOKIES = [SOURCE_COOKIE, GA_COOKIE, AD_COOKIE] as const;

export async function computeAttributionChain(inputs: ChainInputs): Promise<ChainOutputs> {
  const cookie = Object.entries(inputs.cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
  const browser = installFakeBrowser({
    cookie,
    timezone: inputs.timezone,
    gpc: inputs.gpc,
    hostname: new URL(inputs.landing_url).hostname,
    fetch: "route",
  });

  try {
    const snapshot = readConsentSnapshot();
    capturePass({
      landing: landingFromUrl(inputs.landing_url, {
        referrer: inputs.referrer,
        variant: null,
        landedAt: inputs.times.landed_at,
      }),
      consent: { analytics: snapshot.analytics, marketing: snapshot.marketing },
      evidence: consentEvidence({
        record: snapshot.record,
        prior: snapshot.prior,
        row: snapshot.row,
      })!,
      measurementId: inputs.ga_measurement_id,
      now: inputs.times.captured_at,
    });
    await browser.settled();

    const stored = readStoredCarriers(browser.jar());
    const jar = new Map(browser.jar().split("; ").map((entry) => {
      const split = entry.indexOf("=");
      return [entry.slice(0, split), entry.slice(split + 1)] as const;
    }));
    const [route] = browser.fetches;

    recordAccountSignup({
      apiUrl: "https://api.stampeo.app",
      measurementId: inputs.ga_measurement_id,
      getAccessToken: async () => "user-access-token",
      guard: { sent: false },
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    const signup = browser.fetches[browser.fetches.length - 1];

    return {
      carriers: { src: wireOf(stored.src), ga: wireOf(stored.ga), ad: wireOf(stored.ad) },
      cookie_values: Object.fromEntries(
        CARRIER_COOKIES.map((name) => [name, jar.get(name) ?? ""]),
      ),
      route_request: { path: route.url, body: route.body },
      signup_request: { path: new URL(signup.url).pathname, body: signup.body },
    };
  } finally {
    browser.restore();
  }
}
