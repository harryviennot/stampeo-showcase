/**
 * The Share button on a page an owner sends: Web Share where the phone has it,
 * the link copied where it does not.
 */

import { describe, expect, test } from "bun:test";
import { shareLink, type ShareEnvironment } from "./share";

const PAGE = { title: "Add the loyalty card to your phone", url: "https://stampeo.app/help/get-the-loyalty-card" };

function environment(overrides: Partial<ShareEnvironment> = {}): ShareEnvironment & { sent: unknown[]; copied: string[] } {
  const sent: unknown[] = [];
  const copied: string[] = [];
  return {
    share: async (data) => {
      sent.push(data);
    },
    copy: async (text) => {
      copied.push(text);
    },
    sent,
    copied,
    ...overrides,
  };
}

describe("tapping Share", () => {
  test("on a phone with Web Share, opens the share sheet with the page's title and link", async () => {
    const env = environment();

    expect(await shareLink(PAGE, env)).toBe("shared");
    expect(env.sent).toEqual([PAGE]);
    expect(env.copied).toEqual([]);
  });

  test("closing the sheet without choosing anyone is not an error and copies nothing", async () => {
    const env = environment({
      share: async () => {
        throw new DOMException("closed", "AbortError");
      },
    });

    expect(await shareLink(PAGE, env)).toBe("cancelled");
    expect(env.copied).toEqual([]);
  });

  test("with no Web Share (a desktop browser), copies the link", async () => {
    const env = environment({ share: undefined });

    expect(await shareLink(PAGE, env)).toBe("copied");
    expect(env.copied).toEqual([PAGE.url]);
  });

  test("when the share sheet itself fails, falls back to copying", async () => {
    const env = environment({
      share: async () => {
        throw new Error("not allowed");
      },
    });

    expect(await shareLink(PAGE, env)).toBe("copied");
    expect(env.copied).toEqual([PAGE.url]);
  });

  test("when nothing can share or copy, says so", async () => {
    const env = environment({
      share: undefined,
      copy: async () => {
        throw new Error("denied");
      },
    });

    expect(await shareLink(PAGE, env)).toBe("failed");
  });
});
