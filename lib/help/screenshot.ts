/**
 * Screenshot files under public/help: which frame they get, and their real
 * size, read from the file's own header so a render never has to guess.
 */

import fs from "node:fs";
import path from "node:path";

export type ScreenshotDevice = "phone" | "desktop";

export interface ImageSize {
  width: number;
  height: number;
}

/** Our phone captures are 390px wide at 1x and 804px at 2x; desktop ones are wider. */
const PHONE_MAX_WIDTH = 900;

/** Under 900px wide is a phone capture, however tall; anything wider is a desktop one. */
export function inferDevice({ width }: ImageSize): ScreenshotDevice {
  return width < PHONE_MAX_WIDTH ? "phone" : "desktop";
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function pngSize(buffer: Buffer): ImageSize | null {
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(PNG_SIGNATURE)) return null;
  if (buffer.toString("ascii", 12, 16) !== "IHDR") return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

/** Walks the JPEG segments to the first frame header (SOF0 to SOF15, not the table markers). */
function jpegSize(buffer: Buffer): ImageSize | null {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;

  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    const marker = buffer[offset + 1];
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    const isFrameHeader = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isFrameHeader) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + buffer.readUInt16BE(offset + 2);
  }
  return null;
}

function webpSize(buffer: Buffer): ImageSize | null {
  if (buffer.length < 30 || buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    return null;
  }

  switch (buffer.toString("ascii", 12, 16)) {
    case "VP8 ":
      return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
    case "VP8L": {
      const bits = buffer.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    case "VP8X":
      return { width: buffer.readUIntLE(24, 3) + 1, height: buffer.readUIntLE(27, 3) + 1 };
    default:
      return null;
  }
}

/** The size of a PNG, JPEG or WebP from its first bytes, or null for anything else. */
export function readImageSize(buffer: Buffer): ImageSize | null {
  return pngSize(buffer) ?? jpegSize(buffer) ?? webpSize(buffer);
}

const HELP_IMAGE_PATH = /^\/help\/[^?#]+$/;

/**
 * The size of a screenshot referenced as `/help/<file>`. Throws for a path
 * outside public/help, a missing file or a format it cannot read, so a broken
 * image stops the build instead of rendering as nothing.
 */
export function readHelpImage(src: string): ImageSize {
  if (!HELP_IMAGE_PATH.test(src) || src.split("/").includes("..")) {
    throw new Error(`Screenshot "${src}" must be a file under public/help, written as /help/<name>.png`);
  }

  // Scoped to public/help, so the build traces that folder and not the whole project.
  const file = path.join(process.cwd(), "public", "help", src.slice("/help/".length));
  if (!fs.existsSync(file)) throw new Error(`Screenshot "${src}" is not in public/help (looked for ${file})`);

  const size = readImageSize(fs.readFileSync(file));
  if (!size) throw new Error(`Screenshot "${src}" is not a PNG, JPEG or WebP image`);
  return size;
}
