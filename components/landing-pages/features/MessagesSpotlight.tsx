import {
  NotificationSequenceDemo,
  type SequenceMoment,
} from "@/components/features/notifications-push/NotificationSequenceDemo";
import { FEATURES } from "@/lib/landing-pages/copy/features";
import { lpBanner } from "../shared/banner";
import { LpSection } from "../shared/LpSection";
import { phoneCropClass } from "../shared/PhoneCrop";
import { aurevoDesign } from "../shared/AurevoCard";
import { AUREVO } from "../shared/samples";

/**
 * What Aurevo's card shows at each moment, in the copy's order: the 5th stamp
 * the default banner counts, the full card, and the card as it stood when the
 * owner's own message went out.
 */
const KEYS = ["stamp", "reward", "broadcast"] as const;
const STAMPS = [5, AUREVO.design.total_stamps ?? 8, 5] as const;

/** The three moments of the lock-screen demo: each banner sent by the sample café. */
export function messageMoments(): SequenceMoment[] {
  return FEATURES.messages.moments.map((moment, index) => ({
    key: KEYS[index],
    title: moment.title,
    description: moment.description,
    stamps: STAMPS[index],
    banner: lpBanner(moment.banner),
  }));
}

/**
 * Reach them on their lock screen: three moments on Aurevo's whole card, each
 * banner sent by Aurevo. The phone is cut at 520px on a phone, and a line
 * under it says what a broadcast costs.
 */
export async function MessagesSpotlight() {
  return (
    <LpSection
      section="spotlight_messages"
      title={FEATURES.messages.title}
      lead={FEATURES.messages.lead}
      align="center"
    >
      <div className="mx-auto max-w-5xl">
        <NotificationSequenceDemo
          moments={messageMoments()}
          design={await aurevoDesign()}
          fullCard
          phoneClassName={phoneCropClass(520)}
        />
        <div className="flex justify-center">
          <p className="mt-6 max-w-xl text-pretty text-base text-[var(--foreground)]">{FEATURES.messages.broadcast}</p>
        </div>
      </div>
    </LpSection>
  );
}
