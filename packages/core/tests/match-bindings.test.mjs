import assert from "node:assert/strict";
import { parse } from "../src/parser.js";
import { check } from "../src/checker.js";
import { emitTypeScript } from "../src/transpilers/typescript.js";

const il = `
uses { http: Http {} }
types {
  type Payment =
    | Card { id: String, card: String }
    | Cash { id: String, amount: Float };
}

effect foo(p: Payment): Result<String, String> uses http {
  match p {
    Card { id, card: c } => Ok(id);
    Cash { id, amount } => Ok(id);
  };
}
`;

const program = parse(il);
const diags = check(program);
assert.equal(diags.length, 0, "checker diagnostics must be empty");

const ts = emitTypeScript(program);

// Debe contener bindings para alias/campos
assert.match(ts, /const _m_\d+ = p;/);
assert.match(ts, /if \(_m_\d+\.type === "Card"\)/);
assert.match(ts, /const id = _m_\d+\.id;/);
assert.match(ts, /const c = _m_\d+\.card;/);
assert.match(ts, /return _r_\d+;/);

console.log("OK match-bindings");
