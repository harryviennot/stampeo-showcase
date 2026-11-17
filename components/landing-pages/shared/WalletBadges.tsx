/* eslint-disable @next/next/no-img-element */
import { useLocale } from "next-intl";
import { walletBadges } from "@/lib/store-badges";

/** The official Apple Wallet and Google Wallet badges, as images and not links: they say where the card lives. */
export function WalletBadges({
  height = "h-10",
  className = "",
}: Readonly<{ height?: "h-7" | "h-10"; className?: string }>) {
  const badges = walletBadges(useLocale());

  return (
    <div className={`flex items-center ${className}`}>
      <img src={badges.apple} alt="Apple Wallet" className={`${height} w-auto`} />
      <img src={badges.google} alt="Google Wallet" className={`${height} w-auto`} />
    </div>
  );
}
