import { test, expect } from "vitest";
import { parse } from "../src/parser.js";
import { check } from "../src/checker.js";
import { emitTypeScript } from "../src/transpilers/typescript.js";

test("emits bindings for match patterns", () => {
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
  expect(diags).toHaveLength(0);

  const ts = emitTypeScript(program);

  // Debe contener bindings para alias/campos
  expect(ts).toMatch(/const _m_\d+ = p;/);
  expect(ts).toMatch(/if \(_m_\d+\.type === "Card"\)/);
  expect(ts).toMatch(/const id = _m_\d+\.id;/);
  expect(ts).toMatch(/const c = _m_\d+\.card;/);
  expect(ts).toMatch(/return _r_\d+;/);
});
