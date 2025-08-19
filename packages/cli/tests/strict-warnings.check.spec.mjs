import { execa } from "execa";
import * as path from "node:path";

const FIX = path.join(__dirname, "..", "..", "examples", "warn-only.il");
const CLI = path.join(__dirname, "..", "..", "bin", "ilc");

test("check: warnings-only exits 1 with --strict", async () => {
  const { exitCode, stderr, stdout } = await execa(CLI, ["check", FIX, "--strict"], { reject: false });
  expect(exitCode).toBe(1);
  // JSON mode sanity (optional)
  const j = await execa(CLI, ["check", FIX, "--strict", "--json"], { reject: false });
  const obj = JSON.parse(j.stdout);
  expect(obj.meta.strict).toBe(true);
  expect(obj.counts.errors).toBe(0);
  expect(obj.counts.warnings).toBeGreaterThan(0);
  expect(obj.exitCode).toBe(1);
});

test("check: warnings-only exits 0 without --strict", async () => {
  const { exitCode } = await execa(CLI, ["check", FIX], { reject: false });
  expect(exitCode).toBe(0);
});
