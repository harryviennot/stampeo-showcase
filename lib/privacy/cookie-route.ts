import { adCookieFor } from "../attribution/ad-ids";
import {
  AD_COOKIE,
  GA_COOKIE,
  LEGACY_ATTRIBUTION_COOKIE,
  SOURCE_COOKIE,
} from "../attribution/cookie-names";
import { gaCookieFor } from "../attribution/ga-ids";
import { sourceCookieFor } from "../attribution/source";
import {
  consentCookieAttributes,
  consentCookieValue,
  consentFromObject,
  explicitRefusals,
  parseStoredChoice,
  type ConsentCategory,
} from "../consent";
import { buildCookie, serializeSetCookie, type CookieAttributes } from "./cookies";
import { mintSubjectId, readSidCookie, sidCookieAttributes } from "./subject";

/**
 * The logic of `POST /api/privacy/cookies`, kept out of the route file so
 * `bun test lib` covers it. It reads a request, applies the guards, and answers
 * with a status and the `Set-Cookie` values to send; it never logs and never
 * echoes anything it was given.
 *
 * It writes only the names it owns (the consent and subject cookies, and the
 * three attribution carriers) and re-validates every value with the same
 * parsers the client uses: an invalid value is dropped, silently.
 */

/** The most it will read from a request body. */
export const MAX_BODY_BYTES = 8 * 1024;

/** The carriers a request may set, which it may also ask to be cleared. */
const CLEARABLE_COOKIES: ReadonlySet<string> = new Set([
  SOURCE_COOKIE,
  GA_COOKIE,
  AD_COOKIE,
  LEGACY_ATTRIBUTION_COOKIE,
]);

/** Turns a posted carrier value into the cookie to set, or null to drop it. */
export type CarrierParser = (value: unknown) => CookieAttributes | null;

/**
 * The attribution carriers a request may set, by the name it posts them under.
 * Each parser is the one the client reads its own cookie with; a carrier with
 * no parser here is ignored.
 */
export const CARRIER_PARSERS: ReadonlyMap<string, CarrierParser> = new Map([
  ["src", sourceCookieFor],
  ["ga", gaCookieFor],
  ["ad", adCookieFor],
]);

/** The carriers a request may set, by the key it posts them under, and the categories each rests on. */
const CARRIER_CATEGORIES: Readonly<Record<string, readonly ConsentCategory[]>> = {
  src: ["analytics", "marketing"],
  ga: ["analytics"],
  ad: ["marketing"],
};

/**
 * Is a carrier still permitted by what the request's own consent cookie
 * refuses? A refusal of any version stands, and a restored `0` is one; `-1` is
 * no choice and refuses nothing. The source rests on either category, so only
 * both refused takes it.
 */
function carrierPermitted(key: string, refused: ReadonlySet<ConsentCategory>): boolean {
  const categories = CARRIER_CATEGORIES[key] ?? [];
  return categories.some((category) => !refused.has(category));
}

/** The categories the `Cookie:` header's consent record refuses, from any version. */
function refusedBy(cookieHeader: string | null): Set<ConsentCategory> {
  return new Set(explicitRefusals(parseStoredChoice(consentCookieValue(cookieHeader))));
}

export interface PrivacyRequestLike {
  headers: { get(name: string): string | null };
  body: ReadableStream<Uint8Array> | null;
}

export interface PrivacyCookiesResult {
  status: number;
  setCookies: string[];
}

const refuse = (status: number): PrivacyCookiesResult => ({ status, setCookies: [] });

/**
 * Is this `Origin` the site itself? Either the configured public URL, or a
 * host the request itself carries (the first forwarded host when behind a
 * proxy) over https. http is allowed outside production, for local dev.
 */
function isSiteOrigin(origin: string, headers: PrivacyRequestLike["headers"]): boolean {
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }

  try {
    const configured = process.env.NEXT_PUBLIC_SHOWCASE_URL;
    if (configured && new URL(configured).origin === url.origin) return true;
  } catch {
    // An unparseable configured URL names no site; fall through to the host.
  }

  const production = process.env.NODE_ENV === "production";
  if (url.protocol !== "https:" && (production || url.protocol !== "http:")) return false;

  const forwarded = headers.get("x-forwarded-host")?.split(",")[0].trim();
  const host = (forwarded || headers.get("host") || "").toLowerCase();
  return host !== "" && url.host === host;
}

/** The body as text, or null once it exceeds `limit` bytes. */
async function readCapped(
  body: ReadableStream<Uint8Array> | null,
  limit: number,
): Promise<string | null> {
  if (!body) return "";
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel().catch(() => {});
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export async function handlePrivacyCookies(
  request: PrivacyRequestLike,
): Promise<PrivacyCookiesResult> {
  const { headers } = request;

  const origin = headers.get("origin");
  if (!origin || !isSiteOrigin(origin, headers)) return refuse(403);

  const type = (headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (type !== "application/json") return refuse(415);

  const declared = Number(headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return refuse(413);
  const text = await readCapped(request.body, MAX_BODY_BYTES);
  if (text === null) return refuse(413);

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return refuse(400);
  }
  if (!isObject(body)) return refuse(400);

  const setCookies: string[] = [];

  // The subject: the cookie we already hold, else the one in the consent
  // record, else a new one. The record is then written carrying that subject.
  const record = consentFromObject(body.consent);
  const sid =
    body.sid === "ensure"
      ? (readSidCookie(headers.get("cookie")) ?? record?.subjectId ?? mintSubjectId())
      : null;

  if (record) {
    const stored = sid ? { ...record, subjectId: sid } : record;
    setCookies.push(serializeSetCookie(consentCookieAttributes(stored)));
  }
  if (sid) setCookies.push(serializeSetCookie(sidCookieAttributes(sid)));

  if (isObject(body.carriers)) {
    const refused = refusedBy(headers.get("cookie"));
    for (const [name, value] of Object.entries(body.carriers)) {
      if (!carrierPermitted(name, refused)) continue;
      const cookie = CARRIER_PARSERS.get(name)?.(value);
      if (cookie) setCookies.push(serializeSetCookie(cookie));
    }
  }

  if (Array.isArray(body.clear)) {
    const names = new Set(
      body.clear.slice(0, 16).filter((n): n is string => typeof n === "string" && CLEARABLE_COOKIES.has(n)),
    );
    for (const name of names) setCookies.push(serializeSetCookie(buildCookie(name, "", 0)));
  }

  return { status: 204, setCookies };
}
