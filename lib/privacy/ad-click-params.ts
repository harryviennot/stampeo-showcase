import { scrubTextParams, scrubUrlParams, type ParamNames } from "./url-params";

/** The click ids each ad platform appends to a landing, in the order a visitor who carries two is credited: Google, Meta, ChatGPT ads (OpenAI), TikTok. */
const CLICK_IDS_BY_VENDOR = {
  google: ["gclid", "gbraid", "wbraid"],
  meta: ["fbclid"],
  openai: ["oppref"],
  tiktok: ["ttclid"],
} as const;

export type AdClickVendor = keyof typeof CLICK_IDS_BY_VENDOR;

export const AD_CLICK_VENDORS = Object.keys(CLICK_IDS_BY_VENDOR) as AdClickVendor[];

export const AD_CLICK_PARAMS: ParamNames = new Set(Object.values(CLICK_IDS_BY_VENDOR).flat());

const PARAMS_OF = AD_CLICK_VENDORS.map((vendor) => [vendor, new Set<string>(CLICK_IDS_BY_VENDOR[vendor])] as const);

/** `url` without its ad click ids; every other parameter, utm_* included, is kept as written. */
export function stripAdClickIds(url: string): string {
  return scrubUrlParams(url, AD_CLICK_PARAMS);
}

/** The platform whose click id is named `name`: a URL parameter, or the property PostHog makes of it (`gclid`, `$initial_gclid`). */
export function adClickVendorOfName(name: string): AdClickVendor | null {
  const param = name.replace(/^\$initial_/, "").toLowerCase();

  return PARAMS_OF.find(([, params]) => params.has(param))?.[0] ?? null;
}

/** The platform whose click id the text (a URL, or text with URLs in it) carries, or null: the first of `AD_CLICK_VENDORS` when it carries several. */
export function adClickVendor(text: string): AdClickVendor | null {
  return PARAMS_OF.find(([, params]) => scrubTextParams(text, params) !== text)?.[0] ?? null;
}
