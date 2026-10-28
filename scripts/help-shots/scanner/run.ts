/**
 * Scanner-app screenshots on the promo simulator ("Stampeo Promo iPhone 17 Pro", never the developer's own).
 *
 *   bun scripts/help-shots/scanner/run.ts --app <StampeoDev.app> [--shot install-the-scanner-app-01 ...] [--out DIR]
 *
 * The app is a Release simulator build of scanner-app (see README.md). The flow resets the simulator's
 * keychain, installs the build, and walks: welcome, sign-in chooser, an email sign-in as the Aurevo fixture
 * admin, the stamp screen of a fixture customer opened by deep link (no camera), the stepper at +3.
 * It never taps Add Stamp, so no stamp is written. Each screen is saved at 804x1748 (402x874 at 2x).
 */
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { ACCOUNTS } from "../lib/session";
import { findEnvFile, readEnvKey } from "../lib/env";

const { values } = parseArgs({
  options: { app: { type: "string" }, shot: { type: "string", multiple: true }, out: { type: "string" } },
});
const app = values.app ?? process.env.HELP_SHOTS_SCANNER_APP;
if (!app || !fs.existsSync(app)) {
  console.error("Pass --app <path to StampeoDev.app> (a Release iphonesimulator build, see scripts/help-shots/README.md).");
  process.exit(2);
}
const outDir = path.resolve(values.out ?? path.join(import.meta.dir, "../../../public/help"));

// The promo simulator tooling lives in promo-videos, next to the env file.
const promo = path.dirname(findEnvFile());
const { ensureDevice, screenshot } = await import(path.join(promo, "tools/sim/sim.ts"));
const { run, sleep } = await import(path.join(promo, "tools/lib/exec.ts"));

const BUNDLE = "com.hryvnt.stampeo.dev";
/** A fixture customer of the dev Aurevo business (3 of 8 stamps, no reward waiting): Customers page of the dashboard. */
const CUSTOMER_ID = "6c5ad494-e578-4bca-b69c-e315953e2ce5";

const wanted = (name: string) => !values.shot || values.shot.includes(name);
const needsStampScreen = wanted("add-stamps-01");

const udid: string = await ensureDevice("en");
const axe = (...args: string[]): Promise<string> => run(["axe", ...args, "--udid", udid]);
const simctl = (...args: string[]): Promise<string> => run(["xcrun", "simctl", ...args], { allowFail: true });

/** Whether an accessibility label is on screen. */
async function onScreen(label: string) {
  return (await axe("describe-ui")).includes(`"${label}"`);
}

/** Types one key at a time: the keyboard drops characters when a whole string arrives at once. */
async function typeSlow(text: string) {
  for (const ch of text) {
    await axe("type", ch);
    await sleep(140);
  }
}

/** Saves the current screen at phone size, with a clean status bar (9:41, full battery). */
async function snap(name: string) {
  if (!wanted(name)) return;
  await simctl("status_bar", udid, "override", "--time", "9:41", "--dataNetwork", "wifi", "--wifiMode", "active", "--wifiBars", "3", "--cellularMode", "active", "--cellularBars", "4", "--batteryState", "discharging", "--batteryLevel", "100", "--operatorName", "");
  await sleep(800);
  const raw = path.join(outDir, `${name}.raw.png`);
  fs.mkdirSync(outDir, { recursive: true });
  await screenshot(udid, raw);
  await run(["sips", "-z", "1748", "804", raw, "--out", path.join(outDir, `${name}.png`)]);
  fs.rmSync(raw);
  console.log(`  ${name}.png`);
}

// Fresh state: signed out, the build installed.
await simctl("terminate", udid, BUNDLE);
await simctl("keychain", udid, "reset");
await simctl("uninstall", udid, BUNDLE);
await run(["xcrun", "simctl", "install", udid, app]);
await run(["xcrun", "simctl", "launch", udid, BUNDLE]);
await sleep(6000);

await snap("install-the-scanner-app-01");
await axe("tap", "--label", "Sign in");
await sleep(2000);
await snap("install-the-scanner-app-02");

if (needsStampScreen) {
  await axe("tap", "--label", "Continue with email");
  await sleep(2500);
  await axe("tap", "--label", "Email");
  await sleep(1500);
  await typeSlow(ACCOUNTS.aurevo.email);
  await axe("tap", "--label", "Password");
  await sleep(1200);
  await typeSlow(readEnvKey("FIXTURE_PASSWORD"));
  await axe("tap", "--label", "Sign In");
  await sleep(10000);
  if (await onScreen("Skip")) {
    await axe("tap", "--label", "Skip");
    await sleep(3000);
  }

  // The QR code holds the customer id: the same route opens by deep link, without a camera.
  await simctl("openurl", udid, `stampeo-scanner:///stamp/${CUSTOMER_ID}`);
  await sleep(3000);
  if (await onScreen("Open")) await axe("tap", "--label", "Open");
  await sleep(7000);
  await axe("tap", "--label", "Add one stamp");
  await sleep(1000);
  await axe("tap", "--label", "Add one stamp");
  await sleep(2000);
  await snap("add-stamps-01");
  await axe("tap", "--label", "Close");
}
