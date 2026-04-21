import { NextRequest } from "next/server";
import { htmlToMarkdown } from "@/lib/markdown/convert";
import { isMarkdownEligible } from "@/lib/markdown/eligibility";

export async function GET(request: NextRequest): Promise<Response> {
  const path = request.nextUrl.pathname;

  if (!isMarkdownEligible(path)) {
    return new Response("Not found", { status: 404 });
  }

  const target = `${request.nextUrl.origin}${path}${request.nextUrl.search}`;

  let html: string;
  try {
    const res = await fetch(target, {
      headers: {
        "x-internal-markdown": "1",
        accept: "text/html",
      },
    });
    if (!res.ok) {
      return new Response(`Upstream ${res.status}`, { status: res.status });
    }
    html = await res.text();
  } catch {
    return new Response("Upstream fetch failed", { status: 502 });
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
