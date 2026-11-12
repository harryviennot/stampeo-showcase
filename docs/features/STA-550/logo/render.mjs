// Regenerates public/themes/gaspard-gus/logo.avif from logo.html: a 4x
// transparent Chromium screenshot, downsampled to 640x216, AVIF q92 4:4:4.
// Run from the showcase root:
//   PLAYWRIGHT_FROM=../promo-videos/package.json node docs/features/STA-550/logo/render.mjs
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const { chromium } = createRequire(process.env.PLAYWRIGHT_FROM ?? "../promo-videos/package.json")("playwright");
const sharp = createRequire(`${process.cwd()}/package.json`)("sharp");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 640, height: 216 }, deviceScaleFactor: 4 });
await page.goto(new URL("./logo.html", import.meta.url).href);
await page.waitForFunction(() => document.title === "ready", null, { timeout: 30000 });
const big = await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: 640, height: 216 } });
await browser.close();

await sharp(big)
  .resize(640, 216, { kernel: "lanczos3" })
  .avif({ quality: 92, effort: 9, chromaSubsampling: "4:4:4" })
  .toFile(fileURLToPath(new URL("../../../../public/themes/gaspard-gus/logo.avif", import.meta.url)));
