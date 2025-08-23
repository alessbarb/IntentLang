import { test, expect } from "vitest";
import { parse } from "../src/parser/index.js";
import { check } from "../src/checker.js";

test("parses a function with multiple statements and a match expression", () => {
  const il = `
    types {
      type A = X | Y;
    }
    func complex(a: A, b: Int): Int {
      let result = match a {
        X => 1;
        Y => b;
      }
      return result;
    }
  `;
  const program = parse(il);
  const diags = check(program);
  expect(diags).toHaveLength(0);
  const funcDecl = program.items.find((i) => i.kind === "FuncDecl");
  expect(funcDecl).toBeDefined();
  expect((funcDecl as any).body.statements).toHaveLength(2);
});