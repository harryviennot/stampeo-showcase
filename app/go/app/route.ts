import { NextRequest, NextResponse } from "next/server";

// Platform-detecting deep link for the Stampeo scanner app. Encoded in the
// "scan to install" QR code on the scanner-mobile feature page: a phone scanning
// it is sent straight to the right store. Kept in sync with StoreBadges.tsx.
const APP_STORE_URL = "https://apps.apple.com/app/id6761758382";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.hryvnt.stampeo";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  const isAndroid = /android/i.test(ua);
  // Everything that isn't Android goes to the App Store (iPhone/iPad and any
  // desktop scanner preview land on Apple's listing).
  return NextResponse.redirect(isAndroid ? PLAY_STORE_URL : APP_STORE_URL, 302);
}
