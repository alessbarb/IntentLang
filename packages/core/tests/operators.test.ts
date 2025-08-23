import { test, expect } from "vitest";
import { lex } from "../src/lexer.js";
import { parse } from "../src/parser/index.js";

test("lexes extended operators", () => {
  const tokens = lex("a+=1; b--; c&d | e ^ ~f << 1 >> 2 ? g : h");
  const types = tokens.map((t) => t.type);
  expect(types).toContain("pluseq");
  expect(types).toContain("minusminus");
  expect(types).toContain("amp");
  expect(types).toContain("pipe");
  expect(types).toContain("caret");
  expect(types).toContain("tilde");
  expect(types).toContain("lshift");
  expect(types).toContain("rshift");
  expect(types).toContain("question");
});

test("parses compound, update and ternary", () => {
  const program = parse(
    "func f(): Int requires true { let a = 1; a += 2; a--; return a & 1 ? a : 0; }",
  );
  const body = (program.items[0] as any).body.statements;
  expect(body[1].kind).toBe("ExprStmt");
  expect(body[1].expression.kind).toBe("AssignExpr");
  expect(body[2].expression.kind).toBe("UpdateExpr");
  const ret = body[3];
  expect(ret.kind).toBe("ReturnStmt");
  expect((ret as any).argument.kind).toBe("ConditionalExpr");
});
