import { test, expect } from "vitest";
import { parse } from "../src/parser.js";
import { check } from "../src/checker.js";

// Ensure the parser recognizes 'for' statements.
test("parses for statements", () => {
  const il = `
    test loop {
      for x in [1,2] { x; }
    }
  `;
  const program = parse(il);
  const diags = check(program);
  expect(diags).toHaveLength(0);
  const t = program.items.find((i) => i.kind === "TestDecl");
  expect(t).toBeTruthy();
  const stmt = t?.body.statements[0];
  expect(stmt?.kind).toBe("ForStmt");
  if (stmt?.kind === "ForStmt") {
    expect(stmt.id.name).toBe("x");
  }
});
