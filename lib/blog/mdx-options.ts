import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";

/**
 * Compile options shared by the blog MDX pipeline.
 *
 * Kept apart from mdx.ts so tests can assert on them without pulling the whole
 * component map (and the client components behind it) into the test runtime.
 */
export const blogMdxOptions: NonNullable<MDXRemoteProps["options"]> = {
  // next-mdx-remote v6 strips every MDX expression by default — including JSX
  // attribute expressions, so `<PointsCardStyles items={[...]} />` reached the
  // component with items undefined. That default guards *remote, untrusted*
  // MDX; our articles are first-party files committed to this repo, so we turn
  // it off and keep blockDangerousJS (on by default), which still rejects eval,
  // Function, process and friends.
  blockJS: false,
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
  },
};
