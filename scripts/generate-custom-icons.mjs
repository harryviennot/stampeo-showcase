// Generates the marketing "custom stamp icon" demo assets in public/custom-icons/.
//
// These stand in for merchant-uploaded icons on the card-design feature page and
// the landing sector cards. For each icon we emit three PNGs that mirror what the
// backend rembg pipeline produces for a real upload:
//   {name}.png          full-color filled stamp        (processed_url)
//   {name}-grey.png     desaturated empty-stamp variant (greyscale_url)
//   {name}-outline.png  line-art empty-stamp variant    (outline_url)
//
// Source art: Twemoji (https://github.com/jdecked/twemoji), CC-BY 4.0.
// Attribution is surfaced in the UI near the gallery and in messages JSON.
//
// Run from the showcase repo root:  node scripts/generate-custom-icons.mjs
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "custom-icons");
const SIZE = 256;
const TWEMOJI = "https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg";

// name -> Twemoji codepoint
const ICONS = {
  croissant: "1f950",
  coffee: "2615",
  donut: "1f369",
  flower: "1f337",
  pizza: "1f355",
  scissors: "2702",
  gift: "1f381", // used as a dedicated reward-stamp icon in the gallery
};

async function fetchSvg(codepoint) {
  const res = await fetch(`${TWEMOJI}/${codepoint}.svg`);
  if (!res.ok) throw new Error(`fetch ${codepoint}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// Render the SVG centered on a transparent square with a little padding.
function renderFilled(svg) {
  const pad = Math.round(SIZE * 0.08);
  const inner = SIZE - pad * 2;
  return sharp(svg, { density: 384 })
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

// Desaturated, slightly lightened — reads clearly as an "empty / not yet earned" slot.
function makeGrey(filled) {
  return sharp(filled).grayscale().modulate({ brightness: 1.12 }).png().toBuffer();
}

// Line-art: trace the silhouette of the icon's alpha mask (a morphological
// boundary stroke). Clean and recognizable — captures the outer shape plus inner
// holes (donut centre, coffee handle). Approximates the backend outline variant.
async function makeOutline(filled) {
  const { width, height } = await sharp(filled).metadata();
  const alpha = await sharp(filled).ensureAlpha().extractChannel(3).raw().toBuffer();

  const T = 128; // inside/outside threshold
  const R = 3; // stroke half-width in px
  const inside = (x, y) => x >= 0 && y >= 0 && x < width && y < height && alpha[y * width + x] >= T;

  const COLOR = [110, 116, 128]; // slate-grey
  const out = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (alpha[i] < T) continue; // only paint inside the shape
      // boundary pixel: some neighbour within R is outside the shape
      let edge = false;
      for (let dy = -R; dy <= R && !edge; dy++) {
        for (let dx = -R; dx <= R; dx++) {
          if (!inside(x + dx, y + dy)) {
            edge = true;
            break;
          }
        }
      }
      if (edge) {
        out[i * 4] = COLOR[0];
        out[i * 4 + 1] = COLOR[1];
        out[i * 4 + 2] = COLOR[2];
        out[i * 4 + 3] = 255;
      }
    }
  }
  // Soften the stroke edges a touch so it doesn't look aliased at small sizes.
  return sharp(out, { raw: { width, height, channels: 4 } }).blur(0.5).png().toBuffer();
}

async function main() {
  await mkdir(OUT, { recursive: true });
  for (const [name, cp] of Object.entries(ICONS)) {
    const svg = await fetchSvg(cp);
    const filled = await renderFilled(svg);
    await writeFile(join(OUT, `${name}.png`), filled);
    await writeFile(join(OUT, `${name}-grey.png`), await makeGrey(filled));
    await writeFile(join(OUT, `${name}-outline.png`), await makeOutline(filled));
    console.log(`✓ ${name}`);
  }
  console.log(`\nWrote ${Object.keys(ICONS).length * 3} files to public/custom-icons/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
