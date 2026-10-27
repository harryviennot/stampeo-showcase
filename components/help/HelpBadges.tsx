import { useLocale, useTranslations } from "next-intl";
import { planBadge } from "@/lib/help/badges";
import type { HelpAudience, HelpPageType, HelpPlan } from "@/lib/help/types";

const PLAN_PILL =
  "inline-flex h-7 items-center rounded-full bg-[var(--accent-light)] px-3 font-semibold text-[var(--near-black)] ring-1 ring-inset ring-[var(--accent)]/25";

/**
 * Who can do the task, and the plans it is gated to, as one labelled line
 * under the title of a how-to. The plan is named only when the whole page is
 * gated; a page on every plan says nothing about plans.
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
  const locale = useLocale();

  if (type !== "how-to") return null;

  const plan = planBadge(plans);
  const names = audience.map((role) => t(`roles.${role}`));
  const phrase =
    names.length > 1 ? t("badges.roleAnd", { rest: names.slice(0, -1).join(", "), last: names[names.length - 1] }) : names[0];
  // Sentence case: the first role is capitalised, the others stay lower case.
  const roles = phrase.charAt(0).toLocaleUpperCase(locale) + phrase.slice(1);

  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[var(--near-black)]">
      <span>
        {t("badges.rolesLead")} <span className="font-semibold">{roles}</span>
      </span>
      {plan && (
        <span className="inline-flex items-center gap-2">
          {t("badges.planLead")}
          <span className={PLAN_PILL}>{t(`badges.plan.${plan}`)}</span>
        </span>
      )}
    </p>
  );
}
