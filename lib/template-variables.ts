/**
 * Pass-field template rendering for the public enrollment card preview.
 *
 * Card designs may carry `{{variable}}` placeholders in field labels and
 * values (canonical keys, mirroring web/src/lib/template-variables.ts and
 * the backend renderer). The enrollment page substitutes them with the
 * real program data it already has (stamp goal, reward name, head-start
 * stamps) plus a sample cardholder, so visitors see a realistic card
 * instead of raw placeholder syntax.
 */

const VARIABLE_PATTERN = /\{\{(\w+)\}\}/g;

export interface PassFieldLike {
  key: string;
  label: string;
  value: string;
}

export interface PreviewContext {
  stampCount: number;
  totalStamps: number;
  rewardName?: string | null;
  businessName?: string | null;
  /** Sample cardholder first name shown on the preview. */
  sampleFirstName?: string;
}

function buildValues(ctx: PreviewContext): Record<string, string> {
  return {
    stamp_count: String(ctx.stampCount),
    total_stamps: String(ctx.totalStamps),
    stamps_left: String(Math.max(0, ctx.totalStamps - ctx.stampCount)),
    rewards_count: "0",
    reward_name: ctx.rewardName ?? "",
    business_name: ctx.businessName ?? "",
    customer_first_name: ctx.sampleFirstName ?? "Jane",
  };
}

function renderText(text: string, values: Record<string, string>): string {
  return text.replace(VARIABLE_PATTERN, (match, key: string) => values[key] ?? match);
}

/**
 * Render a design field array for the preview. Mirrors the backend: a field
 * whose rendered VALUE is empty is dropped entirely (label included).
 */
export function renderPreviewFields(
  fields: PassFieldLike[] | undefined,
  ctx: PreviewContext
): PassFieldLike[] {
  if (!fields?.length) return [];
  const values = buildValues(ctx);
  const rendered: PassFieldLike[] = [];
  for (const f of fields) {
    const value = renderText(f.value ?? "", values).trim();
    if (!value) continue;
    rendered.push({
      key: f.key,
      label: renderText(f.label ?? "", values).trim(),
      value,
    });
  }
  return rendered;
}
