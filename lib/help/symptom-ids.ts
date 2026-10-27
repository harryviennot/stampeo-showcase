/**
 * Gives every `<Symptom title="…">` an id, so `/help/<slug>#<id>` lands on that
 * troubleshooting entry. Runs after rehype-slug: a symptom's id is the title
 * slugified the way headings are, and takes `-1`, `-2` … when a heading or an
 * earlier symptom already holds it.
 */

import { slug as slugify } from "github-slugger";

interface HastNode {
  type: string;
  name?: string | null;
  properties?: { id?: unknown };
  attributes?: Array<{ type: string; name?: string; value?: unknown }>;
  children?: HastNode[];
}

function walk(node: HastNode, visit: (node: HastNode) => void) {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
}

function attribute(node: HastNode, name: string) {
  return node.attributes?.find((attr) => attr.type === "mdxJsxAttribute" && attr.name === name);
}

export function rehypeSymptomIds() {
  return (tree: HastNode) => {
    const taken = new Set<string>();
    walk(tree, (node) => {
      if (typeof node.properties?.id === "string") taken.add(node.properties.id);
    });

    walk(tree, (node) => {
      if (node.type !== "mdxJsxFlowElement" || node.name !== "Symptom") return;

      const title = attribute(node, "title")?.value;
      if (typeof title !== "string" || title.trim() === "") {
        throw new Error('<Symptom> needs a plain-text title="…", which is also its link target');
      }
      if (attribute(node, "id")) return;

      const base = slugify(title);
      let id = base;
      for (let n = 1; taken.has(id); n += 1) id = `${base}-${n}`;
      taken.add(id);

      node.attributes = [...(node.attributes ?? []), { type: "mdxJsxAttribute", name: "id", value: id }];
    });
  };
}
