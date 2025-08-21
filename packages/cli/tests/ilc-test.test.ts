import { test, expect } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
spawnSync("pnpm", ["--filter", "@intentlang/core", "build"], {
  cwd: repoRoot,
  stdio: "inherit",
});
spawnSync("pnpm", ["--filter", "@intentlang/entlang/cli", "build"], {
  cwd: repoRoot,
  stdio: "inherit",
});

const cliPath = fileURLToPath(new URL("../dist/index.js", import.meta.url));

test("intent test command", () => {
  const tmp = mkdtempSync(join(tmpdir(), "intent-"));
  const file = join(tmp, "sample.il");

  writeFileSync(
    file,
    `
  func ok(): Int requires true { return 1; }
  func bad(): Int requires false { return 0; }
  test pass { ok(); }
  test boom { bad(); }
`,
  );

  let res = spawnSync("node", [cliPath, "test", file], { encoding: "utf8" });
  expect(res.status).not.toBe(0);
  expect(res.stdout).toMatch(/✓ test_pass/);
  expect(res.stderr).toMatch(/✗ test_boom/);

  writeFileSync(
    file,
    `
  func ok(): Int requires true { return 1; }
  test pass { ok(); }
`,
  );

  res = spawnSync("node", [cliPath, "test", file], { encoding: "utf8" });
  expect(res.status).toBe(0);
  expect(res.stdout).toMatch(/✓ test_pass/);

  rmSync(tmp, { recursive: true, force: true });
});
