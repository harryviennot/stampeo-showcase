import { describe, expect, it } from "bun:test";
import fs from "fs";
import path from "path";
// Comes in with `rehype-slug`, which is what generates these ids at build
// time, so the test slugs headings exactly the way the page does.
import GithubSlugger from "github-slugger";
import { routing } from "@/i18n/routing";
import { getLegalContent } from "./index";
import { STABLE_LEGAL_IDS } from "./mdx";

const PAGES = ["privacy", "terms"] as const;

describe("getLegalContent", () => {
  // Both pages call notFound() on a null return, and merchant emails deep-link
  // to /{locale}/privacy and /{locale}/terms, so an unmapped locale is a hard
  // 404 on a link we send out ourselves.
  it("resolves both legal pages in every locale the site serves", () => {
    for (const locale of routing.locales) {
      for (const page of PAGES) {
        const legal = getLegalContent(page, locale);
        expect(legal, `${page} missing for ${locale}`).not.toBeNull();
        expect(legal!.title.length).toBeGreaterThan(0);
        expect(legal!.content.length).toBeGreaterThan(0);
      }
    }
  });

  it("returns null for a locale we do not serve", () => {
    expect(getLegalContent("privacy", "de")).toBeNull();
  });
});

/**
 * Emails link to one stable anchor (`#support-access`) regardless of which
 * locale's page the reader lands on. `rehypeStableLegalIds` rewrites each
 * locale's auto-generated slug to that shared id, so every locale needs an
 * entry — a missing one silently drops the reader at the top of the page.
 */
const DEEP_LINKED = [
  { page: "privacy", section: "2.3", stableId: "support-access" },
  { page: "terms", section: "8.6", stableId: "data-processing-support-access" },
  { page: "privacy", section: "10.1", stableId: "object-to-support-access" },
  // The consent banner's "See the details" link. One hardcoded
  // `/privacy#cookies` href is rendered in four locales, and Polish titles the
  // section "Pliki cookie", so without the mapping three of the four locales
  // drop the reader at the top of a long policy. The trailing dot in "5." is
  // load-bearing: the heading reads "## 5. Cookies".
  { page: "privacy", section: "5.", stableId: "cookies" },
] as const;

