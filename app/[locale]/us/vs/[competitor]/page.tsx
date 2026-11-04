import { comparisonRoute } from "@/lib/compare/page/route";

// A US comparison, served at /us/vs/<slug> by the proxy's rewrite of /us/* to this route. English only.
const { generateStaticParams, generateMetadata, Page } = comparisonRoute("us");

export { generateStaticParams, generateMetadata };
export default Page;
