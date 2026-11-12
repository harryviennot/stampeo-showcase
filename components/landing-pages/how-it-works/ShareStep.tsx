import type { Icon } from "@phosphor-icons/react";
import { DevicePhoneMobileIcon, GlobeIcon, PrinterIcon } from "@/components/icons";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { HOW_IT_WORKS } from "@/lib/landing-pages/copy/how-it-works";
import { IconTile } from "../shared/IconTile";
import { LpSection } from "../shared/LpSection";
import { ShareStepVisual } from "./ShareStepVisual";
import { StepHeading } from "./StepHeading";

/** One icon per channel, in the order of the copy: the counter, online, the team's phone. */
const CHANNEL_ICONS: Icon[] = [
  PrinterIcon,
  GlobeIcon,
  DevicePhoneMobileIcon,
];

/**
 * Step 2: how customers get the card. The words and the three places the QR
 * code lives sit on the left; the flyer and the wallet phone on the right.
 * Under the heading on a phone: the picture, then the three rows.
 */
export function ShareStep() {
  const { label, title, lead, channels } = HOW_IT_WORKS.share;

  return (
    <LpSection section="step_share" anchor>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-10">
        <ScrollReveal className="lg:col-start-1 lg:row-start-1 lg:self-end">
          <StepHeading number={2} label={label} title={title} lead={lead} />
        </ScrollReveal>

        <ScrollReveal delay={150} variant="right" className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
          <ShareStepVisual />
        </ScrollReveal>

        <ul className="flex flex-col gap-3 lg:col-start-1 lg:row-start-2 lg:self-start">
          {channels.map((channel, index) => {
            const Icon = CHANNEL_ICONS[index];

            return (
              <li key={channel.title}>
                <ScrollReveal delay={index * 100}>
                  <div className="flex min-h-[76px] items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[var(--border)]">
                    <IconTile tone="accent">
                      <Icon size={22} weight="duotone" aria-hidden />
                    </IconTile>
                    <div>
                      <h3 className="text-h3 text-[var(--foreground)]">{channel.title}</h3>
                      <p className="mt-0.5 text-base text-[var(--muted-foreground)]">{channel.body}</p>
                    </div>
                  </div>
                </ScrollReveal>
              </li>
            );
          })}
        </ul>
      </div>
    </LpSection>
  );
}
