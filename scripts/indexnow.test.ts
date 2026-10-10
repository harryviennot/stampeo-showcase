import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildIndexNowPayload, extractSitemapUrls, findKeyFile, reportFor, warning } from "./indexnow";

const KEY = "a54facc9a2c4dbf7f5170fa9e04b6dbc";

describe("extractSitemapUrls", () => {
  test("extracts URLs from <loc> tags", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://stampeo.app/</loc>
  </url>
  <url>
    <loc>https://stampeo.app/en/about</loc>
  </url>
</urlset>`;
    expect(extractSitemapUrls(xml)).toEqual([
      "https://stampeo.app/",
      "https://stampeo.app/en/about",
    ]);
  });

  test("ignores xhtml:link alternates (not counted as URLs)", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://stampeo.app/en/pricing</loc>
    <xhtml:link rel="alternate" hreflang="fr" href="https://stampeo.app/fr/pricing" />
  </url>
</urlset>`;
    const result = extractSitemapUrls(xml);
    expect(result).toEqual(["https://stampeo.app/en/pricing"]);
    expect(result).not.toContain("https://stampeo.app/fr/pricing");
  });

  test("handles empty sitemap", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
    expect(extractSitemapUrls(xml)).toEqual([]);
  });
});

describe("buildIndexNowPayload", () => {
  test("returns payload with correct shape", () => {
    const urls = ["https://stampeo.app/", "https://stampeo.app/en/about"];
    const payload = buildIndexNowPayload(urls, KEY);

    expect(payload).toEqual({
      host: "stampeo.app",
      key: KEY,
      keyLocation: `https://stampeo.app/${KEY}.txt`,
      urlList: urls,
    });
  });

  test("filters out foreign hosts", () => {
    const urls = [
      "https://stampeo.app/",
      "https://example.com/",
      "https://stampeo.app/en/about",
    ];
    const payload = buildIndexNowPayload(urls, KEY);

    expect(payload.urlList).toEqual([
      "https://stampeo.app/",
      "https://stampeo.app/en/about",
    ]);
  });

  test("deduplicates URLs", () => {
    const urls = [
      "https://stampeo.app/",
      "https://stampeo.app/",
      "https://stampeo.app/en/about",
      "https://stampeo.app/en/about",
    ];
    const payload = buildIndexNowPayload(urls, KEY);

    expect(payload.urlList).toEqual([
      "https://stampeo.app/",
      "https://stampeo.app/en/about",
    ]);
  });

  test("caps URL list at 10,000 entries", () => {
    const urls = Array.from({ length: 15000 }, (_, i) =>
      `https://stampeo.app/page-${i}`,
    );
    const payload = buildIndexNowPayload(urls, KEY);

    expect(payload.urlList.length).toBe(10000);
  });

  test("keyLocation matches the actual key file in public/", () => {
    const keyFile = findKeyFile();
    expect(keyFile).toBeDefined();

    const key = keyFile!.replace(".txt", "");
    expect(readFileSync(join(import.meta.dir, "..", "public", keyFile!), "utf-8").trim()).toBe(key);
    expect(buildIndexNowPayload([], key).keyLocation).toBe(`https://stampeo.app/${keyFile}`);
  });
});

describe("reportFor", () => {
  test.each([200, 202])("HTTP %p is a plain log line", (status) => {
    expect(reportFor(status)).toEqual({ ok: true, line: `IndexNow response: ${status}` });
  });

  test.each([400, 403, 422, 429, 500, 0])(
    "HTTP %p becomes a warning annotation that names the status",
    (status) => {
      const { ok, line } = reportFor(status);

      expect(ok).toBe(false);
      expect(line).toStartWith("::warning::IndexNow ");
      expect(line).toContain(status === 0 ? "no response" : String(status));
    },
  );
});

test("warning is a single-line GitHub Actions annotation", () => {
  expect(warning("sitemap fetch failed")).toBe("::warning::IndexNow sitemap fetch failed");
});
