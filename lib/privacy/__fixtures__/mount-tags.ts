import { readConsentSnapshot } from "../snapshot";

/**
 * What GoogleAnalytics and MetaPixel do on mount: load their tag when its gate
 * allows. `instance` gives each call its own copy of the two tag modules, which
 * hold their loaded state at module level.
 */
export async function mountTags(instance: string): Promise<void> {
  const ga = await import(`../../google-analytics?${instance}`);
  const meta = await import(`../../meta-pixel?${instance}`);
  const { analytics, marketing, ready } = readConsentSnapshot();
  if (ga.shouldLoadGa({ measurementId: "G-ZFZ6JLPFXN", analytics, ready, trackable: true })) {
    ga.initGa("G-ZFZ6JLPFXN");
  }
  if (meta.shouldLoadMetaPixel({ pixelId: "1088158323750710", marketing, ready, trackable: true })) {
    meta.initMetaPixel("1088158323750710");
  }
}
