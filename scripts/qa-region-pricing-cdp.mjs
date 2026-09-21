#!/usr/bin/env bun

/**
 * STA-330 browser-level QA without a Playwright dependency.
 *
 * Chrome DevTools Protocol applies the timezone before navigation, which is
 * materially different from mocking `regionBilling()`: the real browser Intl,
 * navigator language fallback, React hydration, and every rendered surface
 * participate in the test.
 */

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE_URL = process.env.QA_BASE_URL ?? "https://showcase.dev.stampeo.app";
const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const ROUTES = [
  { path: "/", kind: "landing", fallback: "eur", fallbackTrial: 30 },
  { path: "/fr", kind: "landing", fallback: "eur", fallbackTrial: 30 },
  { path: "/en", kind: "landing", fallback: "eur", fallbackTrial: 30 },
  { path: "/es", kind: "landing", fallback: "eur", fallbackTrial: 30 },
  { path: "/pl", kind: "landing", fallback: "eur", fallbackTrial: 30 },
  { path: "/us", kind: "landing", fallback: "usd", fallbackTrial: 14 },
  { path: "/uk", kind: "landing", fallback: "eur", fallbackTrial: 30 },
  { path: "/pricing", kind: "pricing", fallback: "eur", fallbackTrial: 30 },
  { path: "/us/pricing", kind: "pricing", fallback: "usd", fallbackTrial: 14 },
  { path: "/uk/pricing", kind: "pricing", fallback: "eur", fallbackTrial: 30 },
];

const SCENARIOS = [
  {
    name: "US timezone",
    timezone: "America/New_York",
    locale: "en-US",
    currency: "usd",
    trial: 14,
    deepPath: "/pricing",
  },
  {
    name: "French timezone",
    timezone: "Europe/Paris",
    locale: "fr-FR",
    currency: "eur",
    trial: 30,
    deepPath: "/us/pricing",
  },
  {
    name: "non-US detected timezone",
    timezone: "Asia/Tokyo",
    locale: "ja-JP",
    currency: "eur",
    trial: 30,
    deepPath: "/us/pricing",
  },
  {
    name: "undetectable timezone and regionless language",
    timezone: "Etc/UTC",
    locale: "en",
    currency: null,
    trial: null,
    deepPath: "/us/pricing",
  },
];

