import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { WalletCard } from "@/components/card/WalletCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PLAYGROUND_POINTS_REWARDS, type Playground } from "./usePlayground";

/** The live card on one side and the controls panel on the other; each playground sets its own widths and spacing. */
export function PlaygroundBody({
  p,
  className,
  cardClassName,
  panelClassName,
  showQR,
  children,
}: {
  p: Playground;
  className: string;
  cardClassName: string;
  panelClassName: string;
  showQR: boolean;
  children: ReactNode;
}) {
  const { isPoints, design, shownStamps, balance, complete } = p;

  return (
    <div className={className}>
      {/* Live card preview */}
      <ScrollReveal variant="right" className="flex justify-center">
        <motion.div
          className={cardClassName}
          layout
          animate={complete ? { scale: [1, 1.045, 1] } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <ScaledCardWrapper baseWidth={300}>
            <WalletCard
              design={design}
              stamps={isPoints ? undefined : shownStamps}
              pointsBalance={isPoints ? balance : undefined}
              pointsRewards={isPoints ? PLAYGROUND_POINTS_REWARDS : undefined}
              showQR={showQR}
              interactive3D={true}
            />
          </ScaledCardWrapper>
        </motion.div>
      </ScrollReveal>

      {/* Controls */}
      <ScrollReveal variant="left">
        <div className={panelClassName}>{children}</div>
      </ScrollReveal>
    </div>
  );
}
