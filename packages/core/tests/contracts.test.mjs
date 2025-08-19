import assert from "node:assert/strict";
import { parse } from "../src/parser.js";
import { check } from "../src/checker.js";
import { emitTypeScript } from "../src/transpilers/typescript.js";
import ts from "typescript";

async function compileAndLoad(il, fn) {
  const program = parse(il);
  const diags = check(program);
  assert.equal(diags.length, 0, "checker diagnostics must be empty");
  const tsCode = emitTypeScript(program);
  const jsCode = ts.transpileModule(tsCode, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = await import(`data:text/javascript,${encodeURIComponent(jsCode)}`);
  return mod[fn];
}

{
  const il = `
    func add(a: Int, b: Int): Int requires a > 0 ensures a + b > 0 {
      return a + b;
    }
  `;
  const add = await compileAndLoad(il, "add");
  assert.equal(add(1, 2), 3);
  assert.throws(() => add(-1, 2), /Precondition failed/);
  assert.throws(() => add(1, -2), /Postcondition failed/);
}

{
  const il = `
    func foo(a: Int): Int ensures c > 0 { return a; }
  `;
  const program = parse(il);
  const diags = check(program);
  assert.ok(diags.some(d => d.message.includes("Unknown identifier 'c'")));
}

console.log("OK contracts");
