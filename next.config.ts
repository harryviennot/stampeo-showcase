import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: [
    "stampeo.172.16.0.241.nip.io",
    "172.16.0.241",
  ],
};

export default withNextIntl(nextConfig);
