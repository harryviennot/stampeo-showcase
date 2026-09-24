import { describe, expect, test } from "bun:test";
import { serialize } from "next-mdx-remote/serialize";
import { blogMdxOptions } from "./mdx-options";

/** Minimal article using a component that takes a real object prop. */
const SOURCE = `Une intro.

<PointsCardStyles items={[
  { style: "big_point", label: "Grand chiffre" },
  { style: "circle_progress", label: "Anneau" }
]} />
`;

// serialize() is what compileMDX() calls under the hood; the third argument is
// the RSC flag the blog pipeline uses.
const compile = (source: string) => serialize(source, blogMdxOptions, true);

describe("blogMdxOptions", () => {
  test("keeps JSX attribute expressions, so components get their object props", async () => {
    const { compiledSource } = await compile(SOURCE);

    expect(compiledSource).toContain("items:");
    expect(compiledSource).toContain("big_point");
    expect(compiledSource).toContain("circle_progress");
  });

  test("keeps plain string attributes", async () => {
    const { compiledSource } = await compile(`<InfoBox type="tip" title="Astuce">Texte</InfoBox>\n`);

    expect(compiledSource).toContain("tip");
    expect(compiledSource).toContain("Astuce");
  });

  test("still refuses dangerous JavaScript in an expression", async () => {
    await expect(compile(`<InfoBox title={eval("1+1")} />\n`)).rejects.toThrow();
    await expect(compile(`<InfoBox title={process.env.SECRET} />\n`)).rejects.toThrow();
  });
});
