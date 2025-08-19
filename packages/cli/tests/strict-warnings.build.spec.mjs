import { execa } from "execa";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import { tmpdir } from "node:os";

const FIX = path.join(__dirname, "..", "..", "examples", "warn-only.il");
const CLI = path.join(__dirname, "..", "..", "bin", "ilc");

test("build: warnings-only exits 1 with --strict", async () => {
  const out = await fs.mkdtemp(path.join(tmpdir(), "ilc-out-"));
  const { exitCode } = await execa(
    CLI,
    ["build", FIX, "--target", "ts", "--out", out, "--strict"],
    { reject: false },
  );
  expect(exitCode).toBe(1);
});

test("build: warnings-only exits 0 without --strict", async () => {
  const out = await fs.mkdtemp(path.join(tmpdir(), "ilc-out-"));
  const { exitCode } = await execa(
    CLI,
    ["build", FIX, "--target", "ts", "--out", out],
    { reject: false },
  );
  expect(exitCode).toBe(0);
});