function headingFor(locale: string, page: "privacy" | "terms", section: string) {
  const dir = path.join(process.cwd(), "legal", locale);
  const file = fs
    .readdirSync(dir)
    .find((f) =>
      page === "privacy"
        ? /privacy|confidentialite|privacidad|prywatnosci/.test(f)
        : /terms|conditions|terminos|regulamin/.test(f)
    );
  const source = fs.readFileSync(path.join(dir, file!), "utf-8");
  const match = source
    .split("\n")
    .find((line) => new RegExp(`^#+\\s+${section.replace(".", "\\.")}\\s`).test(line));
  return match?.replace(/^#+\s+/, "").trim();
}

describe("STABLE_LEGAL_IDS", () => {
  it("maps the deep-linked heading of every locale to its stable id", () => {
    for (const locale of routing.locales) {
      for (const { page, section, stableId } of DEEP_LINKED) {
        const heading = headingFor(locale, page, section);
        expect(heading, `${page} §${section} heading missing in ${locale}`).toBeDefined();
        const slug = new GithubSlugger().slug(heading!);
        expect(
          STABLE_LEGAL_IDS[slug],
          `${locale} ${page} §${section} slug "${slug}" is not mapped`
        ).toBe(stableId);
      }
    }
  });
});

/**
 * The cookie section of the privacy policy (STA-317).
 *
 * The banner made a sentence in every locale's §5 false: the policy used to
 * state that Stampeo's analytics required no consent banner. That sentence
 * cannot be allowed to come back, and it is exactly the kind of thing that
 * does come back, because the legal text is edited as four separate Markdown
 * files and a parallel copy of the tree exists under `.claude/worktrees/`.
 */
describe("privacy §5 cookies", () => {
  /** The claim the consent banner contradicts, in each locale it was written in. */
  const RETIRED_CLAIMS: Record<string, RegExp> = {
    en: /does not require a cookie consent banner/i,
    fr: /ne nécessite pas de bannière de consentement/i,
    es: /no requiere ningún banner de consentimiento/i,
    pl: /nie wymaga baneru zgody/i,
  };

  function privacySource(locale: string) {
    const dir = path.join(process.cwd(), "legal", locale);
    const file = fs
      .readdirSync(dir)
      .find((f) => /privacy|confidentialite|privacidad|prywatnosci/.test(f));
    return fs.readFileSync(path.join(dir, file!), "utf-8");
  }

  it("no longer claims the site needs no consent banner, in any locale", () => {
    for (const locale of routing.locales) {
      expect(
        privacySource(locale),
        `${locale} still carries the pre-banner claim`
      ).not.toMatch(RETIRED_CLAIMS[locale]);
    }
  });

  it("names every recipient the banner offers, in every locale", () => {
    // CNIL requires the purposes AND the recipients to be disclosed. The
    // banner names Google, Meta and TikTok; if the policy does not, the two
    // disagree and the disclosure is the one that loses.
    for (const locale of routing.locales) {
      const source = privacySource(locale);
      for (const recipient of ["Google Analytics 4", "Meta", "TikTok"]) {
        expect(source, `${locale} does not name ${recipient}`).toContain(recipient);
      }
    }
  });

  it("lists the cookies each recipient sets, in every locale", () => {
    // These names are what a visitor checks in their own browser, and what the
    // revocation path in `lib/consent.ts` deletes. The two lists must agree.
    for (const locale of routing.locales) {
      const source = privacySource(locale);
      for (const cookie of ["_ga", "_gid", "_fbp", "_fbc", "_ttp", "stampeo_consent"]) {
        expect(source, `${locale} does not list ${cookie}`).toContain(cookie);
      }
    }
  });

  it("discloses the attribution cookie, in every locale (STA-323)", () => {
    // `stampeo_attribution` is first-party by origin but a tracker by content:
    // it holds the ad platforms' click ids and the GA client id, and it is
    // deleted by the same revoke path as the rest (see COOKIE_PATTERNS in
    // lib/consent.ts). A visitor inspecting their own jar finds it, so the
    // policy has to account for it or the table is an incomplete disclosure.
    for (const locale of routing.locales) {
      expect(
        privacySource(locale),
        `${locale} does not disclose stampeo_attribution`
      ).toContain("stampeo_attribution");
    }
  });

  it("discloses server-side conversion reporting, in every locale (STA-323)", () => {
    // The material change STA-323 makes to the disclosure: we now RETAIN the
    // advertising identifier ourselves against the business account, and send
    // a conversion from our servers when an invoice is paid — after, and
    // independently of, anything happening in the browser. Section 5 as
    // written only covered scripts running on the page.
    const MARKER: Record<string, RegExp> = {
      en: /from our servers|server-side/i,
      fr: /depuis nos serveurs|côté serveur/i,
      es: /desde nuestros servidores|del lado del servidor/i,
      pl: /z naszych serwerów|po stronie serwera/i,
    };
    for (const locale of routing.locales) {
      expect(
        privacySource(locale),
        `${locale} does not disclose server-side conversion reporting`
      ).toMatch(MARKER[locale]);
    }
  });
});

describe("privacy §5.6 consent records (STA-324)", () => {
  /**
   * The ledger records a decision server-side, keyed by an identifier we set,
   * and — uniquely on this platform — REFUSES an erasure request. None of that
   * is lawful undisclosed, and the erasure exception in particular must be
   * stated outright rather than inferred from a retention table.
   */
  function privacySource(locale: string) {
    const dir = path.join(process.cwd(), "legal", locale);
    const file = fs
      .readdirSync(dir)
      .find((f) => /privacy|confidentialite|privacidad|prywatnosci/.test(f));
    return fs.readFileSync(path.join(dir, file!), "utf-8");
  }

  /**
   * Just §5.6, and nothing else.
   *
   * Scoping matters more than it looks: `stampeo_consent` and the word
   * "consent" both appear in §5.3's cookie table, so a document-wide search
   * for either passes whether or not §5.6 says anything at all. Mutation
   * testing caught three assertions doing exactly that.
   */
  function section56(locale: string) {
    const source = privacySource(locale);
    const start = source.search(/^#+\s+5\.6\s/m);
    if (start === -1) return "";
    // Start AFTER the heading line: slicing at `start + 1` would leave the
    // heading itself matching the "next heading" search below, which silently
    // returns an empty string and makes every assertion on it vacuous.
    const afterHeading = source.indexOf("\n", start);
    if (afterHeading === -1) return "";
    const rest = source.slice(afterHeading);
    const end = rest.search(/^#+\s+\d/m);
    return end === -1 ? rest : rest.slice(0, end);
  }

  /** Just the retention table in §8, which is a different table from §5.3's. */
  function retentionTable(locale: string) {
    const source = privacySource(locale);
    const start = source.search(/^##\s+8\./m);
    if (start === -1) return [];
    const rest = source.slice(start);
    const end = rest.search(/^##\s+9\./m);
    return (end === -1 ? rest : rest.slice(0, end))
      .split("\n")
      .filter((line) => line.trim().startsWith("|"));
  }

  it("has a 5.6 section in every locale", () => {
    for (const locale of routing.locales) {
      expect(privacySource(locale), `${locale} has no §5.6`).toMatch(/^#+\s+5\.6\s/m);
    }
  });

  it("discloses the identifier we set, in every locale", () => {
    // Setting an identifier is processing. A policy that describes the record
    // but not the key to it has not disclosed the thing that makes it personal
    // data in the first place.
    for (const locale of routing.locales) {
      expect(section56(locale), `${locale} §5.6 does not name the cookie`).toContain(
        "stampeo_consent",
      );
    }
  });

  it("states the three-year retention, in every locale", () => {
    for (const locale of routing.locales) {
      expect(section56(locale), `${locale} §5.6 omits the 3-year retention`).toMatch(
        /\b3 (years|ans|años|lata)\b/i,
      );
    }
  });

  it("states the erasure exception and its legal basis, in every locale", () => {
    // The ONE place this platform refuses a deletion request. Art. 17(3) is
    // what makes that lawful, so the article is cited rather than alluded to.
    //
    // Per-locale patterns, because the citation convention differs and a
    // regex loose enough to span all four would match almost any number: EN
    // writes "17(3)", FR and ES "17.3", PL "17 ust. 3".
    const ARTICLE_17_3: Record<string, RegExp> = {
      en: /Article 17\(3\)/i,
      fr: /article 17\.3/i,
      es: /artículo 17\.3/i,
      pl: /art\.\s*17\s*ust\.\s*3/i,
    };

    for (const locale of routing.locales) {
      expect(privacySource(locale), `${locale} omits Art. 17(3)`).toMatch(
        ARTICLE_17_3[locale],
      );
    }
  });

  it("carries a retention-table row for consent records, in every locale", () => {
    for (const locale of routing.locales) {
      // Must be the §8 RETENTION table and must point back at §5.6, so a row
      // about some other kind of consent cannot stand in for this one.
      expect(
        retentionTable(locale).some((row) => /5\.6/.test(row)),
        `${locale} retention table has no consent-records row citing §5.6`,
      ).toBe(true);
    }
  });

  it("does not claim consent records are deleted with the account", () => {
    // They are the one thing that survives it, and a policy saying otherwise
    // would be a promise the schema deliberately breaks.
    for (const locale of routing.locales) {
      expect(section56(locale), `${locale} §5.6 contradicts the schema`).not.toMatch(
        /deleted (together )?with (the|your) (business )?account/i,
      );
    }
  });
});

describe("privacy §5.2 — the consent cookie's own contents", () => {
  /**
   * The cookie table is where a reader looks to find out what a cookie HOLDS.
   * `stampeo_consent` gained a random identifier in STA-324, and describing it
   * only in §5.6 leaves the table saying something narrower than the truth
   * about a cookie we set ourselves.
   */
  function privacySource(locale: string) {
    const dir = path.join(process.cwd(), "legal", locale);
    const file = fs
      .readdirSync(dir)
      .find((f) => /privacy|confidentialite|privacidad|prywatnosci/.test(f));
    return fs.readFileSync(path.join(dir, file!), "utf-8");
  }

  it("the table row mentions the identifier and points at 5.6, in every locale", () => {
    for (const locale of routing.locales) {
      const row = privacySource(locale)
        .split("\n")
        .find((line) => line.includes("`stampeo_consent`") && line.trim().startsWith("|"));

      expect(row, `${locale} has no stampeo_consent table row`).toBeDefined();
      expect(row, `${locale} row does not mention the identifier`).toMatch(
        /identifier|identifiant|identificador|identyfikator/i,
      );
      expect(row, `${locale} row does not cross-reference 5.6`).toContain("5.6");
    }
  });
});
