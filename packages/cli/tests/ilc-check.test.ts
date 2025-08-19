import { test, expect } from "vitest";
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

test("ilc check command", () => {
  const tmp = mkdtempSync(join(tmpdir(), "ilc-check-"));
  const valid = join(tmp, "valid.il");
  writeFileSync(valid, `intent "Test" tags []\nuses {}\ntypes {}`);

  let res = spawnSync("node", [cliPath, "check", valid], { encoding: "utf8" });
  expect(res.status).toBe(0);
  expect(res.stdout).toMatch(/OK/);

  const bad = join(tmp, "bad.il");
  writeFileSync(
    bad,
    `intent "X" tags []\nuses {}\ntypes {}\neffect boom(): Int uses http {}`,
  );
  res = spawnSync("node", [cliPath, "check", bad], { encoding: "utf8" });
  expect(res.status).toBe(1);
  expect(res.stderr).toMatch(/undeclared capability 'http'/);

  res = spawnSync("node", [cliPath, "check", valid, "--json"], {
    encoding: "utf8",
  });
  expect(res.status).toBe(0);
  expect(res.stderr).toBe("");
  let out = JSON.parse(res.stdout);
  expect(out.status).toBe("ok");
  expect(out.diags).toHaveLength(0);

  res = spawnSync("node", [cliPath, "check", bad, "--json"], {
    encoding: "utf8",
  });
  expect(res.status).toBe(1);
  expect(res.stderr).toBe("");
  out = JSON.parse(res.stdout);
  expect(out.status).toBe("error");
  expect(out.diags.length).toBeGreaterThan(0);
  expect(out.diags[0].level).toBe("error");
  expect(out.diags[0].message).toMatch(/undeclared capability 'http'/);

  res = spawnSync("node", [cliPath, "check", join(tmp, "missing.il")], {
    encoding: "utf8",
  });
  expect(res.status).toBe(2);
  expect(res.stderr).toMatch(/Usage: ilc/);

  res = spawnSync("node", [cliPath, "check", valid, "--wat"], {
    encoding: "utf8",
  });
  expect(res.status).toBe(2);
  expect(res.stderr).toMatch(/Usage: ilc/);

  rmSync(tmp, { recursive: true, force: true });
});
