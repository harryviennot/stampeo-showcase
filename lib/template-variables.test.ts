import { describe, expect, it } from "bun:test";
import {
  renderPreviewFields,
  pickSampleName,
  type PreviewContext,
  type PassFieldLike,
} from "./template-variables";

const ctx: PreviewContext = {
  stampCount: 3,
  totalStamps: 10,
  rewardName: "Free Coffee",
  businessName: "Bean Scene",
  sampleFirstName: "Sarah",
  pointsBalance: 120,
  pointsToNext: 80,
  nextRewardName: "Free Latte",
  nextRewardPoints: 200,
  lastRewardName: "Free Cookie",
  storeLocation: "Downtown",
};

const field = (value: string, label = "Label"): PassFieldLike => ({
  key: "k",
  label,
  value,
});

describe("renderPreviewFields", () => {
  it("substitutes every canonical variable — none left as raw {{...}}", () => {
    const vars = [
      "stamp_count",
      "total_stamps",
      "stamps_left",
      "rewards_count",
      "reward_name",
      "business_name",
      "customer_first_name",
      "store_location",
      "points_balance",
      "points_to_next",
      "next_reward_points",
      "next_reward_name",
      "last_reward_name",
    ];
    const fields = vars.map((v) => field(`{{${v}}}`, `{{${v}}}`));
    const rendered = renderPreviewFields(fields, ctx);
    expect(rendered).toHaveLength(vars.length);
    for (const f of rendered) {
      expect(f.value).not.toContain("{{");
      expect(f.label).not.toContain("{{");
    }
  });

  it("fills program data from real values and the customer name from the sample", () => {
    const rendered = renderPreviewFields(
      [
        field("{{stamp_count}}/{{total_stamps}}", "Progress"),
        field("Hi {{customer_first_name}}", "Name"),
        field("{{next_reward_points}} pts", "Goal"),
      ],
      ctx
    );
    expect(rendered[0].value).toBe("3/10");
    expect(rendered[1].value).toBe("Hi Sarah");
    expect(rendered[2].value).toBe("200 pts");
  });

  it("drops a field whose rendered value is empty (mirrors the backend)", () => {
    const rendered = renderPreviewFields(
      [field("{{reward_name}}"), field("   "), field("kept")],
      { ...ctx, rewardName: "" }
    );
    expect(rendered.map((f) => f.value)).toEqual(["kept"]);
  });

  it("leaves unknown placeholders untouched rather than blanking them", () => {
    const rendered = renderPreviewFields([field("{{mystery}}")], ctx);
    expect(rendered[0].value).toBe("{{mystery}}");
  });

  it("returns an empty array for no fields", () => {
    expect(renderPreviewFields(undefined, ctx)).toEqual([]);
    expect(renderPreviewFields([], ctx)).toEqual([]);
  });
});

describe("pickSampleName", () => {
  it("is deterministic for a given locale + seed", () => {
    expect(pickSampleName("en", "biz-123")).toBe(pickSampleName("en", "biz-123"));
  });

  it("returns a name from the requested locale's pool", () => {
    const es = ["Lucía", "Mateo", "Sofía", "Diego", "Valentina", "Hugo", "Martina", "Pablo"];
    expect(es).toContain(pickSampleName("es", "some-business-id"));
  });

  it("falls back to the English pool for an unknown locale", () => {
    const en = ["Sarah", "James", "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan"];
    expect(en).toContain(pickSampleName("de", "biz-xyz"));
  });

  it("varies across different seeds", () => {
    const names = new Set(
      ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"].map((s) => pickSampleName("en", s))
    );
    // With 8 names and 10 distinct seeds we expect more than one bucket hit.
    expect(names.size).toBeGreaterThan(1);
  });
});
