import type { ReactNode } from "react";
import { AppleIcon, ArrowsClockwiseIcon, CheckIcon, ClockIcon, GoogleIcon, XCircleIcon } from "@/components/icons";
import { PROMOTIONAL_CAMPAIGNS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/promotional-campaigns";
import { CARD_SHADOW, CARD_TITLE } from "../../platform/classes";
import { LockScreenNotification } from "../../platform/LockScreenNotification";
import { EYEBROW } from "../../shared/LpSection";
import { shopBanner } from "../ShopIcon";

const { report, delivered, missed } = COPY.delivery;

/** The last campaign is the first idea: the slow-afternoon message the hero shows. */
const CAMPAIGN = COPY.ideas.rows[0];

const sum = (rows: ReadonlyArray<{ value: number }>) => rows.reduce((total, row) => total + row.value, 0);

/** Delivered is what the two wallets took; reachable adds the two counts it missed, as the dashboard counts them. */
const REACHED = sum(delivered);
const REACHABLE = REACHED + sum(missed);
const RATE = Math.round((100 * REACHED) / REACHABLE);

/** The rate line as the dashboard prints it, split for the ring: the figure inside it, the word under it. */
const RATE_LINE = report.deliveryRate.replace("{rate}", String(RATE));
const [RATE_FIGURE, ...RATE_WORDS] = RATE_LINE.split(" ");

/** Each wallet's own mark, in the order of `delivered`; each missed count's icon, in the order of `missed`. */
const MARKS = [<AppleIcon key="apple" className="h-[17px] w-[17px] text-[var(--near-black)]" />, <GoogleIcon key="google" className="h-4 w-4" />];
const MISSED_ICONS = [<ClockIcon key="limit" size={16} weight="bold" />, <XCircleIcon key="removed" size={16} weight="bold" />];

const RULE = "border-t border-black/[0.06]";
const ROW = "flex items-center gap-3";

/** The share delivered as a ring, drawn so its visible arc (round caps included) is the share of the circle. */
function Ring({ share }: Readonly<{ share: number }>) {
  const radius = 44;
  const stroke = 9;
  const circumference = 2 * Math.PI * radius;
  const arc = Math.max(share * circumference - stroke, 0);

  return (
    <div className="relative h-[108px] w-[108px] shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--background-subtle)" strokeWidth={stroke} />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${arc} ${circumference}`}
          strokeDashoffset={-stroke / 2}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[1.75rem] leading-none font-semibold tracking-[-0.04em] tabular-nums text-[var(--near-black)]">
          {RATE_FIGURE}
        </span>
        <span className="mt-1 text-xs font-medium text-[var(--muted-foreground)]">{RATE_WORDS.join(" ")}</span>
      </div>
    </div>
  );
}

/** One count: its mark or icon in a fixed column, its label, and the figure at the end. */
function CountRow({ icon, label, value, muted = false }: Readonly<{ icon: ReactNode; label: string; value: number; muted?: boolean }>) {
  return (
    <li className={`${ROW} ${muted ? "py-1.5 text-[13px] text-[var(--muted-foreground)]" : "py-3 text-[15px] text-[var(--near-black)]"}`}>
      <span
        className={`flex w-8 shrink-0 items-center justify-center ${
          muted ? "" : "h-8 rounded-[9px] bg-white shadow-[0_1px_2px_rgba(25,18,16,0.08)] ring-1 ring-black/[0.07]"
        }`}
      >
        {icon}
      </span>
      <span className={`min-w-0 flex-1 ${muted ? "" : "font-medium"}`}>{label}</span>
      <span className={`tabular-nums ${muted ? "" : "font-semibold"}`}>{value}</span>
    </li>
  );
}

/**
 * The last campaign's report as the dashboard shows it: its status, name and send time, the message as the dark
 * lock-screen notification, the share delivered on a ring with the count it is of, what each wallet delivered, the
 * two counts it missed, and the button to send it again. The whole card is one picture.
 */
export function DeliveryCard() {
  const counts = [...delivered, ...missed].map((row) => `${row.label} ${row.value}`).join(", ");
  const label = `${CAMPAIGN.name}. ${report.status}, ${report.sentAt} ${report.time}. ${CAMPAIGN.banner.sender}: ${CAMPAIGN.banner.body} ${report.stats}: ${RATE_LINE}, ${REACHED} / ${REACHABLE} ${report.reachable}. ${counts}.`;

  return (
    <div
      role="img"
      aria-label={label}
      className={`w-full overflow-hidden rounded-[28px] bg-white text-left ${CARD_SHADOW} ring-1 ring-black/5`}
    >
      <div aria-hidden>
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={`${CARD_TITLE} lg:text-[1.375rem]`}>{CAMPAIGN.name}</p>
              <p className="mt-1 text-[13px] text-[var(--muted-foreground)]">
                {report.sentAt} <span className="font-medium text-[var(--near-black)]">{report.time}</span>
              </p>
            </div>
            <span className="mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--background-subtle)] py-1 pr-2.5 pl-2 text-[11px] leading-4 font-semibold tracking-[0.08em] text-[var(--near-black)] uppercase">
              <CheckIcon size={12} weight="bold" className="text-[var(--accent-hover)]" />
              {report.status}
            </span>
          </div>
          <div className="mt-4 rounded-[22px] bg-[var(--background-subtle)] p-2.5 sm:p-3">
            <LockScreenNotification {...shopBanner(CAMPAIGN.banner)} timeAgo={report.time} />
          </div>
        </div>

        <div className={`${RULE} p-5 sm:p-6`}>
          <p className={`${EYEBROW} text-[var(--muted-foreground)]`}>{report.stats}</p>
          <div className="mt-4 lg:grid lg:grid-cols-[auto_1fr] lg:items-center lg:gap-10">
            <div className="flex items-center gap-5 lg:flex-col lg:gap-3">
              <Ring share={REACHED / REACHABLE} />
              <div className="lg:text-center">
                <p className="text-xl leading-none font-semibold tracking-[-0.02em] tabular-nums text-[var(--near-black)]">
                  {REACHED} / {REACHABLE}
                </p>
                <p className="mt-1.5 text-[13px] leading-none text-[var(--muted-foreground)]">{report.reachable}</p>
              </div>
            </div>

            <div className="mt-4 lg:mt-0">
              <ul className="divide-y divide-black/[0.06]">
                {delivered.map((row, index) => (
                  <CountRow key={row.label} icon={MARKS[index]} label={row.label} value={row.value} />
                ))}
              </ul>
              <ul className={`${RULE} pt-2`}>
                {missed.map((row, index) => (
                  <CountRow key={row.label} icon={MISSED_ICONS[index]} label={row.label} value={row.value} muted />
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className={`${RULE} flex justify-end px-5 py-3.5 sm:px-6`}>
          <span className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[var(--near-black)] shadow-[0_1px_2px_rgba(25,18,16,0.08)] ring-1 ring-black/10">
            <ArrowsClockwiseIcon size={16} weight="bold" />
            {report.sendAgain}
          </span>
        </div>
      </div>
    </div>
  );
}
