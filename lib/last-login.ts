export type LastLoginMethod = "google" | "apple" | "email";

export interface LastLogin {
  method: LastLoginMethod;
  email?: string;
  at: string;
}

export const LAST_LOGIN_COOKIE = "stampeo_last_login";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function readLastLogin(): LastLogin | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${LAST_LOGIN_COOKIE}=`));
  if (!match) return null;
  const raw = match.slice(LAST_LOGIN_COOKIE.length + 1);
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded) as Partial<LastLogin>;
    if (
      parsed.method === "google" ||
      parsed.method === "apple" ||
      parsed.method === "email"
    ) {
      return {
        method: parsed.method,
        email: typeof parsed.email === "string" ? parsed.email : undefined,
        at: typeof parsed.at === "string" ? parsed.at : new Date().toISOString(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function writeLastLogin(method: LastLoginMethod, email?: string): void {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(
    JSON.stringify({ method, email, at: new Date().toISOString() })
  );
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
  let cookie = `${LAST_LOGIN_COOKIE}=${value}; Max-Age=${ONE_YEAR_SECONDS}; Path=/; SameSite=Lax`;
  if (cookieDomain) cookie += `; Domain=${cookieDomain}`;
  if (process.env.NODE_ENV === "production") cookie += "; Secure";
  document.cookie = cookie;
}

export interface ServerCookieAttributes {
  name: string;
  value: string;
  maxAge: number;
  path: string;
  sameSite: "lax";
  secure: boolean;
  domain?: string;
}

export function buildLastLoginCookie(
  method: LastLoginMethod,
  email?: string
): ServerCookieAttributes {
  return {
    name: LAST_LOGIN_COOKIE,
    value: JSON.stringify({ method, email, at: new Date().toISOString() }),
    maxAge: ONE_YEAR_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined,
  };
}

