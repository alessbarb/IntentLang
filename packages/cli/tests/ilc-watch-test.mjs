import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
process.env.FORCE_COLOR = "0";

const cliPath = fileURLToPath(new URL("../dist/index.js", import.meta.url));

// Build once before running (tests/run.mjs already builds, but keep local)
// (No-op if already built by the test runner)

const tmp = mkdtempSync(join(tmpdir(), "ilc-watch-"));
const file = join(tmp, "a.il");

writeFileSync(file, `intent "T" tags []\nuses {}\ntypes {}\n`);

// Start watcher
const child = spawn(
  "node",
  [cliPath, "check", join(tmp, "**/*.il"), "--watch"],
  {
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  },
);

let out = "";
let err = "";
child.stdout.on("data", (b) => (out += b.toString()));
child.stderr.on("data", (b) => (err += b.toString()));

// Wait helper
function waitFor(regex, where, ms = 3000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const t = setInterval(() => {
      if (regex.test(where())) {
        clearInterval(t);
        resolve();
      } else if (Date.now() - start > ms) {
        clearInterval(t);
        reject(new Error(`Timeout waiting for ${regex}`));
      }
    }, 50);
  });
}

// 1) Initial full pass should print "OK"
await waitFor(/OK/, () => out);

// 2) Edit file to introduce an error; diagnostics must be reprinted
writeFileSync(
  file,
  `intent "T" tags []\nuses {}\ntypes {}\neffect boom(): Int uses http {}\n`,
);
await waitFor(/undeclared capability 'http'|^\[ERROR]/m, () => err);

// 3) Ctrl+C => exit 0
const code = await new Promise((resolve) => {
  child.once("close", (c) => resolve(c));
  child.kill("SIGINT");
});
assert.equal(code, 0);
rmSync(tmp, { recursive: true, force: true });
console.log("OK ilc watch command");
