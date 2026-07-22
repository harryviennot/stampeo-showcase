import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { businessDesignTag, businessSlugTag } from "@/lib/acquisition";

/**
 * Purge the acquisition-page Data Cache for a single business.
 *
 * Called by the backend (app/services/showcase_revalidate.py) whenever a card /
 * program / business changes, so the public page reflects it immediately
 * instead of after the `ACQUISITION_REVALIDATE_SECONDS` TTL. Guarded by a
 * shared secret; a mismatch (or unset secret) is rejected.
 *
 * Body: { slug?: string, businessId?: string } — pass either or both.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || req.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const slug = typeof body?.slug === "string" ? body.slug : null;
  const businessId = typeof body?.businessId === "string" ? body.businessId : null;

  // revalidateTag is the correct tag-invalidation API for a Route Handler
  // (updateTag is Server-Action-only). Next 16 requires a profile second arg;
  // `{ expire: 0 }` purges NOW so the next request re-fetches (a named profile
  // like "max" sets a long expiry and would NOT invalidate immediately).
  const purged: string[] = [];
  if (slug) {
    revalidateTag(businessSlugTag(slug), { expire: 0 });
    purged.push(businessSlugTag(slug));
  }
  if (businessId) {
    revalidateTag(businessDesignTag(businessId), { expire: 0 });
    purged.push(businessDesignTag(businessId));
  }

  return NextResponse.json({ revalidated: purged.length > 0, purged });
}
