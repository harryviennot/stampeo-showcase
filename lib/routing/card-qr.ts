/**
 * Where the QR code on Stampeo's printed business cards lands.
 *
 * The cards encode `stampeo.app/qr` and cannot be reprinted, so the
 * destination lives here. A 302 that nothing caches, so it can change; and
 * relative, so each host (prod, dev, localhost) keeps the scan on itself.
 */
const CARD_QR_DESTINATION =
  "/?utm_source=card&utm_medium=qr&utm_campaign=business-cards-2026-10";

export function cardQrRedirect(): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: CARD_QR_DESTINATION, "Cache-Control": "no-store" },
  });
}
