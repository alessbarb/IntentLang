import assert from "node:assert/strict";
import { parse } from "../src/parser.js";
import { check } from "../src/checker.js";

{
  const il = `
    test sample {
      ok();
    }
    func ok(): Int requires true { return 1; }
  `;
  const program = parse(il);
  const diags = check(program);
  assert.equal(diags.length, 0);
  const t = program.items.find(i => i.kind === "TestDecl");
  assert.ok(t);
  assert.equal(t.name.name, "sample");
  assert.equal(t.body.statements.length, 1);
}

{
  const il = `
    test bad {
      missing();
    }
  `;
  const program = parse(il);
  const diags = check(program);
  assert.ok(diags.some(d => d.message.includes("Unknown function or effect 'missing'")));
}

console.log("OK test blocks");
