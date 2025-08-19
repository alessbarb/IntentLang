import { test } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

test.skip("ilc watch command", async () => {
  const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
  spawnSync("pnpm", ["--filter", "@il/core", "build"], {
    cwd: repoRoot,
    stdio: "inherit",
  });
  spawnSync("pnpm", ["--filter", "@il/cli", "build"], {
    cwd: repoRoot,
    stdio: "inherit",
  });

  process.env.FORCE_COLOR = "0";
  const cliPath = fileURLToPath(new URL("../dist/index.js", import.meta.url));
  const tmp = mkdtempSync(join(tmpdir(), "ilc-watch-"));
  const file = join(tmp, "a.il");
  writeFileSync(file, `intent "T" tags []\nuses {}\ntypes {}\n`);

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

  function waitFor(regex: RegExp, where: () => string, ms = 3000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const t = setInterval(() => {
        if (regex.test(where())) {
          clearInterval(t);
          resolve(undefined);
        } else if (Date.now() - start > ms) {
          clearInterval(t);
          reject(new Error(`Timeout waiting for ${regex}`));
        }
      }, 50);
    });
  }

  await waitFor(/OK/, () => out);
  writeFileSync(
    file,
    `intent "T" tags []\nuses {}\ntypes {}\neffect boom(): Int uses http {}\n`,
  );
  await waitFor(/undeclared capability 'http'|^\[ERROR]/m, () => err);
  const code = await new Promise<number>((resolve) => {
    child.once("close", (c) => resolve(c ?? 0));
    child.kill("SIGINT");
  });
  rmSync(tmp, { recursive: true, force: true });
});
