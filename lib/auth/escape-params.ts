import { cookieValue } from "../attribution/codec";
import { AD_COOKIE, SOURCE_COOKIE } from "../attribution/cookie-names";
import { parseAdCookie } from "../attribution/ad-ids";
import { parseSourceCookie } from "../attribution/source";

/**
 * The query parameters the real-browser link carries so the paid click is still
 * attributed there: the ad's UTM tags from `stampeo_src` and the Meta click id
 * from `stampeo_ad`. Nothing else, because the link reaches analytics.
 */
export function escapeParamsFromCookies(cookieHeader: string | null | undefined): URLSearchParams {
  const params = new URLSearchParams();

  const source = parseSourceCookie(cookieValue(cookieHeader, SOURCE_COOKIE));
  if (source) {
    const utm: ReadonlyArray<readonly [string, string | null]> = [
      ["utm_source", source.us],
      ["utm_medium", source.um],
      ["utm_campaign", source.uc],
      ["utm_content", source.uo],
      ["utm_term", source.ut],
    ];
    for (const [name, value] of utm) {
      if (value) params.set(name, value);
    }
  }

  const ad = parseAdCookie(cookieValue(cookieHeader, AD_COOKIE));
  if (ad?.vn === "meta") params.set("fbclid", ad.ci);

  return params;
}
