import { AD_CLICK_PARAMS, AD_CLICK_VENDORS, adClickVendor, adClickVendorOfName, type AdClickVendor } from "../privacy/ad-click-params";
import { isPlainObject, scrubCredentialParams, scrubText, scrubValue } from "../privacy/credential-params";

// The token of a demo session (the wallet-select page, and the pass link its buttons lead to) or of a team-join link, in a path.
const PATH_TOKEN = /(\/(?:demo\/(?:wallet-select|pass)|join)\/)[^/?#\s"]+/g;
const PATH_TOKEN_PLACEHOLDER = ":token";

// A property that carries a demo session's token.
const SESSION_TOKEN_PROPERTY = /^session_?token$/i;

// An email address, plain or percent-encoded as in a link's query (`ines%40example.com`). The local part is capped at 64
// characters, the longest an address may have, which keeps the scan of a long string linear.
const EMAIL = /[\w.+%-]{1,64}(?:@|%40)(?:[a-z\d-]+\.)+[a-z]{2,}/gi;
const EMAIL_PLACEHOLDER = "[email]";

const scrubEmails = (text: string): string => (/@|%40/i.test(text) ? text.replace(EMAIL, EMAIL_PLACEHOLDER) : text);

const scrubString = (text: string): string =>
  scrubEmails(scrubText(scrubCredentialParams(text), AD_CLICK_PARAMS).replace(PATH_TOKEN, `$1${PATH_TOKEN_PLACEHOLDER}`));

/**
 * A PostHog event without what must not reach PostHog: credentials and ad click ids in every URL it carries
 * (`$current_url`, `$referrer`, `$session_entry_url`, `$external_click_url`, the element chain, heatmap keys, and the
 * same under `$set` / `$set_once`), the tokens in a demo or team-join path (replaced by `:token`), the click ids
 * PostHog copies into properties of their own (`gclid`, `$initial_gclid`, `$session_entry_gclid`), a
 * `session_token` property, and any email address in any string (the text of a tapped element and its element chain
 * included), replaced by `[email]`. When a click id was there, `properties.ad_click_vendor` names its platform: the first
 * of Google, Meta, OpenAI and TikTok when several are. The event itself is always kept.
 */
export function scrubPostHogEvent<T>(event: T): T {
  const vendors = new Set<AdClickVendor>();
  const scrub = (text: string) => {
    const vendor = adClickVendor(text);
    if (vendor) vendors.add(vendor);
    return scrubString(text);
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
