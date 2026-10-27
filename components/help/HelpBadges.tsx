import { useFormatter, useTranslations } from "next-intl";
import { planBadge } from "@/lib/help/badges";
import type { HelpAudience, HelpPageType, HelpPlan } from "@/lib/help/types";

const PILL =
  "inline-flex h-7 items-center rounded-full border border-[var(--border)] px-3 text-sm font-semibold";

/**
 * Who can do the task, and the plans it is gated to, under the title of a
 * how-to. One pill for the roles, and one for the plans only when the whole
 * page is gated; a page on every plan has none.
 */
export function HelpBadges({
  type,
  audience,
  plans,
}: {
  type: HelpPageType;
  audience: readonly HelpAudience[];
  plans?: readonly HelpPlan[];
}) {
  const t = useTranslations("help");
  const format = useFormatter();

  if (type !== "how-to") return null;

  const plan = planBadge(plans);
  const roles = format.list(
    audience.map((role) => t(`roles.${role}`)),
    { type: "conjunction" }
  );

  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      <li className={`${PILL} bg-[var(--paper)] text-[var(--near-black)]`}>
        <span className="sr-only">{t("badges.rolesLead")} </span>
        {roles}
      </li>
      {plan && (
        <li className={`${PILL} bg-[var(--accent-light)] text-[var(--accent-hover)]`}>
          <span className="sr-only">{t("badges.planLead")} </span>
          {t(`badges.plan.${plan}`)}
        </li>
      )}
    </ul>
  );
}
