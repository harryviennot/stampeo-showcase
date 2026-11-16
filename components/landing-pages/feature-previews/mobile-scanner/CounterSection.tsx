import type { ReactNode } from "react";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { WalletCard } from "@/components/card/WalletCard";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { MOBILE_SCANNER_PREVIEW } from "@/lib/landing-pages/copy/previews/mobile-scanner";
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
export async function CounterSection() {
  const { eyebrow, title, lead, options, fact } = MOBILE_SCANNER_PREVIEW.counter;
  const aurevo = await aurevoDesign();
  const line = (key: CounterPane["key"]) => options.find((option) => option.key === key) ?? options[0];
  const wrenfold = { ...WRENFOLD.design, ...SILVER_LOOK, secondary_fields: aurevo.secondary_fields?.slice(0, 1) };

  const panes: CounterPane[] = [
    {
      ...line("stamps"),
      screenLabel: "The Scanner app adding three stamps to Sophie's card in one scan: a stepper set to 3 and the Add 3 stamps button.",
      screen: <StampsScreen />,
      cardLabel: "Sophie's wallet card from Aurevo, full at 8 of 8 stamps.",
      card: (
        <Card>
          <WalletCard design={aurevo} stamps={8} />
        </Card>
      ),
      result: "5 → 8 stamps",
    },
    {
      ...line("points"),
      screenLabel: "The Scanner app taking a spend amount of 12.50 with the keypad, and the points it earns, about 12, before anyone confirms.",
      screen: <PointsScreen />,
      cardLabel: "Sophie's wallet card from Marginalia, a bookstore, now at 252 points.",
      card: (
        <Card>
          <WalletCard design={MARGINALIA.design} pointsBalance={252} pointsRewards={MARGINALIA.pointsRewards} />
        </Card>
      ),
      result: "240 → 252 pts",
    },
    {
      ...line("rewards"),
      screenLabel: "The Scanner app's list of rewards to redeem: three rewards, each with a Redeem button.",
      screen: <RewardsScreen />,
      cardLabel: "Sophie's wallet card from Aurevo, back to 2 of 8 stamps once her reward is claimed.",
      card: (
        <Card>
          <WalletCard design={aurevo} stamps={2} />
        </Card>
      ),
      result: "Free coffee redeemed",
    },
    {
      ...line("levels"),
      screenLabel: "The Scanner app showing a Silver customer's perks to apply at the till before charging.",
      screen: <LevelScreen />,
      cardLabel: "Sophie's wallet card from Wrenfold, a dry cleaner, showing its Silver level.",
      card: (
        <Card>
          <WalletCard design={wrenfold} stamps={4} headerLabel="Silver" />
        </Card>
      ),
      result: "Level: Silver",
    },
  ];

  return (
    <LpSection section="counter" anchor eyebrow={eyebrow} title={title} lead={lead} align="center">
      <CounterPlayground label={title} panes={panes} fact={fact} />
    </LpSection>
  );
}
