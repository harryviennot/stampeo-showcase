/**
 * IndexNow integration for rapid search engine indexing.
 * Submits changed URLs to https://api.indexnow.org/ so Bing, ChatGPT Search,
 * Copilot, and DuckDuckGo learn about updates quickly.
 *
 * The step never fails the workflow; a problem shows up as a `::warning::`
 * annotation on the run page instead.
 */

import { readdirSync } from "node:fs";
import { join } from "node:path";

const PUBLIC_DIR = join(import.meta.dir, "..", "public");

/** The `<key>.txt` file in `public/` that proves the site owns the key. */
export function findKeyFile(): string | undefined {
  return readdirSync(PUBLIC_DIR).find((file) => /^[0-9a-f]{32}\.txt$/.test(file));
}

/** A GitHub Actions warning annotation, shown on the run page while the step still passes. */
export function warning(message: string): string {
  return `::warning::IndexNow ${message}`;
}

const REFUSALS: Record<number, string> = {
  400: "rejected the request format",
  403: "does not accept the key (is the key file deployed?)",
  422: "rejected the URLs or the key for this host",
  429: "is rate limiting this site",
};

/** The log line for an IndexNow response: 2xx is plain, anything else (0 = no response) a warning. */
export function reportFor(status: number): { ok: boolean; line: string } {
  if (status >= 200 && status < 300) return { ok: true, line: `IndexNow response: ${status}` };
  const reason = status === 0 ? "gave no response" : (REFUSALS[status] ?? "answered with an error");
  return { ok: false, line: warning(`${reason} (HTTP ${status === 0 ? "no response" : status})`) };
}

export function extractSitemapUrls(xml: string): string[] {
  const urls: string[] = [];
  const locRegex = /<loc>([^<]+)<\/loc>/g;

  let match;
  while ((match = locRegex.exec(xml)) !== null) {
    urls.push(match[1]);
  }

  return urls;
}

export function buildIndexNowPayload(
  urls: string[],
  key: string,
): {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
} {
  // IndexNow rejects the whole batch if any URL is on another host; 10,000 is its per-request cap.
  const sameHost = urls.filter((url) => URL.canParse(url) && new URL(url).host === "stampeo.app");
  const capped = Array.from(new Set(sameHost)).slice(0, 10000);

  return {
    host: "stampeo.app",
    key,
    keyLocation: `https://stampeo.app/${key}.txt`,
    urlList: capped,
  };
}

async function submitToIndexNow(
  payload: ReturnType<typeof buildIndexNowPayload>,
): Promise<number> {
  try {
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    return response.status;
  } catch (error) {
    console.error("Failed to submit to IndexNow:", error);
    return 0;
  }
}

if (import.meta.main) {
  const keyFile = findKeyFile();
  if (!keyFile) {
    console.log(warning("no key file in public/, nothing submitted"));
    process.exit(0);
  }
  const key = keyFile.replace(".txt", "");

  let xml: string;
  try {
    const response = await fetch("https://stampeo.app/sitemap.xml");
    if (!response.ok) {
      console.log(warning(`sitemap fetch answered HTTP ${response.status}, nothing submitted`));
      process.exit(0);
    }
    xml = await response.text();
  } catch (error) {
    console.log(warning(`sitemap fetch failed (${error instanceof Error ? error.message : error}), nothing submitted`));
    process.exit(0);
  }

  const payload = buildIndexNowPayload(extractSitemapUrls(xml), key);
  console.log(reportFor(await submitToIndexNow(payload)).line);
  process.exit(0);
}
