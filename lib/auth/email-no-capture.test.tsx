/**
 * PostHog never receives a visitor's email address. Autocapture sends the text of a tapped element and of the
 * elements around it, so every place the sign-up and sign-in flows print the address the visitor typed carries
 * `ph-no-capture`, which makes PostHog skip any tap whose chain includes it.
 *
 * The sign-up step is rendered in each language and phase. The login and reset-password pages keep their email
 * lines behind a sign-in state a server render cannot reach, so those are read from the page source.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";

import { AuthenticationStep, type AuthPhase } from "@/components/onboarding/steps/AuthenticationStep";
import { AuthContext } from "@/lib/supabase/auth-provider";
import { catalogLocales } from "@/lib/testing/catalogs";
import { ROOT, code, literalAttr, openingTags } from "@/lib/testing/jsx-source";
import { renderIn } from "@/lib/testing/render-en";
import "@/lib/testing/pathname-seam";

const NO_CAPTURE = /(?:^|\s)ph-no-capture(?:\s|$)/;
const VOID_TAGS = new Set(["input", "br", "img", "hr", "link", "meta"]);

/** The text nodes of `html` that contain `text`, each with the opening tags that enclose it. */
function textNodesWith(html: string, text: string): Array<{ text: string; enclosing: string[] }> {
  const found: Array<{ text: string; enclosing: string[] }> = [];
  const stack: Array<{ name: string; attrs: string }> = [];

  for (const token of html.replace(/<!--[\s\S]*?-->/g, "").matchAll(/<(\/?)([a-z][a-z0-9]*)([^>]*)>|([^<]+)/gi)) {
    const [, closing, name, attrs, content] = token;
    if (content !== undefined) {
      if (content.includes(text)) found.push({ text: content.trim(), enclosing: stack.map((tag) => tag.attrs) });
    } else if (closing) {
      while (stack.length > 0 && stack.pop()!.name !== name.toLowerCase());
    } else if (!VOID_TAGS.has(name.toLowerCase()) && !attrs.endsWith("/")) {
      stack.push({ name: name.toLowerCase(), attrs });
    }
  }
  return found;
}

/** Where `email` is printed in `html` without `ph-no-capture` on the element or one around it. */
function exposed(html: string, email: string): string[] {
  return textNodesWith(html, email)
    .filter(({ enclosing }) => !enclosing.some((attrs) => NO_CAPTURE.test(literalAttr(attrs, "class") ?? "")))
    .map(({ text }) => text);
}

function renderStep(locale: string, phase: AuthPhase, email: string): string {
  return renderIn(
    locale,
    <AuthContext.Provider value={{} as never}>
      <AuthenticationStep
        name="Ines"
        phone=""
        email={email}
        onEmailChange={() => {}}
        phase={phase}
        onPhaseChange={() => {}}
        onBack={() => {}}
        onCompleted={() => {}}
        onCodeSent={() => {}}
        oauthStashKey="stampeo_oauth_stash"
      />
    </AuthContext.Provider>,
  );
}

describe("the sign-up step", () => {
  const CASES = catalogLocales().flatMap((locale) => [
    [locale, "the 'did you mean' suggestion", "form", "ines@gmial.com", "ines@gmail.com"] as const,
    [locale, "the line that says where the code was sent", "verify", "ines@example.com", "ines@example.com"] as const,
  ]);

  test.each(CASES)("%s: %s keeps the address out of PostHog", (locale, _what, phase, typed, shown) => {
    const html = renderStep(locale, phase, typed);

    expect(textNodesWith(html, shown).length).toBeGreaterThan(0);
    expect(exposed(html, shown)).toEqual([]);
  });
});

describe("the sign-in and password-reset pages", () => {
  const page = (route: string) => code(join(ROOT, "app", "[locale]", route, "page.tsx"));

  /** The opening tag just before the child expression that matches `printed`, or null when the page does not print it. */
  function tagPrinting(source: string, printed: RegExp) {
    const at = source.search(printed);
    if (at === -1) return null;
    return openingTags(source).filter((tag) => tag.end <= at + 1).at(-1) ?? null;
  }

  test.each([
    ["login", "the line that says which address the reset link went to", />\s*\{tForgot\("emailSentDescription", \{ email \}\)\}\s*</],
    ["login", "the address of the account that must confirm its email", />\s*\{email\}\s*</],
    ["reset-password", "the address of the account getting a new password", />\s*\{view\.email\}\s*</],
  ])("%s: %s is kept out of PostHog", (route, _what, printed) => {
    const tag = tagPrinting(page(route), printed);

    expect(tag).not.toBeNull();
    expect(literalAttr(tag!.attrs, "className") ?? "").toMatch(NO_CAPTURE);
  });
});
