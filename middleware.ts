import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api, /auth, /_next, /_vercel
    // - files with extensions (e.g. favicon.ico)
    "/((?!api|auth|_next|_vercel|.*\\..*).*)",
  ],
};
