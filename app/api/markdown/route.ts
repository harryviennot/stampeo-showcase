import { NextRequest } from "next/server";
import { htmlToMarkdown } from "@/lib/markdown/convert";
import { isMarkdownEligible } from "@/lib/markdown/eligibility";

export const runtime = "nodejs";

function resolveOrigin(request: NextRequest): string {
  const hostHeader = request.headers.get("host");
  if (hostHeader) {
    const protocol = hostHeader.startsWith("localhost") ? "http" : "https";
    return `${protocol}://${hostHeader}`;
  }
  return request.nextUrl.origin;
}

export async function GET(request: NextRequest): Promise<Response> {
  const path = request.nextUrl.pathname;

  if (!isMarkdownEligible(path)) {
    return new Response("Not found", { status: 404 });
  }

  const origin = resolveOrigin(request);
  const target = `${origin}${path}${request.nextUrl.search}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  let html: string;
  try {
    const res = await fetch(target, {
      headers: {
        "x-internal-markdown": "1",
        accept: "text/html",
        "user-agent": "stampeo-markdown-proxy",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      return new Response(`Upstream ${res.status} for ${target}`, {
        status: res.status,
      });
    }
    html = await res.text();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(`Upstream fetch failed: ${message} (target=${target})`, {
      status: 502,
    });
  } finally {
    clearTimeout(timeout);
  }

  const { markdown, tokens } = htmlToMarkdown(html);

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "accept",
      "x-markdown-tokens": String(tokens),
      "Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
