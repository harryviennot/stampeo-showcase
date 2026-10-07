import { handlePrivacyCookies } from "@/lib/privacy/cookie-route";

// Sets the consent and subject cookies as a first-party response. All of the
// logic is in `lib/privacy/cookie-route.ts`, where it is tested.
export async function POST(request: Request) {
  const { status, setCookies } = await handlePrivacyCookies(request);
  const headers = new Headers({ "Cache-Control": "no-store" });
  for (const cookie of setCookies) headers.append("Set-Cookie", cookie);
  return new Response(null, { status, headers });
}
