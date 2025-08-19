import { test, expect } from "vitest";
import { parse } from "../src/parser.js";
import { check } from "../src/checker.js";
import { emitTypeScript } from "../src/transpilers/typescript.js";
import ts from "typescript";

async function compileAndLoad(il: string, fn: string): Promise<any> {
  const program = parse(il);
  const diags = check(program);
  expect(diags).toHaveLength(0);
  const tsCode = emitTypeScript(program);
  const jsCode = ts.transpileModule(tsCode, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const mod = await import(
    `data:text/javascript,${encodeURIComponent(jsCode)}`
  );
  return mod[fn];
}

test("enforces pre and post conditions", async () => {
  const il = `
    func add(a: Int, b: Int): Int requires a > 0 ensures a + b > 0 {
      return a + b;
    }
  `;
  const add = await compileAndLoad(il, "add");
  expect(add(1, 2)).toBe(3);
  expect(() => add(-1, 2)).toThrow(/Precondition failed/);
  expect(() => add(1, -2)).toThrow(/Postcondition failed/);
});

test("reports unknown identifiers in contracts", () => {
  const il = `
    func foo(a: Int): Int ensures c > 0 { return a; }
  `;
  const program = parse(il);
  const diags = check(program);
  expect(
    diags.some((d) => d.message.includes("Unknown identifier 'c'")),
  ).toBe(true);
});

test("supports contracts on effects", async () => {
  const il = `
    uses { clock: Clock {} }
    effect inc(x: Int): Int requires x > -10 ensures x > 0 uses clock {
      return x;
    }
  `;
  const inc = await compileAndLoad(il, "inc");
  await expect(inc({ clock: {} }, 1)).resolves.toBe(1);
  await expect(() => inc({ clock: {} }, -20)).rejects.toThrow(
    /Precondition failed/,
  );
  await expect(() => inc({ clock: {} }, -5)).rejects.toThrow(
    /Postcondition failed/,
  );
});
