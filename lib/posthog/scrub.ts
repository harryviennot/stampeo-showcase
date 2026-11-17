import { AD_CLICK_PARAMS, AD_CLICK_VENDORS, adClickVendor, adClickVendorOfName, type AdClickVendor } from "../privacy/ad-click-params";
import { isPlainObject, scrubCredentialParams, scrubText, scrubValue } from "../privacy/credential-params";

// The token of a demo session (the wallet-select page, and the pass link its buttons lead to) or of a team-join link, in a path.
const PATH_TOKEN = /(\/(?:demo\/(?:wallet-select|pass)|join)\/)[^/?#\s"]+/g;
const PATH_TOKEN_PLACEHOLDER = ":token";

// A property that carries a demo session's token.
const SESSION_TOKEN_PROPERTY = /^session_?token$/i;

const scrubUrls = (text: string): string =>
  scrubText(scrubCredentialParams(text), AD_CLICK_PARAMS).replace(PATH_TOKEN, `$1${PATH_TOKEN_PLACEHOLDER}`);

/**
 * A PostHog event without what must not reach PostHog: credentials and ad click ids in every URL it carries
 * (`$current_url`, `$referrer`, `$session_entry_url`, `$external_click_url`, the element chain, heatmap keys, and the
 * same under `$set` / `$set_once`), the tokens in a demo or team-join path (replaced by `:token`), the click ids
 * PostHog copies into properties of their own (`gclid`, `$initial_gclid`, `$session_entry_gclid`) and a
 * `session_token` property. When a click id was there, `properties.ad_click_vendor` names its platform: the first
 * of Google, Meta, OpenAI and TikTok when several are. The event itself is always kept.
 */
export function scrubPostHogEvent<T>(event: T): T {
  const vendors = new Set<AdClickVendor>();
  const scrub = (text: string) => {
    const vendor = adClickVendor(text);
    if (vendor) vendors.add(vendor);
    return scrubUrls(text);
  };
  // PostHog adds every campaign property, empty when the URL has none: only a click id with a value names a vendor.
  const dropEntry = (key: string, item: unknown) => {
    const vendor = adClickVendorOfName(key);
    if (vendor && item !== null && item !== undefined && item !== "") vendors.add(vendor);
    return vendor !== null || SESSION_TOKEN_PROPERTY.test(key);
  };
  const scrubbed = scrubValue(event, scrub, dropEntry) as { properties?: unknown };
  const vendor = AD_CLICK_VENDORS.find((candidate) => vendors.has(candidate));

  if (vendor && isPlainObject(scrubbed) && isPlainObject(scrubbed.properties)) scrubbed.properties.ad_click_vendor = vendor;
  return scrubbed as T;
}
