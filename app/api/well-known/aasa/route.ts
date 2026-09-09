import { NextResponse } from "next/server";

/**
 * Apple App Site Association, served at /.well-known/apple-app-site-association
 * via a rewrite in next.config.ts.
 *
 * This is what lets an emailed join link open the scanner app directly instead
 * of bouncing through a browser. It is served from a route handler rather than
 * public/ for two reasons: the file has no extension, and Apple requires the
 * application/json content type, which a static file server will not set.
 *
 * Only /join/* is claimed. Claiming the whole domain would hijack every
 * stampeo.app link on a phone with the app installed.
 */

const TEAM_ID = "QQJF5895MC";

const BUNDLE_IDS = [
  "com.hryvnt.stampeo",          // production
  "com.hryvnt.stampeo.preview",  // TestFlight / internal
  "com.hryvnt.stampeo.dev",      // local dev builds
];

export const dynamic = "force-static";

export function GET() {
  const body = {
    applinks: {
      details: [
        {
          appIDs: BUNDLE_IDS.map((id) => `${TEAM_ID}.${id}`),
          components: [
            {
              "/": "/join/*",
              comment: "Scanner join codes open in the app",
            },
          ],
        },
      ],
    },
  };

  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      "content-type": "application/json",
      // Apple's CDN caches this; keep it short enough that adding a build
      // variant doesn't take a day to propagate.
      "cache-control": "public, max-age=3600",
    },
  });
}
