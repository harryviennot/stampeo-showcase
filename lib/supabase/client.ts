import { createBrowserClient } from "@supabase/ssr";

interface CookieOptions {
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: string;
}

interface CookieToSet {
  name: string;
  value: string;
  options: CookieOptions;
}

// Helper to parse cookies from document.cookie
function parseCookies(): { name: string; value: string }[] {
  if (typeof document === "undefined") {
    return [];
  }
  return document.cookie.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

// Helper to set a cookie with domain support
function setCookie(name: string, value: string, options: CookieOptions) {
  if (typeof document === "undefined") {
    return;
  }
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
  let cookie = `${name}=${value}`;

  if (options.maxAge !== undefined) {
    cookie += `; Max-Age=${options.maxAge}`;
  }
  cookie += `; Path=${options.path || "/"}`;

  if (cookieDomain) {
    cookie += `; Domain=${cookieDomain}`;
  }

  if (options.secure || process.env.NODE_ENV === "production") {
    cookie += "; Secure";
  }

  cookie += `; SameSite=${options.sameSite || "Lax"}`;

  document.cookie = cookie;
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookies();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            setCookie(name, value, options);
          });
        },
      },
    }
  );
}
