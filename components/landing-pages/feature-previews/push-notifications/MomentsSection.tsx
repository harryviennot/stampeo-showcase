import {
  NotificationSequenceDemo,
  type SequenceMoment,
} from "@/components/features/notifications-push/NotificationSequenceDemo";
import { PUSH_NOTIFICATIONS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/push-notifications";
import { LpSection } from "../../shared/LpSection";
import { aurevoDesign } from "../../shared/AurevoCard";
import { phoneCropClass } from "../../shared/PhoneCrop";
import { AUREVO } from "../../shared/samples";
import { lpBanner } from "../../shared/banner";

/** What Aurevo's card shows at each moment: the 5th stamp the banner counts, the full card, and the fresh card once the reward is claimed. */
const KEYS = ["stamp", "reward", "redeemed"] as const;
const STAMPS = [5, AUREVO.design.total_stamps ?? 8, 0] as const;

/** The three moments of the lock-screen demo: each banner sent by the sample café, on every plan. */
export function pushMoments(): SequenceMoment[] {
  return COPY.moments.items.map((item, index) => ({
    key: KEYS[index],
    title: item.title,
    description: item.description,
    stamps: STAMPS[index],
    banner: lpBanner(item.banner),
  }));
}

/**
 * "The right message at every step": three moments on Aurevo's whole card, each
 * banner sent by Aurevo. The phone is cut at 520px on a phone.
 */
export async function MomentsSection() {
  return (
    <LpSection
      section="moments"
      eyebrow={COPY.moments.eyebrow}
      title={COPY.moments.title}
      lead={COPY.moments.lead}
      align="center"
    >
      <div className="mx-auto max-w-5xl">
        <NotificationSequenceDemo
          moments={pushMoments()}
          design={await aurevoDesign()}
          fullCard
          phoneClassName={phoneCropClass(520)}
        />
      </div>
    </LpSection>
  );
}
