import { describe, expect, test } from "bun:test";
import { inferDevice, readHelpImage, readImageSize } from "./screenshot";

describe("which frame a screenshot gets", () => {
  // Our phone captures are 390px wide at 1x and 804px at 2x; the desktop ones are wider, however tall.
  test.each([
    [390, 844, "phone"],
    [804, 1740, "phone"],
    [899, 1200, "phone"],
    [900, 1200, "desktop"],
    [1039, 1312, "desktop"],
    [1344, 688, "desktop"],
    [2340, 165, "desktop"],
  ])("%ix%i is a %s shot", (width, height, device) => {
    expect(inferDevice({ width, height })).toBe(device as "phone" | "desktop");
  });
});

describe("reading an image's size from its first bytes", () => {
  const png = (width: number, height: number) => {
    const buffer = Buffer.alloc(33);
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer, 0);
    buffer.writeUInt32BE(13, 8);
    buffer.write("IHDR", 12, "ascii");
    buffer.writeUInt32BE(width, 16);
    buffer.writeUInt32BE(height, 20);
    return buffer;
  };

  // SOI, an APP0 segment to skip, then a baseline frame header.
  const jpeg = (width: number, height: number) => {
    const app0 = Buffer.from([0xff, 0xe0, 0x00, 0x04, 0x00, 0x00]);
    const sof = Buffer.alloc(19);
    Buffer.from([0xff, 0xc0, 0x00, 0x11, 0x08]).copy(sof, 0);
    sof.writeUInt16BE(height, 5);
    sof.writeUInt16BE(width, 7);
    return Buffer.concat([Buffer.from([0xff, 0xd8]), app0, sof]);
  };

  const webpLossy = (width: number, height: number) => {
    const buffer = Buffer.alloc(30);
    buffer.write("RIFF", 0, "ascii");
    buffer.write("WEBP", 8, "ascii");
    buffer.write("VP8 ", 12, "ascii");
    Buffer.from([0x9d, 0x01, 0x2a]).copy(buffer, 23);
    buffer.writeUInt16LE(width, 26);
    buffer.writeUInt16LE(height, 28);
    return buffer;
  };

  const webpExtended = (width: number, height: number) => {
    const buffer = Buffer.alloc(30);
    buffer.write("RIFF", 0, "ascii");
    buffer.write("WEBP", 8, "ascii");
    buffer.write("VP8X", 12, "ascii");
    buffer.writeUIntLE(width - 1, 24, 3);
    buffer.writeUIntLE(height - 1, 27, 3);
    return buffer;
  };

  test.each([
    ["a PNG", png(2340, 165), { width: 2340, height: 165 }],
    ["a JPEG", jpeg(1200, 800), { width: 1200, height: 800 }],
    ["a lossy WebP", webpLossy(640, 480), { width: 640, height: 480 }],
    ["an extended WebP", webpExtended(1000, 300), { width: 1000, height: 300 }],
  ])("%s", (_name, buffer, expected) => {
    expect(readImageSize(buffer)).toEqual(expected);
  });

  test("a file that is not an image has no size", () => {
    expect(readImageSize(Buffer.from("not an image at all"))).toBeNull();
  });
});

describe("a screenshot file under public/help", () => {
  test("is measured from the real file, however thin", () => {
    expect(readHelpImage("/help/export-your-customer-list-01.png")).toEqual({ width: 2340, height: 165 });
    expect(readHelpImage("/help/add-a-team-member-05.png")).toEqual({ width: 390, height: 844 });
  });

  test.each([
    ["a file that is not there", "/help/not-a-shot.png"],
    ["a path outside public/help", "/pricing.png"],
    ["a path that climbs out of public/help", "/help/../../package.json"],
    ["another site's image", "https://example.com/shot.png"],
  ])("%s fails the build with a message naming it", (_name, src) => {
    expect(() => readHelpImage(src)).toThrow(src);
  });
});
