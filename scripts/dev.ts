import { spawn } from "child_process";

const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || "";
// Extract IP from cookie domain (e.g., ".192.0.0.2.nip.io" -> "192.0.0.2")
const ipMatch = /\.?(\d+\.\d+\.\d+\.\d+)\.nip\.io/.exec(cookieDomain);
const ip = ipMatch?.[1];

const port = 3001;

console.log("\n🚀 Starting Showcase dev server...\n");
console.log("   Local:        http://localhost:" + port);
if (ip) {
  console.log("   Network:      http://" + ip + ":" + port);
  console.log("   nip.io:       http://stampeo." + ip + ".nip.io:" + port);
}
console.log("");

const proc = spawn("bunx", ["next", "dev", "-p", String(port)], {
  stdio: "inherit",
  shell: true,
});

proc.on("close", (code) => process.exit(code ?? 0));
