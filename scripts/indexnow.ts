/**
 * IndexNow integration for rapid search engine indexing.
 * Submits changed URLs to https://api.indexnow.org/ so Bing, ChatGPT Search,
 * Copilot, and DuckDuckGo learn about updates quickly.
 */

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

// CLI entry point
if (import.meta.main) {
  // Read the key from the key file in public/
  const { readdirSync, readFileSync } = await import("node:fs");
  const { join } = await import("node:path");

  const publicDir = join(import.meta.dir, "..", "public");
  const files = readdirSync(publicDir);
  const keyFile = files.find((f) => /^[0-9a-f]{32}\.txt$/.test(f));

  if (!keyFile) {
    console.error("No .txt key file found in public/");
    process.exit(0);
  }

  const key = keyFile.replace(".txt", "");

  // Fetch sitemap
  let xml: string;
  try {
    const response = await fetch("https://stampeo.app/sitemap.xml");
    xml = await response.text();
  } catch (error) {
    console.error("Failed to fetch sitemap:", error);
    process.exit(0);
  }

  // Extract URLs and build payload
  const urls = extractSitemapUrls(xml);
  const payload = buildIndexNowPayload(urls, key);

  // Submit to IndexNow
  const status = await submitToIndexNow(payload);
  console.log(`IndexNow response: ${status}`);

  // Always exit 0 (fail soft)
  process.exit(0);
}
