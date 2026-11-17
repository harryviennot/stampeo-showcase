import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { WalletCard } from "@/components/card/WalletCard";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { landingCopy } from "@/lib/landing-pages/copy/bundle";
import { MARKETS, type Market } from "@/lib/markets";
import { SILVER_LOOK } from "@/lib/levels/looks";
import { aurevoDesign } from "../../shared/AurevoCard";
import { LpSection } from "../../shared/LpSection";
import { MARGINALIA, WRENFOLD } from "../../shared/samples";
import { CounterPlayground, type CounterPane } from "./CounterPlayground";
import { LevelScreen, PointsScreen, RewardsScreen, StampsScreen } from "./CounterScreens";

/** A wallet card laid out at 300px and shown 160px wide on a phone, 240px from `lg`. */
function Card({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ScaledBox width={300} height={300 * 1.282} to={240} narrowTo={160}>
      <ScaledCardWrapper baseWidth={300}>{children}</ScaledCardWrapper>
    </ScaledBox>
  );
}

/** The Scanner app's screen for stamps, points, a reward and a level on one phone, beside the customer's card showing what the scan did to it. */
export async function CounterSection({ market }: Readonly<{ market: Market }>) {
  const { shared, previews } = landingCopy(await getLocale());
  const { eyebrow, title, lead, options, fact, panes: words } = previews.mobileScanner.MOBILE_SCANNER_PREVIEW.counter;
  const aurevo = await aurevoDesign();
  const line = (key: CounterPane["key"]) => options.find((option) => option.key === key) ?? options[0];
  const [stamps, points, rewards, levels] = words;
  const wrenfold = { ...WRENFOLD.design, ...SILVER_LOOK, secondary_fields: aurevo.secondary_fields?.slice(0, 1) };

  const panes: CounterPane[] = [
    {
      ...line("stamps"),
      screenLabel: stamps.screenAlt,
      screen: <StampsScreen />,
      cardLabel: stamps.cardAlt,
      card: (
        <Card>
          <WalletCard design={aurevo} stamps={8} />
        </Card>
      ),
      result: stamps.result,
    },
    {
      ...line("points"),
      screenLabel: points.screenAlt,
      screen: <PointsScreen currency={MARKETS[market].currency.symbol} />,
      cardLabel: points.cardAlt,
      card: (
        <Card>
          <WalletCard design={MARGINALIA.design} pointsBalance={252} pointsRewards={MARGINALIA.pointsRewards} />
        </Card>
      ),
      result: points.result,
    },
    {
      ...line("rewards"),
      screenLabel: rewards.screenAlt,
      screen: <RewardsScreen />,
      cardLabel: rewards.cardAlt,
      card: (
        <Card>
          <WalletCard design={aurevo} stamps={2} />
        </Card>
      ),
      result: rewards.result,
    },
    {
      ...line("levels"),
      screenLabel: levels.screenAlt,
      screen: <LevelScreen />,
      cardLabel: levels.cardAlt,
      card: (
        <Card>
          <WalletCard design={wrenfold} stamps={4} headerLabel={shared.SHARED.levelNames.silver} />
        </Card>
      ),
      result: levels.result,
    },
  ];

  return (
    <LpSection section="counter" anchor eyebrow={eyebrow} title={title} lead={lead} align="center">
      <CounterPlayground label={title} panes={panes} fact={fact} />
    </LpSection>
  );
}
