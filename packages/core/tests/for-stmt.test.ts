import { test, expect } from "vitest";
import { emitTypeScript } from "../src/transpilers/typescript.js";
import { parse } from "../src/parser.js";
import { check } from "../src/checker.js";
import type { Program, Span } from "../src/ast.js";

test("transpiles ForStmt to for-of loop", () => {
  const span: Span = {
    start: { line: 0, column: 0, index: 0 },
    end: { line: 0, column: 0, index: 0 },
  };

   const program: Program = {
    kind: "Program",
    span,
    items: [
      {
        kind: "FuncDecl",
        name: { kind: "Identifier", name: "loop", span },
        params: [],
        returnType: { kind: "BasicType", name: "Int", span },
        body: {
          kind: "Block",
          statements: [
            {
              kind: "ForStmt",
              // AST canónigo
              iterator: { kind: "Identifier", name: "x", span },
              iterable: {
                kind: "IdentifierExpr",
                id: { kind: "Identifier", name: "xs", span },
                span,
              },
              // compat opcional (no requerido, pero aceptado)
              id: { kind: "Identifier", name: "x", span },
              body: { kind: "Block", statements: [], span },
              span,
            },
            {
              kind: "ReturnStmt",
              argument: {
                kind: "LiteralExpr",
                value: { kind: "Number", value: 0, span },
                span,
              },
              span,
            },
          ],
          span,
        },
        contracts: undefined,
        span,
      },
    ],
    intent: undefined,
    uses: undefined,
    types: undefined,
  };

  const ts = emitTypeScript(program);
  expect(ts).toContain("for (const x of xs) {\n");
});

// El parser reconoce 'for' y rellena `iterator` (y opcionalmente `id` por compat).
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
    expect(stmt.iterator.name).toBe("x");
    // Si existe `id`, debe coincidir con `iterator` (compat hacia atrás).
    if (stmt.id) expect(stmt.id.name).toBe(stmt.iterator.name);
  }
});