const LANDING_SECTIONS = [
  "hero",
  "differentiator",
  "try_it",
  "pricing",
  "faq",
  "final_cta",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class CdpClient {
  constructor(url) {
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.socket = new WebSocket(url);
    this.ready = new Promise((resolve, reject) => {
      this.socket.onopen = resolve;
      this.socket.onerror = reject;
    });
    this.socket.onmessage = (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }
      const listeners = this.listeners.get(message.method) ?? [];
      this.listeners.delete(message.method);
      for (const listener of listeners) listener.resolve(message.params);
    };
  }

  async send(method, params = {}) {
    await this.ready;
    const id = this.nextId++;
    const response = new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
    this.socket.send(JSON.stringify({ id, method, params }));
    return response;
  }

  waitFor(method, timeoutMs = 30_000) {
    return new Promise((resolve, reject) => {
      const listeners = this.listeners.get(method) ?? [];
      const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${method}`)), timeoutMs);
      listeners.push({
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
      });
      this.listeners.set(method, listeners);
    });
  }

  close() {
    this.socket.close();
  }
}

async function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : null;
      server.close((error) => {
        if (error) reject(error);
        else if (port) resolve(port);
        else reject(new Error("Could not allocate a debugging port"));
      });
    });
  });
}

async function waitForDevTools(port, chrome) {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return;
    } catch {}
    if (chrome.exitCode !== null) throw new Error(`Chrome exited with ${chrome.exitCode}`);
    await sleep(50);
  }
  throw new Error("Chrome did not expose its DevTools endpoint");
}

async function evaluate(client, expression) {
  const response = await client.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.exception?.description ?? "Browser evaluation failed");
  }
  return response.result.value;
}

async function navigate(client, url) {
  const loaded = client.waitFor("Page.loadEventFired");
  const result = await client.send("Page.navigate", { url });
  if (result.errorText) throw new Error(result.errorText);
  await loaded;
}

const snapshotExpression = `(() => {
  const visible = (element) => Boolean(
    element && (element.offsetWidth || element.offsetHeight || element.getClientRects().length)
  );
  const sections = Object.fromEntries(
    ${JSON.stringify(LANDING_SECTIONS)}.map((name) => {
      const element = document.querySelector('[data-landing-section="' + name + '"]');
      return [name, element && visible(element) ? element.innerText : null];
    })
  );
  const landing = Boolean(document.querySelector('[data-landing-section="pricing"]'));
  const relevantRoots = landing
    ? ${JSON.stringify(LANDING_SECTIONS)}.map((name) => document.querySelector('[data-landing-section="' + name + '"]')).filter(Boolean)
    : [document.querySelector('main') || document.body];
  const pending = relevantRoots.reduce(
    (count, root) => count + [...root.querySelectorAll('.animate-pulse')].filter(visible).length,
    0
  );
  return {
    href: location.href,
    readyState: document.readyState,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    landing,
    pending,
    sections,
    text: landing
      ? Object.values(sections).filter(Boolean).join('\\n')
      : (document.querySelector('main') || document.body).innerText,
  };
})()`;

async function settledSnapshot(client) {
  let snapshot;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    snapshot = await evaluate(client, snapshotExpression);
    const sectionsReady = !snapshot.landing || LANDING_SECTIONS.every((name) => snapshot.sections[name]);
    if (
      snapshot.readyState === "complete" &&
      sectionsReady &&
      snapshot.pending === 0 &&
      snapshot.text &&
      !snapshot.text.includes("…")
    ) {
      return snapshot;
    }
    await sleep(250);
  }
  return snapshot;
}

function priceFacts(text) {
  const normalized = text.replaceAll("\u00a0", " ").replaceAll("\u202f", " ");
  const trialLines = normalized
    .split("\n")
    .filter((line) => /trial|free|essai|gratuit|prueba|gratis|prób|bezpłat|darmo/i.test(line));
  return {
    normalized,
    hasUsd: /(?:\$\s*\d|\d\s*\$)/.test(normalized),
    hasEur: /(?:€\s*\d|\d\s*€)/.test(normalized),
    trials: [...trialLines.join("\n").matchAll(/\b(14|30)(?:-|\s)+(?:day|days|jours|días|dni)\b/gi)].map(
      (match) => Number(match[1]),
    ),
    compact: normalized.replace(/[\s,]/g, ""),
  };
}

function assertSnapshot({ scenario, route, expectedCurrency, expectedTrial, snapshot, phase }) {
  const failures = [];
  const facts = priceFacts(snapshot.text);
  const acceptedTimezones = scenario.timezone === "Etc/UTC" ? ["Etc/UTC", "UTC"] : [scenario.timezone];
  if (!acceptedTimezones.includes(snapshot.timezone)) {
    failures.push(`browser timezone was ${snapshot.timezone}`);
  }
  if (snapshot.language.toLowerCase() !== scenario.locale.toLowerCase()) {
    failures.push(`browser language was ${snapshot.language}`);
  }
  if (snapshot.pending !== 0) failures.push(`${snapshot.pending} pricing skeletons remained`);

  if (expectedCurrency === "usd") {
    if (!facts.hasUsd) failures.push("no USD amount rendered");
    if (facts.hasEur) failures.push("a EUR amount rendered in a pricing surface");
  } else {
    if (!facts.hasEur) failures.push("no EUR amount rendered");
    if (facts.hasUsd) failures.push("a USD amount rendered in a pricing surface");
  }

  if (!facts.trials.includes(expectedTrial)) failures.push(`no ${expectedTrial}-day trial rendered`);
  const wrongTrial = expectedTrial === 14 ? 30 : 14;
  if (facts.trials.includes(wrongTrial)) failures.push(`${wrongTrial}-day trial also rendered`);

  if (phase === "annual") {
    const annual = expectedCurrency === "usd"
      ? [39, 63, 95, 468, 756, 1140]
      : [16, 32, 48, 192, 384, 576];
    const comparison = expectedCurrency === "usd" ? [49, 79, 119] : [20, 40, 60];
    const amounts = route.kind === "pricing" ? [...annual, ...comparison] : annual;
    for (const amount of amounts) {
      if (!facts.compact.includes(String(amount))) failures.push(`expected ladder amount ${amount} was absent`);
    }
  }

  return failures.map((failure) => ({
    scenario: scenario.name,
    timezone: scenario.timezone,
    route: route.path,
    finalUrl: snapshot.href,
    phase,
    failure,
  }));
}

async function runScenario({ port, scenario }) {
  const target = await (
    await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent("about:blank")}`, {
      method: "PUT",
    })
  ).json();
  const client = new CdpClient(target.webSocketDebuggerUrl);
  await client.ready;
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Network.enable");
  const userAgent = await evaluate(client, "navigator.userAgent");
  await client.send("Network.setUserAgentOverride", {
    userAgent,
    acceptLanguage: scenario.locale,
    platform: "MacIntel",
  });
  await client.send("Network.clearBrowserCookies");
  await client.send("Storage.clearDataForOrigin", {
    origin: BASE_URL,
    storageTypes: "all",
  });
  await client.send("Emulation.setTimezoneOverride", { timezoneId: scenario.timezone });
  await client.send("Emulation.setLocaleOverride", { locale: scenario.locale });
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const failures = [];
  const passes = [];
  try {
    for (const route of ROUTES) {
      await navigate(client, `${BASE_URL}${route.path}`);
      await evaluate(client, `(() => {
        document.querySelectorAll('details').forEach((details) => { details.open = true; });
        return true;
      })()`);
      const snapshot = await settledSnapshot(client);
      const expectedCurrency = scenario.currency ?? route.fallback;
      const expectedTrial = scenario.trial ?? route.fallbackTrial;
      const routeFailures = assertSnapshot({
        scenario,
        route,
        expectedCurrency,
        expectedTrial,
        snapshot,
        phase: "annual",
      });
      failures.push(...routeFailures);
      if (routeFailures.length === 0) {
        passes.push({ scenario: scenario.name, route: route.path, phase: "annual" });
      }

      if (route.path !== scenario.deepPath) continue;

      await evaluate(client, `(() => {
        const monthly = [...document.querySelectorAll('[role="tab"]')]
          .find((tab) => tab.getAttribute('aria-selected') === 'false');
        monthly?.click();
        return Boolean(monthly);
      })()`);
      await sleep(100);
      const monthlySnapshot = await settledSnapshot(client);
      const monthlyFailures = assertSnapshot({
        scenario,
        route,
        expectedCurrency,
        expectedTrial,
        snapshot: monthlySnapshot,
        phase: "monthly",
      });
      failures.push(...monthlyFailures);
      if (monthlyFailures.length === 0) {
        passes.push({ scenario: scenario.name, route: route.path, phase: "monthly" });
      }

      await client.send("Emulation.setDeviceMetricsOverride", {
        width: 390,
        height: 844,
        deviceScaleFactor: 1,
        mobile: true,
      });
      const mobileSnapshot = await settledSnapshot(client);
      const mobileFailures = assertSnapshot({
        scenario,
        route,
        expectedCurrency,
        expectedTrial,
        snapshot: mobileSnapshot,
        phase: "mobile",
      });
      failures.push(...mobileFailures);
      if (mobileFailures.length === 0) {
        passes.push({ scenario: scenario.name, route: route.path, phase: "mobile" });
      }
      await client.send("Emulation.setDeviceMetricsOverride", {
        width: 1440,
        height: 1000,
        deviceScaleFactor: 1,
        mobile: false,
      });
    }
  } finally {
    client.close();
  }
  return { failures, passes };
}

if (!existsSync(CHROME)) {
  console.error(`Chrome not found at ${CHROME}`);
  process.exit(2);
}

const profile = mkdtempSync(join(tmpdir(), "sta330-region-qa-"));
const debugPort = await freePort();
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${debugPort}`,
    "--remote-allow-origins=*",
    `--user-data-dir=${profile}`,
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "pipe"] },
);

try {
  await waitForDevTools(debugPort, chrome);
  const results = [];
  for (const scenario of SCENARIOS) {
    results.push(await runScenario({ port: debugPort, scenario }));
  }
  const failures = results.flatMap((result) => result.failures);
  const passes = results.flatMap((result) => result.passes);
  console.log(JSON.stringify({
    baseUrl: BASE_URL,
    routes: ROUTES.length,
    scenarios: SCENARIOS.map(({ name, timezone, locale }) => ({ name, timezone, locale })),
    checksPassed: passes.length,
    checksFailed: failures.length,
    failures,
  }, null, 2));
  if (failures.length > 0) process.exitCode = 1;
} finally {
  chrome.kill("SIGTERM");
  rmSync(profile, { recursive: true, force: true });
}
