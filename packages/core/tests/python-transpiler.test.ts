import { test, expect } from "vitest";
import { emitPython } from "../src/transpilers/python.js";
import type {
  Program,
  Identifier,
  Span,
  Block,
  Stmt,
  Expr,
} from "../src/ast.js";

const span: Span = { start: { line: 0, column: 0, index: 0 }, end: { line: 0, column: 0, index: 0 } };

function id(name: string): Identifier {
  return { kind: "Identifier", name, span };
}

function block(statements: Stmt[]): Block {
  return { kind: "Block", statements, span };
}

test("emits for loops", () => {
  const program: Program = {
    kind: "Program",
    items: [
      {
        kind: "FuncDecl",
        name: id("loop"),
        params: [
          {
            kind: "ParamSig",
            name: id("xs"),
            type: { kind: "BasicType", name: "Int", span },
            span,
          },
        ],
        returnType: { kind: "BasicType", name: "Int", span },
        body: block([
          {
            kind: "ForStmt",
            iterator: id("x"),
            iterable: { kind: "IdentifierExpr", id: id("xs"), span },
            body: block([]),
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
        ]),
        span,
      },
    ],
    span,
  };

  const py = emitPython(program);
  expect(py).toMatch(/for x in xs:\n\s+pass/);
});
