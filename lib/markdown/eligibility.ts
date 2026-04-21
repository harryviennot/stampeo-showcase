const EXCLUDED_PREFIXES = [
  "/api",
  "/auth",
  "/onboarding",
  "/login",
  "/_next",
  "/_vercel",
  "/en/onboarding",
  "/en/login",
  "/en/auth",
];

export function isMarkdownEligible(pathname: string): boolean {
  if (!pathname.startsWith("/")) return false;
  if (pathname.includes("..")) return false;
  if (/\.[a-z0-9]+$/i.test(pathname)) return false;
  for (const prefix of EXCLUDED_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return false;
  }
  return true;
}
