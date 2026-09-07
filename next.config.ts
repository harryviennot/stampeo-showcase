import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";

const withNextIntl = createNextIntlPlugin();

const DISCOVERY_LINKS = [
  '</sitemap.xml>; rel="sitemap"',
  '</feed.xml>; rel="alternate"; type="application/rss+xml"; title="Stampeo Blog"',
  '</privacy>; rel="privacy-policy"',
  '</terms>; rel="terms-of-service"',
  '</llms.txt>; rel="describedby"; type="text/plain"',
].join(", ");

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: [
    "stampeo.192.168.20.93.nip.io",
    "192.168.20.93",
    "showcase.dev.stampeo.app",
  ],
  async rewrites() {
    // The two app-association files must live at fixed .well-known paths, but
    // a folder starting with a dot is not routable in the app directory, and
    // the AASA file has no extension so a static host would serve it with the
    // wrong content type. Route handlers do both correctly.
    return [
      {
        source: "/.well-known/apple-app-site-association",
        destination: "/api/well-known/aasa",
      },
      {
        source: "/.well-known/assetlinks.json",
        destination: "/api/well-known/assetlinks",
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "Link", value: DISCOVERY_LINKS }],
      },
    ];
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
});
