import { test, expect } from "vitest";
import { emitPython } from "../src/transpilers/python.js";
import type { Program, Identifier, Span, Block } from "../src/ast.js";

const span: Span = { start: { line: 0, column: 0, index: 0 }, end: { line: 0, column: 0, index: 0 } };

function id(name: string): Identifier {
  return { kind: "Identifier", name, span };
}

function block(statements: any[]): Block {
  // TODO: tipar los elementos cuando `ForStmt` esté incluido en el AST.
  return { kind: "Block", statements, span } as Block;
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
            expr: { kind: "IdentifierExpr", id: id("xs"), span },
            body: block([]),
            span,
          } as any,
          {
            kind: "ReturnStmt",
            argument: { kind: "LiteralExpr", value: { kind: "Number", value: 0, span }, span },
            span,
          },
        ]),
        span,
      } as any,
    ],
    span,
  } as any; // TODO: eliminar 'any' cuando el AST soporte ForStmt

  const py = emitPython(program);
  expect(py).toMatch(/for x in xs:\n\s+pass/);
});
