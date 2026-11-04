import { describe, expect, it } from "bun:test";
import { arrangeBody, splitVerdict } from "./body";

const COMPETITOR = '<ChooseIf side="competitor">\n\n- Their side.\n\n</ChooseIf>';
const STAMPEO = '<ChooseIf side="stampeo">\n\n- Our side.\n\n</ChooseIf>';

describe("the verdict of a page", () => {
  it("is its first paragraph, and the rest of the page follows", () => {
    const { verdict, rest } = splitVerdict(`\nAcme costs <Fact id="price.entry" />,\nStampeo less.\n\n## Prices\n\nMore.\n`);

    expect(verdict).toBe('Acme costs <Fact id="price.entry" />,\nStampeo less.');
    expect(rest.trim()).toBe("## Prices\n\nMore.");
  });

  it.each([
    ["a component", `${COMPETITOR}\n\nText.`],
    ["a heading", "## Choose Acme if\n\nText."],
    ["a list", "- one\n- two\n\nText."],
    ["a quote", "> quoted\n\nText."],
    ["nothing", "   \n"],
  ])("is absent when the page opens with %s", (_name, content) => {
    expect(splitVerdict(content).verdict).toBeNull();
    expect(splitVerdict(content).rest).toBe(content);
  });

  it("can open on an inline fact", () => {
    expect(splitVerdict('<Fact id="stampeo.trial" /> is ours.\n\nMore.').verdict).toBe('<Fact id="stampeo.trial" /> is ours.');
  });
});

describe("the Choose if cards of a page", () => {
  it("sit in one pair when written back to back, with the sign-up call to action right after", () => {
    const arranged = arrangeBody(`Intro.\n\n${COMPETITOR}\n\n${STAMPEO}\n\n<ComparisonTable />`);

    const pair = arranged.indexOf("<ChooseIfPair>");
    expect(pair).toBeGreaterThan(arranged.indexOf("Intro."));
    expect(arranged.indexOf(COMPETITOR)).toBeGreaterThan(pair);
    expect(arranged.indexOf(STAMPEO)).toBeGreaterThan(arranged.indexOf(COMPETITOR));
    expect(arranged.indexOf("</ChooseIfPair>")).toBeGreaterThan(arranged.indexOf(STAMPEO));
    expect(arranged.indexOf("<CallToAction />")).toBeGreaterThan(arranged.indexOf("</ChooseIfPair>"));
    expect(arranged.indexOf("<CallToAction />")).toBeLessThan(arranged.indexOf("<ComparisonTable />"));
  });

  it("pair up whichever order they were written in", () => {
    const arranged = arrangeBody(`${STAMPEO}\n\n${COMPETITOR}`);

    expect(arranged).toContain("<ChooseIfPair>");
    expect(arranged.indexOf("<CallToAction />")).toBeGreaterThan(arranged.indexOf("</ChooseIfPair>"));
  });

  it("stay as written when something sits between them, and the call to action still follows the last one", () => {
    const arranged = arrangeBody(`${COMPETITOR}\n\nSome words.\n\n${STAMPEO}\n\nAfter.`);

    expect(arranged).not.toContain("ChooseIfPair");
    expect(arranged.indexOf("<CallToAction />")).toBeGreaterThan(arranged.indexOf(STAMPEO));
    expect(arranged.indexOf("<CallToAction />")).toBeLessThan(arranged.indexOf("After."));
  });

  it("do not get a second call to action when the writer placed one", () => {
    const arranged = arrangeBody(`${COMPETITOR}\n\n${STAMPEO}\n\n<CallToAction title="Try it" buttonText="Go" />`);

    expect(arranged.match(/<CallToAction/g)).toHaveLength(1);
  });

  it("leave a page without them alone", () => {
    expect(arrangeBody("Just text.")).toBe("Just text.");
  });
});
