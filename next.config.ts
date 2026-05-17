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
    "stampeo.10.196.9.69.nip.io",
    "10.196.9.69",
  ],
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
