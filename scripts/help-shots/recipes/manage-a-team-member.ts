import { openSofia, teamRecipe } from "./team-member-panel";

export const recipe = teamRecipe("manage-a-team-member", [
  {
    n: "01",
    asOwner: true,
    shows: "a scanner's panel, as the owner: Role, Activity, Scanning access, Danger zone",
    async run(h) {
      const panel = await openSofia(h);
      await h.snapBand(panel, { from: panel, to: panel.getByRole("button", { name: "Remove from team" }), padBottom: 24 });
    },
  },
  {
    n: "02",
    asOwner: false,
    shows: "the same panel as an admin: role as text, the owner-only line, Activity, no controls",
    async run(h) {
      const panel = await openSofia(h);
      await h.snapBand(panel, { from: panel, to: panel.getByText("All-time scans", { exact: true }), padBottom: 24 });
    },
  },
]);
