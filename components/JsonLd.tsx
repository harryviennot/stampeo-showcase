/**
 * Structured data as a plain data block, rendered on the server so crawlers
 * that do not run JavaScript still read it. `<` is escaped so a string in the
 * data can never close the tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
