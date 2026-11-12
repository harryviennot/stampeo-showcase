import { WalletCard } from "@/components/card/WalletCard";
import { PassFrame } from "./PassFrame";
import { MARGINALIA } from "./samples";

/** The bookstore's points card, with its running balance and its QR code, at `width` px. */
export function MarginaliaCard({ width }: Readonly<{ width: number }>) {
  return (
    <PassFrame width={width}>
      <WalletCard
        design={MARGINALIA.design}
        pointsBalance={MARGINALIA.pointsBalance}
        pointsRewards={MARGINALIA.pointsRewards}
      />
    </PassFrame>
  );
}
