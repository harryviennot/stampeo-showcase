import { comparisonRoute } from "@/lib/compare/page/route";

// A French comparison ("<concurrent> ou Stampeo"), served at /comparatif/<slug>. French only.
const { generateStaticParams, generateMetadata, Page } = comparisonRoute("fr");

export { generateStaticParams, generateMetadata };
export default Page;
