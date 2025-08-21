import { test, expect } from "vitest";
import { emitTypeScript } from "../src/transpilers/typescript.js";
import type { Program, Span } from "../src/ast.js";

// TODO: Remove `as any` casts when ForStmt is part of the AST types.

test("transpiles ForStmt to for-of loop", () => {
  const span: Span = {
    start: { line: 0, column: 0, index: 0 },
    end: { line: 0, column: 0, index: 0 },
  };

  const program = {
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
              it: { kind: "Identifier", name: "x", span },
              expr: {
                kind: "IdentifierExpr",
                id: { kind: "Identifier", name: "xs", span },
                span,
              },
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
  } as any as Program;

  const ts = emitTypeScript(program);
  expect(ts).toContain("for (const x of xs) {\n");
});
