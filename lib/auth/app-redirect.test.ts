import { describe, expect, it } from "bun:test";
import { postLoginUrl, sameOriginAppUrl } from "./app-redirect";

const APP = "https://app.stampeo.app";

describe("sameOriginAppUrl", () => {
  it.each([
    ["https://app.stampeo.app/program/design", "https://app.stampeo.app/program/design"],
    ["https://app.stampeo.app/billing?success=true", "https://app.stampeo.app/billing?success=true"],
    ["https://app.stampeo.app/invite/abc123", "https://app.stampeo.app/invite/abc123"],
  ])("follows %s", (redirect, expected) => {
    expect(sameOriginAppUrl(redirect, APP)).toBe(expected);
  });

  it.each([
    // Same host, script scheme: assigned to location.href this runs on the showcase.
    ["javascript://app.stampeo.app/%0Aalert(document.cookie)"],
    ["JavaScript://app.stampeo.app/%0Aalert(1)"],
    ["http://app.stampeo.app/program/design"],
    // A blob URL carries the origin of the URL inside it.
    ["blob:https://app.stampeo.app/3f2b"],
    ["https://app.stampeo.app:8443/program/design"],
    ["https://evil.example/program/design"],
    ["https://app.stampeo.app.evil.example/"],
    ["/program/design"],
    ["not a url"],
    [""],
    [null],
  ])("refuses %p", (redirect) => {
    expect(sameOriginAppUrl(redirect, APP)).toBeNull();
  });

  it.each([
    ["https://app.stampeo.app/program/design", APP, "https://app.stampeo.app/program/design"],
    ["javascript://app.stampeo.app/%0Aalert(1)", APP, APP],
    [null, APP, APP],
    ["https://app.stampeo.app/program/design", undefined, "https://app.stampeo.app/program/design"],
    ["javascript://app.stampeo.app/%0Aalert(1)", "", "https://app.stampeo.app"],
  ])("postLoginUrl(%p, env %p) sends the browser to %s", (redirect, appUrl, expected) => {
    expect(postLoginUrl(redirect, appUrl)).toBe(expected);
  });

  it("refuses credentials in the URL", () => {
    expect(sameOriginAppUrl("https://u:p@app.stampeo.app/program/design", APP)).toBeNull();
  });

  it.each([["localhost:3000"], ["app.stampeo.app:443"]])(
    "a scheme-less app URL (%s) never lets javascript: through",
    (appUrl) => {
      expect(sameOriginAppUrl("javascript:alert(document.cookie)", appUrl)).toBeNull();
    }
  );

  it("matches the configured dev origin, port included", () => {
    const dev = "http://app.stampeo.10.1.241.183.nip.io:3000";
    expect(sameOriginAppUrl(`${dev}/program/design`, dev)).toBe(`${dev}/program/design`);
    expect(sameOriginAppUrl("http://app.stampeo.10.1.241.183.nip.io/x", dev)).toBeNull();
  });
});
