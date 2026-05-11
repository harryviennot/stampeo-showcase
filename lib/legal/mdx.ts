import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { visit } from "unist-util-visit";
import { mdxComponents } from "@/components/blog/mdx";

/**
 * Locale-independent IDs for sections that are deep-linked from outside the
 * showcase (e.g. transactional emails). Auto-generated slugs differ across
 * languages, which would break a link if the user's browser locale doesn't
 * match the locale in the link. Rewriting these to stable IDs lets one URL
 * work no matter which locale's page the user lands on.
 *
 * Key = auto-slug emitted by `rehype-slug` (github-slugger). Value = stable
 * id consumed by the email URL builder in backend/app/services/email.py.
 *
 * When a heading is renamed in any *.md file, refresh the matching key.
 */
const STABLE_LEGAL_IDS: Record<string, string> = {
  // Privacy §2.3 — Support access by Stampeo personnel
  "23-support-access-by-stampeo-personnel": "support-access",
  "23-accès-support-par-le-personnel-stampeo": "support-access",
  // Terms §8.6 — Support Access by Stampeo Personnel (DPA section)
  "86-support-access-by-stampeo-personnel": "data-processing-support-access",
  "86-accès-support-par-le-personnel-stampeo": "data-processing-support-access",
  // Privacy §10.1 — Right to object to support access
  "101-right-to-object-to-support-access": "object-to-support-access",
  "101-droit-dopposition-à-laccès-support": "object-to-support-access",
};

function rehypeStableLegalIds() {
  return (tree: unknown) => {
    visit(tree as never, "element", (node: { properties?: Record<string, unknown> }) => {
      const id = node.properties?.id;
      if (typeof id !== "string") return;
      const mapped = STABLE_LEGAL_IDS[id];
      if (mapped && node.properties) node.properties.id = mapped;
    });
  };
}

export async function compileLegalMDX(source: string) {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug, rehypeStableLegalIds],
      },
    },
  });

  return content;
}
