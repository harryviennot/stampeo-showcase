import { WalletCard } from "@/components/card/WalletCard";
import { resolveFanCard } from "@/lib/hero-fan";
import { PassFrame } from "../../shared/PassFrame";

/** A shop's card from the brand banks at its sample count, drawn `width` px wide. */
export function SampleCard({ id, width }: Readonly<{ id: string; width: number }>) {
  const card = resolveFanCard(id);

  return (
    <PassFrame width={width}>
      {card.kind === "stamps" ? (
        <WalletCard design={card.sample.design} stamps={card.sample.stamps} />
      ) : (
        <WalletCard
          design={card.sample.design}
          pointsBalance={card.sample.pointsBalance}
          pointsRewards={card.sample.pointsRewards}
        />
      )}
    </PassFrame>
  );
}
