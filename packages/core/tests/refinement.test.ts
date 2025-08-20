import { test, expect } from "vitest";
import { parse } from "../src/parser.js";

test("accepts function call refinements", () => {
  const il = `types { type Email = String where matches("foo"); }`;
  const program = parse(il);
  const decl = (program.items[0] as any).declarations[0];
  expect(decl.refinement).toBe('matches("foo")');
});

test("accepts comparison refinements", () => {
  const il = `types { type User = { age: Int where _ >= 18 }; }`;
  const program = parse(il);
  const decl = (program.items[0] as any).declarations[0];
  const field = decl.expr.fields[0];
  expect(field.refinement).toBe("_ >= 18");
});

test("rejects complex expressions in refinements", () => {
  const il = `types { type T = Int where _ > 0 && _ < 10; }`;
  expect(() => parse(il)).toThrow();
});
