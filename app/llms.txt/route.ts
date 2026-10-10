import { buildLlmsTxt } from "@/lib/llms-txt";
import { getPlanCatalog } from "@/lib/plan-catalog";

/** Same cadence as the plan catalog fetch, so the quoted prices stay current. */
export const revalidate = 300;

export async function GET(): Promise<Response> {
  const [eur, usd] = await Promise.all([getPlanCatalog("eur"), getPlanCatalog("usd")]);
  return new Response(buildLlmsTxt({ eur, usd }), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
