import { openSofia, teamRecipe } from "./team-member-panel";

export const recipe = teamRecipe("remove-a-team-member", [
  {
    n: "01",
    asOwner: true,
    shows: "the bottom of a scanner's panel: Scanning access and Remove from team under Danger zone",
    async run(h) {
      const panel = await openSofia(h);
      const remove = panel.getByRole("button", { name: "Remove from team" });
      await h.snapBand(panel, { from: panel.getByText(/scanning access/i).first(), to: remove, padTop: 14, padBottom: 24 });
    },
  },
]);
