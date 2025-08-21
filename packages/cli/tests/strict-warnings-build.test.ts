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

test.skip("build: warnings-only exits 1 with --strict", async () => {
  const srcDir = await mkdtemp(path.join(tmpdir(), "intent-src-"));
  const src = path.join(srcDir, "warn.il");
  await writeFile(src, IL);
  const out = await mkdtemp(path.join(tmpdir(), "intent-out-"));
  const { status } = spawnSync(
    "node",
    [CLI, "build", src, "--target", "ts", "--out", out, "--strict"],
    { encoding: "utf8" },
  );
  expect(status).toBe(1);
});

test.skip("build: warnings-only exits 0 without --strict", async () => {
  const srcDir = await mkdtemp(path.join(tmpdir(), "intent-src-"));
  const src = path.join(srcDir, "warn.il");
  await writeFile(src, IL);
  const out = await mkdtemp(path.join(tmpdir(), "intent-out-"));
  const { status } = spawnSync(
    "node",
    [CLI, "build", src, "--target", "ts", "--out", out],
    { encoding: "utf8" },
  );
  expect(status).toBe(0);
});
