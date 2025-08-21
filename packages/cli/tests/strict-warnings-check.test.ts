import { test, expect } from "vitest";
import * as path from "node:path";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const __dirname = path.dirname(fileURLToPath(import.meta.url));
spawnSync("pnpm", ["--filter", "@intentlang/core", "build"], {
  cwd: repoRoot,
  stdio: "inherit",
});
spawnSync("pnpm", ["--filter", "@intentlang/entlang/cli", "build"], {
  cwd: repoRoot,
  stdio: "inherit",
});

const CLI = path.join(__dirname, "..", "dist", "index.js");

const IL = `
intent "W" tags []
uses {}
types {
  type Letter = A | B;
}
func show(x: Letter): String {
  match x {
    A => "a";
    A => "again";
    B => "b";
  }
}
`;

test.skip("check: warnings-only exits 1 with --strict", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "intent-src-"));
  const src = path.join(dir, "warn.il");
  await writeFile(src, IL);
  const { status } = spawnSync(
    "node",
    [CLI, "check", src, "--strict"],
    { encoding: "utf8" },
  );
  expect(status).toBe(1);
  const j = spawnSync(
    "node",
    [CLI, "check", src, "--strict", "--json"],
    { encoding: "utf8" },
  );
  const obj = JSON.parse(j.stdout);
  expect(obj.meta.strict).toBe(true);
  expect(obj.counts.errors).toBe(0);
  expect(obj.counts.warnings).toBeGreaterThan(0);
  expect(obj.exitCode).toBe(1);
});

test.skip("check: warnings-only exits 0 without --strict", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "intent-src-"));
  const src = path.join(dir, "warn.il");
  await writeFile(src, IL);
  const { status } = spawnSync("node", [CLI, "check", src], {
    encoding: "utf8",
  });
  expect(status).toBe(0);
});
