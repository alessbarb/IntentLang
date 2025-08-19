import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
spawnSync("pnpm", ["--filter", "@il/core", "build"], { cwd: repoRoot, stdio: "inherit" });
spawnSync("pnpm", ["--filter", "@il/cli", "build"], { cwd: repoRoot, stdio: "inherit" });

const cliPath = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), "ilc-"));
const file = join(tmp, "sample.il");

writeFileSync(file, `
  func ok(): Int requires true { return 1; }
  func bad(): Int requires false { return 0; }
  test pass { ok(); }
  test boom { bad(); }
`);

let res = spawnSync("node", [cliPath, "test", file], { encoding: "utf8" });
assert.notEqual(res.status, 0);
assert.match(res.stdout, /✓ test_pass/);
assert.match(res.stderr, /✗ test_boom/);

writeFileSync(file, `
  func ok(): Int requires true { return 1; }
  test pass { ok(); }
`);

res = spawnSync("node", [cliPath, "test", file], { encoding: "utf8" });
assert.equal(res.status, 0);
assert.match(res.stdout, /✓ test_pass/);

rmSync(tmp, { recursive: true, force: true });
console.log("OK ilc test command");
