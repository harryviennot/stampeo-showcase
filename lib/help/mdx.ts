import { compileMDX } from "next-mdx-remote/rsc";
import { helpMdxComponents } from "@/components/help/mdx";
import { blogMdxOptions } from "@/lib/blog/mdx-options";
import { rehypeSymptomIds } from "./symptom-ids";

/** The blog's compile options, plus the plugin that gives each Symptom its link id. */
export const helpMdxOptions: typeof blogMdxOptions = {
  ...blogMdxOptions,
  mdxOptions: {
    ...blogMdxOptions.mdxOptions,
    rehypePlugins: [...(blogMdxOptions.mdxOptions?.rehypePlugins ?? []), rehypeSymptomIds],
  },
};

export async function compileHelpMDX(source: string) {
  const { content } = await compileMDX({
    source,
    components: helpMdxComponents,
    options: helpMdxOptions,
  });

  return content;
}
