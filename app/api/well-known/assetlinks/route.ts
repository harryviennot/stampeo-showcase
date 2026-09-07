import { NextResponse } from "next/server";

/**
 * Android App Links digital asset links, served at /.well-known/assetlinks.json
 * via a rewrite in next.config.ts. The Android counterpart to the AASA file.
 *
 * Fingerprints come from the environment rather than the source, because the
 * one that matters in production is Play App Signing's — Google re-signs the
 * upload, so the certificate is theirs, not ours, and it can be rotated without
 * a code change. Get them from `eas credentials -p android` and from the Play
 * Console under Setup > App signing.
 *
 * Set ANDROID_CERT_FINGERPRINTS to a comma-separated list of SHA-256
 * fingerprints (the colon-separated uppercase hex form). With none set the
 * file is still valid JSON, and Android App Links simply stay unverified —
 * links fall back to this web page, which is the intended degradation.
 */

const PACKAGE_NAMES = [
  "com.hryvnt.stampeo",
  "com.hryvnt.stampeo.preview",
  "com.hryvnt.stampeo.dev",
];

export const dynamic = "force-dynamic";

function fingerprints(): string[] {
  return (process.env.ANDROID_CERT_FINGERPRINTS ?? "")
    .split(",")
    .map((f) => f.trim().toUpperCase())
    .filter(Boolean);
}

export function GET() {
  const certs = fingerprints();

  const body = PACKAGE_NAMES.map((packageName) => ({
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: packageName,
      sha256_cert_fingerprints: certs,
    },
  }));

  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=3600",
    },
  });
}
