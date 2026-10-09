import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { buildIndexNowPayload, extractSitemapUrls } from "./indexnow";

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
    const key = "a54facc9a2c4dbf7f5170fa9e04b6dbc";
    const payload = buildIndexNowPayload(urls, key);

    expect(payload).toEqual({
      host: "stampeo.app",
      key,
      keyLocation: `https://stampeo.app/${key}.txt`,
      urlList: urls,
    });
  });

  test("filters out foreign hosts", () => {
    const urls = [
      "https://stampeo.app/",
      "https://example.com/",
      "https://stampeo.app/en/about",
    ];
    const key = "a54facc9a2c4dbf7f5170fa9e04b6dbc";
    const payload = buildIndexNowPayload(urls, key);

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
    const key = "a54facc9a2c4dbf7f5170fa9e04b6dbc";
    const payload = buildIndexNowPayload(urls, key);

    expect(payload.urlList).toEqual([
      "https://stampeo.app/",
      "https://stampeo.app/en/about",
    ]);
  });

  test("caps URL list at 10,000 entries", () => {
    const urls = Array.from({ length: 15000 }, (_, i) =>
      `https://stampeo.app/page-${i}`,
    );
    const key = "a54facc9a2c4dbf7f5170fa9e04b6dbc";
    const payload = buildIndexNowPayload(urls, key);

    expect(payload.urlList.length).toBe(10000);
  });

  test("keyLocation matches the actual key file in public/", () => {
    const publicDir = join(import.meta.dir, "..", "public");
    const files = readdirSync(publicDir);
    const keyFile = files.find((f) => f.endsWith(".txt"));

    expect(keyFile).toBeDefined();

    if (keyFile) {
      const keyContent = readFileSync(join(publicDir, keyFile), "utf-8").trim();
      const key = keyFile.replace(".txt", "");

      // Verify the key content matches the filename (minus .txt)
      expect(keyContent).toBe(key);

      const payload = buildIndexNowPayload([], key);
      expect(payload.keyLocation).toBe(
        `https://stampeo.app/${keyFile}`,
      );
    }
  });
});
