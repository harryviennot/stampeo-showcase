import { BellIcon, CalendarCheckIcon } from "@/components/icons";
import { StampeoLogo } from "@/components/logo";
import { ANALYTICS_PREVIEW } from "@/lib/landing-pages/copy/previews/analytics";
import { STAMPED_CARD } from "../../platform/classes";
import { IconTile } from "../../shared/IconTile";
import { LpSection } from "../../shared/LpSection";
import { INK } from "./ink";
import { EMAIL_TREND } from "../../../../lib/landing-pages/previews/analytics-sample";

/** One fact beside the email: an icon tile and a line. */
const FACT_ICONS = [CalendarCheckIcon, BellIcon] as const;

/**
 * "Your numbers come to you": the owner's performance email as a stamped mini, with its four figures and the
 * nudge about customers close to a reward, and the two facts that say when it comes and that it stops on request.
 */
export function RecapSection() {
  const { eyebrow, title, lead, email, facts } = ANALYTICS_PREVIEW.recap;
  const label = `An email from ${email.from} titled "${email.subject}": ${email.figures.map((figure) => `${figure.value} ${figure.label.toLowerCase()}`).join(", ")}, and a note that ${email.nudge.toLowerCase()}.`;

  return (
    <LpSection section="recap" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <div className="mx-auto grid max-w-[1040px] items-center gap-8 lg:grid-cols-12 lg:gap-12">
        <div role="img" aria-label={label} className={`overflow-hidden text-left lg:col-span-7 ${STAMPED_CARD}`}>
          <div aria-hidden>
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4 sm:px-7">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white">
                <StampeoLogo />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block text-[15px] font-semibold text-[var(--foreground)]">{email.from}</span>
                <span className="block text-[13px] text-[var(--muted-foreground)]">to you</span>
              </span>
            </div>

            <div className="px-5 pt-6 pb-6 sm:px-7">
              <p className="text-[22px] leading-tight font-bold tracking-[-0.02em] text-[var(--foreground)] sm:text-[26px]">{email.subject}</p>

              <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6">
                {email.figures.map((figure, at) => (
                  <div key={figure.label}>
                    <dt className="text-[13px] leading-4" style={{ color: INK.label }}>
                      {figure.label}
                    </dt>
                    <dd className="mt-1.5 flex items-baseline gap-2">
                      <span className="text-[2.25rem] leading-none font-semibold tracking-[-0.04em] tabular-nums sm:text-[2.75rem]" style={{ color: INK.figure }}>
                        {figure.value}
                      </span>
                      {at === 0 && (
                        <span className="text-[13px] font-semibold tabular-nums" style={{ color: INK.up }}>
                          {EMAIL_TREND}
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="mt-7 rounded-2xl bg-[#fff6ec] px-4 py-3.5 text-[15px] leading-snug text-[var(--foreground)]">{email.nudge}</p>
            </div>
          </div>
        </div>

        <ul className="flex flex-col gap-5 text-left lg:col-span-5">
          {facts.map((fact, at) => {
            const Icon = FACT_ICONS[at];

            return (
              <li key={fact.text} className="flex items-center gap-4">
                <IconTile tone="brand">
                  <Icon size={22} weight="duotone" aria-hidden />
                </IconTile>
                <span className="text-lg leading-snug font-semibold text-pretty lg:text-xl text-[var(--foreground)]">{fact.text}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </LpSection>
  );
}
