/**
 * Production's blind-spot cards (`/en/features/analytics`): left alone they render as the live page does, and the
 * analytics preview borrows them with its own questions and no section frame.
 */

import { describe, expect, test } from "bun:test";
import { BlindSpotCards } from "@/components/features/analytics/BlindSpotCards";
import { renderEn } from "../../testing/render-en";

describe("the cards with no props: the live page's own", () => {
  test("the six questions, each over its ???, under the section's title and description", () => {
    expect(renderEn(<BlindSpotCards />)).toMatchSnapshot();
  });
});

describe("a page that frames the cards itself", () => {
  const questions = ["How many regulars?", "Is it working?"];
  const html = renderEn(<BlindSpotCards questions={questions} noAnswer="Unknown" bare />);

  test("shows its own questions, each turning to its own answer, with no section or heading around them", () => {
    for (const question of questions) expect(html).toContain(question);
    expect(html.match(/Unknown/g)).toHaveLength(questions.length);
    expect(html).not.toContain("<section");
    expect(html).not.toContain("<h2");
    expect(html).not.toContain("What you don");
    expect(html).not.toContain("How many regular customers");
  });

  test("keeps production's grid: two columns on a phone, three from md", () => {
    expect(html).toContain("grid-cols-2 md:grid-cols-3");
  });
});
