import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test, expect } from "vitest";

const root = resolve(__dirname, "../src/generated/grammar");

test("visitor.gen.ts expone visitProgram", () => {
  const file = resolve(root, "IntentLangVisitor.ts");
  const content = readFileSync(file, "utf8");
  expect(content).toContain("visitProgram?:");
});

test("nodes.gen.ts incluye ProgramContext", () => {
  const file = resolve(root, "IntentLangParser.ts");
  const content = readFileSync(file, "utf8");
  expect(content).toMatch(/class\s+ProgramContext/);
});
