import { cardQrRedirect } from "@/lib/routing/card-qr";

// The QR code printed on Stampeo's business cards. See lib/routing/card-qr.ts.
export const dynamic = "force-dynamic";

export function GET() {
  return cardQrRedirect();
}
