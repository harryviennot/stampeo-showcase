import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env.local") });

const publicDev = process.env.PUBLIC_DEV === "1";
const publicEnvPath = resolve(process.cwd(), ".env.public");
if (publicDev && existsSync(publicEnvPath)) {
  config({ path: publicEnvPath, override: true });
}

const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || "";
const ipMatch = /\.?(\d+\.\d+\.\d+\.\d+)\.nip\.io/.exec(cookieDomain);
const ip = ipMatch?.[1];

const port = 3001;

console.log("\n🚀 Starting Showcase dev server...\n");
console.log("   Local:        http://localhost:" + port);
if (publicDev) {
  console.log("   Public (HTTPS): " + (process.env.NEXT_PUBLIC_SHOWCASE_URL || "(NEXT_PUBLIC_SHOWCASE_URL missing)"));
  console.log("   (frpc must be running: `docker compose up tunnel`)");
} else if (ip) {
  console.log("   Network:      http://" + ip + ":" + port);
  console.log("   nip.io:       http://stampeo." + ip + ".nip.io:" + port);
}
console.log("");

const proc = spawn("bunx", ["next", "dev", "-p", String(port)], {
  stdio: "inherit",
  shell: true,
});

proc.on("close", (code) => process.exit(code ?? 0));
