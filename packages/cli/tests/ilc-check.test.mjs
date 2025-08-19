import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
spawnSync("pnpm", ["--filter", "@il/core", "build"], {
  cwd: repoRoot,
  stdio: "inherit",
});
spawnSync("pnpm", ["--filter", "@il/cli", "build"], {
  cwd: repoRoot,
  stdio: "inherit",
});

const cliPath = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), "ilc-check-"));
const valid = join(tmp, "valid.il");
writeFileSync(valid, `intent "Test" tags []\nuses {}\ntypes {}`);

let res = spawnSync("node", [cliPath, "check", valid], { encoding: "utf8" });
assert.equal(res.status, 0);
assert.match(res.stdout, /OK/);

const bad = join(tmp, "bad.il");
writeFileSync(
  bad,
  `intent "X" tags []\nuses {}\ntypes {}\neffect boom(): Int uses http {}`,
);
res = spawnSync("node", [cliPath, "check", bad], { encoding: "utf8" });
assert.equal(res.status, 1);
assert.match(res.stderr, /undeclared capability 'http'/);

res = spawnSync("node", [cliPath, "check", join(tmp, "missing.il")], {
  encoding: "utf8",
});
assert.equal(res.status, 2);
assert.match(res.stderr, /Usage: ilc/);

res = spawnSync("node", [cliPath, "check", valid, "--wat"], {
  encoding: "utf8",
});
assert.equal(res.status, 2);
assert.match(res.stderr, /Usage: ilc/);

rmSync(tmp, { recursive: true, force: true });
console.log("OK ilc check command");
