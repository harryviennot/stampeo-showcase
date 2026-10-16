import { scrubUrlParams } from "./credential-params";

// The click ids Google Ads, Meta and TikTok append to an ad landing.
const AD_CLICK_PARAMS: ReadonlySet<string> = new Set(["gclid", "gbraid", "wbraid", "fbclid", "ttclid"]);

/** `url` without its ad click ids; every other parameter, utm_* included, is kept as written. */
export function stripAdClickIds(url: string): string {
  return scrubUrlParams(url, AD_CLICK_PARAMS);
}
