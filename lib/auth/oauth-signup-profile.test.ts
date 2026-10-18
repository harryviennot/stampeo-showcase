/**
 * Back from Google or Apple, a new account gets the language of the page it
 * signed up on in its Supabase metadata, next to the name and phone stashed in
 * step 1. Without it the backend has no language for the people it writes to.
 */

import { describe, expect, test } from "bun:test";
import {
  buildOAuthSignupMetadata,
  syncOAuthSignupProfile,
  type OAuthSignupSync,
} from "./oauth-signup-profile";

describe("the metadata written on the OAuth return", () => {
  test.each(["fr", "en", "es", "pl"])("carries the %s page's language", (locale) => {
    expect(buildOAuthSignupMetadata({ name: "Ines", phone: "+33612345678" }, locale)).toEqual({
      locale,
      name: "Ines",
      phone: "+33612345678",
    });
  });

  test.each([
    ["the stash was lost with the tab", null],
    ["step 1 was never filled in", {}],
    ["step 1 held only blanks", { name: "  ", phone: "" }],
  ])("is the language alone when %s", (_case, stash) => {
    expect(buildOAuthSignupMetadata(stash, "es")).toEqual({ locale: "es" });
  });

  test("keeps the name when there is no phone, and the phone when there is no name", () => {
    expect(buildOAuthSignupMetadata({ name: "Ines" }, "fr")).toEqual({ locale: "fr", name: "Ines" });
    expect(buildOAuthSignupMetadata({ phone: "+48123456789" }, "pl")).toEqual({
      locale: "pl",
      phone: "+48123456789",
    });
  });

  test("trims the name and the phone", () => {
    expect(buildOAuthSignupMetadata({ name: "  Ines ", phone: " +33612345678 " }, "en")).toEqual({
      locale: "en",
      name: "Ines",
      phone: "+33612345678",
    });
  });

  test.each(["de", "", "FR", "fr-FR"])("falls back to French for the unserved language %p", (locale) => {
    expect(buildOAuthSignupMetadata(null, locale)).toEqual({ locale: "fr" });
  });
});

/** Records each write the sync makes, in order. */
function recorder() {
  const writes: unknown[] = [];
  const sync: Pick<OAuthSignupSync, "updateUserMetadata" | "updateProfilePhone"> = {
    updateUserMetadata: async (data) => {
      writes.push({ metadata: data });
    },
    updateProfilePhone: async (phone) => {
      writes.push({ profilePhone: phone });
    },
  };
  return { writes, sync };
}

describe("the profile sync after a Google or Apple sign-up", () => {
  test("writes the language even when the visitor left no name or phone", async () => {
    const { writes, sync } = recorder();

    await syncOAuthSignupProfile({ ...sync, stash: null, locale: "en" });

    expect(writes).toEqual([{ metadata: { locale: "en" } }]);
  });

  test("writes the name, phone and language, then the phone to the profile", async () => {
    const { writes, sync } = recorder();

    await syncOAuthSignupProfile({
      ...sync,
      stash: { name: "Ines", phone: "+33612345678" },
      locale: "fr",
    });

    expect(writes).toEqual([
      { metadata: { locale: "fr", name: "Ines", phone: "+33612345678" } },
      { profilePhone: "+33612345678" },
    ]);
  });

  test("keeps the language a returning account already has", async () => {
    const { writes, sync } = recorder();

    await syncOAuthSignupProfile({ ...sync, stash: null, locale: "en", existingLocale: "es" });

    expect(writes).toEqual([{ metadata: { locale: "es" } }]);
  });

  test("never blocks the redirect when a write fails", async () => {
    const sync: OAuthSignupSync = {
      stash: { phone: "+33612345678" },
      locale: "fr",
      updateUserMetadata: async () => {
        throw new Error("network down");
      },
      updateProfilePhone: async () => {
        throw new Error("network down");
      },
    };

    await expect(syncOAuthSignupProfile(sync)).resolves.toBeUndefined();
  });

  test("leaves the profile phone alone when there is none", async () => {
    const { writes, sync } = recorder();

    await syncOAuthSignupProfile({ ...sync, stash: { name: "Ines" }, locale: "pl" });

    expect(writes).toEqual([{ metadata: { locale: "pl", name: "Ines" } }]);
  });
});
