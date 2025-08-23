import { test, expect } from "vitest";
import { parse } from "../src/parser/index.js";
import { check } from "../src/checker.js";
import { emitTypeScript } from "../src/transpilers/typescript.js";

test("parses match guards and transpiles", () => {
  const il = `
func handle(n: Int): Int requires true {
  return match n {
    1 if true => 1;
    2 => 2;
  };
}
`;
  const program = parse(il);
  const ret = (program.items[0] as any).body.statements[0] as any;
  const m = ret.argument;
  expect(m.cases[0].guard).toBeDefined();
  const diags = check(program);
  expect(diags.filter((d) => d.level === "error")).toHaveLength(0);
  const ts = emitTypeScript(program);
  expect(ts).toMatch(/&& \(\(\) =>/);
});

test("match guard must be Bool", () => {
  const il = `
func f(n: Int): Int requires true {
  return match n {
    1 if 1 => 0;
    2 => 1;
  };
}
`;
  const program = parse(il);
  const diags = check(program);
  expect(diags.some((d) => d.code === "ILC0229")).toBe(true);
});

