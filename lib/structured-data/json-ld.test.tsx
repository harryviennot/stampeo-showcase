import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { JsonLd } from "@/components/JsonLd";

/**
 * What a crawler that does not run JavaScript receives: the server markup.
 * Structured data has to be in it, as a plain data block.
 */
describe("JsonLd", () => {
  it("renders a server-side ld+json script with the data as valid JSON", () => {
    const data = { "@context": "https://schema.org", "@type": "Organization", name: "Stampeo" };
    const html = renderToStaticMarkup(<JsonLd data={data} />);

    expect(html).toStartWith('<script type="application/ld+json">');
    const body = html.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "");
    expect(JSON.parse(body)).toEqual(data);
  });

  it("escapes < so a string in the data cannot close the script tag", () => {
    const data = { "@type": "FAQPage", name: "</script><script>alert(1)</script>" };
    const html = renderToStaticMarkup(<JsonLd data={data} />);

    // Exactly one closing tag: the component's own.
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    expect(html).toContain("\\u003c/script>");
    const body = html.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "");
    expect(JSON.parse(body).name).toBe(data.name);
  });
});
