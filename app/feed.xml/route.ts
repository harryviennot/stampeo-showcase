import { feedPath } from "@/lib/blog/feed";

/** The unlocalised feed URL moves permanently to the French feed. */
export async function GET() {
  return new Response(null, {
    status: 308,
    headers: { Location: feedPath("fr") },
  });
}
