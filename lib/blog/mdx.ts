import { compileMDX } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/blog/mdx";
import { blogMdxOptions } from "./mdx-options";

export async function compileBlogMDX(source: string) {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: blogMdxOptions,
  });

  return content;
}
